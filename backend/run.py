# backend/run.py

from app import create_app
from config import Config # Import your Config class from config.py

# Create the Flask application instance using the factory function
app = create_app(Config)

if __name__ == '__main__':
    
    app.run(debug=True)
