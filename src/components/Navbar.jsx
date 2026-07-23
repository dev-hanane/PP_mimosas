import { Navbar as BSNavbar, Nav, Container, Button } from 'react-bootstrap'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { FaSignOutAlt } from 'react-icons/fa'

export default function Navbar() {
  const { isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const isActive = (path) => location.pathname === path

  const handleServicesClick = (e) => {
    if (location.pathname === '/') {
      e.preventDefault()
      const element = document.getElementById('services')
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' })
      }
    } else {
      navigate('/#services')
    }
  }

  return (
    <BSNavbar bg="light" expand="lg" className="shadow-sm sticky-top">
      <Container>
        <BSNavbar.Brand as={Link} to="/" className="fw-bold" style={{ color: 'var(--primary)', fontSize: '1.5rem' }}>
          🌿 Camping Mimosas
        </BSNavbar.Brand>
        <BSNavbar.Toggle aria-controls="navbar-nav" />
        <BSNavbar.Collapse id="navbar-nav">
          <Nav className="ms-auto align-items-center">
            <Nav.Link 
              as={Link} 
              to="/" 
              className="fw-medium"
              style={{ color: isActive('/') ? 'var(--primary)' : 'inherit', borderBottom: isActive('/') ? '2px solid var(--primary)' : 'none', paddingBottom: '0.2rem' }}
            >
              Accueil
            </Nav.Link>
            <Nav.Link 
              onClick={handleServicesClick}
              href="#services"
              className="fw-medium"
              style={{ cursor: 'pointer' }}
            >
              Nos Services
            </Nav.Link>
            <Nav.Link as={Link} to="/galerie" className="fw-medium">Galerie</Nav.Link>
            <Nav.Link as={Link} to="/avis" className="fw-medium">Avis Clients</Nav.Link>
            <Nav.Link as={Link} to="/communaute" className="fw-medium">Communauté</Nav.Link>
            <Nav.Link as={Link} to="/contact" className="fw-medium">Contact</Nav.Link>
            
            {isAuthenticated ? (
              <>
                <Button 
                  variant="outline-danger" 
                  size="sm" 
                  className="ms-2 d-flex align-items-center gap-2"
                  onClick={async () => {
                    await logout()
                    navigate('/')
                  }}
                >
                  <FaSignOutAlt size={14} />
                  Déconnexion
                </Button>
              </>
            ) : (
              <>
                <Button 
                  variant="outline-primary" 
                  size="sm" 
                  className="ms-2"
                  onClick={() => navigate('/login')}
                >
                  Connexion
                </Button>
                <Button 
                  variant="primary" 
                  size="sm" 
                  className="ms-2"
                  onClick={() => navigate('/signup')}
                >
                  S'inscrire
                </Button>
              </>
            )}
          </Nav>
        </BSNavbar.Collapse>
      </Container>
    </BSNavbar>
  )
}