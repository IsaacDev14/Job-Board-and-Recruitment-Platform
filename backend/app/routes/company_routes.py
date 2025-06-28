# backend/app/routes/company_routes.py

from flask import request
from flask_restx import Namespace, Resource, fields
from app import db
from app.models import Company, Job, User # Import User for owner_id validation
from sqlalchemy.exc import IntegrityError, DataError

# Create a Namespace for company-related routes
company_ns = Namespace('companies', description='Company profile and management operations')

# Define input/output models for Swagger documentation and request parsing
company_model = company_ns.model('Company', {
    'id': fields.Integer(readOnly=True, description='The unique identifier of a company'),
    'name': fields.String(required=True, description='The name of the company'),
    'description': fields.String(description='A brief description of the company'),
    'industry': fields.String(description='The industry the company operates in'),
    'website': fields.String(description='The company\'s official website URL'),
    'contact_email': fields.String(description='General contact email for the company'),
    'owner_id': fields.Integer(description='ID of the user who owns this company profile') # Add owner_id to model
})

# Define a minimal company model for input (e.g., for creation)
company_create_model = company_ns.model('CompanyCreate', {
    'name': fields.String(required=True, description='The name of the company'),
    'description': fields.String(description='A brief description of the company'),
    'industry': fields.String(description='The industry the company operates in'),
    'website': fields.String(description='The company\'s official website URL'),
    'contact_email': fields.String(description='General contact email for the company'),
    'owner_id': fields.Integer(required=True, description='ID of the user who owns this company profile') # owner_id is required for creation
})

# Define an update model where fields are optional
company_update_model = company_ns.model('CompanyUpdate', {
    'name': fields.String(description='The name of the company'),
    'description': fields.String(description='A brief description of the company'),
    'industry': fields.String(description='The industry the company operates in'),
    'website': fields.String(description='The company\'s official website URL'),
    'contact_email': fields.String(description='General contact email for the company'),
    'owner_id': fields.Integer(description='ID of the user who owns this company profile')
})

@company_ns.route('', strict_slashes=False) # Keep strict_slashes=False for consistency
class CompanyList(Resource):
    @company_ns.doc(description='Get a list of all companies. Can be filtered by name.',
                    responses={200: 'Success', 500: 'Internal Server Error'})
    @company_ns.marshal_list_with(company_model)
    def get(self):
        """Get all companies with optional name filter"""
        name = request.args.get('name')
        if name:
            companies = Company.query.filter(Company.name.ilike(f'%{name}%')).all()
        else:
            companies = Company.query.all()
        return companies

    @company_ns.doc(description='Create a new company.',
                    responses={
                        201: 'Company created successfully',
                        400: 'Validation Error / Missing Data',
                        404: 'Recruiter not found', # Add 404 for recruiter check
                        500: 'Internal Server Error'
                    })
    @company_ns.expect(company_create_model, validate=True)
    @company_ns.marshal_with(company_model, code=201)
    def post(self):
        """Create a new company"""
        data = request.get_json()
        print(f"Received company creation data: {data}")

        # Validate owner_id
        owner_id = data.get('owner_id')
        if owner_id is None:
            company_ns.abort(400, message="owner_id is required.")

        user = User.query.get(owner_id)
        if not user or not user.is_recruiter:
            company_ns.abort(404, message=f"User with ID {owner_id} not found or is not a recruiter.")

        # Removed the explicit duplicate name check:
        # if Company.query.filter_by(name=data['name']).first():
        #     company_ns.abort(409, message="Company with this name already exists")

        try:
            # Manually assign fields to ensure owner_id is handled, not just **data
            new_company = Company(
                name=data['name'], # This is also required by the model
                description=data.get('description'),
                industry=data.get('industry'),
                website=data.get('website'),
                contact_email=data.get('contact_email'),
                owner_id=owner_id # Explicitly assign owner_id
            )
            db.session.add(new_company)
            db.session.commit()
            print(f"Company '{new_company.name}' created successfully with ID: {new_company.id}")
            return new_company, 201
        except IntegrityError as e:
            db.session.rollback()
            # This catch is now primarily for non-nullable fields missing (like 'name' if not in data)
            # or foreign key constraints (if owner_id validation above somehow fails or is removed).
            print(f"IntegrityError detail: {e.orig}")
            company_ns.abort(400, message=f"Database constraint violation: Check if all required fields are provided or owner_id is valid. Original error: {e.orig}")
        except DataError as e:
            db.session.rollback()
            print(f"DataError detail: {e}")
            company_ns.abort(400, message=f"Invalid data format for one of the fields. Detail: {str(e)}")
        except KeyError as e: # Catch KeyError if a required field like 'name' is missing from data
            db.session.rollback()
            print(f"KeyError detail: {e}")
            company_ns.abort(400, message=f"Missing required field in payload (e.g., 'name'): {str(e)}")
        except Exception as e:
            db.session.rollback()
            print(f"Unexpected error creating company: {e}")
            company_ns.abort(500, message=f"An unexpected server error occurred: {str(e)}")


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

        # Removed the explicit duplicate name check for updates
        # if 'name' in data and data['name'] != company.name and \
        #    Company.query.filter_by(name=data['name']).first():
        #     company_ns.abort(409, message="Company with this name already exists")

        # If owner_id is being updated, validate the new owner_id
        if 'owner_id' in data:
            new_owner_id = data.get('owner_id')
            if new_owner_id is None:
                company_ns.abort(400, message="owner_id cannot be null if provided for update.")
            new_owner = User.query.get(new_owner_id)
            if not new_owner or not new_owner.is_recruiter:
                company_ns.abort(404, message=f"New owner with ID {new_owner_id} not found or is not a recruiter.")
            setattr(company, 'owner_id', new_owner_id) # Set owner_id explicitly
            data.pop('owner_id', None) # Remove from data to avoid processing in the loop below


        try:
            for key, value in data.items():
                if hasattr(company, key):
                    setattr(company, key, value)
            db.session.commit()
            return company
        except IntegrityError as e:
            db.session.rollback()
            print(f"IntegrityError during update: {e.orig}")
            company_ns.abort(400, message=f"Update failed due to database constraint violation. Original error: {e.orig}")
        except DataError as e:
            db.session.rollback()
            print(f"DataError during update: {e}")
            company_ns.abort(400, message=f"Invalid data format for one of the fields during update. Detail: {str(e)}")
        except Exception as e:
            db.session.rollback()
            print(f"Unexpected error during company update: {e}")
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