# backend/app/__init__.py

import os
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_bcrypt import Bcrypt
from flask_restx import Api # Make sure Api is imported

# Initialize SQLAlchemy
db = SQLAlchemy()
# Initialize Flask-Bcrypt
bcrypt = Bcrypt()
# Initialize Migrate
migrate = Migrate()


def create_app():
    app = Flask(__name__)

    # Load configuration from config.py
    app.config.from_object('config.Config')

    # Initialize extensions
    db.init_app(app)
    bcrypt.init_app(app)
    migrate.init_app(app, db) # Initialize migrate with app and db

    # Import models to ensure they are registered with SQLAlchemy for migrations
    from app import models

    # Register blueprints (including your API blueprint)
    from app.routes import api_bp # Import the api_bp blueprint from app.routes
    app.register_blueprint(api_bp)

    # Simple root route for testing
    @app.route('/')
    def index():
        return "Welcome to the Job Board and Recruitment Platform API!"

    return app

