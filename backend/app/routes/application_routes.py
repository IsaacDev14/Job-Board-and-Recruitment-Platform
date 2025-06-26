# backend/app/routes/application_routes.py

from flask_restx import Namespace, Resource

application_ns = Namespace('Applications', description='Job application operations')

@application_ns.route('/')
class ApplicationList(Resource):
    def get(self):
        return {"message": "List of applications (placeholder)"}

applications_ns = application_ns
__all__ = ['applications_ns']

