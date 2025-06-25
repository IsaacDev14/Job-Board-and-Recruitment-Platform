from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import JobListing, Application, User
from extensions import db
from utils.helpers import success_response, error_response

jobs_bp = Blueprint('jobs', __name__)

@jobs_bp.route('/jobs', methods=['GET'])
def get_jobs():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    
    jobs = JobListing.query.filter_by(is_active=True).paginate(
        page=page, per_page=per_page, error_out=False
    )
    
    return success_response({
        'jobs': [job.to_dict() for job in jobs.items],
        'pagination': {
            'page': jobs.page,
            'pages': jobs.pages,
            'per_page': jobs.per_page,
            'total': jobs.total
        }
    })

@jobs_bp.route('/jobs/<int:job_id>', methods=['GET'])
def get_job(job_id):
    job = JobListing.query.get_or_404(job_id)
    
    if not job.is_active:
        return error_response("Job not found", 404)
    
    return success_response({'job': job.to_dict()})

@jobs_bp.route('/jobs', methods=['POST'])
@jwt_required()
def create_job():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if user.role != 'recruiter':
        return error_response("Only recruiters can post jobs", 403)
    
    data = request.get_json()
    
    if not data or not data.get('title') or not data.get('description'):
        return error_response("Title and description are required", 400)
    
    job = JobListing(
        title=data['title'],
        description=data['description'],
        location=data.get('location'),
        salary_range=data.get('salary_range'),
        company_id=user.company_id or data.get('company_id')
    )
    
    db.session.add(job)
    db.session.commit()
    
    return success_response({'job': job.to_dict()}, "Job posted successfully", 201)

@jobs_bp.route('/jobs/<int:job_id>', methods=['PUT'])
@jwt_required()
def update_job(job_id):
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if user.role != 'recruiter':
        return error_response("Only recruiters can update jobs", 403)
    
    job = JobListing.query.get_or_404(job_id)
    
    # Check if user owns this job (through company)
    if job.company_id != user.company_id:
        return error_response("You can only update your company's jobs", 403)
    
    data = request.get_json()
    
    job.title = data.get('title', job.title)
    job.description = data.get('description', job.description)
    job.location = data.get('location', job.location)
    job.salary_range = data.get('salary_range', job.salary_range)
    job.is_active = data.get('is_active', job.is_active)
    
    db.session.commit()
    
    return success_response({'job': job.to_dict()}, "Job updated successfully")

@jobs_bp.route('/jobs/<int:job_id>', methods=['DELETE'])
@jwt_required()
def delete_job(job_id):
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if user.role != 'recruiter':
        return error_response("Only recruiters can delete jobs", 403)
    
    job = JobListing.query.get_or_404(job_id)
    
    if job.company_id != user.company_id:
        return error_response("You can only delete your company's jobs", 403)
    
    db.session.delete(job)
    db.session.commit()
    
    return success_response(message="Job deleted successfully")

@jobs_bp.route('/jobs/<int:job_id>/apply', methods=['POST'])
@jwt_required()
def apply_to_job(job_id):
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if user.role != 'job_seeker':
        return error_response("Only job seekers can apply to jobs", 403)
    
    job = JobListing.query.get_or_404(job_id)
    
    if not job.is_active:
        return error_response("This job is no longer active", 400)
    
    # Check if user already applied
    existing_application = Application.query.filter_by(
        user_id=current_user_id, job_id=job_id
    ).first()
    
    if existing_application:
        return error_response("You have already applied to this job", 400)
    
    application = Application(
        user_id=current_user_id,
        job_id=job_id
    )
    
    db.session.add(application)
    db.session.commit()
    
    return success_response({
        'application': application.to_dict()
    }, "Application submitted successfully", 201)
