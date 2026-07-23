import { Container, Row, Col, Card, ProgressBar } from 'react-bootstrap'
import { FaStar } from 'react-icons/fa'

export default function Reviews() {
  const reviews = [
    {
      id: 1,
      author: "Lina M.",
      rating: 5,
      date: "15 Mars 2026",
      text: "Séjour magnifique ! Les maisons en bois sont super confortables et le personnel est très accueillant. Je recommande vivement !"
    },
    {
      id: 2,
      author: "Karim B.",
      rating: 5,
      date: "10 Mars 2026",
      text: "Un havre de paix parfait pour se ressourcer. La nature est préservée et les activités proposées sont variées. Excellent rapport qualité-prix."
    },
    {
      id: 3,
      author: "Sophie D.",
      rating: 4,
      date: "5 Mars 2026",
      text: "Très belle expérience en famille. Les enfants ont adoré les activités. Seul petit bémol : le WiFi pourrait être meilleur."
    }
  ]

  return (
    <Container className="py-5">
      <h2 className="text-center mb-2" style={{ color: 'var(--primary)' }}>Avis de nos Clients</h2>
      <p className="text-center text-muted mb-5">Découvrez les expériences de nos visiteurs</p>

      <Row className="mb-5">
        <Col md={4} className="text-center mb-4">
          <h1 className="display-4 fw-bold" style={{ color: 'var(--primary)' }}>4.8</h1>
          <div className="text-warning mb-2">
            {[...Array(5)].map((_, i) => <FaStar key={i} />)}
          </div>
          <p className="text-muted">Basé sur 127 avis</p>
        </Col>
        <Col md={8}>
          <div className="mb-2 d-flex align-items-center">
            <span className="me-2">5 étoiles</span>
            <ProgressBar now={75} className="flex-grow-1" style={{ height: '8px' }} />
            <span className="ms-2 text-muted">75%</span>
          </div>
          <div className="mb-2 d-flex align-items-center">
            <span className="me-2">4 étoiles</span>
            <ProgressBar now={20} className="flex-grow-1" style={{ height: '8px' }} />
            <span className="ms-2 text-muted">20%</span>
          </div>
          <div className="mb-2 d-flex align-items-center">
            <span className="me-2">3 étoiles</span>
            <ProgressBar now={3} className="flex-grow-1" style={{ height: '8px' }} />
            <span className="ms-2 text-muted">3%</span>
          </div>
        </Col>
      </Row>

      <Row className="g-4">
        {reviews.map((review) => (
          <Col md={4} key={review.id}>
            <Card className="h-100 shadow-sm border-0">
              <Card.Body>
                <div className="text-warning mb-2">
                  {[...Array(review.rating)].map((_, i) => <FaStar key={i} size={16} />)}
                </div>
                <Card.Text className="text-muted mb-3">{review.text}</Card.Text>
                <div className="d-flex justify-content-between align-items-center">
                  <strong>{review.author}</strong>
                  <small className="text-muted">{review.date}</small>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  )
}