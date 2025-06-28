# backend/app/routes/user_routes.py

from flask import request
from flask_restx import Namespace, Resource, fields
from app import db
from app.models import User # Make sure User is imported
from sqlalchemy.exc import IntegrityError, DataError

user_ns = Namespace('users', description='User operations')

# Define reusable models for Swagger documentation
user_model = user_ns.model('User', {
    'id': fields.Integer(readOnly=True, description='The unique identifier of a user'),
    'username': fields.String(required=True, description='The user\'s username'),
    'email': fields.String(required=True, description='The user\'s email address'),
    'is_recruiter': fields.Boolean(description='Whether the user is a recruiter'),
    'date_joined': fields.DateTime(dt_format='iso8601', description='Date and time the user joined'),
    'role': fields.String(description='User role (e.g., job_seeker, recruiter)') # Assuming you want to expose role
})

user_create_model = user_ns.model('UserCreate', {
    'username': fields.String(required=True, description='User\'s chosen username'),
    'email': fields.String(required=True, description='User\'s email address'),
    'password': fields.String(required=True, description='User\'s password', min_length=6),
    'is_recruiter': fields.Boolean(description='Whether the user is a recruiter', default=False)
})

user_update_model = user_ns.model('UserUpdate', {
    'username': fields.String(description='User\'s chosen username'),
    'email': fields.String(description='User\'s email address'),
    'password': fields.String(description='User\'s new password', min_length=6),
    'is_recruiter': fields.Boolean(description='Whether the user is a recruiter')
})


@user_ns.route('/')
class UserList(Resource):
    @user_ns.doc('list_users')
    @user_ns.marshal_list_with(user_model)
    def get(self):
        """List all users"""
        users = User.query.all()
        return users

    @user_ns.doc('create_user')
    @user_ns.expect(user_create_model, validate=True)
    @user_ns.marshal_with(user_model, code=201)
    def post(self):
        """Create a new user"""
        data = request.get_json()
        
        # Check for existing username or email
        if User.query.filter_by(username=data['username']).first():
            user_ns.abort(409, message="Username already exists.")
        if User.query.filter_by(email=data['email']).first():
            user_ns.abort(409, message="Email already exists.")

        try:
            new_user = User(
                username=data['username'],
                email=data['email'],
                is_recruiter=data.get('is_recruiter', False)
            )
            new_user.password_hash = data['password'] # Use the setter
            db.session.add(new_user)
            db.session.commit()
            return new_user, 201
        except IntegrityError as e:
            db.session.rollback()
            user_ns.abort(400, message=f"Database error: {e.orig}")
        except DataError as e:
            db.session.rollback()
            user_ns.abort(400, message=f"Invalid data: {e}")
        except Exception as e:
            db.session.rollback()
            user_ns.abort(500, message=f"An unexpected error occurred: {str(e)}")


@user_ns.route('/<int:user_id>')
@user_ns.param('user_id', 'The user unique identifier')
class UserResource(Resource):
    @user_ns.doc('get_user')
    @user_ns.marshal_with(user_model)
    def get(self, user_id):
        """Get a user by ID"""
        user = User.query.get(user_id)
        if not user:
            user_ns.abort(404, message="User not found")
        return user

    @user_ns.doc('update_user')
    @user_ns.expect(user_update_model, validate=True)
    @user_ns.marshal_with(user_model)
    def put(self, user_id):
        """Update a user by ID"""
        user = User.query.get(user_id)
        if not user:
            user_ns.abort(404, message="User not found")

        data = request.get_json()
        if not data:
            user_ns.abort(400, message="No input data provided")

        try:
            if 'username' in data and data['username'] != user.username and \
               User.query.filter_by(username=data['username']).first():
                user_ns.abort(409, message="Username already exists.")
            
            if 'email' in data and data['email'] != user.email and \
               User.query.filter_by(email=data['email']).first():
                user_ns.abort(409, message="Email already exists.")

            for key, value in data.items():
                if key == 'password':
                    user.password_hash = value # Use the setter
                elif hasattr(user, key):
                    setattr(user, key, value)
            
            db.session.commit()
            return user
        except IntegrityError as e:
            db.session.rollback()
            user_ns.abort(400, message=f"Database error: {e.orig}")
        except DataError as e:
            db.session.rollback()
            user_ns.abort(400, message=f"Invalid data: {e}")
        except Exception as e:
            db.session.rollback()
            user_ns.abort(500, message=f"An unexpected error occurred: {str(e)}")

    @user_ns.doc('delete_user')
    def delete(self, user_id):
        """Delete a user by ID"""
        user = User.query.get(user_id)
        if not user:
            user_ns.abort(404, message="User not found")
        
        # Optional: Add checks for associated companies/jobs/applications before deleting a user
        # if user.companies.first() or user.jobs_posted.first() or user.applications_made.first():
        #     user_ns.abort(400, message="Cannot delete user with associated data (companies, jobs, applications).")

        try:
            db.session.delete(user)
            db.session.commit()
            return '', 204
        except Exception as e:
            db.session.rollback()
            user_ns.abort(500, message=f"An error occurred: {str(e)}")