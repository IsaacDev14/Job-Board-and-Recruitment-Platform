# backend/app/__init__.py

from flask import Flask, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_bcrypt import Bcrypt
from flask_restx import Api # Make sure Api is imported
from flask_jwt_extended import JWTManager # Import JWTManager
from flask_cors import CORS # Import CORS

# Initialize extensions globally
db = SQLAlchemy()
bcrypt = Bcrypt()
migrate = Migrate()
jwt = JWTManager() # Initialize JWTManager
api = Api( # Initialize Flask-RESTx Api
    version='1.0',
    title='Job Board API',
    description='A comprehensive API for managing job postings, user accounts, companies, and applications.',
    doc='/docs', # This sets the Swagger UI endpoint to /docs (root relative)
    prefix='/api' # <--- ADD THIS LINE: All namespaces will now be prefixed with /api
)

def create_app(config_class=None):
    app = Flask(__name__)

    # Load configuration
    if config_class:
        app.config.from_object(config_class)
    else:
        # Fallback for when create_app is called without a config_class (e.g., by Flask-CLI)
        # Assumes config.py is in the parent directory (backend/)
        from config import Config
        app.config.from_object(Config)

    # Initialize extensions with the app
    db.init_app(app)
    bcrypt.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app) # Initialize JWTManager with the app
    api.init_app(app) # Initialize Flask-RESTx with the app

    # --- CORS Configuration ---
    # Allow requests from your React frontend development server
    # The 'resources' argument specifies which API paths CORS should apply to.
    # The 'origins' argument specifies which domains are allowed to make requests.
    CORS(app, resources={r"/api/*": {"origins": app.config['FRONTEND_URL']}})

    # --- JWT Error Handlers ---
    # Import handlers from a dedicated file and register them
    from . import jwt_handlers
    jwt_handlers.register_jwt_handlers(jwt, api)


    # Import models to ensure they are registered with SQLAlchemy for migrations
    from . import models

    # Register API namespaces (routes)
    # Note: Flask-RESTx handles the API prefix via api.prefix in Api() initialization,
    # so namespaces are added directly without url_prefix here.
    from .routes.auth_routes import auth_ns
    from .routes.user_routes import users_ns
    from .routes.company_routes import companies_ns
    from .routes.job_routes import jobs_ns
    from .routes.application_routes import applications_ns

    api.add_namespace(auth_ns)
    api.add_namespace(users_ns)
    api.add_namespace(companies_ns)
    api.add_namespace(jobs_ns, path='/jobs')
    api.add_namespace(applications_ns)

    # Simple root route for testing (optional, not part of /api prefix)
    @app.route('/')
    def index():
        return "Welcome to the Job Board and Recruitment Platform API!"



    return app
