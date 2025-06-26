# backend/app/routes/company_routes.py

from flask import request
from flask_restx import Namespace, Resource, fields
from app import db
from app.models import Company, Job # Import Job to check for related jobs before deleting company
from sqlalchemy.exc import IntegrityError

# Create a Namespace for company-related routes
company_ns = Namespace('Companies', description='Company profile and management operations')

# Define input/output models for Swagger documentation and request parsing
company_model = company_ns.model('Company', {
    'id': fields.Integer(readOnly=True, description='The unique identifier of a company'),
    'name': fields.String(required=True, description='The name of the company'),
    'description': fields.String(description='A brief description of the company'),
    'industry': fields.String(description='The industry the company operates in'),
    'website': fields.String(description='The company\'s official website URL'),
    'contact_email': fields.String(description='General contact email for the company')
})

# Define a minimal company model for input (e.g., for creation)
company_create_model = company_ns.model('CompanyCreate', {
    'name': fields.String(required=True, description='The name of the company'),
    'description': fields.String(description='A brief description of the company'),
    'industry': fields.String(description='The industry the company operates in'),
    'website': fields.String(description='The company\'s official website URL'),
    'contact_email': fields.String(description='General contact email for the company')
})

# Define an update model where fields are optional
company_update_model = company_ns.model('CompanyUpdate', {
    'name': fields.String(description='The name of the company'),
    'description': fields.String(description='A brief description of the company'),
    'industry': fields.String(description='The industry the company operates in'),
    'website': fields.String(description='The company\'s official website URL'),
    'contact_email': fields.String(description='General contact email for the company')
})

@company_ns.route('/')
class CompanyList(Resource):
    @company_ns.doc(description='Get a list of all companies.',
                     responses={200: 'Success', 500: 'Internal Server Error'})
    @company_ns.marshal_list_with(company_model)
    def get(self):
        """Get all companies"""
        companies = Company.query.all()
        return companies

    @company_ns.doc(description='Create a new company.',
                     responses={
                         201: 'Company created successfully',
                         400: 'Validation Error / Missing Data',
                         409: 'Company name already exists',
                         500: 'Internal Server Error'
                     })
    @company_ns.expect(company_create_model, validate=True)
    @company_ns.marshal_with(company_model, code=201)
    def post(self):
        """Create a new company"""
        data = request.get_json()

        if Company.query.filter_by(name=data['name']).first():
            company_ns.abort(409, message="Company with this name already exists")

        try:
            new_company = Company(**data) # Directly unpack data as it matches model fields
            db.session.add(new_company)
            db.session.commit()
            return new_company, 201
        except IntegrityError:
            db.session.rollback()
            company_ns.abort(409, message="Error creating company: Name might already exist.")
        except Exception as e:
            db.session.rollback()
            company_ns.abort(500, message=f"An error occurred: {str(e)}")


@company_ns.route('/<int:company_id>')
@company_ns.param('company_id', 'The company unique identifier')
class CompanyResource(Resource):
    @company_ns.doc(description='Get a company by ID.',
                     responses={200: 'Success', 404: 'Company not found', 500: 'Internal Server Error'})
    @company_ns.marshal_with(company_model)
    def get(self, company_id):
        """Get a company by ID"""
        company = Company.query.get(company_id)
        if not company:
            company_ns.abort(404, message="Company not found")
        return company

    @company_ns.doc(description='Update an existing company by ID.',
                     responses={
                         200: 'Company updated successfully',
                         400: 'Validation Error',
                         404: 'Company not found',
                         409: 'Company name already exists',
                         500: 'Internal Server Error'
                     })
    @company_ns.expect(company_update_model, validate=True)
    @company_ns.marshal_with(company_model)
    def put(self, company_id):
        """Update a company by ID"""
        company = Company.query.get(company_id)
        if not company:
            company_ns.abort(404, message="Company not found")

        data = request.get_json()
        if not data:
            company_ns.abort(400, message="No input data provided")

        if 'name' in data and data['name'] != company.name and \
           Company.query.filter_by(name=data['name']).first():
            company_ns.abort(409, message="Company with this name already exists")

        for key, value in data.items():
            if hasattr(company, key):
                setattr(company, key, value)

        try:
            db.session.commit()
            return company
        except IntegrityError:
            db.session.rollback()
            company_ns.abort(409, message="Update failed: Company name might already exist.")
        except Exception as e:
            db.session.rollback()
            company_ns.abort(500, message=f"An error occurred: {str(e)}")

    @company_ns.doc(description='Delete a company by ID.',
                     responses={
                         204: 'Company deleted successfully',
                         400: 'Cannot delete company with associated jobs',
                         404: 'Company not found',
                         500: 'Internal Server Error'
                     })
    def delete(self, company_id):
        """Delete a company by ID"""
        company = Company.query.get(company_id)
        if not company:
            company_ns.abort(404, message="Company not found")

        # Check if there are any jobs associated with this company
        if Job.query.filter_by(company_id=company_id).first():
            company_ns.abort(400, message="Cannot delete company: There are jobs associated with this company.")

        try:
            db.session.delete(company)
            db.session.commit()
            return '', 204
        except Exception as e:
            db.session.rollback()
            company_ns.abort(500, message=f"An error occurred: {str(e)}")

