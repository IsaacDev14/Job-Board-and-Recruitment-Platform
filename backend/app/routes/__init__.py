from flask import Blueprint
from flask_restx import Api

# --- IMPORT ALL YOUR ROUTE NAMESPACES ---
from .user_routes import user_ns           # Handles user-related routes
from .company_routes import company_ns     # Handles company-related routes
from .job_routes import job_ns             # Handles job posting routes
from .auth_routes import auth_ns           # Handles login, registration, JWT auth
from .application_routes import application_ns  # Handles job application submissions

# --- CREATE THE API BLUEPRINT ---
# This blueprint will be registered in the main app with url_prefix='/api'
api_bp = Blueprint('api', __name__, url_prefix='/api')

# --- INITIALIZE Flask-RESTx API ON THE BLUEPRINT ---
api = Api(
    api_bp,
    title='Job Board and Recruitment Platform API',
    version='1.0',
    description='A comprehensive API for managing job postings, companies, users, authentication, and job applications.',
    doc='/docs'  # Swagger UI will be accessible at http://localhost:5000/api/docs
)

# --- REGISTER NAMESPACES ---
api.add_namespace(user_ns, path='/users')              # e.g. /api/users
api.add_namespace(company_ns, path='/companies')       # e.g. /api/companies
api.add_namespace(job_ns, path='/jobs')                # e.g. /api/jobs
api.add_namespace(auth_ns, path='/auth')               # e.g. /api/auth
api.add_namespace(application_ns, path='/applications')  # e.g. /api/applications
