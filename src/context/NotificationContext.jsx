import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { io } from 'socket.io-client'
import { useAuth } from './AuthContext'
import { communityService } from '../services/api'

const NotificationContext = createContext(null)

function socketBaseUrl() {
  const apiBase = import.meta.env.VITE_API_URL || ''
  if (!apiBase || apiBase.startsWith('/')) {
    return window.location.origin
  }
  return apiBase.replace(/\/api\/?$/, '')
}

export function NotificationProvider({ children }) {
  const { isAuthenticated } = useAuth()
  const [unreadCount, setUnreadCount] = useState(0)
  const [previews, setPreviews] = useState([])

  const refreshUnread = useCallback(async () => {
    if (!isAuthenticated) {
      setUnreadCount(0)
      setPreviews([])
      return
    }
    try {
      const data = await communityService.getUnreadSummary()
      setUnreadCount(data.unread_count ?? 0)
      setPreviews(data.previews ?? [])
    } catch {
      setUnreadCount(0)
      setPreviews([])
    }
  }, [isAuthenticated])

  const markCommunityRead = useCallback(async () => {
    if (!isAuthenticated) return
    try {
      await communityService.markRead()
      setUnreadCount(0)
      setPreviews([])
    } catch {
      /* ignore */
    }
  }, [isAuthenticated])

  useEffect(() => {
    refreshUnread()
  }, [refreshUnread, isAuthenticated])

  useEffect(() => {
    if (!isAuthenticated) return undefined

    // Socket léger : notifications uniquement (ne rejoint pas le salon communauté)
    const socket = io(socketBaseUrl(), {
      transports: ['websocket', 'polling'],
    })

    socket.on('unread_refresh', () => {
      refreshUnread()
    })

    const interval = setInterval(refreshUnread, 45000)
    return () => {
      clearInterval(interval)
      socket.disconnect()
    }
  }, [isAuthenticated, refreshUnread])

  return (
    <NotificationContext.Provider
      value={{ unreadCount, previews, refreshUnread, markCommunityRead }}
    >
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const ctx = useContext(NotificationContext)
  if (!ctx) {
    throw new Error('useNotifications must be used within NotificationProvider')
  }
  return ctx
}
