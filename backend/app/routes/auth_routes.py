# backend/app/routes/auth_routes.py

from flask import request
from flask_restx import Namespace, Resource, fields
from app import db
from app.models import User # Make sure User is imported
from sqlalchemy.exc import IntegrityError

# Create a Namespace for authentication-related routes
auth_ns = Namespace('auth', description='Authentication related operations')

# Define input models for request parsing and Swagger documentation
user_register_model = auth_ns.model('UserRegister', {
    'username': fields.String(required=True, description='User\'s chosen username'),
    'email': fields.String(required=True, description='User\'s email address', attribute='email'),
    'password': fields.String(required=True, description='User\'s password', min_length=6),
    'is_recruiter': fields.Boolean(description='Whether the user is a recruiter', default=False)
})

user_login_model = auth_ns.model('UserLogin', {
    'email': fields.String(required=False, description='User\'s email address'),
    'username': fields.String(required=False, description='User\'s username'),
    'password': fields.String(required=True, description='User\'s password')
})

user_output_model = auth_ns.model('UserOutput', {
    'id': fields.Integer(readOnly=True, description='The unique identifier of a user'),
    'username': fields.String(required=True, description='The user\'s username'),
    'email': fields.String(required=True, description='The user\'s email address'),
    'is_recruiter': fields.Boolean(description='Whether the user is a recruiter'),
    'date_joined': fields.DateTime(dt_format='iso8601', description='Date and time the user joined'),
    "role": fields.String, # Frontend expects a 'role' string
})

@auth_ns.route('/register')
class UserRegister(Resource):
    @auth_ns.expect(user_register_model, validate=True)
    @auth_ns.marshal_with(user_output_model, code=201)
    def post(self):
        """Register a new user"""
        data = request.get_json()
        print(f"Received registration data: {data}")

        username = data['username']
        email = data['email']
        password = data['password']
        is_recruiter = data.get('is_recruiter', False)

        if User.query.filter_by(username=username).first():
            print(f"Username '{username}' already exists")
            auth_ns.abort(409, message="Username already taken")

        if User.query.filter_by(email=email).first():
            print(f"Email '{email}' already exists")
            auth_ns.abort(409, message="Email already registered")

        try:
            print("Creating new user...")
            new_user = User(username=username, email=email, is_recruiter=is_recruiter)
            # Corrected: Assign plain password to the password_hash property setter
            new_user.password_hash = password

            # Set the 'role' field on the user instance for the output model,
            # it's not a stored column but derived from is_recruiter for frontend
            new_user.role = "recruiter" if new_user.is_recruiter else "job_seeker"

            db.session.add(new_user)
            db.session.commit()
            print(f"User '{username}' registered successfully.")

            return new_user, 201

        except IntegrityError as ie:
            db.session.rollback()
            print(f"IntegrityError: {ie}")
            auth_ns.abort(409, message="Error registering user: username or email might already exist")

        except Exception as e:
            db.session.rollback()
            print(f"Unexpected error during registration: {e}")
            auth_ns.abort(500, message=f"An error occurred: {str(e)}")


@auth_ns.route('/login')
class UserLogin(Resource):
    @auth_ns.expect(user_login_model, validate=True)
    @auth_ns.marshal_with(user_output_model, code=200)
    def post(self):
        """Log in a user"""
        data = request.get_json()

        email = data.get('email')
        username = data.get('username')
        password = data['password']

        user = None
        if email:
            user = User.query.filter_by(email=email).first()
        elif username:
            user = User.query.filter_by(username=username).first()

        # Corrected: Use the authenticate method from the User model
        if user and user.authenticate(password):
            # Determine role for frontend response
            role = "recruiter" if user.is_recruiter else "job_seeker"
            user.role = role # Assign role for the output model

            print(f"User '{user.username}' logged in successfully.")

            return {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "is_recruiter": user.is_recruiter,
               "role": role # Ensure role is returned
            }, 200

        else:
            auth_ns.abort(401, message="Invalid credentials")