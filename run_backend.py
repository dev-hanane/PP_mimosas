#!/usr/bin/env python3
"""
Script de démarrage du backend Flask
"""

import subprocess
import sys
import os

def install_requirements():
    """Installer les dépendances requises"""
    print("📦 Installation des dépendances...")
    result = subprocess.run([sys.executable, '-m', 'pip', 'install', '-r', 'requirements.txt'], 
                          capture_output=False)
    if result.returncode != 0:
        print("❌ Erreur lors de l'installation des dépendances")
        return False
    print("✅ Dépendances installées")
    return True

def start_flask_server():
    """Démarrer le serveur Flask"""
    print("\n🚀 Démarrage du serveur Flask...")
    print("📍 L'API sera disponible sur: http://localhost:5000")
    print("\n📚 Documentation de l'API:")
    print("   • GET /api/health - Vérifier le statut")
    print("   • GET /api/accommodations - Lister tous les hébergements")
    print("   • GET /api/reviews - Lister tous les avis")
    print("   • POST /api/reviews - Créer un avis")
    print("   • GET /api/services - Lister tous les services")
    print("   • POST /api/contact - Envoyer un message de contact")
    print("   • POST /api/bookings - Créer une réservation")
    print("\n⏹️  Appuyez sur Ctrl+C pour arrêter le serveur\n")
    
    os.environ['FLASK_APP'] = 'app.py'
    os.environ['FLASK_ENV'] = 'development'
    
    result = subprocess.run([sys.executable, 'app.py'])
    return result.returncode == 0

if __name__ == '__main__':
    if install_requirements():
        start_flask_server()
