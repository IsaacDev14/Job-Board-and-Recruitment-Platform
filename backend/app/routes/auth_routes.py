# backend/app/routes/auth_routes.py

from flask import request, jsonify
from flask_restx import Namespace, Resource, fields # Import Namespace, Resource, fields
from app import db # Import the db instance from your app package
from app.models import User # Import your User model
from sqlalchemy.exc import IntegrityError

# Create a Namespace for authentication-related routes
auth_ns = Namespace('Auth', description='Authentication related operations')

# Define input models for request parsing and Swagger documentation
# These models describe the expected structure of JSON payloads.
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

# Define output model for user data (to avoid exposing password hash)
user_output_model = auth_ns.model('UserOutput', {
    'id': fields.Integer(readOnly=True, description='The unique identifier of a user'),
    'username': fields.String(required=True, description='The user\'s username'),
    'email': fields.String(required=True, description='The user\'s email address'),
    'is_recruiter': fields.Boolean(description='Whether the user is a recruiter'),
    'date_joined': fields.DateTime(dt_format='iso8601', description='Date and time the user joined')
})

@auth_ns.route('/register')
class UserRegister(Resource):
    @auth_ns.expect(user_register_model, validate=True) # Validate incoming JSON against this model
    @auth_ns.marshal_with(user_output_model, code=201) # Define output format and status code
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

        username = data['username'] # Data is already validated by @auth_ns.expect
        email = data['email']
        password = data['password']
        is_recruiter = data.get('is_recruiter', False)

        # Check for existing user by username or email
        if User.query.filter_by(username=username).first():
            auth_ns.abort(409, message="Username already taken")
        if User.query.filter_by(email=email).first():
            auth_ns.abort(409, message="Email already registered")

        try:
            new_user = User(username=username, email=email, is_recruiter=is_recruiter)
            new_user.set_password(password)

            db.session.add(new_user)
            db.session.commit()

            return new_user, 201 # Flask-RESTx will marshal this according to user_output_model

        except IntegrityError:
            db.session.rollback()
            auth_ns.abort(409, message="Error registering user: username or email might already exist")
        except Exception as e:
            db.session.rollback()
            auth_ns.abort(500, message=f"An error occurred: {str(e)}")

@auth_ns.route('/login')
class UserLogin(Resource):
    @auth_ns.expect(user_login_model, validate=True)
    @auth_ns.marshal_with(user_output_model, code=200)
    @auth_ns.doc(description='Log in an existing user. Requires either email or username along with password.',
                 responses={
                     200: 'Login successful',
                     400: 'Validation Error / Missing Data',
                     401: 'Invalid credentials',
                     500: 'Internal Server Error'
                 })
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

        if user and user.check_password(password):
            # In a real app, generate and return a JWT token here
            # For now, we return user details as a placeholder
            return user, 200 # Flask-RESTx will marshal this
        else:
            auth_ns.abort(401, message="Invalid credentials")

