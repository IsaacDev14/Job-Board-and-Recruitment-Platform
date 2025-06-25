import secrets
import string
from flask import jsonify

def generate_reset_token():
    """Generate a secure random token for password reset"""
    return ''.join(secrets.choice(string.ascii_letters + string.digits) for _ in range(32))

def success_response(data=None, message="Success", status_code=200):
    """Standard success response format"""
    response = {"success": True, "message": message}
    if data:
        response["data"] = data
    return jsonify(response), status_code

def error_response(message="An error occurred", status_code=400, errors=None):
    """Standard error response format"""
    response = {"success": False, "message": message}
    if errors:
        response["errors"] = errors
    return jsonify(response), status_code
