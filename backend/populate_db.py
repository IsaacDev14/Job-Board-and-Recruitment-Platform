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
    db.session.query(Application).delete()
    db.session.query(Job).delete()
    db.session.query(Company).delete()
    db.session.query(User).delete()
    db.session.commit()
    print("Existing data cleared.")


    # --- Create Users ---
    print("Creating users...")
    user1 = User(username='jobseeker1', email='jobseeker1@example.com', is_recruiter=False)
    user1.set_password('password123') # Hash the password

    user2 = User(username='jobseeker2', email='jobseeker2@example.com', is_recruiter=False)
    user2.set_password('password123')

    recruiter1 = User(username='recruiter_alpha', email='recruiter.alpha@companyx.com', is_recruiter=True)
    recruiter1.set_password('recruitpass')

    recruiter2 = User(username='recruiter_beta', email='recruiter.beta@companyy.com', is_recruiter=True)
    recruiter2.set_password('recruitpass')

    db.session.add_all([user1, user2, recruiter1, recruiter2])
    db.session.commit()
    print("Users created.")

    # --- Create Companies ---
    print("Creating companies...")
    company_x = Company(
        name='Tech Innovators Inc.',
        industry='Software Development',
        description='Leading tech company specializing in AI solutions.',
        contact_email='info@techinnovators.com',
        website='http://www.techinnovators.com'
    )

    company_y = Company(
        name='Global Solutions Ltd.',
        industry='Consulting',
        description='Providing strategic consulting services worldwide.',
        contact_email='contact@globalsolutions.com',
        website='http://www.globalsolutions.com'
    )

    db.session.add_all([company_x, company_y])
    db.session.commit()
    print("Companies created.")

    # --- Create Jobs ---
    print("Creating jobs...")
    job1 = Job(
        title='Senior Software Engineer',
        description='Develop and maintain scalable web applications using Python and React.',
        requirements='5+ years experience with Flask/Django, React. Strong CS fundamentals.',
        salary='100,000-140,000 USD',
        location='San Francisco, CA',
        company=company_x,      # Link to company_x
        recruiter=recruiter1,    # Link to recruiter1
        date_posted=datetime.utcnow() - timedelta(days=7)
    )

    job2 = Job(
        title='Data Analyst Intern',
        description='Assist in data collection, analysis, and reporting.',
        requirements='Proficiency in SQL and Excel. Basic Python/R a plus. Currently enrolled student.',
        salary='Hourly, 25 USD',
        location='Remote',
        company=company_y,      # Link to company_y
        recruiter=recruiter2,    # Link to recruiter2
        date_posted=datetime.utcnow() - timedelta(days=3)
    )

    job3 = Job(
        title='Product Manager',
        description='Lead product development from conception to launch.',
        requirements='3+ years product management experience. Excellent communication skills.',
        salary='90,000-120,000 USD',
        location='New York, NY',
        company=company_x,
        recruiter=recruiter1,
        date_posted=datetime.utcnow() - timedelta(days=10)
    )

    job4 = Job(
        title='Marketing Specialist',
        description='Develop and execute marketing campaigns.',
        requirements='Proven experience in digital marketing. SEO/SEM knowledge.',
        salary='60,000-80,000 USD',
        location='London, UK',
        company=company_y,
        recruiter=recruiter2,
        date_posted=datetime.utcnow() - timedelta(days=5),
        is_active=False # Example of an inactive job
    )

    db.session.add_all([job1, job2, job3, job4])
    db.session.commit()
    print("Jobs created.")

    # --- Create Applications ---
    print("Creating applications...")
    app1 = Application(
        applicant=user1,
        job=job1,
        application_date=datetime.utcnow() - timedelta(days=2),
        status='Pending',
        resume_path='path/to/jobseeker1_resume_job1.pdf'
    )

    app2 = Application(
        applicant=user2,
        job=job1,
        application_date=datetime.utcnow() - timedelta(days=1),
        status='Reviewed',
        resume_path='path/to/jobseeker2_resume_job1.pdf'
    )

    app3 = Application(
        applicant=user1,
        job=job2,
        application_date=datetime.utcnow() - timedelta(hours=12),
        status='Pending',
        resume_path='path/to/jobseeker1_resume_job2.pdf'
    )

    db.session.add_all([app1, app2, app3])
    db.session.commit()
    print("Applications created.")

    print("Database population complete!")

if __name__ == '__main__':
    populate_database()

