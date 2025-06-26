# backend/app/routes/user_routes.py

from flask import request
from flask_restx import Namespace, Resource, fields, reqparse
from app import db # Import the db instance
from app.models import User, Company # Import User and Company model
from flask_jwt_extended import jwt_required, get_jwt_identity # Import JWT decorators and functions
from sqlalchemy.exc import IntegrityError

# Create a Namespace for user-related routes
users_ns = Namespace('Users', description='User profile and management operations')

# Define input/output models for Swagger documentation and request parsing
# Output model for general user data (without password_hash)
user_output_model = users_ns.model('UserOutput', {
    'id': fields.Integer(readOnly=True, description='The unique identifier of a user'),
    'username': fields.String(required=True, description='User\'s chosen username'),
    'email': fields.String(required=True, description='User\'s email address'),
    'first_name': fields.String(description='User\'s first name'),
    'last_name': fields.String(description='User\'s last name'),
    'is_recruiter': fields.Boolean(description='Whether the user is a recruiter'),
    'company_id': fields.Integer(description='The ID of the company the recruiter is associated with'),
    'date_joined': fields.DateTime(dt_format='iso8601', description='Date and time the user joined'),
    'updated_at': fields.DateTime(dt_format='iso8601', description='Date and time the user was last updated')
})

# Input model for user creation (includes password)
user_create_model = users_ns.model('UserCreate', {
    'username': fields.String(required=True, description='User\'s chosen username'),
    'email': fields.String(required=True, description='User\'s email address'),
    'password': fields.String(required=True, description='User\'s password', min_length=6),
    'first_name': fields.String(description='User\'s first name'),
    'last_name': fields.String(description='User\'s last name'),
    'is_recruiter': fields.Boolean(description='Whether the user is a recruiter', default=False),
    'company_id': fields.Integer(description='ID of the company if the user is a recruiter')
})

# Input model for user update (all fields optional for PUT/PATCH)
user_update_model = users_ns.model('UserUpdate', {
    'username': fields.String(description='User\'s chosen username'),
    'email': fields.String(description='User\'s email address'),
    'password': fields.String(description='User\'s new password', min_length=6),
    'first_name': fields.String(description='User\'s first name'),
    'last_name': fields.String(description='User\'s last name'),
    'is_recruiter': fields.Boolean(description='Whether the user is a recruiter'),
    'company_id': fields.Integer(description='ID of the company if the user is a recruiter')
})

# Request parser for query parameters (e.g., for filtering/pagination)
user_list_parser = reqparse.RequestParser()
user_list_parser.add_argument('is_recruiter', type=fields.Boolean, help='Filter by recruiter status (true/false)', location='args', required=False)
user_list_parser.add_argument('username', type=str, help='Filter by username (case-insensitive substring match)', location='args', required=False)


@users_ns.route('/')
class UserList(Resource):
    @users_ns.doc(description='Get a list of all users. Can be filtered by username or recruiter status.',
                 responses={
                     200: 'Success (returns a list of users)',
                     403: 'Permission denied',
                     500: 'Internal Server Error'
                 })
    @users_ns.expect(user_list_parser) # Apply the parser for query args
    @users_ns.marshal_list_with(user_output_model) # Use marshal_list_with for a list of objects
    @jwt_required() # Protect this endpoint
    def get(self):
        """Get all users"""
        current_user_id = get_jwt_identity()
        current_user = User.query.get(current_user_id)

        if not current_user:
            users_ns.abort(404, message="Authenticated user not found.")

        # Non-recruiters can only view their own profile in a list context
        if not current_user.is_recruiter:
            return [current_user.to_dict()]

        # For recruiters, apply filters
        args = user_list_parser.parse_args()
        query = User.query

        if args.get('username'):
            query = query.filter(User.username.ilike(f"%{args['username']}%"))
        if args.get('is_recruiter') is not None:
            query = query.filter_by(is_recruiter=args['is_recruiter'])

        users = query.all()
        return users # Flask-RESTx will marshal this list of objects

    @users_ns.doc(description='Create a new user account. Only recruiters can create other user accounts.',
                 responses={
                     201: 'User created successfully',
                     400: 'Validation Error',
                     403: 'Permission denied',
                     409: 'Username or Email already taken',
                     404: 'Company not found (if recruiter with invalid company_id)',
                     500: 'Internal Server Error'
                 })
    @users_ns.expect(user_create_model, validate=True)
    @users_ns.marshal_with(user_output_model, code=201)
    @jwt_required()
    def post(self):
        """Create a new user"""
        current_user_id = get_jwt_identity()
        current_user = User.query.get(current_user_id)

        # Only recruiters (or admins, if implemented) can create other users
        if not current_user or not current_user.is_recruiter:
            users_ns.abort(403, message='Permission denied. Only recruiters can create new user accounts.')

        data = request.get_json()

        username = data['username']
        email = data['email']
        password = data['password']
        is_recruiter_new_user = data.get('is_recruiter', False)
        company_id_new_user = data.get('company_id')

        if User.query.filter_by(username=username).first():
            users_ns.abort(409, message="Username already taken.")
        if User.query.filter_by(email=email).first():
            users_ns.abort(409, message="Email already registered.")

        # If the new user is a recruiter, validate company_id
        if is_recruiter_new_user:
            if company_id_new_user is None:
                users_ns.abort(400, message="Recruiter must be associated with a company_id.")
            company = Company.query.get(company_id_new_user)
            if not company:
                users_ns.abort(404, message=f"Company with ID {company_id_new_user} not found.")

        try:
            new_user = User(
                username=username,
                email=email,
                first_name=data.get('first_name'),
                last_name=data.get('last_name'),
                is_recruiter=is_recruiter_new_user,
                company_id=company_id_new_user if is_recruiter_new_user else None
            )
            new_user.set_password(password)

            db.session.add(new_user)
            db.session.commit()
            return new_user, 201
        except IntegrityError:
            db.session.rollback()
            users_ns.abort(409, message="Error creating user: username or email might already exist.")
        except Exception as e:
            db.session.rollback()
            users_ns.abort(500, message=f"An unexpected error occurred: {str(e)}")


@users_ns.route('/<int:id>')
@users_ns.param('id', 'The user unique identifier')
class UserResource(Resource):
    @users_ns.doc(description='Get a user by ID.',
                 responses={200: 'Success', 403: 'Permission denied', 404: 'User not found', 500: 'Internal Server Error'})
    @users_ns.marshal_with(user_output_model)
    @jwt_required()
    def get(self, id):
        """Get a user by ID"""
        current_user_id = get_jwt_identity()
        current_user = User.query.get(current_user_id)

        if not current_user:
            users_ns.abort(404, message="Authenticated user not found.")

        user = User.query.get_or_404(id, description='User not found.')

        # Security check: A user can only view their own profile unless they are a recruiter
        if not current_user.is_recruiter and current_user.id != id:
            users_ns.abort(403, message='Permission denied. You can only view your own profile.')

        return user # Flask-RESTx will marshal this

    @users_ns.doc(description='Update an existing user by ID. Only authenticated user (for their own profile) or recruiter can update.',
                 responses={
                     200: 'User updated successfully',
                     400: 'Validation Error',
                     403: 'Permission denied',
                     404: 'User or Company not found',
                     409: 'Username or Email already taken',
                     500: 'Internal Server Error'
                 })
    @users_ns.expect(user_update_model, validate=True, skip_none=True) # skip_none=True for partial updates
    @users_ns.marshal_with(user_output_model)
    @jwt_required()
    def put(self, id):
        """Update a user by ID (partial or full replacement)"""
        current_user_id = get_jwt_identity()
        current_user = User.query.get(current_user_id)

        if not current_user:
            users_ns.abort(404, message="Authenticated user not found.")

        user = User.query.get_or_404(id, description='User not found.')

        # Security check: A user can only update their own profile unless they are a recruiter
        if not current_user.is_recruiter and current_user.id != id:
            users_ns.abort(403, message='Permission denied. You can only update your own profile.')

        data = request.get_json()
        if not data:
            users_ns.abort(400, message="No input data provided for update.")

        # Handle unique constraints for username and email if they are being updated
        if 'username' in data and data['username'] != user.username and \
           User.query.filter_by(username=data['username']).first():
            users_ns.abort(409, message="Username already taken.")
        if 'email' in data and data['email'] != user.email and \
           User.query.filter_by(email=data['email']).first():
            users_ns.abort(409, message="Email already registered.")

        # Handle password update separately
        if 'password' in data:
            user.set_password(data['password'])
            # We explicitly don't set password_hash using setattr below
            del data['password'] # Remove from data to avoid direct assignment

        # Validate company_id if recruiter status or company_id is being changed
        if 'is_recruiter' in data and data['is_recruiter']:
            if 'company_id' not in data or data['company_id'] is None:
                users_ns.abort(400, message="Recruiter must be associated with a company_id.")
            company = Company.query.get(data['company_id'])
            if not company:
                users_ns.abort(404, message=f"Company with ID {data['company_id']} not found.")
        elif 'company_id' in data and data['company_id'] is not None and not user.is_recruiter:
             users_ns.abort(400, message="Only recruiters can be associated with a company_id.")
        elif 'company_id' in data and data['company_id'] is None and user.is_recruiter:
             users_ns.abort(400, message="Recruiter must be associated with a company_id. Cannot set to null.")


        try:
            for key, value in data.items():
                # Avoid updating primary key, timestamps, and password_hash (handled by set_password)
                if hasattr(user, key) and key not in ['id', 'date_joined', 'updated_at', 'password_hash']:
                    setattr(user, key, value)
            db.session.commit()
            return user # Flask-RESTx will marshal this
        except IntegrityError:
            db.session.rollback()
            users_ns.abort(409, message="Update failed: Username or Email might already exist.")
        except Exception as e:
            db.session.rollback()
            users_ns.abort(500, message=f"An unexpected error occurred during update: {str(e)}")

    @users_ns.doc(description='Delete a user by ID. Only authenticated user (for their own profile) or recruiter can delete.',
                 responses={204: 'User deleted successfully', 403: 'Permission denied', 404: 'User not found', 500: 'Internal Server Error'})
    def delete(self, id):
        """Delete a user by ID"""
        current_user_id = get_jwt_identity()
        current_user = User.query.get(current_user_id)

        if not current_user:
            users_ns.abort(404, message="Authenticated user not found.")

        user = User.query.get_or_404(id, description='User not found.')

        # Security check: A user can only delete their own profile unless they are a recruiter
        if not current_user.is_recruiter and current_user.id != id:
            users_ns.abort(403, message='Permission denied. You can only delete your own profile.')

        try:
            db.session.delete(user)
            db.session.commit()
            return '', 204 # No Content
        except Exception as e:
            db.session.rollback()
            users_ns.abort(500, message=f"An unexpected error occurred during deletion: {str(e)}")

