import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FaBell } from 'react-icons/fa'
import { useNotifications } from '../context/NotificationContext'
import { useAuth } from '../context/AuthContext'
import '../styles/community.css'

function formatTime(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}

export default function NotificationBell({ className = '', variant = 'community' }) {
  const { isAuthenticated } = useAuth()
  const { unreadCount, previews, markCommunityRead } = useNotifications()
  const [open, setOpen] = useState(false)
  const panelRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    const onDocClick = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [open])

  if (!isAuthenticated) return null

  const handleOpen = () => {
    setOpen((v) => !v)
  }

  const goToCommunity = async () => {
    setOpen(false)
    await markCommunityRead()
    navigate('/communaute')
  }

  const btnClass =
    variant === 'home' ? 'home-notif-btn' : 'community-icon-btn'

  return (
    <div className={`notif-bell-wrap ${className}`} ref={panelRef}>
      <button
        type="button"
        className={btnClass}
        aria-label="Notifications communauté"
        aria-expanded={open}
        onClick={handleOpen}
      >
        <FaBell />
        {unreadCount > 0 && (
          <span className="community-notif-badge">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="notif-dropdown">
          <div className="notif-dropdown-header">
            <strong>Messages communauté</strong>
            {unreadCount > 0 && (
              <span className="notif-dropdown-count">{unreadCount} non lu(s)</span>
            )}
          </div>
          {previews.length === 0 ? (
            <p className="notif-dropdown-empty">Aucun nouveau message.</p>
          ) : (
            <ul className="notif-dropdown-list">
              {previews.map((item) => (
                <li key={item.id}>
                  <button type="button" className="notif-dropdown-item" onClick={goToCommunity}>
                    <span className="notif-dropdown-author">{item.author}</span>
                    <span className="notif-dropdown-text">{item.text}</span>
                    <span className="notif-dropdown-time">{formatTime(item.created_at)}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          <Link to="/communaute" className="notif-dropdown-link" onClick={() => setOpen(false)}>
            Ouvrir la discussion →
          </Link>
        </div>
      )}
    </div>
  )
}
