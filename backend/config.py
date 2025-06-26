# backend/config.py
import os
from dotenv import load_dotenv

# Get the directory of this config.py file (which is backend/)
basedir = os.path.abspath(os.path.dirname(__file__))

# Go up one level to the project root where .env is located
project_root = os.path.abspath(os.path.join(basedir, os.pardir))

# Load environment variables from .env file located at the project root
load_dotenv(os.path.join(project_root, '.env'))

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'your-very-secret-key'
    # Use DATABASE_URL from .env, or fallback to sqlite in the backend/ directory
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or \
                              'sqlite:///' + os.path.join(basedir, 'app.db')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    FRONTEND_URL = os.environ.get('FRONTEND_URL') or 'http://localhost:3000' # Default for React dev server

