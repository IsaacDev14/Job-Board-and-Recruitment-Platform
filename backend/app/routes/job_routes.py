from flask import request
from flask_restx import Namespace, Resource, fields, reqparse
from app import db  # Import the db instance
from app.models import Job, User, Company  # Import Job, User, and Company models
from sqlalchemy.exc import IntegrityError, DataError

# Create a Namespace for job-related routes
job_ns = Namespace('jobs', description='Job operations', path='/jobs')

# Define reusable models for Swagger documentation
job_model = job_ns.model('Job', {
    'id': fields.Integer(readOnly=True, description='The unique identifier of a job posting'),
    'title': fields.String(required=True, description='Title of the job'),
    'description': fields.String(required=True, description='Detailed description of the job'),
    'requirements': fields.String(description='Required skills and qualifications'),
    'location': fields.String(description='Job location (e.g., city, remote)'),
    'salary': fields.Float(description='Advertised salary or salary range'),
    'job_type': fields.String(description='Full-time, Part-time, Contract, etc.'),
    'posted_date': fields.DateTime(dt_format='iso8601', description='Date job was posted'),
    'expires_date': fields.DateTime(dt_format='iso8601', description='Date job expires (optional)'),
    'recruiter_id': fields.Integer(required=True, description='ID of the recruiter who posted the job'),
    'company_id': fields.Integer(required=True, description='ID of the company offering the job'),
    'company_name': fields.String(attribute='company.name', readOnly=True, description='Name of the company (read-only)'),
    'recruiter_username': fields.String(attribute='recruiter.username', readOnly=True, description='Username of the recruiter (read-only)')
})

job_create_model = job_ns.model('JobCreate', {
    'title': fields.String(required=True, description='Title of the job'),
    'description': fields.String(required=True, description='Detailed description of the job'),
    'requirements': fields.String(description='Required skills and qualifications'),
    'location': fields.String(description='Job location (e.g., city, remote)'),
    'salary': fields.Float(description='Advertised salary or salary range'),
    'job_type': fields.String(description='Full-time, Part-time, Contract, etc.'),
    'expires_date': fields.DateTime(dt_format='iso8601', description='Date job expires (optional)'),
    'recruiter_id': fields.Integer(required=True, description='ID of the recruiter who posted the job'),
    'company_id': fields.Integer(required=True, description='ID of the company offering the job')
})

job_update_model = job_ns.model('JobUpdate', {
    'title': fields.String(description='Title of the job'),
    'description': fields.String(description='Detailed description of the job'),
    'requirements': fields.String(description='Required skills and qualifications'),
    'location': fields.String(description='Job location (e.g., city, remote)'),
    'salary': fields.Float(description='Advertised salary or salary range'),
    'job_type': fields.String(description='Full-time, Part-time, Contract, etc.'),
    'expires_date': fields.DateTime(dt_format='iso8601', description='Date job expires (optional)'),
    'recruiter_id': fields.Integer(description='ID of the recruiter who posted the job'),
    'company_id': fields.Integer(description='ID of the company offering the job')
})

# Request parser for query parameters for GET /jobs
job_list_parser = reqparse.RequestParser()
job_list_parser.add_argument('location', type=str, help='Filter by job location', location='args')
job_list_parser.add_argument('job_type', type=str, help='Filter by job type', location='args')
job_list_parser.add_argument('company_id', type=int, help='Filter by company ID', location='args')
job_list_parser.add_argument('recruiter_id', type=int, help='Filter by recruiter ID', location='args')


@job_ns.route('/')
class JobList(Resource):
    @job_ns.doc(description='Get a list of all job postings. Can be filtered by location, type, company, or recruiter.',
                 params={
                     'location': 'Filter jobs by location',
                     'job_type': 'Filter jobs by type (e.g., Full-time)',
                     'company_id': 'Filter jobs by company ID',
                     'recruiter_id': 'Filter jobs by recruiter ID'
                 },
                 responses={200: 'Success', 500: 'Internal Server Error'})
    @job_ns.expect(job_list_parser)
    @job_ns.marshal_list_with(job_model)
    def get(self):
        args = job_list_parser.parse_args()
        query = Job.query.join(User, Job.recruiter_id == User.id)\
                         .join(Company, Job.company_id == Company.id)

        if args.get('location'):
            query = query.filter(Job.location.ilike(f"%{args['location']}%"))
        if args.get('job_type'):
            query = query.filter(Job.job_type.ilike(f"%{args['job_type']}%"))
        if args.get('company_id'):
            query = query.filter_by(company_id=args['company_id'])
        if args.get('recruiter_id'):
            query = query.filter_by(recruiter_id=args['recruiter_id'])

        return query.all()

    @job_ns.doc(description='Create a new job posting.',
                 responses={201: 'Created', 400: 'Bad Request', 404: 'Not Found', 500: 'Server Error'})
    @job_ns.expect(job_create_model, validate=True)
    @job_ns.marshal_with(job_model, code=201)
    def post(self):
        data = request.get_json()
        recruiter = User.query.get(data.get('recruiter_id'))
        if not recruiter or not recruiter.is_recruiter:
            job_ns.abort(404, message="Recruiter not found or not valid")

        company = Company.query.get(data.get('company_id'))
        if not company:
            job_ns.abort(404, message="Company not found")

        try:
            new_job = Job(**data)
            db.session.add(new_job)
            db.session.commit()
            return new_job, 201
        except IntegrityError as e:
            db.session.rollback()
            job_ns.abort(400, message=f"Integrity Error: {str(e.orig)}")
        except DataError as e:
            db.session.rollback()
            job_ns.abort(400, message=f"Data Error: {str(e)}")
        except Exception as e:
            db.session.rollback()
            job_ns.abort(500, message=f"Unexpected Error: {str(e)}")


@job_ns.route('/<int:job_id>')
@job_ns.param('job_id', 'Job ID')
class JobResource(Resource):
    @job_ns.marshal_with(job_model)
    def get(self, job_id):
        job = Job.query.options(db.joinedload(Job.recruiter), db.joinedload(Job.company)).get(job_id)
        if not job:
            job_ns.abort(404, message="Job not found")
        return job

    @job_ns.expect(job_update_model, validate=True)
    @job_ns.marshal_with(job_model)
    def put(self, job_id):
        job = Job.query.get(job_id)
        if not job:
            job_ns.abort(404, message="Job not found")

        data = request.get_json()

        if 'recruiter_id' in data:
            recruiter = User.query.get(data['recruiter_id'])
            if not recruiter or not recruiter.is_recruiter:
                job_ns.abort(404, message="Recruiter not found or invalid")

        if 'company_id' in data:
            company = Company.query.get(data['company_id'])
            if not company:
                job_ns.abort(404, message="Company not found")

        try:
            for key, value in data.items():
                if hasattr(job, key):
                    setattr(job, key, value)
            db.session.commit()
            return job
        except IntegrityError as e:
            db.session.rollback()
            job_ns.abort(400, message=f"Integrity Error: {str(e.orig)}")
        except DataError as e:
            db.session.rollback()
            job_ns.abort(400, message=f"Data Error: {str(e)}")
        except Exception as e:
            db.session.rollback()
            job_ns.abort(500, message=f"Unexpected Error: {str(e)}")

    def delete(self, job_id):
        job = Job.query.get(job_id)
        if not job:
            job_ns.abort(404, message="Job not found")
        try:
            db.session.delete(job)
            db.session.commit()
            return '', 204
        except Exception as e:
            db.session.rollback()
            job_ns.abort(500, message=f"Unexpected Error: {str(e)}")



jobs_ns = job_ns
__all__ = ['jobs_ns']
