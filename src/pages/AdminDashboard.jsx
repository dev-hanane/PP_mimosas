import { Container, Row, Col, Card, Table, Button } from 'react-bootstrap'
import { FaUsers, FaHome, FaCalendarCheck, FaChartLine } from 'react-icons/fa'

export default function AdminDashboard() {
  return (
    <Container fluid className="py-4">
      <h2 className="mb-4" style={{ color: 'var(--primary)' }}>Tableau de Bord Administrateur</h2>
      
      <Row className="g-4 mb-4">
        <Col md={3}>
          <Card className="shadow-sm border-0">
            <Card.Body className="d-flex align-items-center">
              <FaUsers size={40} className="me-3" style={{ color: 'var(--primary)' }} />
              <div>
                <h3 className="mb-0">127</h3>
                <small className="text-muted">Clients</small>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="shadow-sm border-0">
            <Card.Body className="d-flex align-items-center">
              <FaHome size={40} className="me-3" style={{ color: 'var(--secondary)' }} />
              <div>
                <h3 className="mb-0">12</h3>
                <small className="text-muted">Réservations ce mois</small>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="shadow-sm border-0">
            <Card.Body className="d-flex align-items-center">
              <FaCalendarCheck size={40} className="me-3" style={{ color: 'var(--accent)' }} />
              <div>
                <h3 className="mb-0">85%</h3>
                <small className="text-muted">Taux d'occupation</small>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="shadow-sm border-0">
            <Card.Body className="d-flex align-items-center">
              <FaChartLine size={40} className="me-3" style={{ color: 'var(--primary)' }} />
              <div>
                <h3 className="mb-0">+15%</h3>
                <small className="text-muted">vs mois dernier</small>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col md={8}>
          <Card className="shadow-sm border-0">
            <Card.Header className="bg-white">
              <h5 className="mb-0 fw-bold">Dernières Réservations</h5>
            </Card.Header>
            <Card.Body>
              <Table responsive hover>
                <thead>
                  <tr>
                    <th>Client</th>
                    <th>Type</th>
                    <th>Date</th>
                    <th>Statut</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Lina M.</td>
                    <td>Maison en Bois</td>
                    <td>01-05 Mai 2026</td>
                    <td><span className="badge bg-success">Confirmée</span></td>
                    <td><Button size="sm" variant="outline-primary">Voir</Button></td>
                  </tr>
                  <tr>
                    <td>Karim B.</td>
                    <td>Emplacement Tente</td>
                    <td>15-18 Juin 2026</td>
                    <td><span className="badge bg-warning">En attente</span></td>
                    <td><Button size="sm" variant="outline-primary">Voir</Button></td>
                  </tr>
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="shadow-sm border-0">
            <Card.Header className="bg-white">
              <h5 className="mb-0 fw-bold">Actions Rapides</h5>
            </Card.Header>
            <Card.Body>
              <Button variant="primary" className="w-100 mb-2">Nouvelle Réservation</Button>
              <Button variant="outline-secondary" className="w-100 mb-2">Gérer Hébergements</Button>
              <Button variant="outline-secondary" className="w-100 mb-2">Voir Avis Clients</Button>
              <Button variant="outline-secondary" className="w-100">Paramètres</Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  )
}