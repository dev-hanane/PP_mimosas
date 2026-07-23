import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { io } from 'socket.io-client'
import {
  FaSun,
  FaMoon,
  FaSmile,
  FaPaperclip,
  FaPaperPlane,
  FaChevronDown,
  FaChevronUp,
  FaComments,
  FaCheckDouble,
  FaHome,
  FaTrash,
} from 'react-icons/fa'
import Swal from 'sweetalert2'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { useNotifications } from '../context/NotificationContext'
import NotificationBell from '../components/NotificationBell'
import { communityService } from '../services/api'
import '../styles/community.css'

const LOGO = 'src/images/logo.png'
const EMOJIS = ['😊', '👍', '🏕️', '🌿', '🔥', '❤️', '🎉', '🙏']

function appendMessage(prev, message) {
  if (!message?.id) return prev
  if (prev.some((m) => m.id === message.id)) return prev
  return [...prev, message]
}

function avatarUrl(name) {
  const label = encodeURIComponent(name || 'User')
  return `https://ui-avatars.com/api/?name=${label}&background=E8F5E9&color=2D5A27&size=128&bold=true`
}

function shortName(fullName) {
  if (!fullName) return 'Membre'
  const parts = fullName.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 1) return parts[0]
  const lastInitial = parts[parts.length - 1][0]
  return `${parts[0]} ${lastInitial}.`
}

function profileShortName(user) {
  if (!user) return 'Invité'
  const first = user.first_name || user.username || 'Membre'
  const last = user.last_name
  if (last) return `${first} ${last[0]}.`
  return first
}

function formatTime(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}

function isToday(iso) {
  if (!iso) return false
  const d = new Date(iso)
  const now = new Date()
  return (
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear()
  )
}

function dateLabel(iso) {
  if (!iso) return "Aujourd'hui"
  if (isToday(iso)) return "Aujourd'hui"
  return new Date(iso).toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
}

function isImageUrl(url) {
  return /\.(png|jpe?g|gif|webp)$/i.test(url || '')
}

function parseChatPayload(payload) {
  if (Array.isArray(payload)) {
    return {
      messages: payload.map((m) => ({ ...m, type: 'chat' })),
      first_unread_id: null,
      has_unread: false,
      has_older: false,
    }
  }
  return {
    messages: (payload?.messages || []).map((m) => ({ ...m, type: 'chat' })),
    first_unread_id: payload?.first_unread_id ?? null,
    has_unread: Boolean(payload?.has_unread),
    has_older: Boolean(payload?.has_older),
  }
}

export default function Community() {
  const { user, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()
  const { toggleTheme, isDark } = useTheme()
  const { markCommunityRead, refreshUnread } = useNotifications()
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [connected, setConnected] = useState(false)
  const [loading, setLoading] = useState(true)
  const [socketError, setSocketError] = useState('')
  const [onlineCount, setOnlineCount] = useState(0)
  const [showEmoji, setShowEmoji] = useState(false)
  const [pendingFile, setPendingFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [firstUnreadId, setFirstUnreadId] = useState(null)
  const [viewHint, setViewHint] = useState('')
  const [hasOlderMessages, setHasOlderMessages] = useState(false)
  const [loadingOlder, setLoadingOlder] = useState(false)
  const [isBrowsingHistory, setIsBrowsingHistory] = useState(false)
  const listRef = useRef(null)
  const socketRef = useRef(null)
  const fileInputRef = useRef(null)
  const firstUnreadRef = useRef(null)
  const scrolledToUnread = useRef(false)
  const skipScrollToBottomRef = useRef(false)
  const recentSnapshotRef = useRef(null)
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const profileMenuRef = useRef(null)

  const socketBaseUrl = useMemo(() => {
    const apiBase = import.meta.env.VITE_API_URL || ''
    if (!apiBase || apiBase.startsWith('/')) {
      return window.location.origin
    }
    return apiBase.replace(/\/api\/?$/, '')
  }, [])

  const displayName = useMemo(() => {
    if (!user) return 'Invité'
    if (user.first_name && user.last_name) {
      return `${user.first_name} ${user.last_name}`.toUpperCase()
    }
    return (user.username || 'Membre').toUpperCase()
  }, [user])

  const applyChatPayload = useCallback((payload) => {
    const { messages: list, first_unread_id, has_unread, has_older } = parseChatPayload(payload)
    setMessages(list)
    setFirstUnreadId(first_unread_id)
    setHasOlderMessages(has_older)
    setIsBrowsingHistory(false)
    if (has_unread) {
      setViewHint('Nouveaux messages non lus')
      scrolledToUnread.current = false
    } else {
      setViewHint('')
    }
    recentSnapshotRef.current = {
      messages: list,
      first_unread_id,
      has_unread,
      has_older,
      viewHint: has_unread ? 'Nouveaux messages non lus' : '',
    }
  }, [])

  useEffect(() => {
    communityService
      .getMessages()
      .then(applyChatPayload)
      .catch(() => {})
      .finally(() => setLoading(false))

    return () => {
      if (isAuthenticated) {
        markCommunityRead()
      }
    }
  }, [isAuthenticated, markCommunityRead, applyChatPayload])

  useEffect(() => {
    const onDocClick = (e) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target)) {
        setProfileMenuOpen(false)
      }
    }
    if (profileMenuOpen) {
      document.addEventListener('mousedown', onDocClick)
    }
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [profileMenuOpen])

  useEffect(() => {
    const socket = io(socketBaseUrl, {
      transports: ['websocket', 'polling'],
      withCredentials: true,
    })
    socketRef.current = socket

    socket.on('connect', () => {
      setConnected(true)
      setSocketError('')
      socket.emit('join_community', {
        token: localStorage.getItem('token') || '',
      })
    })

    socket.on('disconnect', () => setConnected(false))

    socket.on('connect_error', () => {
      setSocketError('Connexion temps réel indisponible. Lancez le backend : python app.py')
      setLoading(false)
    })

    socket.on('chat_history', (payload) => {
      applyChatPayload(payload)
      setLoading(false)
    })

    socket.on('community_message', (message) => {
      setMessages((prev) => appendMessage(prev, { ...message, type: 'chat', is_unread: false }))
    })

    socket.on('community_message_deleted', ({ id }) => {
      setMessages((prev) => prev.filter((m) => m.id !== id))
    })

    socket.on('online_count', (payload) => {
      if (payload?.count) setOnlineCount(payload.count)
    })

    socket.on('community_error', (payload) => {
      setSocketError(payload?.error || 'Erreur chat.')
    })

    return () => {
      socket.emit('leave_community')
      socketRef.current = null
      socket.disconnect()
    }
  }, [socketBaseUrl, applyChatPayload])

  useEffect(() => {
    if (loading) return
    if (skipScrollToBottomRef.current) {
      skipScrollToBottomRef.current = false
      return
    }
    if (firstUnreadId && firstUnreadRef.current && !scrolledToUnread.current && !isBrowsingHistory) {
      firstUnreadRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
      scrolledToUnread.current = true
      return
    }
    if (listRef.current && !isBrowsingHistory) {
      listRef.current.scrollTop = listRef.current.scrollHeight
    }
  }, [messages, loading, firstUnreadId, isBrowsingHistory])

  const loadOlderMessages = async () => {
    const oldest = messages[0]
    if (!oldest?.id || loadingOlder) return

    setLoadingOlder(true)
    const chatEl = listRef.current
    const prevScrollHeight = chatEl?.scrollHeight ?? 0

    try {
      const data = await communityService.getOlderMessages(oldest.id, 3)
      const olderList = (data.messages || []).map((m) => ({ ...m, type: 'chat' }))
      if (olderList.length > 0) {
        skipScrollToBottomRef.current = true
        setMessages((prev) => {
          const ids = new Set(prev.map((m) => m.id))
          const unique = olderList.filter((m) => !ids.has(m.id))
          return [...unique, ...prev]
        })
        setIsBrowsingHistory(true)
        setViewHint('')
        requestAnimationFrame(() => {
          if (chatEl) {
            chatEl.scrollTop = chatEl.scrollHeight - prevScrollHeight
          }
        })
      }
      setHasOlderMessages(Boolean(data.has_older))
    } catch {
      setSocketError('Impossible de charger les messages plus anciens.')
    } finally {
      setLoadingOlder(false)
    }
  }

  const returnToRecentMessages = () => {
    if (recentSnapshotRef.current) {
      const snap = recentSnapshotRef.current
      skipScrollToBottomRef.current = true
      setMessages(snap.messages)
      setFirstUnreadId(snap.first_unread_id)
      setHasOlderMessages(snap.has_older)
      setViewHint(snap.viewHint)
      setIsBrowsingHistory(false)
      scrolledToUnread.current = false
      requestAnimationFrame(() => {
        if (snap.first_unread_id && firstUnreadRef.current) {
          firstUnreadRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
          scrolledToUnread.current = true
        } else if (listRef.current) {
          listRef.current.scrollTop = listRef.current.scrollHeight
        }
      })
      return
    }
    communityService.getMessages().then(applyChatPayload).catch(() => {})
  }

  const handleDeleteMessage = async (messageId) => {
    const { isConfirmed } = await Swal.fire({
      title: 'Supprimer ce message ?',
      text: 'Cette action est définitive et ne peut pas être annulée.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler',
      confirmButtonColor: '#2d5a27',
      cancelButtonColor: '#9ca3af',
      background: 'linear-gradient(160deg, #e8f5e9 0%, #ffffff 55%)',
      color: '#2d5a27',
      iconColor: '#2d5a27',
      customClass: {
        popup: 'community-swal-popup',
        confirmButton: 'community-swal-confirm',
        cancelButton: 'community-swal-cancel',
      },
    })

    if (!isConfirmed) return

    try {
      setSocketError('')
      await communityService.deleteMessage(messageId)
      setMessages((prev) => prev.filter((m) => m.id !== messageId))
      await refreshUnread()
      Swal.fire({
        title: 'Message supprimé',
        icon: 'success',
        timer: 1600,
        showConfirmButton: false,
        background: 'linear-gradient(160deg, #e8f5e9 0%, #ffffff 55%)',
        color: '#2d5a27',
        iconColor: '#2d5a27',
      })
    } catch (err) {
      Swal.fire({
        title: 'Erreur',
        text: err.error || err.message || 'Impossible de supprimer le message.',
        icon: 'error',
        confirmButtonText: 'OK',
        confirmButtonColor: '#2d5a27',
        background: '#fff8f0',
        color: '#2d5a27',
      })
    }
  }

  const sendMessage = async () => {
    const text = newMessage.trim()
    if (!connected) return
    if (!isAuthenticated) {
      setSocketError('Connectez-vous pour envoyer un message.')
      return
    }
    if (!text && !pendingFile) return

    let attachmentUrl = null
    if (pendingFile) {
      try {
        setUploading(true)
        const result = await communityService.uploadAttachment(pendingFile)
        attachmentUrl = result.url
      } catch (err) {
        setSocketError(err.error || 'Échec du téléversement.')
        setUploading(false)
        return
      }
      setUploading(false)
      setPendingFile(null)
    }

    socketRef.current?.emit('community_message', {
      text,
      attachment_url: attachmentUrl || '',
      token: localStorage.getItem('token') || '',
    })
    setNewMessage('')
    setShowEmoji(false)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setSocketError('Fichier trop volumineux (max 5 Mo).')
        return
      }
      setPendingFile(file)
      setSocketError('')
    }
    e.target.value = ''
  }

  const addEmoji = (emoji) => {
    setNewMessage((prev) => `${prev}${emoji}`)
    setShowEmoji(false)
  }

  const renderAttachment = (url) => {
    if (!url) return null
    const src = url.startsWith('http') ? url : url
    if (isImageUrl(url)) {
      return (
        <div className="community-bubble-attachment">
          <a href={src} target="_blank" rel="noreferrer">
            <img src={src} alt="Pièce jointe" />
          </a>
        </div>
      )
    }
    return (
      <div className="community-bubble-attachment">
        <a href={src} target="_blank" rel="noreferrer">
          📎 Voir la pièce jointe
        </a>
      </div>
    )
  }

  const renderMessages = () => {
    if (loading) {
      return <div className="community-loading">Chargement des messages…</div>
    }

    if (messages.length === 0) {
      return (
        <div className="community-empty">
          Aucun message pour le moment.
          <br />
          Soyez le premier à écrire dans la discussion générale.
        </div>
      )
    }

    let lastDateKey = null
    let isFirstDatePill = true
    const blocks = []

    messages.forEach((message) => {
      const dateKey = message.created_at
        ? new Date(message.created_at).toDateString()
        : 'today'
      const showDate = dateKey !== lastDateKey
      lastDateKey = dateKey

      if (showDate) {
        blocks.push(
          <div key={`date-${dateKey}-${message.id}`} className="community-date-row">
            {isFirstDatePill && (hasOlderMessages || loadingOlder) && (
              <button
                type="button"
                className="community-arrow-btn"
                onClick={loadOlderMessages}
                disabled={!hasOlderMessages || loadingOlder}
                title="3 messages plus anciens"
                aria-label="Afficher 3 messages plus anciens"
              >
                <FaChevronUp />
              </button>
            )}
            <div className="community-date-pill">{dateLabel(message.created_at)}</div>
          </div>
        )
        isFirstDatePill = false
      }

      const isMine = user?.id === message.user_id
      const isFirstUnread = message.id === firstUnreadId
      const authorLabel = isMine
        ? `${displayName} (vous)`
        : shortName(message.author)

      blocks.push(
        <div
          key={message.id}
          ref={isFirstUnread ? firstUnreadRef : null}
          className={`community-msg-row ${isMine ? 'community-msg-row--mine' : 'community-msg-row--other'}`}
        >
          {!isMine && (
            <img
              src={avatarUrl(message.author)}
              alt=""
              className="community-msg-avatar"
            />
          )}
          <div
            className={`community-bubble ${isMine ? 'community-bubble--mine' : 'community-bubble--other'} ${
              message.is_unread ? 'community-bubble--unread' : ''
            }`}
          >
            <div className="community-bubble-top">
              <p className="community-bubble-author">{authorLabel}</p>
              {isMine && (
                <button
                  type="button"
                  className="community-delete-btn"
                  aria-label="Supprimer le message"
                  onClick={() => handleDeleteMessage(message.id)}
                >
                  <FaTrash />
                </button>
              )}
            </div>
            {message.text && <p className="community-bubble-text">{message.text}</p>}
            {renderAttachment(message.attachment_url)}
            <div className="community-bubble-meta">
              <span className="community-bubble-time">{formatTime(message.created_at)}</span>
              {isMine && <FaCheckDouble className="community-read-check" aria-label="Lu" />}
            </div>
          </div>
        </div>
      )
    })

    if (isBrowsingHistory) {
      blocks.push(
        <div key="return-recent" className="community-return-recent">
          <button
            type="button"
            className="community-arrow-btn community-arrow-btn--down"
            onClick={returnToRecentMessages}
            title="Revenir aux messages récents"
            aria-label="Revenir aux messages récents"
          >
            <FaChevronDown />
          </button>
        </div>
      )
    }

    return blocks
  }

  return (
    <div className={`community-page ${isDark ? 'dark' : ''}`}>
      <Link to="/" className="community-back-home">
        <FaHome /> Retour à l&apos;accueil
      </Link>

      <div className="community-shell">
        <header className="community-header">
          <div className="community-brand">
            <img src={LOGO} alt="Camping Mimosas" className="community-brand-logo" />
            <div className="community-brand-text">
              <p className="community-brand-title">Camping Mimosas</p>
              <p className="community-brand-sub">Communauté</p>
            </div>
          </div>

          <div className="community-room-pill">
            <div className="community-room-icon">
              <FaComments />
            </div>
            <div className="community-room-info">
              <p className="community-room-title">Discussion générale</p>
              <p className="community-room-online">
                <span className="community-online-dot" />
                {onlineCount} membre{onlineCount > 1 ? 's' : ''} en ligne
              </p>
            </div>
          </div>

          <div className="community-header-actions">
            <NotificationBell />
            <button
              type="button"
              className="community-icon-btn"
              aria-label={isDark ? 'Mode clair' : 'Mode sombre'}
              onClick={toggleTheme}
            >
              {isDark ? <FaSun /> : <FaMoon />}
            </button>
            <div className="community-profile-wrap" ref={profileMenuRef}>
              <button
                type="button"
                className={`community-profile ${profileMenuOpen ? 'community-profile--open' : ''}`}
                onClick={() => setProfileMenuOpen((open) => !open)}
                aria-expanded={profileMenuOpen}
                aria-haspopup="true"
              >
                <img
                  src={avatarUrl(profileShortName(user))}
                  alt=""
                  className="community-profile-avatar"
                />
                <div className="community-profile-info">
                  <p className="community-profile-name">{profileShortName(user)}</p>
                  <p className="community-profile-status">
                    <span className="community-online-dot" />
                    {connected ? 'En ligne' : 'Hors ligne'}
                  </p>
                </div>
                <FaChevronDown
                  className={`community-chevron ${profileMenuOpen ? 'community-chevron--open' : ''}`}
                />
              </button>
              {profileMenuOpen && (
                <div className="community-profile-menu" role="menu">
                  {isAuthenticated ? (
                    <>
                     
                      <Link
                        to="/"
                        className="community-profile-menu-item"
                        role="menuitem"
                        onClick={() => setProfileMenuOpen(false)}
                      >
                        Retour à l&apos;accueil
                      </Link>
                      <button
                        type="button"
                        className="community-profile-menu-item community-profile-menu-item--danger"
                        role="menuitem"
                        onClick={async () => {
                          setProfileMenuOpen(false)
                          await logout()
                          navigate('/')
                        }}
                      >
                        Déconnexion
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        to="/login"
                        className="community-profile-menu-item"
                        role="menuitem"
                        onClick={() => setProfileMenuOpen(false)}
                      >
                        Connexion
                      </Link>
                      <Link
                        to="/signup"
                        className="community-profile-menu-item"
                        role="menuitem"
                        onClick={() => setProfileMenuOpen(false)}
                      >
                        Créer un compte
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </header>

        {socketError && (
          <div className="community-alert">
            {socketError}
            {!isAuthenticated && (
              <>
                {' '}
                <Link to="/login">Connexion</Link> · <Link to="/signup">Inscription</Link>
              </>
            )}
          </div>
        )}

        {!isAuthenticated && !socketError && (
          <div className="community-alert">
            Lecture libre. Pour écrire : <Link to="/login">connectez-vous</Link>.
          </div>
        )}

        {viewHint && (
          <div className="community-view-hint">{viewHint}</div>
        )}

        <div className="community-chat" ref={listRef}>
          {renderMessages()}
        </div>

        {pendingFile && (
          <div className="community-attachment-preview">
            <span>📎 {pendingFile.name}</span>
            <button type="button" onClick={() => setPendingFile(null)}>
              Retirer
            </button>
          </div>
        )}

        {showEmoji && (
          <div className="community-emoji-picker">
            {EMOJIS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                className="community-emoji-btn"
                onClick={() => addEmoji(emoji)}
              >
                {emoji}
              </button>
            ))}
          </div>
        )}

        <footer className="community-input-bar">
          <input
            ref={fileInputRef}
            type="file"
            hidden
            accept="image/png,image/jpeg,image/gif,image/webp,application/pdf"
            onChange={handleFileChange}
          />
          <div className="community-input-wrap">
            <button
              type="button"
              className="community-input-icon"
              aria-label="Emoji"
              onClick={() => setShowEmoji((v) => !v)}
              disabled={!isAuthenticated}
            >
              <FaSmile />
            </button>
            <input
              type="text"
              maxLength={500}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Écrire un message..."
              disabled={!connected || !isAuthenticated || uploading}
            />
            <button
              type="button"
              className="community-input-icon"
              aria-label="Pièce jointe"
              onClick={() => fileInputRef.current?.click()}
              disabled={!connected || !isAuthenticated || uploading}
            >
              <FaPaperclip />
            </button>
          </div>
          <button
            type="button"
            className="community-send-btn"
            onClick={sendMessage}
            disabled={
              !connected ||
              !isAuthenticated ||
              uploading ||
              (!newMessage.trim() && !pendingFile)
            }
            aria-label="Envoyer"
          >
            <FaPaperPlane />
          </button>
        </footer>
      </div>
    </div>
  )
}
