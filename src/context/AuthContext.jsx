import { createContext, useContext, useState, useEffect } from 'react'
import { authService } from '../services/api'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    // Initialiser depuis localStorage au démarrage
    const storedUser = localStorage.getItem('user')
    const token = localStorage.getItem('token')
    
    if (storedUser && token) {
      try {
        return JSON.parse(storedUser)
      } catch (e) {
        localStorage.removeItem('user')
        localStorage.removeItem('token')
        return null
      }
    }
    return null
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Synchroniser les changements de localStorage d'autres onglets
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'user' || e.key === 'token') {
        const storedUser = localStorage.getItem('user')
        const token = localStorage.getItem('token')
        
        if (storedUser && token) {
          try {
            setUser(JSON.parse(storedUser))
          } catch (err) {
            setUser(null)
          }
        } else {
          setUser(null)
        }
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  const signup = async (signupData) => {
    try {
      setError(null)
      const response = await authService.signup(signupData)
      // S'assurer que le user et token sont dans localStorage
      if (response.user) {
        localStorage.setItem('user', JSON.stringify(response.user))
      }
      if (response.token) {
        localStorage.setItem('token', response.token)
      }
      setUser(response.user)
      return response
    } catch (err) {
      const message = err.error || err.message || 'Erreur lors de l\'inscription'
      setError(message)
      throw new Error(message)
    }
  }

  const login = async (email, password) => {
    try {
      setError(null)
      const response = await authService.login(email, password)
      // S'assurer que le user et token sont dans localStorage
      if (response.user) {
        localStorage.setItem('user', JSON.stringify(response.user))
      }
      if (response.token) {
        localStorage.setItem('token', response.token)
      }
      setUser(response.user)
      return response
    } catch (err) {
      const message = err.error || err.message || 'Erreur lors de la connexion'
      setError(message)
      throw new Error(message)
    }
  }

  const logout = async () => {
    try {
      setError(null)
      // Nettoyer localStorage
      localStorage.removeItem('user')
      localStorage.removeItem('token')
      await authService.logout()
      setUser(null)
    } catch (err) {
      console.error('Erreur lors de la déconnexion:', err)
      // Même en cas d'erreur, nettoyer le state
      setUser(null)
      localStorage.removeItem('user')
      localStorage.removeItem('token')
    }
  }

  const updateProfile = async (profileData) => {
    try {
      setError(null)
      const response = await authService.updateProfile(profileData)
      setUser(response.user)
      localStorage.setItem('user', JSON.stringify(response.user))
      return response
    } catch (err) {
      const message = err.error || err.message || 'Erreur lors de la mise à jour du profil'
      setError(message)
      throw new Error(message)
    }
  }

  const changePassword = async (currentPassword, newPassword) => {
    try {
      setError(null)
      return await authService.changePassword(currentPassword, newPassword)
    } catch (err) {
      const message = err.error || err.message || 'Erreur lors du changement de mot de passe'
      setError(message)
      throw new Error(message)
    }
  }

  const value = {
    user,
    signup,
    login,
    logout,
    updateProfile,
    changePassword,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isClient: user?.role === 'client',
    loading,
    error,
    setError
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}