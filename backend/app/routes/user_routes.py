# backend/app/routes/user_routes.py

from flask import request, jsonify
from flask_restx import Namespace, Resource, fields, reqparse # Import reqparse for arguments
from app import db # Import the db instance from your app package
from app.models import User # Import your User model
from sqlalchemy.exc import IntegrityError

# Create a Namespace for user-related routes
user_ns = Namespace('Users', description='User profile and management operations')

# Define input/output models for Swagger documentation and request parsing
# Output model for general user data (without password_hash)
user_output_model = user_ns.model('UserOutput', {
    'id': fields.Integer(readOnly=True, description='The unique identifier of a user'),
    'username': fields.String(required=True, description='User\'s chosen username'),
    'email': fields.String(required=True, description='User\'s email address'),
    'is_recruiter': fields.Boolean(description='Whether the user is a recruiter'),
    'date_joined': fields.DateTime(dt_format='iso8601', description='Date and time the user joined')
})

# Input model for user creation (includes password)
user_create_model = user_ns.model('UserCreate', {
    'username': fields.String(required=True, description='User\'s chosen username'),
    'email': fields.String(required=True, description='User\'s email address'),
    'password': fields.String(required=True, description='User\'s password', min_length=6),
    'is_recruiter': fields.Boolean(description='Whether the user is a recruiter', default=False)
})

# Input model for user update (all fields optional for PATCH)
user_update_model = user_ns.model('UserUpdate', {
    'username': fields.String(description='User\'s chosen username'),
    'email': fields.String(description='User\'s email address'),
    'password': fields.String(description='User\'s new password', min_length=6),
    'is_recruiter': fields.Boolean(description='Whether the user is a recruiter')
})

# Request parser for query parameters (e.g., for filtering/pagination)
user_list_parser = reqparse.RequestParser()
user_list_parser.add_argument('is_recruiter', type=bool, help='Filter by recruiter status', location='args')


@user_ns.route('/')
class UserList(Resource):
    @user_ns.doc(description='Get a list of all users. Can be filtered by recruiter status.',
                 params={'is_recruiter': 'Filter by recruiter status (true/false)'},
                 responses={200: 'Success', 500: 'Internal Server Error'})
    @user_ns.marshal_list_with(user_output_model) # Use marshal_list_with for a list of objects
    @user_ns.expect(user_list_parser) # Apply the parser for query args
    def get(self):
        """Get all users"""
        args = user_list_parser.parse_args()
        is_recruiter_filter = args.get('is_recruiter')

        query = User.query

        if is_recruiter_filter is not None:
            query = query.filter_by(is_recruiter=is_recruiter_filter)

        users = query.all()
        return users # Flask-RESTx will marshal this list of objects

    @user_ns.doc(description='Create a new user account.',
                 responses={
                     201: 'User created successfully',
                     400: 'Validation Error / Missing Data',
                     409: 'Username or Email already taken',
                     500: 'Internal Server Error'
                 })
    @user_ns.expect(user_create_model, validate=True)
    @user_ns.marshal_with(user_output_model, code=201)
    def post(self):
        """Create a new user"""
        data = request.get_json()

        username = data['username']
        email = data['email']
        password = data['password']
        is_recruiter = data.get('is_recruiter', False)

        if User.query.filter_by(username=username).first():
            user_ns.abort(409, message="Username already taken")
        if User.query.filter_by(email=email).first():
            user_ns.abort(409, message="Email already registered")

        try:
            new_user = User(username=username, email=email, is_recruiter=is_recruiter)
            new_user.set_password(password)

            db.session.add(new_user)
            db.session.commit()
            return new_user, 201
        except IntegrityError:
            db.session.rollback()
            user_ns.abort(409, message="Error creating user: username or email might already exist")
        except Exception as e:
            db.session.rollback()
            user_ns.abort(500, message=f"An error occurred: {str(e)}")


@user_ns.route('/<int:user_id>')
@user_ns.param('user_id', 'The user unique identifier')
class UserResource(Resource):
    @user_ns.doc(description='Get a user by ID.',
                 responses={200: 'Success', 404: 'User not found', 500: 'Internal Server Error'})
    @user_ns.marshal_with(user_output_model)
    def get(self, user_id):
        """Get a user by ID"""
        user = User.query.get(user_id)
        if not user:
            user_ns.abort(404, message="User not found")
        return user

    @user_ns.doc(description='Update an existing user by ID.',
                 responses={
                     200: 'User updated successfully',
                     400: 'Validation Error',
                     404: 'User not found',
                     409: 'Username or Email already taken',
                     500: 'Internal Server Error'
                 })
    @user_ns.expect(user_update_model, validate=True)
    @user_ns.marshal_with(user_output_model)
    def put(self, user_id): # For full replacement
        """Update a user by ID (full replacement)"""
        user = User.query.get(user_id)
        if not user:
            user_ns.abort(404, message="User not found")

        data = request.get_json()
        if not data:
            user_ns.abort(400, message="No input data provided")

        # Handle unique constraints
        if 'username' in data and data['username'] != user.username and \
           User.query.filter_by(username=data['username']).first():
            user_ns.abort(409, message="Username already taken")
        if 'email' in data and data['email'] != user.email and \
           User.query.filter_by(email=data['email']).first():
            user_ns.abort(409, message="Email already registered")

        # Update fields
        for key, value in data.items():
            if key == 'password':
                user.set_password(value)
            elif hasattr(user, key):
                setattr(user, key, value)

        try:
            db.session.commit()
            return user # Returns updated user
        except IntegrityError:
            db.session.rollback()
            user_ns.abort(409, message="Update failed: Username or Email might already exist.")
        except Exception as e:
            db.session.rollback()
            user_ns.abort(500, message=f"An error occurred: {str(e)}")

    @user_ns.doc(description='Delete a user by ID.',
                 responses={204: 'User deleted successfully', 404: 'User not found', 500: 'Internal Server Error'})
    def delete(self, user_id):
        """Delete a user by ID"""
        user = User.query.get(user_id)
        if not user:
            user_ns.abort(404, message="User not found")

        try:
            db.session.delete(user)
            db.session.commit()
            return '', 204 # No Content
        except Exception as e:
            db.session.rollback()
            user_ns.abort(500, message=f"An error occurred: {str(e)}")

