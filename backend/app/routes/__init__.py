# routes/saved_job_routes.py

from flask import request
from flask_restx import Namespace, Resource, fields
from app import db
from app.models import SavedJob

# Initialize Namespace with strict_slashes=False to prevent redirects
# for requests that might be missing a trailing slash.
saved_ns = Namespace('saved_jobs', description='Saved Jobs operations', strict_slashes=False)

# Define input model for saving a job
saved_model = saved_ns.model('SavedJob', {
    'user_id': fields.Integer(required=True, description='ID of the user saving the job'),
    'job_id': fields.Integer(required=True, description='ID of the job to be saved'),
})

# Output model for a saved job record
saved_output = saved_ns.model('SavedJobOut', {
    'id': fields.Integer(readOnly=True, description='The unique identifier of the saved job record'),
    'user_id': fields.Integer(description='ID of the user who saved the job'),
    'job_id': fields.Integer(description='ID of the job that was saved'),
    'saved_at': fields.String(description='Timestamp when the job was saved', attribute='saved_at.isoformat'),
})


@saved_ns.route('/')
class SavedJobList(Resource):
    @saved_ns.doc(params={'user_id': 'ID of the user to fetch saved jobs for'})
    @saved_ns.marshal_list_with(saved_output)
    def get(self):
        """Get all saved jobs for a specific user"""
        user_id = request.args.get('user_id', type=int)
        if not user_id:
            # Return a clear error message if user_id is missing
            return {"message": "user_id is required as a query parameter"}, 400
        # Fetch all saved jobs for the given user_id
        saved_jobs = SavedJob.query.filter_by(user_id=user_id).all()
        # Convert each SavedJob object to its dictionary representation
        return [s.to_dict() for s in saved_jobs]

    @saved_ns.expect(saved_model, validate=True) # Ensure input data is validated
    @saved_ns.marshal_with(saved_output, code=201)
    def post(self):
        """Save a new job for a user"""
        data = request.get_json()
        user_id = data.get('user_id')
        job_id = data.get('job_id')

        # Basic validation
        if not user_id or not job_id:
            return {"message": "user_id and job_id are required"}, 400

        # Check if the job is already saved by the user to prevent duplicates
        existing_saved_job = SavedJob.query.filter_by(user_id=user_id, job_id=job_id).first()
        if existing_saved_job:
            # If already saved, return the existing record and a 200 OK status
            return existing_saved_job.to_dict(), 200 # Or 409 Conflict if you prefer

        # Create a new SavedJob entry
        new_saved = SavedJob(user_id=user_id, job_id=job_id)
        db.session.add(new_saved)
        db.session.commit()
        # Return the newly created record with a 201 Created status
        return new_saved.to_dict(), 201


@saved_ns.route('/<int:job_id>')
class SavedJobDelete(Resource):
    @saved_ns.doc(params={'user_id': 'ID of the user to delete the saved job for'})
    @saved_ns.response(204, 'Job successfully unsaved')
    @saved_ns.response(400, 'User ID is required')
    @saved_ns.response(404, 'Saved job not found for this user and job ID')
    def delete(self, job_id):
        """Unsave a job (delete a saved job entry)"""
        user_id = request.args.get('user_id', type=int)
        if not user_id:
            # If user_id is missing, return a 400 Bad Request
            return {"message": "user_id is required as a query parameter"}, 400

        # Find the specific saved job entry by user_id and job_id
        saved = SavedJob.query.filter_by(user_id=user_id, job_id=job_id).first()

        if not saved:
            # If no such saved job is found, return a 404 Not Found
            return {"message": "Saved job not found for this user and job ID"}, 404

        # Delete the saved job entry from the database
        db.session.delete(saved)
        db.session.commit()
        # Return a 204 No Content status for successful deletion
        return {"message": "Saved job deleted"}, 204
from flask import Blueprint
from flask_restx import Api

# --- IMPORT ALL YOUR ROUTE NAMESPACES ---
from .user_routes import user_ns          # Handles user-related routes
from .company_routes import company_ns    # Handles company-related routes
from .job_routes import job_ns            # Handles job posting routes
from .auth_routes import auth_ns          # Handles login, registration, JWT auth
from .application_routes import application_ns  # Handles job application submissions
from .saved_job_routes import saved_ns


# --- CREATE THE API BLUEPRINT ---
# This blueprint will be registered in the main app with url_prefix='/api'
# Removed strict_slashes from Blueprint as it's not a valid argument here.
api_bp = Blueprint('api', __name__, url_prefix='/api')

# --- INITIALIZE Flask-RESTx API ON THE BLUEPRINT ---
api = Api(
    api_bp,
    title='Job Board and Recruitment Platform API',
    version='1.0',
    description='A comprehensive API for managing job postings, companies, users, authentication, and job applications.',
    doc='/docs',   # Swagger UI will be accessible at http://localhost:5000/api/docs
    strict_slashes=False # Added strict_slashes=False to the Api constructor
)

# --- REGISTER NAMESPACES ---
api.add_namespace(user_ns, path='/users')              # e.g. /api/users
api.add_namespace(company_ns, path='/companies')       # e.g. /api/companies
api.add_namespace(job_ns, path='/jobs')                # e.g. /api/jobs
api.add_namespace(auth_ns, path='/auth')               # e.g. /api/auth
api.add_namespace(application_ns, path='/applications')  # e.g. /api/applications
api.add_namespace(saved_ns, path='/saved_jobs')
