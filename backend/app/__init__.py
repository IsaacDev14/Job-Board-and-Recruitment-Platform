# app/__init__.py

from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_bcrypt import Bcrypt
from flask_cors import CORS
from flask_jwt_extended import JWTManager
import os

# --- EXTENSIONS INITIALIZATION ---
db = SQLAlchemy()         # For ORM/database interaction
migrate = Migrate()       # For database migrations
bcrypt = Bcrypt()         # For password hashing
jwt = JWTManager()        # For JWT authentication

def create_app():
    # Create the Flask app instance
    app = Flask(__name__)

    # --- CONFIGURATION SECTION ---

    # SQLite database path inside instance folder
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(app.instance_path, 'jobboard.db')

    # Disable unnecessary modification tracking
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    # Secret keys (should ideally be set via environment variables)
    app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'a_very_secret_key_for_development_only_12345')
    app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY', 'super-secret-jwt-key')

    # JWT token expiration (1 hour)
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = 3600

    # Ensure the instance folder exists
    os.makedirs(app.instance_path, exist_ok=True)

    # --- INITIALIZE EXTENSIONS WITH APP ---
    db.init_app(app)
    migrate.init_app(app, db)
    bcrypt.init_app(app)
    jwt.init_app(app)

    # --- CORS CONFIGURATION ---
    # Allow requests from your frontend at localhost:5173
    CORS(app, supports_credentials=True, resources={
        r"/api/*": {
            "origins": [
                "http://localhost:5173",
                "http://127.0.0.1:5173"
            ],
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"]
        }
    })

    # --- REGISTER YOUR ROUTES/BLUEPRINTS ---
    from app.routes import api_bp  # Import blueprint from your routes package
    app.register_blueprint(api_bp, url_prefix='/api')

    # --- PRINT REGISTERED ROUTES FOR DEBUGGING ---
    print("\n--- Registered Routes ---")
    for rule in app.url_map.iter_rules():
        if str(rule.endpoint).startswith('api.'):
            methods = ', '.join(sorted(rule.methods - {'HEAD', 'OPTIONS'}))
            print(f"Endpoint: {rule.endpoint}, Methods: {methods}, Path: {rule.rule}")
    print("--------------------------\n")

    return app
