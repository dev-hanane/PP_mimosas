"""
Module d'authentification pour Flask
Gestion de l'inscription, connexion et JWT
"""

from functools import wraps
from datetime import datetime, timedelta
import jwt
from flask import request, jsonify
import bcrypt
import os

# Clé secrète pour JWT (à mettre dans .env en production)
SECRET_KEY = os.getenv('SECRET_KEY', 'your-secret-key-change-in-production')

def hash_password(password):
    """Hasher un mot de passe"""
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

def verify_password(password, password_hash):
    """Vérifier un mot de passe"""
    try:
        return bcrypt.checkpw(password.encode('utf-8'), password_hash.encode('utf-8'))
    except:
        return False

def create_token(user_id, expires_in=24):
    """Créer un token JWT"""
    payload = {
        'user_id': user_id,
        'exp': datetime.utcnow() + timedelta(hours=expires_in),
        'iat': datetime.utcnow()
    }
    return jwt.encode(payload, SECRET_KEY, algorithm='HS256')

def verify_token(token):
    """Vérifier un token JWT"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
        return payload['user_id']
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None


def get_user_id_from_request():
    """Retourne user_id si un Bearer token valide est présent, sinon None."""
    auth = request.headers.get('Authorization', '')
    if not auth.startswith('Bearer '):
        return None
    try:
        token = auth.split(' ', 1)[1]
    except IndexError:
        return None
    return verify_token(token)

def token_required(f):
    """Décorateur pour protéger les routes avec JWT"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        token = None
        
        # Vérifier le header Authorization
        if 'Authorization' in request.headers:
            try:
                token = request.headers['Authorization'].split(' ')[1]
            except IndexError:
                return jsonify({'error': 'Invalid token format'}), 401
        
        if not token:
            return jsonify({'error': 'Token is missing'}), 401
        
        user_id = verify_token(token)
        if user_id is None:
            return jsonify({'error': 'Invalid or expired token'}), 401
        
        request.user_id = user_id
        return f(*args, **kwargs)
    
    return decorated_function
