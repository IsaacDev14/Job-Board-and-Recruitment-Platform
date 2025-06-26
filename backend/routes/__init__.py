# routes/__init__.py
def register_blueprints(app):
    from .auth_routes import auth_bp
    from .job_routes import jobs_bp
    from .user_routes import users_bp
    from .company_routes import companies_bp

    app.register_blueprint(auth_bp, url_prefix='/api')
    app.register_blueprint(jobs_bp, url_prefix='/api')
    app.register_blueprint(users_bp, url_prefix='/api')
    app.register_blueprint(companies_bp, url_prefix='/api')
