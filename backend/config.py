# backend/config.py
import os
from dotenv import load_dotenv

# Get the directory of this config.py file (which is backend/)
basedir = os.path.abspath(os.path.dirname(__file__))


load_dotenv(os.path.join(basedir, '.env')) # Load .env from the backend/ directory

class Config:
    """
    Base configuration class for the Flask application.
    Settings here apply to all environments (development, production, testing).
    """
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'a-default-fallback-secret-key-for-dev'

    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or \
                              'sqlite:///' + os.path.join(basedir, 'app.db')
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    FRONTEND_URL = os.environ.get('FRONTEND_URL') or 'http://localhost:5173'

    # JWT Configuration
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY') or SECRET_KEY # Use SECRET_KEY if JWT_SECRET_KEY not set
    # JWT token expiration in seconds
    JWT_ACCESS_TOKEN_EXPIRES = int(os.environ.get('JWT_ACCESS_TOKEN_EXPIRES_HOURS', 24)) * 3600
