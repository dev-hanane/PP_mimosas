"""
Application Flask pour le Backend du Camping Mimosas
"""

from dotenv import load_dotenv
load_dotenv()

from flask import Flask, jsonify, request, send_from_directory
from werkzeug.utils import secure_filename
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_mail import Mail, Message
from flask_socketio import SocketIO, emit, join_room, leave_room
from datetime import datetime
import os
import stripe
from auth import hash_password, verify_password, create_token, verify_token, token_required, get_user_id_from_request
from stripe_payments import register_payment_routes
from chatbot_engine import process_chatbot_message

# Tentative d'import Gemini (optionnel)
try:
    import google.generativeai as genai
    GEMINI_AVAILABLE = True
    GEMINI_ERROR = None
except ImportError as e:
    GEMINI_AVAILABLE = False
    GEMINI_ERROR = f"Module non installé: {str(e)}"
    genai = None
except TypeError as e:
    # Erreur de compatibilité Python 3.14 + protobuf
    GEMINI_AVAILABLE = False
    GEMINI_ERROR = f"Incompatibilité protobuf/Python: {str(e)}. Solution: pip install --upgrade protobuf google-generativeai"
    genai = None
except Exception as e:
    GEMINI_AVAILABLE = False
    GEMINI_ERROR = f"Erreur d'import: {str(e)}"
    genai = None

app = Flask(__name__)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*", async_mode="threading")
COMMUNITY_ROOM = "community_room"
COMMUNITY_HISTORY_LIMIT = 100
# sid -> user_id (None = visiteur sans compte) pour les présents dans le salon
ONLINE_PRESENCE = {}


def normalize_database_url(raw_url: str) -> str:
    """Normalize DB URL (supports postgres:// and sqlite relative paths)."""
    if not raw_url:
        return raw_url
    if raw_url.startswith('postgres://'):
        raw_url = raw_url.replace('postgres://', 'postgresql://', 1)
    if raw_url.startswith('postgresql://'):
        return raw_url.replace('postgresql://', 'postgresql+psycopg://', 1)
    if raw_url.startswith('sqlite:///') and not raw_url.startswith('sqlite:////'):
        sqlite_path = raw_url.replace('sqlite:///', '', 1)
        if not os.path.isabs(sqlite_path):
            basedir = os.path.abspath(os.path.dirname(__file__))
            return f"sqlite:///{os.path.join(basedir, sqlite_path)}"
    return raw_url

# Configuration Stripe (clés depuis .env uniquement)
from stripe_config import apply_stripe_secret
apply_stripe_secret()

# Configuration Mail (Flask-Mail)
app.config['MAIL_SERVER'] = os.getenv('MAIL_SERVER', 'smtp.gmail.com')
app.config['MAIL_PORT'] = int(os.getenv('MAIL_PORT', 587))
app.config['MAIL_USE_TLS'] = os.getenv('MAIL_USE_TLS', 'true').lower() == 'true'
app.config['MAIL_USERNAME'] = os.getenv('MAIL_USERNAME')
app.config['MAIL_PASSWORD'] = os.getenv('MAIL_PASSWORD')
app.config['MAIL_DEFAULT_SENDER'] = os.getenv('MAIL_DEFAULT_SENDER', 'contact@mimosas-camping.ma')
mail = Mail(app)

# Configuration
basedir = os.path.abspath(os.path.dirname(__file__))
COMMUNITY_UPLOAD_DIR = os.path.join(basedir, 'uploads', 'community')
os.makedirs(COMMUNITY_UPLOAD_DIR, exist_ok=True)
ALLOWED_COMMUNITY_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp', 'pdf'}
default_sqlite_url = f"sqlite:///{os.path.join(basedir, 'camping_new.db')}"
app.config['SQLALCHEMY_DATABASE_URI'] = normalize_database_url(
    os.getenv('DATABASE_URL', default_sqlite_url)
)
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JSON_SORT_KEYS'] = False

# Configuration Gemini API (optionnel)
model = None
if GEMINI_AVAILABLE:
    GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
    if GEMINI_API_KEY:
        try:
            genai.configure(api_key=GEMINI_API_KEY)
            model = genai.GenerativeModel('gemini-2.0-flash')
            print("Gemini API configured successfully (model: gemini-2.0-flash)")
        except Exception as e:
            print(f"Gemini config warning: {str(e)}")
    else:
        print("Gemini warning: GEMINI_API_KEY not found in .env")
else:
    if GEMINI_ERROR:
        print(f"Gemini warning: {GEMINI_ERROR}")
    else:
        print("Gemini warning: google-generativeai not installed; chatbot disabled.")

db = SQLAlchemy(app)


def get_display_name(user):
    if not user:
        return "Visiteur"
    if user.first_name and user.last_name:
        return f"{user.first_name} {user.last_name}"
    if user.first_name:
        return user.first_name
    return user.username or "Visiteur"

# ================== MODELS ==================

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    first_name = db.Column(db.String(80))
    last_name = db.Column(db.String(80))
    phone = db.Column(db.String(20))
    address = db.Column(db.Text)
    city = db.Column(db.String(80))
    postal_code = db.Column(db.String(10))
    country = db.Column(db.String(80))
    role = db.Column(db.String(20), default='client')
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    bookings = db.relationship('Booking', backref='user', lazy=True)
    reviews = db.relationship('Review', backref='user', lazy=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'phone': self.phone,
            'address': self.address,
            'city': self.city,
            'postal_code': self.postal_code,
            'country': self.country,
            'role': self.role,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class Accommodation(db.Model):
    __tablename__ = 'accommodations'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    description = db.Column(db.Text)
    type = db.Column(db.String(50))
    capacity = db.Column(db.Integer)
    price_per_night = db.Column(db.Float)
    image_url = db.Column(db.String(255))
    amenities = db.Column(db.Text)
    is_available = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    bookings = db.relationship('Booking', backref='accommodation', lazy=True)
    reviews = db.relationship('Review', backref='accommodation', lazy=True)
    galleries = db.relationship('Gallery', backref='accommodation', lazy=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'type': self.type,
            'capacity': self.capacity,
            'price_per_night': self.price_per_night,
            'image_url': self.image_url,
            'amenities': self.amenities.split(',') if self.amenities else [],
            'is_available': self.is_available,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class Booking(db.Model):
    __tablename__ = 'bookings'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    accommodation_id = db.Column(db.Integer, db.ForeignKey('accommodations.id'), nullable=False)
    check_in_date = db.Column(db.Date, nullable=False)
    check_out_date = db.Column(db.Date, nullable=False)
    number_of_guests = db.Column(db.Integer, nullable=False)
    total_price = db.Column(db.Float)
    status = db.Column(db.String(20), default='pending')
    special_requests = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    payments = db.relationship('Payment', backref='booking', lazy=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'accommodation_id': self.accommodation_id,
            'check_in_date': str(self.check_in_date),
            'check_out_date': str(self.check_out_date),
            'number_of_guests': self.number_of_guests,
            'total_price': self.total_price,
            'status': self.status,
            'special_requests': self.special_requests,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class Review(db.Model):
    __tablename__ = 'reviews'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    accommodation_id = db.Column(db.Integer, db.ForeignKey('accommodations.id'))
    rating = db.Column(db.Integer)
    comment = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        # Générer le nom à partir de first_name et last_name, sinon utiliser username
        if self.user and self.user.first_name and self.user.last_name:
            user_name = f"{self.user.first_name} {self.user.last_name}"
        elif self.user and self.user.first_name:
            user_name = self.user.first_name
        elif self.user and self.user.username:
            user_name = self.user.username
        else:
            user_name = "Visiteur"
        
        return {
            'id': self.id,
            'user_id': self.user_id,
            'accommodation_id': self.accommodation_id,
            'rating': self.rating,
            'comment': self.comment,
            'author': user_name,
            'user_name': user_name,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class Service(db.Model):
    __tablename__ = 'services'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    description = db.Column(db.Text)
    category = db.Column(db.String(50))
    price = db.Column(db.Float)
    is_available = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'category': self.category,
            'price': self.price,
            'is_available': self.is_available
        }

class Payment(db.Model):
    __tablename__ = 'payments'
    
    id = db.Column(db.Integer, primary_key=True)
    booking_id = db.Column(db.Integer, db.ForeignKey('bookings.id'), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    payment_method = db.Column(db.String(50))
    transaction_id = db.Column(db.String(120))
    status = db.Column(db.String(20), default='pending')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'booking_id': self.booking_id,
            'amount': self.amount,
            'payment_method': self.payment_method,
            'transaction_id': self.transaction_id,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class Gallery(db.Model):
    __tablename__ = 'gallery'
    
    id = db.Column(db.Integer, primary_key=True)
    accommodation_id = db.Column(db.Integer, db.ForeignKey('accommodations.id'))
    image_url = db.Column(db.String(255), nullable=False)
    caption = db.Column(db.String(255))
    display_order = db.Column(db.Integer)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'accommodation_id': self.accommodation_id,
            'image_url': self.image_url,
            'caption': self.caption,
            'display_order': self.display_order
        }

class ContactMessage(db.Model):
    __tablename__ = 'contact_messages'
    
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), nullable=False)
    subject = db.Column(db.String(255))
    message = db.Column(db.Text, nullable=False)
    status = db.Column(db.String(20), default='new')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'email': self.email,
            'subject': self.subject,
            'message': self.message,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class CommunityMessage(db.Model):
    __tablename__ = 'community_messages'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    text = db.Column(db.Text, nullable=False)
    attachment_url = db.Column(db.String(512))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship('User', backref='community_messages')

    def to_chat_dict(self):
        payload = {
            'id': self.id,
            'text': self.text,
            'user_id': self.user_id,
            'author': get_display_name(self.user),
            'created_at': (self.created_at.isoformat() + 'Z') if self.created_at else None,
        }
        if self.attachment_url:
            payload['attachment_url'] = self.attachment_url
        return payload


class UserCommunityRead(db.Model):
    __tablename__ = 'user_community_read'

    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), primary_key=True)
    last_read_at = db.Column(db.DateTime, default=datetime.utcnow)


def get_community_unread_count(user_id):
    state = UserCommunityRead.query.get(user_id)
    last_read = state.last_read_at if state else datetime.min
    return (
        CommunityMessage.query.filter(
            CommunityMessage.created_at > last_read,
            CommunityMessage.user_id != user_id,
        ).count()
    )


def get_community_unread_previews(user_id, limit=3):
    state = UserCommunityRead.query.get(user_id)
    last_read = state.last_read_at if state else datetime.min
    rows = (
        CommunityMessage.query.filter(
            CommunityMessage.created_at > last_read,
            CommunityMessage.user_id != user_id,
        )
        .order_by(CommunityMessage.created_at.desc())
        .limit(limit)
        .all()
    )
    return [row.to_chat_dict() for row in reversed(rows)]


def mark_community_read(user_id):
    state = UserCommunityRead.query.get(user_id)
    if not state:
        state = UserCommunityRead(user_id=user_id, last_read_at=datetime.utcnow())
        db.session.add(state)
    else:
        state.last_read_at = datetime.utcnow()
    db.session.commit()


def migrate_community_schema():
    from sqlalchemy import inspect, text

    db.create_all()
    inspector = inspect(db.engine)
    if 'community_messages' not in inspector.get_table_names():
        return
    columns = {col['name'] for col in inspector.get_columns('community_messages')}
    if 'attachment_url' not in columns:
        with db.engine.begin() as conn:
            conn.execute(
                text('ALTER TABLE community_messages ADD COLUMN attachment_url VARCHAR(512)')
            )


def get_optional_user_id_from_request():
    auth_header = request.headers.get('Authorization', '')
    if not auth_header.startswith('Bearer '):
        return None
    token = auth_header.split(' ', 1)[1].strip()
    return verify_token(token) if token else None


def load_community_messages_for_viewer(user_id=None, context_before=2, recent_fallback=3):
    """
    Affiche les messages depuis le premier non-lu (utilisateur connecté),
    sinon les `recent_fallback` derniers messages.
    """
    if user_id is None:
        rows = (
            CommunityMessage.query
            .order_by(CommunityMessage.created_at.desc())
            .limit(recent_fallback)
            .all()
        )
        rows = list(reversed(rows))
        has_older = False
        if rows:
            has_older = (
                CommunityMessage.query.filter(
                    CommunityMessage.created_at < rows[0].created_at
                ).count()
                > 0
            )
        return [row.to_chat_dict() for row in rows], {
            'first_unread_id': None,
            'has_unread': False,
            'has_older': has_older,
        }

    state = UserCommunityRead.query.get(user_id)
    last_read = state.last_read_at if state else datetime.min

    unread_rows = (
        CommunityMessage.query.filter(
            CommunityMessage.created_at > last_read,
            CommunityMessage.user_id != user_id,
        )
        .order_by(CommunityMessage.created_at.asc())
        .all()
    )

    first_unread_id = None

    if unread_rows:
        first_unread_at = unread_rows[0].created_at
        first_unread_id = unread_rows[0].id
        context_rows = (
            CommunityMessage.query.filter(
                CommunityMessage.created_at < first_unread_at
            )
            .order_by(CommunityMessage.created_at.desc())
            .limit(context_before)
            .all()
        )
        context_rows = list(reversed(context_rows))
        main_rows = (
            CommunityMessage.query.filter(
                CommunityMessage.created_at >= first_unread_at
            )
            .order_by(CommunityMessage.created_at.asc())
            .all()
        )
        rows = context_rows + main_rows
    else:
        rows = (
            CommunityMessage.query
            .order_by(CommunityMessage.created_at.desc())
            .limit(recent_fallback)
            .all()
        )
        rows = list(reversed(rows))

    messages = []
    for row in rows:
        payload = row.to_chat_dict()
        payload['is_unread'] = (
            row.created_at > last_read and row.user_id != user_id
        )
        messages.append(payload)

    has_older = False
    if rows:
        has_older = (
            CommunityMessage.query.filter(
                CommunityMessage.created_at < rows[0].created_at
            ).count()
            > 0
        )

    return messages, {
        'first_unread_id': first_unread_id,
        'has_unread': bool(unread_rows),
        'has_older': has_older,
    }


def load_older_community_messages(before_id, limit=3, user_id=None):
    """Messages plus anciens que `before_id` (par lots de `limit`)."""
    anchor = CommunityMessage.query.get(before_id)
    if not anchor:
        return [], False

    older_rows = (
        CommunityMessage.query.filter(
            CommunityMessage.created_at < anchor.created_at
        )
        .order_by(CommunityMessage.created_at.desc())
        .limit(limit)
        .all()
    )
    older_rows = list(reversed(older_rows))

    last_read = datetime.min
    if user_id:
        state = UserCommunityRead.query.get(user_id)
        last_read = state.last_read_at if state else datetime.min

    messages = []
    for row in older_rows:
        payload = row.to_chat_dict()
        if user_id:
            payload['is_unread'] = (
                row.created_at > last_read and row.user_id != user_id
            )
        else:
            payload['is_unread'] = False
        messages.append(payload)

    has_older = False
    if older_rows:
        has_older = (
            CommunityMessage.query.filter(
                CommunityMessage.created_at < older_rows[0].created_at
            ).count()
            > 0
        )

    return messages, has_older

# ================== ROUTES ==================

@app.route('/api/health', methods=['GET'])
def health():
    """Vérifier la santé de l'API"""
    return jsonify({'status': 'ok', 'message': 'Backend Camping Mimosas is running'}), 200


@app.route('/api/community/messages', methods=['GET'])
def get_community_messages():
    """Historique : depuis le premier non-lu, ou les 3 derniers messages."""
    user_id = get_optional_user_id_from_request()
    messages, meta = load_community_messages_for_viewer(user_id)
    return jsonify({'messages': messages, **meta}), 200


@app.route('/api/community/messages/older', methods=['GET'])
def get_older_community_messages():
    """Charger des messages plus anciens (3 par défaut)."""
    before_id = request.args.get('before_id', type=int)
    if not before_id:
        return jsonify({'error': 'before_id requis'}), 400

    limit = request.args.get('limit', 3, type=int)
    limit = max(1, min(limit, 20))

    user_id = get_optional_user_id_from_request()
    messages, has_older = load_older_community_messages(before_id, limit, user_id)
    return jsonify({'messages': messages, 'has_older': has_older}), 200


@app.route('/api/community/messages/<int:message_id>', methods=['DELETE'])
@token_required
def delete_community_message(message_id):
    """Supprimer un message (auteur uniquement)."""
    row = CommunityMessage.query.get(message_id)
    if not row:
        return jsonify({'error': 'Message introuvable'}), 404
    if row.user_id != request.user_id:
        return jsonify({'error': 'Non autorisé'}), 403

    db.session.delete(row)
    db.session.commit()
    socketio.emit(
        'community_message_deleted',
        {'id': message_id},
        to=COMMUNITY_ROOM,
    )
    socketio.emit('unread_refresh', {})
    return jsonify({'message': 'Message supprimé', 'id': message_id}), 200


@app.route('/api/community/unread', methods=['GET'])
@token_required
def get_community_unread():
    """Nombre de messages communauté non lus."""
    count = get_community_unread_count(request.user_id)
    previews = get_community_unread_previews(request.user_id)
    return jsonify({'unread_count': count, 'previews': previews}), 200


@app.route('/api/community/mark-read', methods=['POST'])
@token_required
def post_community_mark_read():
    """Marquer la discussion comme lue."""
    mark_community_read(request.user_id)
    return jsonify({'message': 'ok', 'unread_count': 0}), 200


@app.route('/api/community/upload', methods=['POST'])
@token_required
def upload_community_attachment():
    """Téléverser une pièce jointe pour le chat."""
    file = request.files.get('file')
    if not file or not file.filename:
        return jsonify({'error': 'Fichier manquant'}), 400

    ext = file.filename.rsplit('.', 1)[-1].lower() if '.' in file.filename else ''
    if ext not in ALLOWED_COMMUNITY_EXTENSIONS:
        return jsonify({'error': 'Type de fichier non autorisé'}), 400

    filename = secure_filename(f"{request.user_id}_{int(datetime.utcnow().timestamp())}.{ext}")
    filepath = os.path.join(COMMUNITY_UPLOAD_DIR, filename)
    file.save(filepath)

    url = f"/uploads/community/{filename}"
    return jsonify({'url': url, 'filename': filename}), 201


@app.route('/uploads/community/<path:filename>')
def serve_community_file(filename):
    return send_from_directory(COMMUNITY_UPLOAD_DIR, filename)

@app.route('/api/accommodations', methods=['GET'])
def get_accommodations():
    """Récupérer tous les hébergements"""
    accommodations = Accommodation.query.all()
    return jsonify([acc.to_dict() for acc in accommodations]), 200

@app.route('/api/accommodations/<int:id>', methods=['GET'])
def get_accommodation(id):
    """Récupérer un hébergement spécifique"""
    accommodation = Accommodation.query.get(id)
    if not accommodation:
        return jsonify({'error': 'Accommodation not found'}), 404
    return jsonify(accommodation.to_dict()), 200

@app.route('/api/reviews', methods=['GET'])
def get_reviews():
    """Récupérer tous les avis"""
    reviews = Review.query.all()
    return jsonify([review.to_dict() for review in reviews]), 200

@app.route('/api/reviews', methods=['POST'])
@token_required
def create_review():
    """Créer un nouvel avis"""
    try:
        data = request.get_json()
        review = Review(
            user_id=request.user_id,
            rating=data.get('rating'),
            comment=data.get('comment')
        )
        db.session.add(review)
        db.session.commit()
        return jsonify(review.to_dict()), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/services', methods=['GET'])
def get_services():
    """Récupérer tous les services"""
    services = Service.query.all()
    return jsonify([service.to_dict() for service in services]), 200

@app.route('/api/contact', methods=['POST'])
def create_contact_message():
    """Créer un message de contact et envoyer un email"""
    try:
        data = request.get_json()
        email = data.get('email')
        subject = data.get('subject')
        message_text = data.get('message')
        
        # Sauvegarder le message en base de données
        message = ContactMessage(
            email=email,
            subject=subject,
            message=message_text
        )
        db.session.add(message)
        db.session.commit()
        
        # Envoyer l'email
        try:
            # Email à l'administrateur
            admin_msg = Message(
                subject=f"Nouveau message de contact: {subject}",
                recipients=[app.config['MAIL_USERNAME']],
                body=f"""
Nouveau message de contact reçu:

De: {email}
Sujet: {subject}

Message:
{message_text}

---
Message ID: {message.id}
Date: {message.created_at}
                """
            )
            mail.send(admin_msg)
            
            # Email de confirmation à l'utilisateur
            user_msg = Message(
                subject="Nous avons reçu votre message - Camping Mimosas",
                recipients=[email],
                body=f"""
Merci {email},

Nous avons bien reçu votre message concernant: {subject}

Notre équipe vous répondra dans les plus brefs délais.

Cordialement,
Camping Mimosas
                """
            )
            mail.send(user_msg)
            
            return jsonify({
                **message.to_dict(),
                'email_sent': True,
                'message': 'Message envoyé avec succès!'
            }), 201
        except Exception as email_error:
            # Le message est sauvegardé même si l'email échoue
            print(f"⚠️ Erreur lors de l'envoi de l'email: {str(email_error)}")
            return jsonify({
                **message.to_dict(),
                'email_sent': False,
                'message': 'Message sauvegardé mais erreur d\'envoi d\'email',
                'error': str(email_error)
            }), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/auth/signup', methods=['POST'])
def signup():
    """Créer un nouveau compte utilisateur"""
    try:
        data = request.get_json()
        
        # Validation des données requises
        if not data.get('email') or not data.get('password') or not data.get('username'):
            return jsonify({'error': 'Email, username, et password sont requis'}), 400
        
        # Vérifier si l'utilisateur existe déjà
        existing_user = User.query.filter_by(email=data.get('email')).first()
        if existing_user:
            return jsonify({'error': 'Cet email est déjà utilisé'}), 409
        
        existing_user = User.query.filter_by(username=data.get('username')).first()
        if existing_user:
            return jsonify({'error': 'Ce nom d\'utilisateur est déjà pris'}), 409
        
        # Créer un nouvel utilisateur
        user = User(
            username=data.get('username'),
            email=data.get('email'),
            password_hash=hash_password(data.get('password')),
            first_name=data.get('first_name', ''),
            last_name=data.get('last_name', ''),
            phone=data.get('phone', ''),
            address=data.get('address', ''),
            city=data.get('city', ''),
            postal_code=data.get('postal_code', ''),
            country=data.get('country', ''),
            role='client'
        )
        
        db.session.add(user)
        db.session.commit()
        
        # Créer un token JWT
        token = create_token(user.id)
        
        return jsonify({
            'message': 'Inscription réussie',
            'token': token,
            'user': user.to_dict()
        }), 201
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

@app.route('/api/auth/login', methods=['POST'])
def login():
    """Connecter un utilisateur"""
    try:
        data = request.get_json()
        
        if not data.get('email') or not data.get('password'):
            return jsonify({'error': 'Email et password sont requis'}), 400
        
        # Trouver l'utilisateur
        user = User.query.filter_by(email=data.get('email')).first()
        if not user:
            return jsonify({'error': 'Email ou mot de passe incorrect'}), 401
        
        # Vérifier le mot de passe
        if not verify_password(data.get('password'), user.password_hash):
            return jsonify({'error': 'Email ou mot de passe incorrect'}), 401
        
        # Vérifier si le compte est actif
        if not user.is_active:
            return jsonify({'error': 'Ce compte a été désactivé'}), 403
        
        # Créer un token JWT
        token = create_token(user.id)
        
        return jsonify({
            'message': 'Connexion réussie',
            'token': token,
            'user': user.to_dict()
        }), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/auth/verify', methods=['GET'])
@token_required
def verify_auth():
    """Vérifier la validité du token"""
    try:
        user = User.query.get(request.user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        return jsonify({
            'message': 'Token valide',
            'user': user.to_dict()
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/auth/logout', methods=['POST'])
@token_required
def logout():
    """Déconnecter un utilisateur (invalidate token - optionnel)"""
    return jsonify({'message': 'Déconnexion réussie'}), 200

@app.route('/api/auth/profile', methods=['GET'])
@token_required
def get_profile():
    """Récupérer le profil de l'utilisateur authentifié"""
    try:
        user = User.query.get(request.user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        return jsonify(user.to_dict()), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/auth/profile', methods=['PUT'])
@token_required
def update_profile():
    """Mettre à jour le profil de l'utilisateur"""
    try:
        data = request.get_json()
        user = User.query.get(request.user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Mettre à jour les champs autorisés
        if 'first_name' in data:
            user.first_name = data['first_name']
        if 'last_name' in data:
            user.last_name = data['last_name']
        if 'phone' in data:
            user.phone = data['phone']
        if 'address' in data:
            user.address = data['address']
        if 'city' in data:
            user.city = data['city']
        if 'postal_code' in data:
            user.postal_code = data['postal_code']
        if 'country' in data:
            user.country = data['country']
        
        user.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'message': 'Profil mis à jour',
            'user': user.to_dict()
        }), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

@app.route('/api/auth/change-password', methods=['POST'])
@token_required
def change_password():
    """Changer le mot de passe de l'utilisateur"""
    try:
        data = request.get_json()
        user = User.query.get(request.user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Vérifier l'ancien mot de passe
        if not verify_password(data.get('current_password', ''), user.password_hash):
            return jsonify({'error': 'Mot de passe actuel incorrect'}), 401
        
        # Vérifier que le nouveau mot de passe n'est pas vide
        if not data.get('new_password'):
            return jsonify({'error': 'Le nouveau mot de passe est requis'}), 400
        
        # Mettre à jour le mot de passe
        user.password_hash = hash_password(data.get('new_password'))
        user.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({'message': 'Mot de passe changé avec succès'}), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

# ===== Hébergements par défaut (requis pour les réservations) =====
DEFAULT_ACCOMMODATIONS = [
    {
        'id': 1,
        'name': 'Bungalow / Chalet',
        'description': 'Hébergement confortable avec sanitaires privés',
        'type': 'bungalow',
        'capacity': 4,
        'price_per_night': 150.0,
        'image_url': 'src/images/chalets.png',
    },
    {
        'id': 2,
        'name': 'Emplacement caravane',
        'description': 'Emplacement spacieux avec branchements électriques',
        'type': 'caravane',
        'capacity': 4,
        'price_per_night': 120.0,
        'image_url': 'src/images/zone_car.png',
    },
    {
        'id': 3,
        'name': 'Emplacement tente',
        'description': 'Zone nature entourée de verdure',
        'type': 'tente',
        'capacity': 6,
        'price_per_night': 80.0,
        'image_url': 'src/images/tente.png',
    },
    {
        'id': 4,
        'name': 'Camping-car / Mobile home',
        'description': 'Accès direct aux services du camping',
        'type': 'campingcar',
        'capacity': 4,
        'price_per_night': 130.0,
        'image_url': 'src/images/zone_car.png',
    },
]


def ensure_default_accommodations():
    """Crée les hébergements de base si la table est vide (migration SQLite/Postgres)."""
    if Accommodation.query.count() > 0:
        return
    for item in DEFAULT_ACCOMMODATIONS:
        db.session.add(Accommodation(
            id=item['id'],
            name=item['name'],
            description=item['description'],
            type=item['type'],
            capacity=item['capacity'],
            price_per_night=item['price_per_night'],
            image_url=item['image_url'],
            amenities='',
            is_available=True,
        ))
    db.session.commit()
    try:
        from sqlalchemy import text
        db.session.execute(text(
            "SELECT setval(pg_get_serial_sequence('accommodations', 'id'), "
            "(SELECT COALESCE(MAX(id), 1) FROM accommodations))"
        ))
        db.session.commit()
    except Exception:
        db.session.rollback()


# ===== Routes pour les réservations =====
def _parse_booking_date(value):
    if not value:
        return datetime.utcnow().date()
    raw = str(value).replace('Z', '+00:00')
    if 'T' in raw:
        return datetime.fromisoformat(raw).date()
    return datetime.fromisoformat(raw[:10]).date()


def _resolve_accommodation_id(service):
    ensure_default_accommodations()
    category_map = {
        'bungalow': 1, 'chalet': 1,
        'caravane': 2, 'camping': 2,
        'tente': 3,
        'campingcar': 4,
    }
    candidate = service.get('accommodation_id') or category_map.get(service.get('id'))
    if candidate:
        acc = Accommodation.query.get(int(candidate))
        if acc:
            return acc.id
    first = Accommodation.query.order_by(Accommodation.id.asc()).first()
    if not first:
        raise ValueError('Aucun hébergement disponible en base de données')
    return first.id


@app.route('/api/bookings', methods=['POST'])
def create_booking():
    """Créer une réservation - accessible au public"""
    try:
        data = request.get_json()
        
        # Supporter le format du frontend
        # Le frontend envoie soit des infos simples, soit le format complet
        try:
            # Format du formulaire frontend
            if 'startDate' in data or 'client' in data:
                ensure_default_accommodations()
                client_info = data.get('client', {})
                email = (client_info.get('email') or data.get('email') or '').strip().lower()
                if not email:
                    email = f"guest_{int(datetime.utcnow().timestamp())}@camping-mimosas.com"

                # Utilisateur connecté : lier la réservation à son compte
                logged_user_id = get_user_id_from_request()
                if logged_user_id:
                    user = User.query.get(logged_user_id)
                    if not user:
                        return jsonify({'error': 'Utilisateur introuvable'}), 401
                else:
                    user = User.query.filter(db.func.lower(User.email) == email).first()
                    if not user:
                        guest_name = (client_info.get('name') or 'Guest').strip()
                        user = User(
                            username=email.split('@')[0][:50],
                            email=email,
                            password_hash=hash_password("temp_password"),
                            first_name=guest_name,
                            phone=client_info.get('phone', ''),
                            role='client',
                            is_active=True
                        )
                        db.session.add(user)
                        db.session.flush()

                try:
                    guests = int(data.get('guests', 1))
                except (TypeError, ValueError):
                    guests = 1

                check_in = _parse_booking_date(data.get('startDate'))
                check_out = _parse_booking_date(data.get('endDate'))
                booking_status = data.get('status', 'pending')
                if booking_status not in ('pending', 'confirmed', 'cancelled'):
                    booking_status = 'pending'

                selectedServices = data.get('selectedServices', [])
                if not selectedServices:
                    return jsonify({'error': 'Aucun hébergement sélectionné'}), 400

                created_bookings = []
                for service in selectedServices:
                    accommodation_id = _resolve_accommodation_id(service)
                    booking = Booking(
                        user_id=user.id,
                        accommodation_id=accommodation_id,
                        check_in_date=check_in,
                        check_out_date=check_out,
                        number_of_guests=guests,
                        total_price=float(service.get('subtotal', 0) or data.get('totalPrice', 0)),
                        special_requests=client_info.get('message', ''),
                        status=booking_status,
                    )
                    db.session.add(booking)
                    db.session.flush()
                    created_bookings.append(booking.to_dict())

                db.session.commit()

                return jsonify({
                    'message': 'Réservation créée avec succès',
                    'status': 'success',
                    'booking_count': len(created_bookings),
                    'bookings': created_bookings,
                    'user_id': user.id,
                }), 201
            else:
                # Format traditionnel de l'API
                user_id = getattr(request, 'user_id', None)
                
                booking = Booking(
                    user_id=user_id,
                    accommodation_id=data.get('accommodation_id'),
                    check_in_date=datetime.fromisoformat(data.get('check_in_date')),
                    check_out_date=datetime.fromisoformat(data.get('check_out_date')),
                    number_of_guests=data.get('number_of_guests'),
                    total_price=float(data.get('total_price')),
                    special_requests=data.get('special_requests', ''),
                    status='confirmed'
                )
                
                db.session.add(booking)
                db.session.commit()
                
                return jsonify({
                    'message': 'Réservation créée avec succès',
                    'booking': booking.to_dict()
                }), 201
        except ValueError as ve:
            db.session.rollback()
            return jsonify({'error': f'Format de données invalide: {str(ve)}'}), 400
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

@app.route('/api/bookings', methods=['GET'])
@token_required
def get_user_bookings():
    """Récupérer les réservations de l'utilisateur"""
    try:
        bookings = Booking.query.filter_by(user_id=request.user_id).order_by(Booking.created_at.desc()).all()
        return jsonify([booking.to_dict() for booking in bookings]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/bookings/<int:id>', methods=['GET'])
@token_required
def get_booking(id):
    """Récupérer une réservation spécifique"""
    try:
        booking = Booking.query.get(id)
        
        if not booking:
            return jsonify({'error': 'Booking not found'}), 404
        
        # Vérifier que c'est le propriétaire ou un admin
        if booking.user_id != request.user_id and not User.query.get(request.user_id).is_admin:
            return jsonify({'error': 'Unauthorized'}), 403
        
        return jsonify(booking.to_dict()), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500

# ================== CHATBOT API ==================

@app.route('/api/chatbot', methods=['POST'])
def chatbot():
    """Chatbot Mimos : FAQ officielle + hébergements (BDD). Gemini = small talk uniquement."""
    try:
        data = request.get_json() or {}
        user_message = data.get('message', '').strip()

        if not user_message:
            return jsonify({'error': 'Message vide'}), 400

        result = process_chatbot_message(
            user_message=user_message,
            accommodation_model=Accommodation,
            ensure_default_accommodations_fn=ensure_default_accommodations,
            gemini_model=model if GEMINI_AVAILABLE else None,
            allow_gemini_reformulation=bool(GEMINI_AVAILABLE and model),
        )

        if result.get('error'):
            return jsonify({'error': result['error']}), 400

        return jsonify({
            'reply': result['reply'],
            'status': 'success',
            'source': result.get('source'),
            'matched_id': result.get('matched_id'),
        }), 200

    except FileNotFoundError:
        return jsonify({
            'error': 'Fichier FAQ introuvable (data/camping_faq.json)',
        }), 503
    except Exception as e:
        print(f"Erreur chatbot: {str(e)}")
        return jsonify({'error': f'Erreur serveur: {str(e)}'}), 500


# ================== ENREGISTREMENT DES ROUTES STRIPE ==================
register_payment_routes(app)


def count_unique_online_members():
    """Compte les utilisateurs uniques (pas chaque onglet/socket)."""
    try:
        participants = list(socketio.server.manager.get_participants('/', COMMUNITY_ROOM))
    except Exception:
        participants = []

    user_ids = set()
    anonymous_sessions = 0
    for sid in participants:
        user_id = ONLINE_PRESENCE.get(sid)
        if user_id:
            user_ids.add(user_id)
        else:
            anonymous_sessions += 1

    return len(user_ids) + anonymous_sessions


def broadcast_online_count():
    count = count_unique_online_members()
    socketio.emit('online_count', {'count': count}, to=COMMUNITY_ROOM)


@socketio.on('connect')
def on_connect():
    """Connexion socket sans rejoindre le salon (évite de gonfler le compteur)."""
    pass


@socketio.on('disconnect')
def on_disconnect():
    from flask import request as flask_request
    ONLINE_PRESENCE.pop(flask_request.sid, None)
    broadcast_online_count()


@socketio.on('join_community')
def on_join_community(data=None):
    from flask import request as flask_request

    join_room(COMMUNITY_ROOM)

    payload = data or {}
    token = (payload.get('token') or '').strip()
    sid = flask_request.sid

    user_id = verify_token(token) if token else None
    ONLINE_PRESENCE[sid] = user_id

    with app.app_context():
        messages, meta = load_community_messages_for_viewer(user_id)
        emit('chat_history', {'messages': messages, **meta})

    broadcast_online_count()


@socketio.on('leave_community')
def on_leave_community():
    from flask import request as flask_request
    leave_room(COMMUNITY_ROOM)
    ONLINE_PRESENCE.pop(flask_request.sid, None)
    broadcast_online_count()


@socketio.on('community_message')
def on_community_message(data):
    from flask import request as flask_request

    text = (data or {}).get('text', '').strip()
    attachment_url = (data or {}).get('attachment_url', '').strip()
    token = (data or {}).get('token', '').strip()

    if not text and not attachment_url:
        emit('community_error', {'error': 'Message vide.'}, to=flask_request.sid)
        return

    user_id = verify_token(token)
    if user_id is None:
        emit(
            'community_error',
            {'error': 'Session expirée, reconnectez-vous.'},
            to=flask_request.sid,
        )
        return

    with app.app_context():
        user = User.query.get(user_id)
        if not user:
            emit('community_error', {'error': 'Utilisateur introuvable.'}, to=flask_request.sid)
            return

        join_room(COMMUNITY_ROOM)
        ONLINE_PRESENCE[flask_request.sid] = user_id

        display_text = text[:500] if text else ''
        if attachment_url and not display_text:
            display_text = '📎 Pièce jointe'

        row = CommunityMessage(
            user_id=user_id,
            text=display_text,
            attachment_url=attachment_url or None,
        )
        db.session.add(row)
        db.session.commit()
        message = row.to_chat_dict()

    emit('community_message', message, to=COMMUNITY_ROOM)
    socketio.emit('unread_refresh', {})
    broadcast_online_count()

if __name__ == '__main__':
    with app.app_context():
        migrate_community_schema()
        ensure_default_accommodations()
    socketio.run(app, debug=True, host='0.0.0.0', port=5000)
