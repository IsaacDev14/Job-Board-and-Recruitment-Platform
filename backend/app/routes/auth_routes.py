# backend/app/routes/auth_routes.py

from flask import request, jsonify
from flask_restx import Namespace, Resource, fields
from app import db, bcrypt # Import db and bcrypt
from app.models import User, Company # Import User and Company model (for recruiter company_id check)
from flask_jwt_extended import create_access_token # Import JWT functions
from sqlalchemy.exc import IntegrityError # To catch unique constraint errors

# Create a Namespace for authentication-related routes
auth_ns = Namespace('Auth', description='Authentication related operations')

# Define input models for request parsing and Swagger documentation
user_register_model = auth_ns.model('UserRegister', {
    'username': fields.String(required=True, description='User\'s chosen username'),
    'email': fields.String(required=True, description='User\'s email address'),
    'password': fields.String(required=True, description='User\'s password', min_length=6),
    'first_name': fields.String(description='User\'s first name'),
    'last_name': fields.String(description='User\'s last name'),
    'is_recruiter': fields.Boolean(description='Whether the user is a recruiter', default=False),
    'company_id': fields.Integer(description='ID of the company if the user is a recruiter')
})

user_login_model = auth_ns.model('UserLogin', {
    'email': fields.String(required=True, description='User\'s email address'),
    'password': fields.String(required=True, description='User\'s password')
})

# Define output model for user data returned after login/registration (excluding password_hash)
user_output_model = auth_ns.model('UserOutput', {
    'id': fields.Integer(readOnly=True, description='The unique identifier of a user'),
    'username': fields.String(required=True, description='The user\'s username'),
    'email': fields.String(required=True, description='The user\'s email address'),
    'first_name': fields.String(description='The user\'s first name'),
    'last_name': fields.String(description='The user\'s last name'),
    'is_recruiter': fields.Boolean(description='Whether the user is a recruiter'),
    'company_id': fields.Integer(description='The ID of the company the recruiter is associated with'),
    'date_joined': fields.DateTime(dt_format='iso8601', description='Date and time the user joined'),
    'updated_at': fields.DateTime(dt_format='iso8601', description='Date and time the user was last updated')
})

# Response model for login/register success, including token
auth_success_response_model = auth_ns.model('AuthSuccess', {
    'message': fields.String(description='Success message'),
    'access_token': fields.String(description='JWT Access Token'),
    'user': fields.Nested(user_output_model, description='Authenticated user details')
})

@auth_ns.route('/register')
class UserRegister(Resource):
    @auth_ns.expect(user_register_model, validate=True)
    @auth_ns.marshal_with(auth_success_response_model, code=201)
    @auth_ns.doc(description='Register a new user (job seeker or recruiter).',
                 responses={
                     201: 'User registered successfully',
                     400: 'Validation Error / Missing Data',
                     409: 'Username or Email already taken',
                     500: 'Internal Server Error'
                 })
    def post(self):
        """Register a new user"""
        data = request.get_json()

        username = data['username']
        email = data['email']
        password = data['password']
        is_recruiter = data.get('is_recruiter', False)
        company_id = data.get('company_id') # Will be None if not provided

        # Input validation for existing users/emails
        if User.query.filter_by(username=username).first():
            auth_ns.abort(409, message="Username already taken")
        if User.query.filter_by(email=email).first():
            auth_ns.abort(409, message="Email already registered")

        # Validate company_id if recruiter
        if is_recruiter:
            if company_id is None:
                auth_ns.abort(400, message="Recruiter must be associated with a company_id.")
            company = Company.query.get(company_id)
            if not company:
                auth_ns.abort(404, message=f"Company with ID {company_id} not found.")

        try:
            new_user = User(
                username=username,
                email=email,
                first_name=data.get('first_name'),
                last_name=data.get('last_name'),
                is_recruiter=is_recruiter,
                company_id=company_id if is_recruiter else None # Ensure company_id is null for non-recruiters
            )
            new_user.set_password(password)

            db.session.add(new_user)
            db.session.commit()

            # Generate JWT token
            access_token = create_access_token(identity=new_user.id)

            return {
                "message": "User registered successfully",
                "access_token": access_token,
                "user": new_user.to_dict() # Return the marshaled user data
            }, 201

        except IntegrityError:
            db.session.rollback()
            auth_ns.abort(409, message="Error registering user: username or email might already exist")
        except Exception as e:
            db.session.rollback()
            auth_ns.abort(500, message=f"An error occurred during registration: {str(e)}")

@auth_ns.route('/login')
class UserLogin(Resource):
    @auth_ns.expect(user_login_model, validate=True)
    @auth_ns.marshal_with(auth_success_response_model, code=200)
    @auth_ns.doc(description='Log in an existing user. Requires email and password.',
                 responses={
                     200: 'Login successful',
                     400: 'Validation Error / Missing Data',
                     401: 'Invalid credentials',
                     500: 'Internal Server Error'
                 })
    def post(self):
        """Log in a user"""
        data = request.get_json()

        email = data['email']
        password = data['password']

        user = User.query.filter_by(email=email).first()

        if not user or not user.check_password(password):
            auth_ns.abort(401, message="Invalid credentials")

        # Generate JWT token
        access_token = create_access_token(identity=user.id)

        return {
            "message": "Login successful",
            "access_token": access_token,
            "user": user.to_dict() # Return the marshaled user data
        }, 200

