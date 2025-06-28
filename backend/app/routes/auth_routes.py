# backend/app/routes/auth_routes.py

from flask import request, jsonify
from flask_restx import Namespace, Resource, fields
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity # Import JWT functions
from app import db, bcrypt # Import db and bcrypt
from app.models import User, Company # Import User and Company models
from sqlalchemy.exc import IntegrityError

# Create a Namespace for authentication-related routes
auth_ns = Namespace('auth', description='Authentication related operations')

# --- Models for Frontend/Backend Communication ---

# Model for user data that will be part of the login/register response
# This matches your Frontend's BackendUser type
user_payload_model = auth_ns.model('UserPayload', {
    'id': fields.Integer(readOnly=True, description='The unique identifier of a user'),
    'username': fields.String(required=True, description='The user\'s username'),
    'email': fields.String(required=True, description='The user\'s email address'),
    'is_recruiter': fields.Boolean(description='Whether the user is a recruiter'),
    'company_id': fields.Integer(allow_null=True, description='ID of the associated company for recruiters'),
    # Note: 'role' is derived on the frontend, not directly sent by backend in this model
    # 'date_joined': fields.DateTime(dt_format='iso8601', description='Date and time the user joined'), # Optional if you want to include
})

# Model for the full login/register response, matching Frontend's LoginResponse
login_register_response_model = auth_ns.model('LoginRegisterResponse', {
    'access_token': fields.String(required=True, description='JWT Access Token'),
    'user': fields.Nested(user_payload_model, required=True, description='Authenticated user details')
})

# Input models for requests
user_register_input_model = auth_ns.model('UserRegisterInput', {
    'username': fields.String(required=True, description='User\'s chosen username'),
    'email': fields.String(required=True, description='User\'s email address'),
    'password': fields.String(required=True, description='User\'s password', min_length=6),
    'is_recruiter': fields.Boolean(description='Whether the user is a recruiter', default=False)
})

user_login_input_model = auth_ns.model('UserLoginInput', {
    'email': fields.String(required=False, description='User\'s email address'),
    'username': fields.String(required=False, description='User\'s username'),
    'password': fields.String(required=True, description='User\'s password')
})


@auth_ns.route('/register')
class UserRegister(Resource):
    @auth_ns.expect(user_register_input_model, validate=True)
    @auth_ns.marshal_with(login_register_response_model, code=201) # Use the new response model
    def post(self):
        """Register a new user and return an access token"""
        data = auth_ns.payload # Use auth_ns.payload for validated data

        username = data['username']
        email = data['email']
        password = data['password']
        is_recruiter = data.get('is_recruiter', False)

        if User.query.filter_by(username=username).first():
            auth_ns.abort(409, message="Username already taken")
        if User.query.filter_by(email=email).first():
            auth_ns.abort(409, message="Email already registered")

        try:
            new_user = User(username=username, email=email, is_recruiter=is_recruiter)
            new_user.password_hash = password # Use the hybrid_property setter
            db.session.add(new_user)
            db.session.commit()

            # Fix: Convert user.id to string for JWT identity
            access_token = create_access_token(identity=str(new_user.id))

            # Prepare user data to match frontend's BackendUser structure
            user_data_for_response = {
                "id": new_user.id,
                "username": new_user.username,
                "email": new_user.email,
                "is_recruiter": new_user.is_recruiter,
                "company_id": None # Newly registered recruiter won't have a company_id yet
            }

            return {
                "access_token": access_token,
                "user": user_data_for_response
            }, 201

        except IntegrityError as ie:
            db.session.rollback()
            auth_ns.abort(409, message="Error registering user: username or email might already exist")
        except Exception as e:
            db.session.rollback()
            auth_ns.abort(500, message=f"An unexpected error occurred: {str(e)}")


@auth_ns.route('/login')
class UserLogin(Resource):
    @auth_ns.expect(user_login_input_model, validate=True)
    @auth_ns.marshal_with(login_register_response_model, code=200) # Use the new response model
    def post(self):
        """Log in a user and return an access token"""
        data = auth_ns.payload

        email = data.get('email')
        username = data.get('username') # Allow login by username too
        password = data['password']

        user = None
        if email:
            user = User.query.filter_by(email=email).first()
        elif username:
            user = User.query.filter_by(username=username).first()

        if user and user.authenticate(password):
            # Fix: Convert user.id to string for JWT identity
            access_token = create_access_token(identity=str(user.id))

            company_id = None
            if user.is_recruiter and user.companies:
                # Assuming a recruiter owns one company for simplicity
                company_id = user.companies[0].id

            # Prepare user data to match frontend's BackendUser structure
            user_data_for_response = {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "is_recruiter": user.is_recruiter,
                "company_id": company_id
            }

            return {
                "access_token": access_token,
                "user": user_data_for_response
            }, 200
        else:
            auth_ns.abort(401, message="Invalid credentials")

@auth_ns.route('/current_user')
class CurrentUser(Resource):
    @auth_ns.doc('get_current_user')
    @jwt_required() # Requires a valid JWT token
    @auth_ns.marshal_with(user_payload_model) # Returns just the user payload, not the full login response
    def get(self):
        """Get details of the currently authenticated user"""
        # get_jwt_identity() will now return a string (the user ID)
        user_id_str = get_jwt_identity()
        user = User.query.get(int(user_id_str)) # Convert back to int to query the database

        if user:
            company_id = None
            if user.is_recruiter and user.companies:
                company_id = user.companies[0].id

            user_data = {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "is_recruiter": user.is_recruiter,
                "company_id": company_id
            }
            return user_data, 200
        auth_ns.abort(404, message="User not found")
