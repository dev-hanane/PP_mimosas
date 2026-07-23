import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import { useAuth } from '../context/AuthContext';

export default function Signup() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    username: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    country: '',
    password: '',
    confirmPassword: '',
    conditions: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { signup } = useAuth();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!formData.conditions) {
      setError('Veuillez accepter les conditions d\'utilisation');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }
    if (formData.password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères.');
      return;
    }
    if (!formData.username || !formData.email) {
      setError('Le nom d\'utilisateur et l\'email sont requis');
      return;
    }
    
    setIsLoading(true);
    try {
      await signup(formData);
      Swal.fire({
        title: 'Bienvenue! 🌿',
        html: '<p style="font-size: 1rem; margin: 10px 0;">Inscription réussie!</p><p style="font-size: 0.9rem; color: #666;">Vous allez être redirigé vers votre tableau de bord.</p>',
        icon: 'success',
        confirmButtonText: 'Continuer',
        confirmButtonColor: '#afee1b',
        background: 'linear-gradient(135deg, #2d7a3a 0%, #4a9d57 100%)',
        color: '#ffffff',
        iconColor: '#afee1b',
        allowOutsideClick: false,
        didOpen: (modal) => {
          const confirmBtn = modal.querySelector('.swal2-confirm');
          if (confirmBtn) {
            confirmBtn.style.color = '#1f5126';
            confirmBtn.style.fontWeight = '600';
          }
        }
      }).then(() => {
        navigate('/');
      });
    } catch (err) {
      setError(err.message || 'Erreur lors de l\'inscription');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <style>{`
        .backButtonLink:hover {
          background: #afee1b !important;
          transform: translateX(-5px);
          box-shadow: 0 12px 30px rgba(175, 238, 27, 0.6) !important;
        }
        input::placeholder, select::placeholder {
          color: rgba(255, 255, 255, 0.7) !important;
          opacity: 1;
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
      <Link to="/" style={styles.backButton} className="backButtonLink">
        ← Retour
      </Link>
      <div style={styles.card}>
        <div style={styles.header}>
          <h1 style={styles.title}>🏕 Camping Mimosas</h1>
          <p style={styles.subtitle}>Créer votre compte</p>
        </div>

        {error && (
          <div style={styles.errorBox}>
            <span style={styles.errorIcon}>⚠️</span>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={styles.twoColumns}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Prénom *</label>
              <input
                type="text"
                name="firstName"
                placeholder="Votre prénom"
                value={formData.firstName}
                onChange={handleChange}
                required
                style={styles.input}
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Nom *</label>
              <input
                type="text"
                name="lastName"
                placeholder="Votre nom"
                value={formData.lastName}
                onChange={handleChange}
                required
                style={styles.input}
              />
            </div>
          </div>

          <div style={styles.twoColumns}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Nom d'utilisateur *</label>
              <input
                type="text"
                name="username"
                placeholder="Votre nom d'utilisateur"
                value={formData.username}
                onChange={handleChange}
                required
                style={styles.input}
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Email *</label>
              <input
                type="email"
                name="email"
                placeholder="email@ex.com"
                value={formData.email}
                onChange={handleChange}
                required
                style={styles.input}
              />
            </div>
          </div>

          <div style={styles.twoColumns}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Téléphone</label>
              <input
                type="tel"
                name="phone"
                placeholder="+212 6XX"
                value={formData.phone}
                onChange={handleChange}
                style={styles.input}
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Ville</label>
              <input
                type="text"
                name="city"
                placeholder="Votre ville"
                value={formData.city}
                onChange={handleChange}
                style={styles.input}
              />
            </div>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Adresse</label>
            <input
              type="text"
              name="address"
              placeholder="Votre adresse complète"
              value={formData.address}
              onChange={handleChange}
              style={styles.input}
            />
          </div>

          <div style={styles.twoColumns}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Code Postal</label>
              <input
                type="text"
                name="postalCode"
                placeholder="Code postal"
                value={formData.postalCode}
                onChange={handleChange}
                style={styles.input}
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Pays</label>
              <input
                type="text"
                name="country"
                placeholder="Votre pays"
                value={formData.country}
                onChange={handleChange}
                style={styles.input}
              />
            </div>
          </div>

          <div style={styles.twoColumns}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Mot de passe *</label>
              <input
                type="password"
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
                style={styles.input}
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Confirmer *</label>
              <input
                type="password"
                name="confirmPassword"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                style={styles.input}
              />
            </div>
          </div>

          <div style={styles.checkboxGroup}>
            <input
              type="checkbox"
              name="conditions"
              id="conditions"
              checked={formData.conditions}
              onChange={handleChange}
              required
              style={styles.checkbox}
            />
            <label htmlFor="conditions" style={styles.checkboxLabel}>
              J'accepte les conditions d'utilisation et la politique de confidentialité *
            </label>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            style={{...styles.button, opacity: isLoading ? 0.7 : 1}}
            onMouseOver={(e) => !isLoading && (e.target.style.transform = 'translateY(-2px)')}
            onMouseOut={(e) => (e.target.style.transform = 'translateY(0)')}
          >
            {isLoading ? 'Inscription en cours...' : 'S\'inscrire'}
          </button>
        </form>

        <div style={styles.signup}>
          Déjà inscrit? <a href="/login" style={styles.signupLink}>Se connecter</a>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #2d7a3a 0%, #4a9d57 100%)',
    backgroundImage: 'url(src/images/verts/back2.png)',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundAttachment: 'fixed',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    position: 'relative'
  },

  card: {
    position: 'relative',
    background: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '24px',
    padding: '40px',
    width: '100%',
    maxWidth: '700px',
    boxShadow: '0 25px 50px rgba(0, 0, 0, 0.3), inset 0 0 0 1px rgba(255, 255, 255, 0.1)',
    animation: 'slideUp 0.6s ease-out',
    maxHeight: '90vh',
    overflowY: 'auto',
    zIndex: 1
  },

  errorBox: {
    background: 'rgba(239, 68, 68, 0.2)',
    border: '1px solid rgba(239, 68, 68, 0.5)',
    color: '#fee2e2',
    padding: '12px 16px',
    borderRadius: '8px',
    marginBottom: '20px',
    fontSize: '0.95rem',
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },

  errorIcon: {
    fontSize: '1.2rem'
  },

  header: {
    textAlign: 'center',
    marginBottom: '25px'
  },

  title: {
    color: 'rgb(165, 221, 33)',
    fontSize: '2rem',
    fontWeight: '700',
    marginBottom: '8px',
    textShadow: '0 2px 10px rgba(0, 0, 0, 0.2)'
  },

  subtitle: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: '0.9rem'
  },

  twoColumns: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
    marginBottom: '16px'
  },

  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },

  label: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: '0.9rem',
    fontWeight: '600'
  },

  input: {
    padding: '12px 14px',
    background: 'rgba(255, 255, 255, 0.15)',
    border: '2px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '8px',
    color: '#ffffff',
    fontSize: '0.95rem',
    transition: 'all 0.3s ease',
    outline: 'none',
    fontFamily: 'inherit'
  },

  checkboxGroup: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '10px',
    marginBottom: '20px'
  },

  checkbox: {
    width: '20px',
    height: '20px',
    cursor: 'pointer',
    marginTop: '4px'
  },

  checkboxLabel: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: '0.9rem',
    cursor: 'pointer',
    lineHeight: '1.4'
  },

  button: {
    width: '100%',
    padding: '14px',
    background: '#afee1b',
    border: 'none',
    borderRadius: '8px',
    color: '#1f5126',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 10px 25px rgba(175, 238, 27, 0.4)',
    marginBottom: '15px'
  },

  signup: {
    textAlign: 'center',
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: '0.9rem'
  },

  signupLink: {
    color: '#ffffff',
    fontWeight: '600',
    textDecoration: 'none',
    transition: 'all 0.3s ease'
  },

  backButton: {
    position: 'absolute',
    top: '30px',
    left: '30px',
    color: '#ffffff',
    fontSize: '1rem',
    fontWeight: '700',
    textDecoration: 'none',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    zIndex: 10,
    background: 'rgba(175, 238, 27, 0.9)',
    padding: '10px 18px',
    borderRadius: '8px',
    boxShadow: '0 8px 20px rgba(175, 238, 27, 0.4)',
    border: 'none',
    backdropFilter: 'blur(10px)'
  }
};
