from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_bcrypt import Bcrypt
from flask_cors import CORS
from flask_jwt_extended import JWTManager
import os

db = SQLAlchemy()
migrate = Migrate()
bcrypt = Bcrypt()
jwt = JWTManager()

def create_app():
    app = Flask(__name__)

    # --- APPLICATION CONFIGURATION ---
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(app.instance_path, 'jobboard.db')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'a_very_secret_key_for_development_only_12345')
    # JWT Configuration
    app.config["JWT_SECRET_KEY"] = os.environ.get('JWT_SECRET_KEY', 'super-secret-jwt-key') # Change this in production!
    app.config["JWT_ACCESS_TOKEN_EXPIRES"] = 3600 # Token expires in 1 hour (3600 seconds)

    os.makedirs(app.instance_path, exist_ok=True)
    # --- END CONFIGURATION ---

    # Initialize extensions with the app
    db.init_app(app)
    migrate.init_app(app, db)
    bcrypt.init_app(app)
    jwt.init_app(app)

    # Configure CORS explicitly for your /api/* routes
    # IMPORTANT: Add http://localhost:5173 to origins
    CORS(app, resources={r"/api/*": {
        "origins": ["http://127.0.0.1:5173", "http://localhost:5173"], # Explicitly allow both origins
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }})

    # Import and register your API blueprint
    from app.routes import api_bp
    app.register_blueprint(api_bp, url_prefix='/api')

    # --- DEBUGGING: PRINT REGISTERED ROUTES ON STARTUP ---
    print("\n--- Registered Routes (Flask app.url_map) ---")
    for rule in app.url_map.iter_rules():
        if str(rule.endpoint).startswith('api.'):
            methods = ', '.join(sorted(rule.methods - {'HEAD', 'OPTIONS'}))
            print(f"Endpoint: {rule.endpoint}, Methods: {methods}, Path: {rule.rule}")
    print("------------------------------------------\n")
    # --- END DEBUGGING SECTION ---

    return app
