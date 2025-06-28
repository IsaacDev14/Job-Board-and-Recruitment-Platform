from flask import request
from flask_restx import Namespace, Resource, fields, reqparse
from app import db
from app.models import Job, User, Company
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import joinedload
from datetime import datetime

# Namespace
job_ns = Namespace('jobs', description='Job listing operations')

# Swagger output model
job_model = job_ns.model('Job', {
    'id': fields.Integer(readOnly=True),
    'title': fields.String(required=True),
    'description': fields.String(required=True),
    'requirements': fields.String(),
    'location': fields.String(),
    'salary': fields.String(),
    'job_type': fields.String(),
    'date_posted': fields.DateTime(dt_format='iso8601'),
    'expires_date': fields.DateTime(dt_format='iso8601'),
    'recruiter_id': fields.Integer(),
    'company_id': fields.Integer(),
    'is_active': fields.Boolean(),
    'image': fields.String(description='Image URL for job'),
    'company_name': fields.String(attribute='company.name', readOnly=True),
    'recruiter_username': fields.String(attribute='recruiter.username', readOnly=True),
    'salary_range': fields.String(attribute='salary', readOnly=True),
    'type': fields.String(attribute='job_type', readOnly=True),
})

# Swagger input models
job_create_model = job_ns.model('JobCreate', {
    'title': fields.String(required=True),
    'description': fields.String(required=True),
    'requirements': fields.String(),
    'location': fields.String(),
    'salary': fields.String(),
    'job_type': fields.String(),
    'expires_date': fields.DateTime(dt_format='iso8601'),
    'recruiter_id': fields.Integer(required=True),
    'company_id': fields.Integer(),
    'image': fields.String(description='Image URL for job'),
})

job_update_model = job_ns.model('JobUpdate', {
    'title': fields.String(),
    'description': fields.String(),
    'requirements': fields.String(),
    'location': fields.String(),
    'salary': fields.String(),
    'job_type': fields.String(),
    'expires_date': fields.DateTime(dt_format='iso8601'),
    'recruiter_id': fields.Integer(),
    'company_id': fields.Integer(),
    'is_active': fields.Boolean(),
    'image': fields.String(description='Image URL for job'),
})

# Query parser
job_list_parser = reqparse.RequestParser()
job_list_parser.add_argument('location', type=str, location='args')
job_list_parser.add_argument('job_type', type=str, location='args')
job_list_parser.add_argument('company_id', type=int, location='args')
job_list_parser.add_argument('recruiter_id', type=int, location='args')
job_list_parser.add_argument('is_active', type=bool, location='args', default=True)

# /jobs
@job_ns.route('/', strict_slashes=False)
class JobList(Resource):
    @job_ns.expect(job_list_parser)
    @job_ns.marshal_list_with(job_model)
    def get(self):
        """Fetch list of jobs with optional filters."""
        args = job_list_parser.parse_args()
        query = Job.query.options(joinedload(Job.company), joinedload(Job.recruiter))

        if args['location']:
            query = query.filter(Job.location.ilike(f"%{args['location']}%"))
        if args['job_type']:
            query = query.filter(Job.job_type.ilike(f"%{args['job_type']}%"))
        if args['company_id']:
            query = query.filter_by(company_id=args['company_id'])
        if args['recruiter_id']:
            query = query.filter_by(recruiter_id=args['recruiter_id'])
        if args['is_active'] is not None:
            query = query.filter_by(is_active=args['is_active'])

        return query.all()

    @job_ns.expect(job_create_model, validate=True)
    @job_ns.marshal_with(job_model, code=201)
    def post(self):
        """Create a new job listing."""
        data = request.get_json()

        recruiter = User.query.get(data['recruiter_id'])
        if not recruiter or not recruiter.is_recruiter:
            job_ns.abort(404, message="Invalid recruiter ID or user is not a recruiter.")

        if data.get('company_id'):
            company = Company.query.get(data['company_id'])
            if not company:
                job_ns.abort(404, message="Company not found.")

        try:
            new_job = Job(
                title=data['title'],
                description=data['description'],
                requirements=data.get('requirements'),
                location=data.get('location'),
                salary=data.get('salary'),
                job_type=data.get('job_type'),
                expires_date=data.get('expires_date'),
                recruiter_id=data['recruiter_id'],
                company_id=data.get('company_id'),
                image=data.get('image'),
                date_posted=datetime.utcnow(),
                is_active=True
            )
            db.session.add(new_job)
            db.session.commit()
            return new_job, 201
        except Exception as e:
            db.session.rollback()
            job_ns.abort(500, message=f"Error creating job: {str(e)}")

# /jobs/<job_id>
@job_ns.route('/<int:job_id>', strict_slashes=False)
@job_ns.param('job_id', 'The job ID')
class JobResource(Resource):
    @job_ns.marshal_with(job_model)
    def get(self, job_id):
        """Retrieve a single job by ID."""
        job = Job.query.options(joinedload(Job.company), joinedload(Job.recruiter)).get(job_id)
        if not job:
            job_ns.abort(404, message="Job not found")
        return job

    @job_ns.expect(job_update_model, validate=True)
    @job_ns.marshal_with(job_model)
    def put(self, job_id):
        """Update an existing job."""
        job = Job.query.get(job_id)
        if not job:
            job_ns.abort(404, message="Job not found")

        data = request.get_json()

        if 'recruiter_id' in data:
            recruiter = User.query.get(data['recruiter_id'])
            if not recruiter or not recruiter.is_recruiter:
                job_ns.abort(404, message="Invalid recruiter ID or user is not a recruiter.")

        if 'company_id' in data:
            company_id = data['company_id']
            if company_id is not None:
                company = Company.query.get(company_id)
                if not company:
                    job_ns.abort(404, message="Company not found.")
                job.company_id = company_id
            data.pop('company_id', None)

        try:
            for key, value in data.items():
                if hasattr(job, key):
                    setattr(job, key, value)
            db.session.commit()
            return job
        except Exception as e:
            db.session.rollback()
            job_ns.abort(500, message=f"Error updating job: {str(e)}")

    def delete(self, job_id):
        """Delete a job if no applications are linked."""
        job = Job.query.get(job_id)
        if not job:
            job_ns.abort(404, message="Job not found")

        if job.applications:
            job_ns.abort(400, message="Cannot delete job with existing applications")

        try:
            db.session.delete(job)
            db.session.commit()
            return '', 204
        except Exception as e:
            db.session.rollback()
            job_ns.abort(500, message=f"Error deleting job: {str(e)}")
