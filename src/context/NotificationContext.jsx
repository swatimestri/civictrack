import { createContext, useContext, useEffect, useState, useMemo } from 'react'
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc, addDoc, serverTimestamp, writeBatch } from 'firebase/firestore'
import { db } from '../services/firebase'
import { useAuth } from './AuthContext'

const NotificationContext = createContext(null)

export function NotificationProvider({ children }) {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (!db || !user?.uid) {
      setNotifications([])
      setUnreadCount(0)
      return
    }

    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      setNotifications(data)
      setUnreadCount(data.filter(n => !n.read).length)
    }, (error) => {
      console.error("Error fetching notifications:", error)
    })

    return () => unsubscribe()
  }, [user?.uid])

  async function markAsRead(notificationId) {
    if (!db) return
    await updateDoc(doc(db, 'notifications', notificationId), { read: true })
  }

  async function markAllAsRead() {
    if (!db || notifications.length === 0) return
    const unread = notifications.filter(n => !n.read)
    if (unread.length === 0) return
    
    const batch = writeBatch(db)
    unread.forEach(n => {
      const ref = doc(db, 'notifications', n.id)
      batch.update(ref, { read: true })
    })
    await batch.commit()
  }

  async function addNotification(userId, message, type, link = null) {
    if (!db) return
    await addDoc(collection(db, 'notifications'), {
      userId,
      message,
      type, // 'status_update', 'comment', 'assignment', 'system'
      link,
      read: false,
      createdAt: serverTimestamp()
    })
  }

  const value = useMemo(() => ({
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    addNotification
  }), [notifications, unreadCount])

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const ctx = useContext(NotificationContext)
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider')
  return ctx
}
