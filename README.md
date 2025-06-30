
# Job Board and Recruitment Platform

This platform offers a centralized, full-featured system for job listings, applications, and user profile management. It supports different user roles (job seekers and recruiters), allowing recruiters to post jobs and manage applications while job seekers can apply, track, and build their professional profile — all from one place.

---

##  Minimum Viable Product (MVP) Features

### Frontend – React SPA  
**Tech Stack:** React, Context API, TailwindCSS  

**Pages / Routes:**  
- `/` – Public landing page with featured job categories or listings  
- `/jobs` – Job listing page with filters and search  
- `/jobs/:id` – Detailed job description page  
- `/login` – Login form  
- `/register` – Registration page  
- `/forgot-password` – Password reset request  
- `/reset-password/:token` – Password update page  
- `/dashboard` – Protected user dashboard  
- `/applications` – Protected: User-specific application tracking  
- `/post-job` – Protected: Recruiters can post jobs  
- `/my-jobs` – Protected: Manage posted jobs  
- `/profile` – Protected: Edit/view user profile  

---

### Backend – Flask REST API  
**Authentication:** JWT-based  

**Key Endpoints:**  
- `POST /register` – Register a new user  
- `POST /login` – Authenticate and return JWT  
- `POST /forgot-password` – Start password reset process  
- `POST /reset-password` – Complete password reset using token  
- `GET /jobs` – Public access to all jobs  
- `GET /jobs/:id` – Access single job details  
- `POST /jobs` – PROTECTED (Recruiters): Create job listing  
- `PUT /jobs/:id` – PROTECTED: Update job listing  
- `DELETE /jobs/:id` – PROTECTED: Delete job listing  
- `POST /jobs/:id/apply` – PROTECTED (Job Seeker): Apply to job  
- `GET /users/:id/applications` – PROTECTED: View applications of a user  
- `GET /companies` – View all companies  
- `PATCH /users/:id` – PROTECTED: Update user profile  

---

##  Database Schema & Entity Relationships

### Models  
- **User**: Stores user info including role (`job_seeker`, `recruiter`), hashed password, and relationships to jobs and applications.  
- **Company**: Stores company details and owns jobs.  
- **JobListing**: Job postings with details such as title, description, salary, and company association.  
- **Application**: Tracks job applications by users with statuses (pending, reviewed, etc.).  

### Relationships  
- One Company → Many Users (Recruiters)  
- One Company → Many JobListings  
- One User → Many Applications  
- One JobListing → Many Applications  

---

## Tech Stack

| Layer     | Technology           |
|-----------|---------------------|
| Frontend  | React, TailwindCSS, Context API |
| Backend   | Python, Flask, Flask-RESTful, JWT, Flask-Migrate |
| Database  | PostgreSQL          |
| Authentication | JWT             |
| Deployment | Render             |

---

## Project Structure Highlights

- **Frontend:** Uses a single-page application (SPA) approach with React functional components and Context API for state management. Pages like Job Listings, Login, Register, Dashboard, and Job Posting are protected based on user roles.  
- **Backend:** REST API with Flask, handling authentication, authorization, and CRUD operations for users, jobs, applications, and companies. Passwords are hashed with Bcrypt. Database migrations managed with Flask-Migrate.  
- **Database:** PostgreSQL stores users, companies, jobs, and applications with proper foreign key relationships ensuring data integrity.


---

## How to Run Locally

### Backend  
1. Clone repo and create a virtual environment:  
   ```bash
   python -m venv venv
   source venv/bin/activate  # Linux/macOS
   venv\Scripts\activate     # Windows
   ```  
2. Install dependencies:  
   ```bash
   pip install -r requirements.txt
   ```  
3. Setup `.env` file with your PostgreSQL URL and secret key.  
4. Run migrations:  
   ```bash
   flask db upgrade
   ```  
5. Start the backend server:  
   ```bash
   flask run
   ```  

### Frontend  
1. Navigate to the frontend folder:  
   ```bash
   cd frontend
   ```  
2. Install dependencies:  
   ```bash
   npm install
   ```  
3. Start development server:  
   ```bash
   npm run dev
   ```  

---

## Future Enhancements

- Add real-time notifications for application status updates.  
- Implement resume uploads and parsing.  
- Introduce admin roles and analytics dashboards.  
- Improve UI/UX with more interactive job filters and search capabilities.

---

## Team Contacts

- Dorothy Chepkoech 
- Isaac Mwiti Kubai 
---

## License

This project is licensed under the MIT License.

---

*Thank you for reviewing our project!*
