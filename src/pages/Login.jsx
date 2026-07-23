import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaUser, FaEye, FaEyeSlash } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

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
    setIsLoading(true);
    setError('');
    
    try {
      const response = await login(formData.email, formData.password);
      const role = response?.user?.role;
      navigate(role === 'admin' ? '/admin' : '/');
    } catch (err) {
      setError(err.message || 'Erreur lors de la connexion');
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div style={styles.container}>
      <style>{`
        .backButtonLink:hover {
          background: #afee1b !important;
          transform: translateX(-5px);
          box-shadow: 0 12px 30px rgba(175, 238, 27, 0.6) !important;
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
          <p style={styles.subtitle}>Connectez-vous à votre compte</p>
        </div>

        {error && (
          <div style={styles.errorBox}>
            <span style={styles.errorIcon}>⚠️</span>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={styles.inputGroup}>
            <FaUser style={styles.inputIcon} />
            <input
              type="email"
              name="email"
              placeholder="Adresse email"
              value={formData.email}
              onChange={handleChange}
              required
              style={styles.input}
            />
          </div>

          <div style={styles.inputGroup}>
            <div
              onClick={togglePasswordVisibility}
              style={styles.inputIcon}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder="Mot de passe"
              value={formData.password}
              onChange={handleChange}
              required
              style={styles.input}
            />
          </div>

          <div style={styles.rememberForgot}>
            <a href="#" style={styles.forgotPassword}>Mot de passe oublié?</a>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            style={{...styles.button, opacity: isLoading ? 0.7 : 1}}
          >
            {isLoading ? 'Connexion en cours...' : 'Se Connecter'}
          </button>
        </form>

        <div style={styles.signup}>
          Pas encore inscrit? <a href="/signup" style={styles.signupLink}>Créer un compte</a>
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
    padding: '50px 40px',
    width: '100%',
    maxWidth: '420px',
    boxShadow: '0 25px 50px rgba(0, 0, 0, 0.3), inset 0 0 0 1px rgba(255, 255, 255, 0.1)',
    animation: 'slideUp 0.6s ease-out',
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
    marginBottom: '35px'
  },

  title: {
    color: 'rgb(165, 221, 33)',
    fontSize: '2.5rem',
    fontWeight: '700',
    marginBottom: '10px',
    textShadow: '0 2px 10px rgba(0, 0, 0, 0.2)'
  },

  subtitle: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: '0.95rem',
    lineHeight: '1.5'
  },

  inputGroup: {
    position: 'relative',
    marginBottom: '25px'
  },

  input: {
    width: '100%',
    padding: '16px 45px 16px 18px',
    background: 'rgba(255, 255, 255, 0.15)',
    border: '2px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '12px',
    color: '#ffffff',
    fontSize: '1rem',
    transition: 'all 0.3s ease',
    outline: 'none',
    fontFamily: 'inherit'
  },

  inputIcon: {
    position: 'absolute',
    right: '15px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: 'rgba(255, 255, 255, 0.7)',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center'
  },

  rememberForgot: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px',
    fontSize: '0.9rem'
  },

  rememberMe: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: 'rgba(255, 255, 255, 0.9)',
    cursor: 'pointer'
  },

  forgotPassword: {
    color: 'rgba(255, 255, 255, 0.8)',
    textDecoration: 'none',
    transition: 'all 0.3s ease',
    borderBottom: '1px solid transparent'
  },

  button: {
    width: '100%',
    padding: '16px',
    background: '#afee1b',
    border: 'none',
    borderRadius: '12px',
    color: '#1f5126',
    fontSize: '1.1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 10px 25px rgba(175, 238, 27, 0.4)',
    position: 'relative',
    overflow: 'hidden'
  },

  signup: {
    textAlign: 'center',
    marginTop: '25px',
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: '0.95rem'
  },

  signupLink: {
    color: '#ffffff',
    fontWeight: '600',
    textDecoration: 'none',
    marginLeft: '5px',
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
