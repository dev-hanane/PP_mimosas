#!/usr/bin/env python3
"""
Script d'initialisation de la base de données et du backend Flask
pour le projet Camping Mimosas
"""

import sqlite3
import os
from datetime import datetime

# Chemin de la base de données
DB_PATH = "camping.db"

def create_database():
    """Créer et initialiser la base de données SQLite"""
    
    # Supprimer l'ancien fichier s'il existe et n'est pas valide
    if os.path.exists(DB_PATH):
        try:
            conn = sqlite3.connect(DB_PATH)
            conn.execute("SELECT 1")
            conn.close()
            print(f"✓ La base de données {DB_PATH} existe déjà et est valide")
            return
        except:
            import shutil
            backup_path = f"{DB_PATH}.backup"
            try:
                shutil.move(DB_PATH, backup_path)
                print(f"⚠ Ancien fichier {DB_PATH} sauvegardé en {backup_path} (invalide)")
            except:
                print(f"⚠ Impossible de sauvegarden l'ancien fichier, le script va continuer")
    
    # Créer la base de données
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    print("\n📝 Création des tables...")
    
    # Table Users (Utilisateurs)
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username VARCHAR(80) UNIQUE NOT NULL,
            email VARCHAR(120) UNIQUE NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            first_name VARCHAR(80),
            last_name VARCHAR(80),
            phone VARCHAR(20),
            address TEXT,
            city VARCHAR(80),
            postal_code VARCHAR(10),
            country VARCHAR(80),
            role VARCHAR(20) DEFAULT 'client',
            is_active BOOLEAN DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    print("   ✓ Table 'users' créée")
    
    # Table Accommodations (Hébergements)
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS accommodations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name VARCHAR(120) NOT NULL,
            description TEXT,
            type VARCHAR(50),
            capacity INTEGER,
            price_per_night DECIMAL(10, 2),
            image_url VARCHAR(255),
            amenities TEXT,
            is_available BOOLEAN DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    print("   ✓ Table 'accommodations' créée")
    
    # Table Bookings (Réservations)
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS bookings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            accommodation_id INTEGER NOT NULL,
            check_in_date DATE NOT NULL,
            check_out_date DATE NOT NULL,
            number_of_guests INTEGER NOT NULL,
            total_price DECIMAL(10, 2),
            status VARCHAR(20) DEFAULT 'pending',
            special_requests TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id),
            FOREIGN KEY (accommodation_id) REFERENCES accommodations(id)
        )
    ''')
    print("   ✓ Table 'bookings' créée")
    
    # Table Reviews (Avis)
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS reviews (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            accommodation_id INTEGER,
            rating INTEGER CHECK(rating >= 1 AND rating <= 5),
            comment TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id),
            FOREIGN KEY (accommodation_id) REFERENCES accommodations(id)
        )
    ''')
    print("   ✓ Table 'reviews' créée")
    
    # Table Services (Services)
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS services (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name VARCHAR(120) NOT NULL,
            description TEXT,
            category VARCHAR(50),
            price DECIMAL(10, 2),
            is_available BOOLEAN DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    print("   ✓ Table 'services' créée")
    
    # Table Payments (Paiements)
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS payments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            booking_id INTEGER NOT NULL,
            amount DECIMAL(10, 2) NOT NULL,
            payment_method VARCHAR(50),
            transaction_id VARCHAR(120),
            status VARCHAR(20) DEFAULT 'pending',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (booking_id) REFERENCES bookings(id)
        )
    ''')
    print("   ✓ Table 'payments' créée")
    
    # Table Gallery (Galerie)
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS gallery (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            accommodation_id INTEGER,
            image_url VARCHAR(255) NOT NULL,
            caption VARCHAR(255),
            display_order INTEGER,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (accommodation_id) REFERENCES accommodations(id)
        )
    ''')
    print("   ✓ Table 'gallery' créée")
    
    # Table Contact Messages (Messages de contact)
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS contact_messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email VARCHAR(120) NOT NULL,
            subject VARCHAR(255),
            message TEXT NOT NULL,
            status VARCHAR(20) DEFAULT 'new',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    print("   ✓ Table 'contact_messages' créée")
    
    # Sauvegarder et fermer
    conn.commit()
    conn.close()
    
    print(f"\n✅ Base de données '{DB_PATH}' créée avec succès!")
    print(f"\n📊 Récapitulatif des tables créées:")
    print("   • users - Gestion des utilisateurs")
    print("   • accommodations - Types d'hébergements")
    print("   • bookings - Réservations")
    print("   • reviews - Avis et commentaires")
    print("   • services - Services disponibles")
    print("   • payments - Historique des paiements")
    print("   • gallery - Images de la galerie")
    print("   • contact_messages - Messages de contact")

if __name__ == "__main__":
    create_database()
