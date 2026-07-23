"""Peuple la table accommodations si elle est vide."""
from dotenv import load_dotenv

load_dotenv()

from app import app, ensure_default_accommodations, Accommodation

if __name__ == '__main__':
    with app.app_context():
        before = Accommodation.query.count()
        ensure_default_accommodations()
        after = Accommodation.query.count()
        print(f'Hébergements: {before} -> {after}')
        for a in Accommodation.query.order_by(Accommodation.id).all():
            print(f'  {a.id}: {a.name} ({a.price_per_night} DH/nuit)')
