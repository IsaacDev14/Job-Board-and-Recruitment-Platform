# backend/app/jwt_handlers.py

from flask_jwt_extended import JWTManager
from flask_restx import Api
from flask import jsonify

def register_jwt_handlers(jwt: JWTManager, api: Api):
    """
    Registers custom error handlers for Flask-JWT-Extended.
    These handlers will return JSON responses for various JWT-related errors.
    """

    @jwt.unauthorized_loader
    def unauthorized_response(callback):
        """
        Handler for when an unauthenticated request attempts to access a protected endpoint.
        """
        return jsonify({"message": "Missing or invalid token", "error": "unauthorized"}), 401

    @jwt.invalid_token_loader
    def invalid_token_response(callback):
        """
        Handler for when a token is invalid (e.g., malformed, signature mismatch).
        """
        return jsonify({"message": "Signature verification failed", "error": "invalid_token"}), 401

    @jwt.expired_token_loader
    def expired_token_response(callback):
        """
        Handler for when an access token has expired.
        """
        return jsonify({"message": "Token has expired", "error": "token_expired"}), 401

    @jwt.needs_fresh_token_loader
    def needs_fresh_token_response(callback):
        """
        Handler for when a protected endpoint requires a 'fresh' token, but a non-fresh token is provided.
        """
        return jsonify({"message": "Fresh token required", "error": "fresh_token_required"}), 401

    @jwt.revoked_token_loader
    def revoked_token_response(callback):
        """
        Handler for when a revoked token attempts to access a protected endpoint.
        """
        return jsonify({"message": "Token has been revoked", "error": "token_revoked"}), 401

    @jwt.token_verification_loader
    def token_verification_response(callback):
        """
        Handler for when a token's verification fails (e.g., token not found in blocklist if blocklist is enabled).
        """
        # This handler is often used with token blocklisting/revocation
        return jsonify({"message": "Token verification failed", "error": "token_verification_failed"}), 401

    # User lookup loader to load the user from the database based on JWT identity
    # This is crucial for @jwt_required to correctly identify the user.
    @jwt.user_lookup_loader
    def user_lookup_callback(_jwt_header, jwt_data):
        identity = jwt_data["sub"] # 'sub' claim usually holds the user ID
        from app.models import User # Import here to avoid circular dependency
        return User.query.get(identity)

