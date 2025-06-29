# populate_db.py

from app import create_app, db
from app.models import User, Company, Job, Application, SavedJob
from datetime import datetime

def populate_database():
    app = create_app()
    with app.app_context():
        print("Populating database with dummy data...")

        # Clear old data (order matters due to FKs)
        print("Clearing old data.")
        db.session.query(SavedJob).delete()
        db.session.query(Application).delete()
        db.session.query(Job).delete()
        db.session.query(Company).delete()
        db.session.query(User).delete()
        db.session.commit()

        # Create Users
        print("Creating users...")
        user1 = User(username='jobseeker1', email='jobseeker1@example.com', is_recruiter=False)
        user1.password_hash = 'password123'  # <-- Use password_hash setter to hash

        user2 = User(username='jobseeker2', email='jobseeker2@example.com', is_recruiter=False)
        user2.password_hash = 'password123'

        recruiter1 = User(username='recruiter_alpha', email='recruiter.alpha@companyx.com', is_recruiter=True)
        recruiter1.password_hash = 'recruitpass'

        recruiter2 = User(username='recruiter_beta', email='recruiter.beta@companyy.com', is_recruiter=True)
        recruiter2.password_hash = 'recruitpass'

        db.session.add_all([user1, user2, recruiter1, recruiter2])
        db.session.commit()

        # Create Companies owned by recruiters
        print("Creating companies...")
        company1 = Company(
            name="Company X",
            industry="Technology",
            description="Innovative tech solutions.",
            contact_email="contact@companyx.com",
            website="https://companyx.com",
            owner_id=recruiter1.id
        )

        company2 = Company(
            name="Company Y",
            industry="Finance",
            description="Leading financial services.",
            contact_email="contact@companyy.com",
            website="https://companyy.com",
            owner_id=recruiter2.id
        )

        db.session.add_all([company1, company2])
        db.session.commit()

        # Create Jobs posted by recruiters & companies
        print("Creating jobs...")
        job1 = Job(
            title="Software Engineer",
            description="Develop and maintain web applications.",
            requirements="Python, Flask, SQLAlchemy",
            location="Remote",
            salary="$70,000 - $90,000",
            job_type="Full-time",
            recruiter_id=recruiter1.id,
            company_id=company1.id,
            expires_date=datetime(2025, 12, 31),
            is_active=True,
            image=None
        )

        job2 = Job(
            title="Financial Analyst",
            description="Analyze financial data and trends.",
            requirements="Finance degree, Excel skills",
            location="New York, NY",
            salary="$60,000 - $80,000",
            job_type="Full-time",
            recruiter_id=recruiter2.id,
            company_id=company2.id,
            expires_date=datetime(2025, 11, 30),
            is_active=True,
            image=None
        )

        db.session.add_all([job1, job2])
        db.session.commit()

        # Create Applications by jobseekers for jobs
        print("Creating applications...")
        application1 = Application(
            user_id=user1.id,
            job_id=job1.id,
            status="pending",
            resume_url="https://resumes.example.com/jobseeker1_resume.pdf",
            cover_letter_text="I am very interested in this role."
        )

        application2 = Application(
            user_id=user2.id,
            job_id=job2.id,
            status="pending",
            resume_url="https://resumes.example.com/jobseeker2_resume.pdf",
            cover_letter_text="Looking forward to contributing."
        )

        db.session.add_all([application1, application2])
        db.session.commit()

        # Optionally create SavedJobs
        print("Creating saved jobs...")
        saved1 = SavedJob(
            user_id=user1.id,
            job_id=job2.id
        )

        saved2 = SavedJob(
            user_id=user2.id,
            job_id=job1.id
        )

        db.session.add_all([saved1, saved2])
        db.session.commit()

        print("Database populated successfully.")

if __name__ == '__main__':
    populate_database()
