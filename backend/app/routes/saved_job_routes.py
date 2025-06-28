from flask import request
from flask_restx import Namespace, Resource, fields
from app import db
from app.models import SavedJob

saved_ns = Namespace('saved_jobs', description='Saved Jobs operations', strict_slashes=False)

# Input model for saving job
saved_model = saved_ns.model('SavedJob', {
    'user_id': fields.Integer(required=True, description='ID of the user saving the job'),
    'job_id': fields.Integer(required=True, description='ID of the job to be saved'),
})

# Output model for response
saved_output = saved_ns.model('SavedJobOut', {
    'id': fields.Integer(readOnly=True),
    'user_id': fields.Integer(),
    'job_id': fields.Integer(),
    'saved_at': fields.String(attribute='saved_at.isoformat'),
})

# Allow both `/saved_jobs` and `/saved_jobs/`
@saved_ns.route('/')
@saved_ns.route('')
class SavedJobList(Resource):
    def options(self):
        return {}, 200

    @saved_ns.doc(params={'user_id': 'ID of the user to fetch saved jobs for'})
    @saved_ns.marshal_list_with(saved_output)
    def get(self):
        user_id = request.args.get('user_id', type=int)
        if not user_id:
            return {"message": "user_id is required"}, 400
        saved_jobs = SavedJob.query.filter_by(user_id=user_id).all()
        return [s.to_dict() for s in saved_jobs]

    @saved_ns.expect(saved_model, validate=True)
    @saved_ns.marshal_with(saved_output, code=201)
    def post(self):
        data = request.get_json()
        user_id = data.get('user_id')
        job_id = data.get('job_id')

        if not user_id or not job_id:
            return {"message": "user_id and job_id are required"}, 400

        existing = SavedJob.query.filter_by(user_id=user_id, job_id=job_id).first()
        if existing:
            return existing.to_dict(), 200

        new_saved = SavedJob(user_id=user_id, job_id=job_id)
        db.session.add(new_saved)
        db.session.commit()
        return new_saved.to_dict(), 201

# Also allow both `/saved_jobs/<job_id>` and `/saved_jobs/<job_id>/`
@saved_ns.route('/<int:job_id>')
@saved_ns.route('/<int:job_id>/')
class SavedJobDelete(Resource):
    def options(self, job_id):
        return {}, 200

    @saved_ns.doc(params={'user_id': 'ID of the user to delete the saved job for'})
    @saved_ns.response(204, 'Job successfully unsaved')
    def delete(self, job_id):
        user_id = request.args.get('user_id', type=int)
        if not user_id:
            return {"message": "user_id is required"}, 400

        saved = SavedJob.query.filter_by(user_id=user_id, job_id=job_id).first()
        if not saved:
            return {"message": "Saved job not found"}, 404

        db.session.delete(saved)
        db.session.commit()
        return {"message": "Saved job deleted"}, 204
