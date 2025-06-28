# backend/app/routes/job_routes.py

from flask import request
from flask_restx import Namespace, Resource, fields, reqparse
from app import db # Import the db instance
from app.models import Job, User, Company # Import Job, User, and Company models
from sqlalchemy.exc import IntegrityError, DataError
from sqlalchemy.orm import joinedload # Import joinedload for eager loading
from datetime import datetime # Import datetime for date_posted

# Create a Namespace for job-related routes
job_ns = Namespace('jobs', description='Job listing operations')

# Define reusable models for Swagger documentation
job_model = job_ns.model('Job', {
    'id': fields.Integer(readOnly=True, description='The unique identifier of a job posting'),
    'title': fields.String(required=True, description='Title of the job'),
    'description': fields.String(required=True, description='Detailed description of the job'),
    'requirements': fields.String(description='Required skills and qualifications'),
    'location': fields.String(description='Job location (e.g., city, remote)'),
    'salary': fields.String(description='Advertised salary or salary range'),
    'job_type': fields.String(description='Full-time, Part-time, Contract, etc.'),
    'date_posted': fields.DateTime(dt_format='iso8601', description='Date job was posted'),
    'expires_date': fields.DateTime(dt_format='iso8601', description='Date job expires (optional)'),
    'recruiter_id': fields.Integer(required=True, description='ID of the recruiter who posted the job'),
    'company_id': fields.Integer(description='ID of the company offering the job (optional)'), # No longer required
    'is_active': fields.Boolean(description='Whether the job posting is active'),
    # You might want to embed company/recruiter details here or have separate endpoints
    'company_name': fields.String(attribute='company.name', readOnly=True, description='Name of the company (read-only)'),
    'recruiter_username': fields.String(attribute='recruiter.username', readOnly=True, description='Username of the recruiter (read-only)'),
    # Add salary_range for frontend compatibility (if frontend expects this specifically)
    'salary_range': fields.String(attribute='salary', readOnly=True, description='Advertised salary or salary range (for frontend)'),
    'type': fields.String(attribute='job_type', readOnly=True, description='Job type (for frontend)') # Added for frontend compatibility
})

job_create_model = job_ns.model('JobCreate', {
    'title': fields.String(required=True, description='Title of the job'),
    'description': fields.String(required=True, description='Detailed description of the job'),
    'requirements': fields.String(description='Required skills and qualifications'),
    'location': fields.String(description='Job location (e.g., city, remote)'),
    'salary': fields.String(description='Advertised salary or salary range'),
    'job_type': fields.String(description='Full-time, Part-time, Contract, etc.'),
    'expires_date': fields.DateTime(dt_format='iso8601', description='Date job expires (optional)'),
    'recruiter_id': fields.Integer(required=True, description='ID of the recruiter who posted the job'),
    'company_id': fields.Integer(description='ID of the company offering the job (optional)') # REMOVED required=True
})

job_update_model = job_ns.model('JobUpdate', {
    'title': fields.String(description='Title of the job'),
    'description': fields.String(description='Detailed description of the job'),
    'requirements': fields.String(description='Required skills and qualifications'),
    'location': fields.String(description='Job location (e.g., city, remote)'),
    'salary': fields.String(description='Advertised salary or salary range'),
    'job_type': fields.String(description='Full-time, Part-time, Contract, etc.'),
    'expires_date': fields.DateTime(dt_format='iso8601', description='Date job expires (optional)'),
    'recruiter_id': fields.Integer(description='ID of the recruiter who posted the job'),
    'company_id': fields.Integer(description='ID of the company offering the job (optional)'), # Ensure no required=True
    'is_active': fields.Boolean(description='Whether the job posting is active'),
})

# Request parser for query parameters for GET /jobs
job_list_parser = reqparse.RequestParser()
job_list_parser.add_argument('location', type=str, help='Filter by job location', location='args')
job_list_parser.add_argument('job_type', type=str, help='Filter by job type', location='args')
job_list_parser.add_argument('company_id', type=int, help='Filter by company ID', location='args')
job_list_parser.add_argument('recruiter_id', type=int, help='Filter by recruiter ID', location='args')
job_list_parser.add_argument('is_active', type=bool, help='Filter by active status', location='args', default=True)


@job_ns.route('/', strict_slashes=False)
class JobList(Resource):
    @job_ns.doc(description='Get a list of all job postings. Can be filtered by location, type, company, or recruiter.',
                params={
                    'location': 'Filter jobs by location',
                    'job_type': 'Filter jobs by type (e.g., Full-time)',
                    'company_id': 'Filter jobs by company ID',
                    'recruiter_id': 'Filter jobs by recruiter ID',
                    'is_active': 'Filter by active status (true/false)'
                },
                responses={200: 'Success', 500: 'Internal Server Error'})
    @job_ns.expect(job_list_parser)
    @job_ns.marshal_list_with(job_model)
    def get(self):
        """Get all job postings with optional filters"""
        print("Fetching all jobs...")
        args = job_list_parser.parse_args()

        # Start with a query that eager loads company and recruiter information
        query = Job.query.options(joinedload(Job.company), joinedload(Job.recruiter))

        if args.get('location'):
            query = query.filter(Job.location.ilike(f"%{args['location']}%"))
        if args.get('job_type'):
            query = query.filter(Job.job_type.ilike(f"%{args['job_type']}%"))

        if args.get('company_id'):
            query = query.filter_by(company_id=args['company_id'])

        if args.get('recruiter_id'):
            query = query.filter_by(recruiter_id=args['recruiter_id'])

        # Filter by active status
        if args.get('is_active') is not None:
            query = query.filter_by(is_active=args['is_active'])

        jobs = query.all()
        print(f"Found {len(jobs)} jobs.")

        return jobs

    @job_ns.doc(description='Create a new job posting.',
                responses={
                    201: 'Job created successfully',
                    400: 'Validation Error / Invalid Foreign Key',
                    404: 'Recruiter or Company not found',
                    500: 'Internal Server Error'
                })
    @job_ns.expect(job_create_model, validate=True)
    @job_ns.marshal_with(job_model, code=201)
    def post(self):
        """Create a new job posting"""
        data = request.get_json()
        print("Received job creation data: ", data)

        recruiter_id = data.get('recruiter_id')

        # Validate recruiter - still required
        recruiter = User.query.get(recruiter_id)
        if not recruiter or not recruiter.is_recruiter:
            job_ns.abort(404, message=f"Recruiter with ID {recruiter_id} not found or is not a recruiter.")

        # Handle company_id - now optional
        company_id = data.get('company_id')
        if company_id is not None: # Only validate if company_id was actually provided (and not None)
            company = Company.query.get(company_id)
            if not company:
                job_ns.abort(404, message=f"Company with ID {company_id} not found.")
        # If company_id is not provided in data, or is explicitly None, it will be handled as None by SQLAlchemy due to nullable=True

        try:
            new_job = Job(
                title=data['title'],
                description=data['description'],
                requirements=data.get('requirements'),
                location=data.get('location'),
                salary=data.get('salary'),
                job_type=data.get('job_type'),
                expires_date=data.get('expires_date'), # datetime will be handled by SQLAlchemy
                recruiter_id=recruiter_id,
                company_id=company_id # This will correctly be None if not provided or set to null
            )

            db.session.add(new_job)
            db.session.commit()
            print(f"Job '{new_job.title}' created successfully with ID: {new_job.id}")
            return new_job, 201
        except IntegrityError as e:
            db.session.rollback()
            # This catches issues like non-existent foreign keys or other DB constraints
            print(f"IntegrityError detail: {e.orig}")
            job_ns.abort(400, message=f"Database error: Check if recruiter_id exists or data types are correct. Detail: {str(e.orig)}")
        except DataError as e:
            db.session.rollback()
            print(f"DataError detail: {e}")
            job_ns.abort(400, message=f"Invalid data format for one of the fields. Detail: {str(e)}")
        except KeyError as e: # Catch KeyError if a required field like 'title' or 'description' is missing
            db.session.rollback()
            print(f"KeyError detail: {e}")
            job_ns.abort(400, message=f"Missing required field in payload: {str(e)}")
        except Exception as e:
            db.session.rollback()
            print(f"Unexpected error posting job: {e}")
            job_ns.abort(500, message=f"An unexpected error occurred: {str(e)}")


@job_ns.route('/<int:job_id>')
@job_ns.param('job_id', 'The unique identifier of a job posting')
class JobResource(Resource):
    @job_ns.doc(description='Get a job posting by ID.',
                responses={200: 'Success', 404: 'Job not found', 500: 'Internal Server Error'})
    @job_ns.marshal_with(job_model)
    def get(self, job_id):
        """Get a job posting by ID"""
        # Eager load related recruiter and company for marshaling
        job = Job.query.options(db.joinedload(Job.recruiter), db.joinedload(Job.company)).get(job_id)
        if not job:
            job_ns.abort(404, message="Job posting not found")
        return job

    @job_ns.doc(description='Update an existing job posting by ID.',
                responses={
                    200: 'Job updated successfully',
                    400: 'Validation Error / Invalid Foreign Key',
                    404: 'Job, Recruiter, or Company not found',
                    500: 'Internal Server Error'
                })
    @job_ns.expect(job_update_model, validate=True)
    @job_ns.marshal_with(job_model)
    def put(self, job_id):
        """Update a job posting by ID"""
        job = Job.query.get(job_id)
        if not job:
            job_ns.abort(404, message="Job posting not found")

        data = request.get_json()
        if not data:
            job_ns.abort(400, message="No input data provided")

        # Validate recruiter_id if provided
        if 'recruiter_id' in data:
            recruiter = User.query.get(data['recruiter_id'])
            if not recruiter or not recruiter.is_recruiter:
                job_ns.abort(404, message=f"Recruiter with ID {data['recruiter_id']} not found or is not a recruiter.")

        # Handle company_id update - now optional
        if 'company_id' in data: # Check if the key exists in the incoming data
            company_id_from_data = data['company_id']
            if company_id_from_data is not None: # If a value is provided and it's not null
                company = Company.query.get(company_id_from_data)
                if not company:
                    job_ns.abort(404, message=f"Company with ID {company_id_from_data} not found.")
            # If company_id_from_data is None, it's valid and will be set as null in DB
            setattr(job, 'company_id', company_id_from_data)
            data.pop('company_id', None) # Remove from data so the loop below doesn't overwrite if it's already set


        try:
            for key, value in data.items():
                if hasattr(job, key):
                    setattr(job, key, value)
            db.session.commit()
            return job
        except IntegrityError as e:
            db.session.rollback()
            print(f"IntegrityError during job update: {e.orig}")
            job_ns.abort(400, message=f"Database error: Check if recruiter_id or company_id exist. Detail: {str(e.orig)}")
        except DataError as e:
            db.session.rollback()
            print(f"DataError during job update: {e}")
            job_ns.abort(400, message=f"Invalid data format for one of the fields. Detail: {str(e)}")
        except Exception as e:
            db.session.rollback()
            print(f"Unexpected error during job update: {e}")
            job_ns.abort(500, message=f"An unexpected error occurred: {str(e)}")


    @job_ns.doc(description='Delete a job posting by ID.',
                responses={204: 'Job deleted successfully', 400: 'Cannot delete job with associated applications', 404: 'Job not found', 500: 'Internal Server Error'})
    def delete(self, job_id):
        """Delete a job posting by ID"""
        job = Job.query.get(job_id)
        if not job:
            job_ns.abort(404, message="Job posting not found")

        # Check if there are any applications associated with this job
        # Assuming you have an Application model and relationship
        if hasattr(job, 'applications') and job.applications.first():
            job_ns.abort(400, message="Cannot delete job: There are applications associated with this job.")

        try:
            db.session.delete(job)
            db.session.commit()
            return '', 204
        except Exception as e:
            db.session.rollback()
            print(f"Unexpected error deleting job: {e}")
            job_ns.abort(500, message=f"An error occurred: {str(e)}")