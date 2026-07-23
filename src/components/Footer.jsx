import { Container, Row, Col } from 'react-bootstrap'
import { FaFacebook, FaInstagram, FaTwitter, FaMapMarkerAlt, FaPhone, FaEnvelope } from 'react-icons/fa'
import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="bg-dark text-light py-5 mt-auto">
      <Container>
        <Row className="g-4">
          <Col md={4}>
            <h5 className="fw-bold mb-3" style={{ color: 'var(--accent)' }}>🌿 Camping Mimosas</h5>
            <p className="text-muted">Un havre de paix à Mohammedia où nature, confort et authenticité marocaine se rencontrent.</p>
            <div className="d-flex gap-3 mt-3">
              <a href="#" className="text-light"><FaFacebook size={20} /></a>
              <a href="#" className="text-light"><FaInstagram size={20} /></a>
              <a href="#" className="text-light"><FaTwitter size={20} /></a>
            </div>
          </Col>
          
          <Col md={4}>
            <h5 className="fw-bold mb-3" style={{ color: 'var(--accent)' }}>Liens Rapides</h5>
            <ul className="list-unstyled">
              <li><Link to="/services" className="text-muted text-decoration-none">Nos Services</Link></li>
              <li><Link to="/galerie" className="text-muted text-decoration-none">Galerie Photos</Link></li>
              <li><Link to="/avis" className="text-muted text-decoration-none">Avis Clients</Link></li>
              <li><Link to="/communaute" className="text-muted text-decoration-none">Communauté</Link></li>
            </ul>
          </Col>
          
          <Col md={4}>
            <h5 className="fw-bold mb-3" style={{ color: 'var(--accent)' }}>Contact</h5>
            <ul className="list-unstyled text-muted">
              <li className="mb-2"><FaMapMarkerAlt className="me-2" /> Mohammedia, Maroc</li>
              <li className="mb-2"><FaPhone className="me-2" /> +212 5XX-XXXXXX</li>
              <li className="mb-2"><FaEnvelope className="me-2" /> chaaouanhanane18@gmail.com</li>
            </ul>
          </Col>
        </Row>
        
        <hr className="my-4" />
        
        <div className="text-center text-muted">
          <small>&copy; 2026 Camping Mimosas. Tous droits réservés.</small>
        </div>
      </Container>
    </footer>
  )
}