# backend/app/models.py

from datetime import datetime
from app import db, bcrypt # Import db and bcrypt from your app package's __init__.py

class User(db.Model):
    """
    Represents a user in the system. Can be a job seeker or a recruiter.
    """
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(64), unique=True, nullable=False, index=True)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(128), nullable=False)
    is_recruiter = db.Column(db.Boolean, default=False, nullable=False)
    date_joined = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    # A user (recruiter) can post many jobs
    jobs_posted = db.relationship('Job', backref='recruiter', lazy=True, foreign_keys='Job.recruiter_id')
    # A user (applicant) can have many applications
    applications = db.relationship('Application', backref='applicant', lazy=True)

    def set_password(self, password):
        """Hashes the given password and stores it."""
        self.password_hash = bcrypt.generate_password_hash(password).decode('utf-8')

    def check_password(self, password):
        """Checks if the given password matches the stored hash."""
        return bcrypt.check_password_hash(self.password_hash, password)

    def to_dict(self, include_password=False):
        """Converts user object to a dictionary for API responses."""
        data = {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'is_recruiter': self.is_recruiter,
            'date_joined': self.date_joined.isoformat() + 'Z' # ISO 8601 format with Z for UTC
        }
        if include_password: # Generally, avoid sending password hash
            data['password_hash'] = self.password_hash
        return data

    def __repr__(self):
        return f"<User {self.username} ({self.email}) - Recruiter: {self.is_recruiter}>"

class Company(db.Model):
    """
    Represents a company that posts job listings.
    """
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(128), unique=True, nullable=False, index=True)
    industry = db.Column(db.String(64))
    description = db.Column(db.Text)
    contact_email = db.Column(db.String(120))
    website = db.Column(db.String(128))
    date_registered = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    # A company can have many job listings
    jobs = db.relationship('Job', backref='company', lazy=True)

    def to_dict(self):
        """Converts company object to a dictionary for API responses."""
        return {
            'id': self.id,
            'name': self.name,
            'industry': self.industry,
            'description': self.description,
            'contact_email': self.contact_email,
            'website': self.website,
            'date_registered': self.date_registered.isoformat() + 'Z'
        }

    def __repr__(self):
        return f"<Company {self.name}>"

class Job(db.Model):
    """
    Represents a job listing posted by a recruiter from a company.
    """
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(128), nullable=False)
    description = db.Column(db.Text, nullable=False)
    requirements = db.Column(db.Text)
    salary = db.Column(db.String(64)) # e.g., "70,000-90,000 USD", "Negotiable"
    location = db.Column(db.String(128))
    date_posted = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    # Foreign Keys
    company_id = db.Column(db.Integer, db.ForeignKey('company.id'), nullable=False)
    recruiter_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    is_active = db.Column(db.Boolean, default=True, nullable=False) # To activate/deactivate job listings

    # Relationships
    # A job can have many applications
    applications = db.relationship('Application', backref='job', lazy=True)

    def to_dict(self, include_company_info=True, include_recruiter_info=True):
        """Converts job object to a dictionary for API responses."""
        data = {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'requirements': self.requirements,
            'salary': self.salary,
            'location': self.location,
            'date_posted': self.date_posted.isoformat() + 'Z',
            'is_active': self.is_active,
            'company_id': self.company_id,
            'recruiter_id': self.recruiter_id
        }
        if include_company_info and self.company:
            data['company_name'] = self.company.name
            # You might want to include more company details:
            # data['company_industry'] = self.company.industry
        if include_recruiter_info and self.recruiter:
            data['recruiter_username'] = self.recruiter.username
            # data['recruiter_email'] = self.recruiter.email
        return data

    def __repr__(self):
        return f"<Job {self.title} at {self.company.name if self.company else 'N/A'}>"

class Application(db.Model):
    """
    Represents a job application submitted by a user for a specific job.
    """
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    job_id = db.Column(db.Integer, db.ForeignKey('job.id'), nullable=False)
    application_date = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    status = db.Column(db.String(64), default='Pending', nullable=False) # e.g., 'Pending', 'Reviewed', 'Accepted', 'Rejected', 'Withdrawn'
    resume_path = db.Column(db.String(256)) # Placeholder for file path if resumes are stored

    # A composite unique constraint to prevent a user from applying to the same job multiple times
    __table_args__ = (db.UniqueConstraint('user_id', 'job_id', name='_user_job_uc'),)

    def to_dict(self, include_user_info=True, include_job_info=True):
        """Converts application object to a dictionary for API responses."""
        data = {
            'id': self.id,
            'user_id': self.user_id,
            'job_id': self.job_id,
            'application_date': self.application_date.isoformat() + 'Z',
            'status': self.status,
            'resume_path': self.resume_path
        }
        if include_user_info and self.applicant:
            data['applicant_username'] = self.applicant.username
            data['applicant_email'] = self.applicant.email
        if include_job_info and self.job:
            data['job_title'] = self.job.title
            data['job_company_name'] = self.job.company.name if self.job.company else 'N/A'
        return data

    def __repr__(self):
        return f"<Application User:{self.user_id} Job:{self.job_id} Status:'{self.status}'>"

