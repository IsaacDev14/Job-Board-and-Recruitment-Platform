# backend/app/routes/__init__.py

from flask_restx import Api
from flask import Blueprint

# Import all your namespaces
from .user_routes import user_ns
from .company_routes import company_ns
from .job_routes import job_ns
from .auth_routes import auth_ns
from .application_routes import application_ns  # NEW: Import application_ns

# Create a Blueprint for the API
api_bp = Blueprint('api', __name__, url_prefix='/api')

# Initialize Flask-RESTx Api on the blueprint
api = Api(api_bp,
          title='Job Board and Recruitment Platform API',
          version='1.0',
          description='A comprehensive API for managing job postings, companies, and user profiles.',
          doc='/docs')  # Swagger UI available at /api/docs

# Add all namespaces to the API
api.add_namespace(user_ns, path='/users')
api.add_namespace(company_ns, path='/companies')
api.add_namespace(job_ns, path='/jobs')
api.add_namespace(auth_ns, path='/auth')
api.add_namespace(application_ns, path='/applications')  # Register application_ns
