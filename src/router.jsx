import { Routes, Route, Navigate } from 'react-router-dom'
import ChatbotAI from './components/ChatbotAI'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Services from './pages/Services'
import Gallery from './pages/Gallery'
import Reviews from './pages/Reviews'
import Community from './pages/Community'
import About from './pages/About'
import AdminDashboard from './pages/AdminDashboard'

export function AppRouter() {
  return (
    <div className="d-flex flex-column min-vh-100">
      <main className="flex-grow-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/services" element={<Services />} />
          <Route path="/galerie" element={<Gallery />} />
          <Route path="/avis" element={<Reviews />} />
          <Route path="/communaute" element={<Community />} />
          <Route path="/about" element={<About />} />
          <Route path="/booking" element={<Navigate to="/" replace />} />
          <Route path="/client" element={<Navigate to="/" replace />} />
          <Route path="/admin" element={<ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>} />
        </Routes>
      </main>
      <ChatbotAI />
    </div>
  )
}