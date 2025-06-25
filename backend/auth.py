from flask_jwt_extended import create_access_token, create_refresh_token, get_jwt_identity
from models import User
from extensions import db

def authenticate_user(email, password):
    user = User.query.filter_by(email=email).first()
    if user and user.check_password(password):
        return user
    return None

def create_tokens(user):
    access_token = create_access_token(identity=user.id)
    refresh_token = create_refresh_token(identity=user.id)
    return access_token, refresh_token

def get_current_user():
    user_id = get_jwt_identity()
    return User.query.get(user_id)
