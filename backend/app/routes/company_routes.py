# backend/app/routes/company_routes.py

from flask import request
from flask_restx import Namespace, Resource, fields
from app import db
from app.models import Company, Job
from sqlalchemy.exc import IntegrityError

# Create a Namespace
company_ns = Namespace('Companies', description='Company profile and management operations')

# Models
company_model = company_ns.model('Company', {
    'id': fields.Integer(readOnly=True),
    'name': fields.String(required=True),
    'description': fields.String(),
    'industry': fields.String(),
    'website': fields.String(),
    'contact_email': fields.String()
})

company_create_model = company_ns.model('CompanyCreate', {
    'name': fields.String(required=True),
    'description': fields.String(),
    'industry': fields.String(),
    'website': fields.String(),
    'contact_email': fields.String()
})

company_update_model = company_ns.model('CompanyUpdate', {
    'name': fields.String(),
    'description': fields.String(),
    'industry': fields.String(),
    'website': fields.String(),
    'contact_email': fields.String()
})

@company_ns.route('/')
class CompanyList(Resource):
    @company_ns.marshal_list_with(company_model)
    def get(self):
        return Company.query.all()

    @company_ns.expect(company_create_model, validate=True)
    @company_ns.marshal_with(company_model, code=201)
    def post(self):
        data = request.get_json()
        if Company.query.filter_by(name=data['name']).first():
            company_ns.abort(409, "Company with this name already exists")
        try:
            new_company = Company(**data)
            db.session.add(new_company)
            db.session.commit()
            return new_company, 201
        except IntegrityError:
            db.session.rollback()
            company_ns.abort(409, "Database integrity error")
        except Exception as e:
            db.session.rollback()
            company_ns.abort(500, str(e))


@company_ns.route('/<int:company_id>')
@company_ns.param('company_id', 'The company ID')
class CompanyResource(Resource):
    @company_ns.marshal_with(company_model)
    def get(self, company_id):
        company = Company.query.get(company_id)
        if not company:
            company_ns.abort(404, "Company not found")
        return company

    @company_ns.expect(company_update_model, validate=True)
    @company_ns.marshal_with(company_model)
    def put(self, company_id):
        company = Company.query.get(company_id)
        if not company:
            company_ns.abort(404, "Company not found")

        data = request.get_json()
        if 'name' in data and data['name'] != company.name:
            if Company.query.filter_by(name=data['name']).first():
                company_ns.abort(409, "Company with this name already exists")

        for key, value in data.items():
            if hasattr(company, key):
                setattr(company, key, value)

        try:
            db.session.commit()
            return company
        except Exception as e:
            db.session.rollback()
            company_ns.abort(500, str(e))

    def delete(self, company_id):
        company = Company.query.get(company_id)
        if not company:
            company_ns.abort(404, "Company not found")
        if Job.query.filter_by(company_id=company_id).first():
            company_ns.abort(400, "Cannot delete company with associated jobs")
        try:
            db.session.delete(company)
            db.session.commit()
            return '', 204
        except Exception as e:
            db.session.rollback()
            company_ns.abort(500, str(e))

# Export under consistent name
companies_ns = company_ns
__all__ = ['companies_ns']
