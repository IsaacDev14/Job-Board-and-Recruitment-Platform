from flask import Flask
from config import Config
from extensions import db, migrate, jwt, cors
from routes import register_blueprints

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    
    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    cors.init_app(app)
    
    # Register blueprints
    register_blueprints(app)
    
    # Import models to ensure they're registered with SQLAlchemy
    from models import User, Company, JobListing, Application
    
    return app

app = create_app()

if __name__ == '__main__':
    app.run(debug=True)
