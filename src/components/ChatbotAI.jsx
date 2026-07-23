import { useState, useRef, useEffect } from 'react'
import { Button, Form, Card, ListGroup, Badge, Spinner } from 'react-bootstrap'
import { BsRobot, BsSend } from 'react-icons/bs'
import { chatbotService } from '../services/chatbotService'

const shadowPulseKeyframes = `
  @keyframes shadowPulse {
    0% {
      box-shadow: 0 4px 15px rgba(143,206,0,0.2);
    }
    50% {
      box-shadow: 0 4px 30px rgba(143,206,0,0.6);
    }
    100% {
      box-shadow: 0 4px 15px rgba(143,206,0,0.2);
    }
  }
`;

const style = document.createElement('style');
style.textContent = shadowPulseKeyframes;
document.head.appendChild(style);

export default function ChatbotAI() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: "Bonjour ! 👋 Je suis Mimos, Votre assistant. Comment puis-je vous aider ?",
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef(null)

  // Auto-scroll vers le dernier message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || loading) return

    const userMessage = input.trim()
    const newMessages = [...messages, { sender: 'user', text: userMessage }]
    setMessages(newMessages)
    setInput('')
    setLoading(true)

    try {
      const botReply = await chatbotService.sendMessage(userMessage)
      setMessages(prev => [...prev, { sender: 'bot', text: botReply }])
    } catch (error) {
      console.error('Erreur chatbot:', error)
      let errorMsg = error.message || 'Erreur de connexion'
      
      // Vérifier si c'est une erreur 503 (Service Unavailable)
      if (error.message && error.message.includes('503')) {
        errorMsg = '⚠️ Le chatbot n\'est pas configuré. Pour l\'activer:\n1. Installez: pip install google-generativeai\n2. Ajoutez GEMINI_API_KEY dans .env\n3. Relancez le serveur'
      }
      
      setMessages(prev => [...prev, { 
        sender: 'bot', 
        text: `❌ ${errorMsg}` 
      }])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !loading) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div style={{ position: 'fixed', bottom: 20, right: 20, zIndex: 1050 }}>
      {!open && (
        <Button 
          onClick={() => setOpen(true)}
          style={{
            position: 'fixed',
            bottom: 100,
            right: 20,
            width: 60,
            height: 60,
            borderRadius: '50%',
            background: '#8fce00',
            border: 'none',
            boxShadow: '0 4px 15px rgba(143,206,0,0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            fontSize: 28,
            padding: 0,
            transition: 'all 0.3s',
            animation: 'shadowPulse 2s ease-in-out infinite',
          }}
          onMouseEnter={(e) => e.target.style.boxShadow = '0 6px 20px rgba(143,206,0,0.6)'}
          onMouseLeave={(e) => e.target.style.boxShadow = '0 4px 15px rgba(143,206,0,0.4)'}
        >
          🤖
        </Button>
      )}
      {open && (
        <Card style={{ width: 350, maxHeight: 550, display: 'flex', flexDirection: 'column' }}>
          <Card.Header className="d-flex justify-content-between align-items-center" style={{ background: '#8fce00', color: '#fff', borderRadius: '4px 4px 0 0' }}>
            <span className="fw-bold">Mimos Assistant 🤖</span>
            <Button 
              variant="link" 
              size="sm" 
              onClick={() => setOpen(false)}
              style={{ color: '#fff', textDecoration: 'none' }}
            >
              ✖
            </Button>
          </Card.Header>
          <ListGroup 
            variant="flush" 
            style={{ 
              maxHeight: 350, 
              overflowY: 'auto',
              flex: 1,
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {messages.map((m, i) => (
              <ListGroup.Item 
                key={i} 
                className={`border-0 py-2 ${m.sender === 'user' ? 'text-end' : 'text-start'}`}
                style={{ background: m.sender === 'user' ? '#e7f3ff' : '#f5f5f5' }}
              >
                <div style={{ 
                  display: 'inline-block',
                  maxWidth: '80%',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  background: m.sender === 'user' ? '#8fce00' : '#fff',
                  color: m.sender === 'user' ? '#fff' : '#333',
                  border: m.sender === 'user' ? 'none' : '1px solid #ddd',
                  wordWrap: 'break-word'
                }}>
                  {m.text}
                </div>
              </ListGroup.Item>
            ))}
            {loading && (
              <ListGroup.Item className="border-0 py-2 text-start">
                <div style={{ 
                  display: 'inline-block',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  background: '#f5f5f5',
                  border: '1px solid #ddd'
                }}>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Mimos réfléchit...
                </div>
              </ListGroup.Item>
            )}
            <div ref={messagesEndRef} />
          </ListGroup>
          <Card.Footer className="d-flex gap-2 p-2">
            <Form.Control 
              value={input} 
              onChange={e => setInput(e.target.value)} 
              placeholder="Posez une question..." 
              onKeyPress={handleKeyPress}
              disabled={loading}
              style={{ borderColor: '#8fce00' }}
            />
            <Button 
              onClick={handleSend} 
              disabled={loading || !input.trim()}
              style={{ background: '#8fce00', border: 'none' }}
            >
              <BsSend />
            </Button>
          </Card.Footer>
        </Card>
      )}
    </div>
  )
}