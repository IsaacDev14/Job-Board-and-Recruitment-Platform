# backend/run.py

from app import create_app
from config import Config # Import your Config class from config.py

# Create the Flask application instance using the factory function
app = create_app()

if __name__ == '__main__':
    # Run the application in debug mode for development.
    # In production, use a production-ready WSGI server like Gunicorn or uWSGI.
    app.run(debug=True)

