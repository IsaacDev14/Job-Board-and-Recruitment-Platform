# backend/app/__init__.py

from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_bcrypt import Bcrypt
from flask_cors import CORS
from flask_jwt_extended import JWTManager

from config import Config

db = SQLAlchemy()
migrate = Migrate()
bcrypt = Bcrypt()
jwt = JWTManager()

def create_app():
    app = Flask(__name__)

    # Load config from config.py
    app.config.from_object(Config)

    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)
    bcrypt.init_app(app)
    jwt.init_app(app)

    # Setup CORS
    CORS(app, supports_credentials=True, resources={
        r"/api/*": {
            "origins": [app.config['FRONTEND_URL']],
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"]
        }
    })

    # Import and register Blueprints (assuming you have app/routes.py with api_bp)
    from app.routes import api_bp
    app.register_blueprint(api_bp, url_prefix='/api')

    # Debug: print routes
    print("\n--- Registered Routes ---")
    for rule in app.url_map.iter_rules():
        if rule.endpoint.startswith('api.'):
            methods = ', '.join(sorted(rule.methods - {'HEAD', 'OPTIONS'}))
            print(f"Endpoint: {rule.endpoint}, Methods: {methods}, Path: {rule.rule}")
    print("--------------------------\n")

    return app
