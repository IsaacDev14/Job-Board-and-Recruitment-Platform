# backend/config.py

import os
from dotenv import load_dotenv

basedir = os.path.abspath(os.path.dirname(__file__))

# Load .env from backend root
load_dotenv(os.path.join(basedir, '.env'))

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'dev_secret_key')
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'dev_jwt_secret')
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or \
                              'sqlite:///' + os.path.join(basedir, 'instance', 'app.db')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    FRONTEND_URL = os.environ.get('FRONTEND_URL', 'http://localhost:3000')
    JWT_ACCESS_TOKEN_EXPIRES = 3600  # 1 hour in seconds
