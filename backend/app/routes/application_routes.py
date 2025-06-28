# backend/app/routes/application_routes.py

from flask import request
from flask_restx import Namespace, Resource, fields, reqparse
from flask_jwt_extended import jwt_required, get_jwt_identity # Import necessary JWT functions
from app import db
from app.models import Application, Job, User # Import necessary models
from sqlalchemy.orm import joinedload # For eager loading related job and user data

# Create a Namespace for application-related routes
application_ns = Namespace('applications', description='Job application operations')

# Define reusable models for Swagger documentation
# This model includes nested Job and User details for _expand functionality
application_model = application_ns.model('Application', {
    'id': fields.Integer(readOnly=True, description='The unique identifier of the application'),
    'user_id': fields.Integer(required=True, description='ID of the user who applied'),
    'job_id': fields.Integer(required=True, description='ID of the job applied for'),
    'application_date': fields.DateTime(dt_format='iso8601', description='Date the application was submitted'),
    'status': fields.String(description='Status of the application (e.g., pending, accepted, rejected)'),
    'resume_url': fields.String(description='URL to the applicant\'s resume'),
    'cover_letter_text': fields.String(description='Text of the cover letter'),
    # Nested fields for expanded relationships
    'job': fields.Nested(application_ns.model('JobNested', {
        'id': fields.Integer(readOnly=True),
        'title': fields.String,
        'location': fields.String,
        'salary': fields.String, # Backend uses 'salary'
        'salary_range': fields.String(attribute='salary'), # Frontend expects 'salary_range'
        'description': fields.String,
        'company': fields.Nested(application_ns.model('CompanyNested', {
            'name': fields.String
        }), attribute='company', skip_none=True), # Nested company name
    }), skip_none=True), # Use skip_none=True to omit if not expanded
    'applicant': fields.Nested(application_ns.model('UserNested', {
        'username': fields.String,
        'email': fields.String,
    }), attribute='applicant', skip_none=True), # Nested applicant details
})

# Request parser for query parameters for GET /applications
application_list_parser = reqparse.RequestParser()
application_list_parser.add_argument('user_id', type=int, help='Filter applications by user ID', location='args')
application_list_parser.add_argument('job_id', type=int, help='Filter applications by job ID', location='args')
application_list_parser.add_argument('status', type=str, help='Filter applications by status', location='args')
application_list_parser.add_argument('_expand', type=str, help='Expand related resources (e.g., job, user)', location='args', action='append')


@application_ns.route('/', strict_slashes=False)
class ApplicationList(Resource):
    @jwt_required() # Protect this endpoint
    @application_ns.doc(description='Get a list of all job applications for the current user. Can be filtered.',
                        params={
                            'user_id': 'Filter applications by user ID (defaults to current user if not provided)',
                            'job_id': 'Filter applications by job ID',
                            'status': 'Filter applications by status (e.g., pending, accepted)',
                            '_expand': 'Expand related resources (e.g., job, applicant)'
                        },
                        responses={200: 'Success', 401: 'Unauthorized', 403: 'Forbidden', 500: 'Internal Server Error'})
    @application_ns.expect(application_list_parser)
    @application_ns.marshal_list_with(application_model)
    def get(self):
        """List all applications for the authenticated user"""
        # get_jwt_identity() returns a string, convert to int for comparison and query
        current_user_id = int(get_jwt_identity())
        print(f"Backend: Authenticated user ID: {current_user_id} attempting to fetch applications.")

        args = application_list_parser.parse_args()
        
        requested_user_id = args.get('user_id')
        
        # Ensure the requested user_id matches the authenticated user's ID
        # This prevents one user from fetching another user's applications
        if requested_user_id and requested_user_id != current_user_id:
            application_ns.abort(403, message="Forbidden: You can only view your own applications.")

        # Start query, always filtering by the authenticated user's ID
        query = Application.query.filter_by(user_id=current_user_id)

        # Apply additional filters if provided
        if args.get('job_id'):
            query = query.filter_by(job_id=args['job_id'])
        if args.get('status'):
            query = query.filter_by(status=args['status'])

        # Handle _expand for eager loading
        expand_options = args.get('_expand')
        if expand_options:
            if 'job' in expand_options:
                # Eager load job and its associated company
                query = query.options(joinedload(Application.job).joinedload(Job.company))
            if 'applicant' in expand_options:
                query = query.options(joinedload(Application.applicant))
        
        applications = query.all()
        print(f"Backend: Found {len(applications)} applications for user {current_user_id}.")
        return applications
