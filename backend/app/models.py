from app import db  # Import the db instance from the app package
from datetime import datetime
from sqlalchemy.ext.hybrid import hybrid_property  # For hybrid properties
from app import bcrypt  # For password hashing

class User(db.Model):
    __tablename__ = 'users'  # Explicitly define table name

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    _password_hash = db.Column(db.String(128), nullable=False)  # Stores the hashed password
    email = db.Column(db.String(120), unique=True, nullable=False)
    is_recruiter = db.Column(db.Boolean, default=False)  # Indicates if user is a recruiter
    date_joined = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    companies = db.relationship('Company', backref='owner', lazy=True, primaryjoin="User.id == Company.owner_id")
    jobs_posted = db.relationship('Job', backref='recruiter', lazy=True, primaryjoin="User.id == Job.recruiter_id")
    applications_made = db.relationship('Application', backref='applicant', lazy=True, primaryjoin="User.id == Application.user_id")

    def __repr__(self):
        return f'<User {self.username}>'

    @hybrid_property
    def password_hash(self):
        """Getter for password_hash, returns the hashed password."""
        return self._password_hash

    @password_hash.setter
    def password_hash(self, password):
        """Setter for password_hash, hashes the plain password using bcrypt."""
        self._password_hash = bcrypt.generate_password_hash(password.encode('utf-8')).decode('utf-8')

    def authenticate(self, password):
        """Authenticates a user by checking the provided password against the stored hash."""
        return bcrypt.check_password_hash(self.password_hash, password.encode('utf-8'))

class Company(db.Model):
    __tablename__ = 'company'  # Explicitly define table name

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)  # Removed unique=True
    industry = db.Column(db.String(120))
    description = db.Column(db.Text)
    contact_email = db.Column(db.String(120))
    website = db.Column(db.String(120))
    date_registered = db.Column(db.DateTime, default=datetime.utcnow)
    owner_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)  # The user who registered the company

    # Relationships
    jobs = db.relationship('Job', backref='company', lazy=True)

    def __repr__(self):
        return f'<Company {self.name}>'

class Job(db.Model):
    __tablename__ = 'jobs'  # Explicitly define table name

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(512), nullable=False)
    description = db.Column(db.Text, nullable=False)
    requirements = db.Column(db.Text)
    location = db.Column(db.String(120))
    salary = db.Column(db.String(80))  # Changed to String to allow ranges/text
    job_type = db.Column(db.String(50))  # e.g., Full-time, Part-time, Contract
    date_posted = db.Column(db.DateTime, default=datetime.utcnow)
    expires_date = db.Column(db.DateTime)
    is_active = db.Column(db.Boolean, default=True)  # Added field for job status
    image = db.Column(db.String(512), nullable=True)  # Added field for image URL

    recruiter_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    company_id = db.Column(db.Integer, db.ForeignKey('company.id'), nullable=True)

    # Relationships
    applications = db.relationship('Application', backref='job', lazy=True)

    def __repr__(self):
        return f'<Job {self.title}>'

class Application(db.Model):
    __tablename__ = 'applications'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    job_id = db.Column(db.Integer, db.ForeignKey('jobs.id'), nullable=False)
    application_date = db.Column(db.DateTime, default=datetime.utcnow)
    status = db.Column(db.String(50), default='pending')  # e.g., 'pending', 'reviewed', 'accepted', 'rejected'
    resume_url = db.Column(db.String(512))  # URL to resume
    cover_letter_text = db.Column(db.Text)  # Optional cover letter text

    def __repr__(self):
        return f'<Application {self.id} by User {self.user_id} for Job {self.job_id}>'
    
class SavedJob(db.Model):
    __tablename__ = 'saved_jobs'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    job_id = db.Column(db.Integer, db.ForeignKey('jobs.id'), nullable=False)
    saved_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships (optional backrefs)
    user = db.relationship('User', backref='saved_jobs', lazy=True)
    job = db.relationship('Job', backref='saved_by_users', lazy=True)

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "job_id": self.job_id,
            "saved_at": self.saved_at.isoformat()
        }

    def __repr__(self):
        return f'<SavedJob User={self.user_id} Job={self.job_id}>'