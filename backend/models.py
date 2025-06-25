from extensions import db
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from sqlalchemy.orm import validates

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.Enum('job_seeker', 'recruiter', name='user_roles'), nullable=False)
    company_id = db.Column(db.Integer, db.ForeignKey('companies.id'), nullable=True)
    reset_token = db.Column(db.String(255), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    applications = db.relationship('Application', backref='user', lazy=True, cascade='all, delete-orphan')
    company = db.relationship('Company', backref='employees')
    
    @validates('role')
    def validate_role(self, key, role):
        if role not in ['job_seeker', 'recruiter']:
            raise ValueError('Role must be either job_seeker or recruiter')
        return role
    
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
    
    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'role': self.role,
            'company_id': self.company_id,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class Company(db.Model):
    __tablename__ = 'companies'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True, nullable=False)
    description = db.Column(db.Text, nullable=True)
    industry = db.Column(db.String(100), nullable=True)
    location = db.Column(db.String(100), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    job_listings = db.relationship('JobListing', backref='company', lazy=True, cascade='all, delete-orphan')
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'industry': self.industry,
            'location': self.location,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class JobListing(db.Model):
    __tablename__ = 'job_listings'
    
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=False)
    location = db.Column(db.String(100), nullable=True)
    salary_range = db.Column(db.String(100), nullable=True)
    company_id = db.Column(db.Integer, db.ForeignKey('companies.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    is_active = db.Column(db.Boolean, default=True)
    
    # Relationships
    applications = db.relationship('Application', backref='job_listing', lazy=True, cascade='all, delete-orphan')
    
    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'location': self.location,
            'salary_range': self.salary_range,
            'company_id': self.company_id,
            'company': self.company.to_dict() if self.company else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'is_active': self.is_active
        }

class Application(db.Model):
    __tablename__ = 'applications'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    job_id = db.Column(db.Integer, db.ForeignKey('job_listings.id'), nullable=False)
    status = db.Column(db.Enum('pending', 'reviewed', 'accepted', 'rejected', name='application_status'), default='pending')
    applied_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    @validates('status')
    def validate_status(self, key, status):
        if status not in ['pending', 'reviewed', 'accepted', 'rejected']:
            raise ValueError('Status must be one of: pending, reviewed, accepted, rejected')
        return status
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'job_id': self.job_id,
            'status': self.status,
            'applied_at': self.applied_at.isoformat() if self.applied_at else None,
            'job_listing': self.job_listing.to_dict() if self.job_listing else None,
            'user': self.user.to_dict() if self.user else None
        }
