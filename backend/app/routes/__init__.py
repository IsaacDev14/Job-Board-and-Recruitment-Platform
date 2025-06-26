from flask_restx import Api
from flask import Blueprint

# ✅ Import updated namespaces using correct variable names
from .user_routes import users_ns
from .company_routes import companies_ns
from .job_routes import jobs_ns
from .auth_routes import auth_ns
from .application_routes import applications_ns

# Create a Blueprint for the API
api_bp = Blueprint('api', __name__, url_prefix='/api')

# Initialize Flask-RESTx Api on the blueprint
api = Api(api_bp,
          title='Job Board and Recruitment Platform API',
          version='1.0',
          description='A comprehensive API for managing job postings, companies, applications, and user profiles.',
          doc='/docs')  # Swagger UI at /api/docs

# Add all namespaces to the API
api.add_namespace(auth_ns, path='/auth')
api.add_namespace(users_ns, path='/users')
api.add_namespace(companies_ns, path='/companies')
api.add_namespace(jobs_ns, path='/jobs')
api.add_namespace(applications_ns, path='/applications')
