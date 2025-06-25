from flask import Blueprint
from models import Company
from utils.helpers import success_response

companies_bp = Blueprint('companies', __name__)

@companies_bp.route('/companies', methods=['GET'])
def get_companies():
    companies = Company.query.all()
    return success_response({
        'companies': [company.to_dict() for company in companies]
    })
