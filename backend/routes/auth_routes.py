from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import User
from extensions import db
from auth import authenticate_user, create_tokens
from utils.helpers import success_response, error_response, generate_reset_token

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    
    # Validation
    if not data or not data.get('username') or not data.get('email') or not data.get('password'):
        return error_response("Username, email, and password are required", 400)
    
    if not data.get('role') or data.get('role') not in ['job_seeker', 'recruiter']:
        return error_response("Role must be either 'job_seeker' or 'recruiter'", 400)
    
    # Check if user already exists
    if User.query.filter_by(email=data['email']).first():
        return error_response("Email already registered", 400)
    
    if User.query.filter_by(username=data['username']).first():
        return error_response("Username already taken", 400)
    
    # Create new user
    user = User(
        username=data['username'],
        email=data['email'],
        role=data['role'],
        company_id=data.get('company_id')
    )
    user.set_password(data['password'])
    
    db.session.add(user)
    db.session.commit()
    
    # Create tokens
    access_token, refresh_token = create_tokens(user)
    
    return success_response({
        'user': user.to_dict(),
        'access_token': access_token,
        'refresh_token': refresh_token
    }, "User registered successfully", 201)

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    
    if not data or not data.get('email') or not data.get('password'):
        return error_response("Email and password are required", 400)
    
    user = authenticate_user(data['email'], data['password'])
    if not user:
        return error_response("Invalid credentials", 401)
    
    access_token, refresh_token = create_tokens(user)
    
    return success_response({
        'user': user.to_dict(),
        'access_token': access_token,
        'refresh_token': refresh_token
    }, "Login successful")

@auth_bp.route('/forgot-password', methods=['POST'])
def forgot_password():
    data = request.get_json()
    
    if not data or not data.get('email'):
        return error_response("Email is required", 400)
    
    user = User.query.filter_by(email=data['email']).first()
    if user:
        # Generate reset token
        reset_token = generate_reset_token()
        user.reset_token = reset_token
        db.session.commit()
        
        # In a real app, you'd send an email with the reset token
        # For now, we'll just return it in the response
        return success_response({
            'reset_token': reset_token  # Remove this in production
        }, "Password reset token generated")
    
    # Don't reveal if email exists or not
    return success_response(message="If the email exists, a reset token has been sent")

@auth_bp.route('/reset-password', methods=['POST'])
def reset_password():
    data = request.get_json()
    
    if not data or not data.get('token') or not data.get('password'):
        return error_response("Token and new password are required", 400)
    
    user = User.query.filter_by(reset_token=data['token']).first()
    if not user:
        return error_response("Invalid or expired reset token", 400)
    
    user.set_password(data['password'])
    user.reset_token = None  # Clear the reset token
    db.session.commit()
    
    return success_response(message="Password reset successful")
