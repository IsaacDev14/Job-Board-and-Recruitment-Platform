from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import User, Application
from extensions import db
from utils.helpers import success_response, error_response

users_bp = Blueprint('users', __name__)

@users_bp.route('/users/<int:user_id>/applications', methods=['GET'])
@jwt_required()
def get_user_applications(user_id):
    current_user_id = get_jwt_identity()
    
    # Users can only view their own applications
    if current_user_id != user_id:
        return error_response("You can only view your own applications", 403)
    
    applications = Application.query.filter_by(user_id=user_id).all()
    
    return success_response({
        'applications': [app.to_dict() for app in applications]
    })

@users_bp.route('/users/<int:user_id>', methods=['PATCH'])
@jwt_required()
def update_user_profile(user_id):
    current_user_id = get_jwt_identity()
    
    if current_user_id != user_id:
        return error_response("You can only update your own profile", 403)
    
    user = User.query.get_or_404(user_id)
    data = request.get_json()
    
    # Update allowed fields
    if 'username' in data:
        # Check if username is already taken by another user
        existing_user = User.query.filter_by(username=data['username']).first()
        if existing_user and existing_user.id != user_id:
            return error_response("Username already taken", 400)
        user.username = data['username']
    
    if 'email' in data:
        # Check if email is already taken by another user
        existing_user = User.query.filter_by(email=data['email']).first()
        if existing_user and existing_user.id != user_id:
            return error_response("Email already registered", 400)
        user.email = data['email']
    
    db.session.commit()
    
    return success_response({
        'user': user.to_dict()
    }, "Profile updated successfully")
