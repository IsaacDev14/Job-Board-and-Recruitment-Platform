# backend/app/__init__.py

from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_bcrypt import Bcrypt
from flask_cors import CORS
import os # Import the os module for path operations and environment variables

db = SQLAlchemy()
migrate = Migrate()
bcrypt = Bcrypt()

def create_app():
    app = Flask(__name__)

    # --- APPLICATION CONFIGURATION ---
    # Configure your database URI
    # For SQLite, it points to a file named 'jobboard.db' inside the instance folder
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(app.instance_path, 'jobboard.db')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False # Suppress a warning

    # Set a secret key for session management and other security features
    # IMPORTANT: In a production environment, fetch this from an environment variable!
    app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'a_very_secret_key_for_development_only_12345')

    # Ensure the instance folder exists for the SQLite database file
    os.makedirs(app.instance_path, exist_ok=True)
    # --- END CONFIGURATION ---

    # Initialize extensions with the app
    db.init_app(app)
    migrate.init_app(app, db)
    bcrypt.init_app(app)

    # Configure CORS for your frontend
    # Replace 'http://localhost:5173' with your actual frontend URL if different
    CORS(app, resources={r"/api/*": {"origins": "http://localhost:5173"}})

    # Import and register your API blueprint
    from app.routes import api_bp
    app.register_blueprint(api_bp)

    # --- DEBUGGING: PRINT REGISTERED ROUTES ON STARTUP ---
    # This section helps verify that your routes are correctly mapped
    print("\n--- Registered Routes (Flask app.url_map) ---")
    for rule in app.url_map.iter_rules():
        # Only print routes belonging to your 'api' blueprint for clarity
        if str(rule.endpoint).startswith('api.'):
            methods = ', '.join(sorted(rule.methods - {'HEAD', 'OPTIONS'}))
            print(f"Endpoint: {rule.endpoint}, Methods: {methods}, Path: {rule.rule}")
    print("------------------------------------------\n")
    # --- END DEBUGGING SECTION ---

    return app