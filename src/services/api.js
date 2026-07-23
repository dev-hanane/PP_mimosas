// Configuration de base de l'API
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// Fonction utilitaire pour les requêtes API avec fetch
async function apiCall(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = localStorage.getItem('token');

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    // Gestion des erreurs d'authentification
    if (response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: response.statusText }));
      throw error;
    }

    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

// ===== Services d'Authentification =====
export const authService = {
  // Inscription
  signup: async (signupData) => {
    try {
      const response = await apiCall('/auth/signup', {
        method: 'POST',
        body: JSON.stringify({
          username: signupData.username,
          email: signupData.email,
          password: signupData.password,
          first_name: signupData.firstName,
          last_name: signupData.lastName,
          phone: signupData.phone,
          address: signupData.address,
          city: signupData.city,
          postal_code: signupData.postalCode,
          country: signupData.country,
        }),
      });
      
      // Sauvegarder le token et l'utilisateur
      if (response.token) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
      }
      
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Connexion
  login: async (email, password) => {
    try {
      const response = await apiCall('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      
      // Sauvegarder le token et l'utilisateur
      if (response.token) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
      }
      
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Vérifier l'authentification
  verifyAuth: async () => {
    try {
      return await apiCall('/auth/verify', {
        method: 'GET',
      });
    } catch (error) {
      throw error;
    }
  },

  // Déconnexion
  logout: async () => {
    try {
      await apiCall('/auth/logout', {
        method: 'POST',
      });
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } catch (error) {
      console.error('Logout error:', error);
    }
  },

  // Récupérer le profil
  getProfile: async () => {
    try {
      return await apiCall('/auth/profile', {
        method: 'GET',
      });
    } catch (error) {
      throw error;
    }
  },

  // Mettre à jour le profil
  updateProfile: async (profileData) => {
    try {
      return await apiCall('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(profileData),
      });
    } catch (error) {
      throw error;
    }
  },

  // Changer le mot de passe
  changePassword: async (currentPassword, newPassword) => {
    try {
      return await apiCall('/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
        }),
      });
    } catch (error) {
      throw error;
    }
  },
};

// ===== Communauté (chat) =====
export const communityService = {
  getMessages: async () => {
    return apiCall('/community/messages', { method: 'GET' });
  },

  getOlderMessages: async (beforeId, limit = 3) => {
    return apiCall(
      `/community/messages/older?before_id=${beforeId}&limit=${limit}`,
      { method: 'GET' }
    );
  },

  deleteMessage: async (messageId) => {
    return apiCall(`/community/messages/${messageId}`, { method: 'DELETE' });
  },

  getUnreadSummary: async () => {
    return apiCall('/community/unread', { method: 'GET' });
  },

  markRead: async () => {
    return apiCall('/community/mark-read', { method: 'POST' });
  },

  uploadAttachment: async (file) => {
    const url = `${API_BASE_URL}/community/upload`;
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(url, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: response.statusText }));
      throw error;
    }
    return response.json();
  },
};

export default apiCall;
