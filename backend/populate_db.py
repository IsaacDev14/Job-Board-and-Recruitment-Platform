# backend/populate_db.py

import os
from datetime import datetime, timedelta
from app import create_app, db # Import create_app and db
from app.models import User, Company, Job, Application # Import all your models
from config import Config # Import your Config class

# Create the Flask application context
app = create_app(Config)
app.app_context().push() # Push an application context

# --- IMPORTANT: Create all database tables if they don't exist ---
# This line will inspect your models and create corresponding tables in your database
# It's good for initial setup or if you dropped tables directly.
# For migrations managed by Flask-Migrate, 'flask db upgrade' is usually preferred.
db.create_all()
# ------------------------------------------------------------------

def populate_database():
    """
    Populates the database with dummy users, companies, jobs, and applications.
    """
    print("Populating database with dummy data...")

    # Clear existing data (optional, for fresh runs)
    print("Clearing existing data...")
    # Order matters here due to foreign key constraints:
    # Applications depend on Jobs and Users
    # Jobs depend on Companies and Users (recruiters)
    try:
        db.session.query(Application).delete()
        db.session.query(Job).delete()
        db.session.query(User).delete()
        db.session.query(Company).delete()
        db.session.commit()
        print("Existing data cleared.")
    except Exception as e:
        db.session.rollback()
        print(f"Error clearing data: {e}. This might happen if tables don't exist yet, proceeding...")


    # --- Create Companies ---
    print("Creating companies...")
    company_x = Company(
        name='Tech Innovators Inc.',
        industry='Software Development',
        description='Leading tech company specializing in AI solutions.',
        location='San Francisco, CA',
        website='http://www.techinnovations.com',
        contact_email='info@techinnovations.com'
    )

    company_y = Company(
        name='Global Solutions Ltd.',
        industry='Consulting',
        description='Providing strategic consulting services worldwide.',
        location='New York, NY',
        website='http://www.globalsolutions.com',
        contact_email='contact@globalsolutions.com'
    )

    db.session.add_all([company_x, company_y])
    db.session.commit()
    print("Sample companies added.")

    # --- Create Users ---
    print("Creating users...")
    user1 = User(username='jobseeker1', email='jobseeker1@example.com', is_recruiter=False)
    user1.set_password('password123') # Hash the password

    user2 = User(username='jobseeker2', email='jobseeker2@example.com', is_recruiter=False)
    user2.set_password('password123')

    recruiter1 = User(username='recruiter_alpha', email='recruiter.alpha@techinnovators.com', is_recruiter=True, company_id=company_x.id)
    recruiter1.set_password('recruitpass')

    recruiter2 = User(username='recruiter_beta', email='recruiter.beta@globalsolutions.com', is_recruiter=True, company_id=company_y.id)
    recruiter2.set_password('recruitpass')

    db.session.add_all([user1, user2, recruiter1, recruiter2])
    db.session.commit()
    print("Users created.")


    # --- Create Jobs ---
    print("Creating jobs...")
    job1 = Job(
        title='Senior Software Engineer',
        description='Develop and maintain scalable web applications using Python and React.',
        location='Remote',
        job_type='Full-time',
        salary_min=100000,
        salary_max=140000,
        company_id=company_x.id,
        recruiter_id=recruiter1.id,
        posted_at=datetime.utcnow() - timedelta(days=7)
    )

    job2 = Job(
        title='Data Analyst Intern',
        description='Assist in data collection, analysis, and reporting.',
        location='New York, NY',
        job_type='Internship',
        salary_min=25, # hourly
        salary_max=30, # hourly
        company_id=company_y.id,
        recruiter_id=recruiter2.id,
        posted_at=datetime.utcnow() - timedelta(days=3)
    )

    job3 = Job(
        title='Product Manager',
        description='Lead product development from conception to launch.',
        location='San Francisco, CA',
        job_type='Full-time',
        salary_min=90000,
        salary_max=120000,
        company_id=company_x.id,
        recruiter_id=recruiter1.id,
        posted_at=datetime.utcnow() - timedelta(days=10)
    )

    job4 = Job(
        title='Marketing Specialist',
        description='Develop and execute marketing campaigns.',
        location='Remote',
        job_type='Full-time',
        salary_min=60000,
        salary_max=80000,
        company_id=company_y.id,
        recruiter_id=recruiter2.id,
        posted_at=datetime.utcnow() - timedelta(days=5)
    )

    db.session.add_all([job1, job2, job3, job4])
    db.session.commit()
    print("Jobs created.")

    # --- Create Applications ---
    print("Creating applications...")
    app1 = Application(
        user_id=user1.id,
        job_id=job1.id,
        status='Pending',
        applied_at=datetime.utcnow() - timedelta(days=2)
    )

    app2 = Application(
        user_id=user2.id,
        job_id=job1.id,
        status='Reviewed',
        applied_at=datetime.utcnow() - timedelta(days=1)
    )

    app3 = Application(
        user_id=user1.id,
        job_id=job2.id,
        status='Pending',
        applied_at=datetime.utcnow() - timedelta(hours=12)
    )

    db.session.add_all([app1, app2, app3])
    db.session.commit()
    print("Applications created.")

    print("Database population complete!")

if __name__ == '__main__':
    populate_database()
