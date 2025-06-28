from flask import request
from flask_restx import Namespace, Resource, fields, reqparse
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models import Application, Job, User
from sqlalchemy.orm import joinedload
from datetime import datetime

# Create a Namespace for application-related routes
application_ns = Namespace('applications', description='Job application operations')

# Swagger Models
application_model = application_ns.model('Application', {
    'id': fields.Integer(readOnly=True, description='The unique identifier of the application'),
    'user_id': fields.Integer(required=True, description='ID of the user who applied'),
    'job_id': fields.Integer(required=True, description='ID of the job applied for'),
    'application_date': fields.DateTime(dt_format='iso8601', description='Date the application was submitted'),
    'status': fields.String(description='Status of the application (e.g., pending, accepted, rejected)'),
    'resume_url': fields.String(description='URL to the applicant\'s resume'),
    'cover_letter_text': fields.String(description='Text of the cover letter'),
    'job': fields.Nested(application_ns.model('JobNested', {
        'id': fields.Integer,
        'title': fields.String,
        'location': fields.String,
        'salary': fields.String,
        'salary_range': fields.String(attribute='salary'),
        'description': fields.String,
        'company': fields.Nested(application_ns.model('CompanyNested', {
            'name': fields.String
        }), attribute='company', skip_none=True)
    }), skip_none=True),
    'applicant': fields.Nested(application_ns.model('UserNested', {
        'username': fields.String,
        'email': fields.String,
    }), attribute='applicant', skip_none=True),
})

# Model for POST payload
application_create_model = application_ns.model('ApplicationCreate', {
    'user_id': fields.Integer(required=True),
    'job_id': fields.Integer(required=True),
    'resume_url': fields.String,
    'cover_letter_text': fields.String,
})

# Query params for GET
application_list_parser = reqparse.RequestParser()
application_list_parser.add_argument('user_id', type=int, help='Filter applications by user ID', location='args')
application_list_parser.add_argument('job_id', type=int, help='Filter applications by job ID', location='args')
application_list_parser.add_argument('status', type=str, help='Filter applications by status', location='args')
application_list_parser.add_argument('_expand', type=str, help='Expand related resources (e.g., job, applicant)', location='args', action='append')


@application_ns.route('/', strict_slashes=False)
class ApplicationList(Resource):
    @jwt_required()
    @application_ns.expect(application_list_parser)
    @application_ns.marshal_list_with(application_model)
    def get(self):
        """List all applications for the authenticated user"""
        current_user_id = int(get_jwt_identity())
        args = application_list_parser.parse_args()
        requested_user_id = args.get('user_id')

        if requested_user_id and requested_user_id != current_user_id:
            application_ns.abort(403, message="Forbidden: You can only view your own applications.")

        query = Application.query.filter_by(user_id=current_user_id)

        if args.get('job_id'):
            query = query.filter_by(job_id=args['job_id'])
        if args.get('status'):
            query = query.filter_by(status=args['status'])

        expand_options = args.get('_expand')
        if expand_options:
            if 'job' in expand_options:
                query = query.options(joinedload(Application.job).joinedload(Job.company))
            if 'applicant' in expand_options:
                query = query.options(joinedload(Application.applicant))

        applications = query.all()
        return applications

    @jwt_required()
    @application_ns.expect(application_create_model, validate=True)
    @application_ns.marshal_with(application_model, code=201)
    def post(self):
        """Submit a new job application"""
        data = request.get_json()
        current_user_id = int(get_jwt_identity())

        if data['user_id'] != current_user_id:
            application_ns.abort(403, message="You are not allowed to apply on behalf of another user.")

        user = User.query.get(data['user_id'])
        job = Job.query.get(data['job_id'])

        if not user or not job:
            application_ns.abort(404, message="User or Job not found.")

        existing_application = Application.query.filter_by(user_id=user.id, job_id=job.id).first()
        if existing_application:
            application_ns.abort(400, message="You have already applied for this job.")

        new_app = Application(
            user_id=user.id,
            job_id=job.id,
            resume_url=data.get('resume_url'),
            cover_letter_text=data.get('cover_letter_text'),
            status='pending',
            application_date=datetime.utcnow()
        )

        db.session.add(new_app)
        db.session.commit()

        return new_app, 201
