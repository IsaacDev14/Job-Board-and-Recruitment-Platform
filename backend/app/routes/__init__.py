# backend/app/routes/__init__.py

from flask_restx import Api
from flask import Blueprint

# Import your namespaces
from .user_routes import user_ns
from .company_routes import company_ns
from .job_routes import job_ns
from .auth_routes import auth_ns

# Create a Blueprint for the API
api_bp = Blueprint('api', __name__, url_prefix='/api')

# Initialize Flask-RESTx Api on the blueprint
api = Api(api_bp,
          title='Job Board and Recruitment Platform API',
          version='1.0',
          description='A comprehensive API for managing job postings, companies, and user profiles.',
          doc='/docs') # This sets the Swagger UI endpoint to /api/docs (relative to blueprint prefix)

# Add all namespaces to the API
api.add_namespace(user_ns, path='/users')
api.add_namespace(company_ns, path='/companies')
api.add_namespace(job_ns, path='/jobs')
api.add_namespace(auth_ns, path='/auth')

# Note: The api_bp (Blueprint) itself will be registered with the Flask app in app/__init__.py
# The doc parameter in Api() makes it so that Swagger UI is accessible at /api/docs
# If you want it directly at /docs, you would need to initialize Api on the app directly,
# or set the url_prefix of the blueprint to '/' and doc='/docs'

