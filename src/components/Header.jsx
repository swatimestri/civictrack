import { Search, Bell, Menu, Moon, Sun, CheckCircle2 } from 'lucide-react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNotifications } from '../context/NotificationContext'
import { Link, useNavigate } from 'react-router-dom'
import { formatDistanceToNow } from 'date-fns'

export default function Header() {
  const { user } = useAuth()
  const { notifications, unreadCount, markAsRead } = useNotifications()
  const [isDark, setIsDark] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const notifRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (isDark) document.documentElement.classList.add('dark')
    else document.documentElement.classList.remove('dark')
  }, [isDark])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifications(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleNotificationClick = (notif) => {
    markAsRead(notif.id)
    setShowNotifications(false)
    if (notif.link) navigate(notif.link)
  }

  return (
    <header className="h-16 border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-40 flex items-center justify-between px-4 md:px-6">
      <div className="flex items-center gap-4 flex-1">
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="w-5 h-5" />
        </Button>
        <div className="relative max-w-md w-full hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search issues, locations..." 
            className="pl-9 bg-accent/50 border-transparent focus:bg-background focus:border-primary transition-all rounded-full"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => setIsDark(!isDark)}>
          {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </Button>
        
        <div className="relative flex items-center" ref={notifRef}>
          <Button variant="ghost" size="icon" className="relative hidden sm:flex" onClick={() => setShowNotifications(!showNotifications)}>
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
               <span className="absolute top-1 right-2 flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white bg-destructive rounded-full border border-background">
                 {unreadCount > 9 ? '9+' : unreadCount}
               </span>
            )}
          </Button>

          {showNotifications && (
            <div className="absolute top-12 right-0 w-80 bg-card border border-border shadow-soft rounded-2xl overflow-hidden glass animate-in fade-in slide-in-from-top-2 z-50">
              <div className="p-4 border-b border-border flex items-center justify-between bg-muted/20">
                <h3 className="font-semibold text-foreground">Notifications</h3>
                <Link to="/notifications" onClick={() => setShowNotifications(false)} className="text-xs text-primary hover:underline font-medium">View All</Link>
              </div>
              <div className="max-h-80 overflow-y-auto custom-scrollbar flex flex-col">
                {notifications.slice(0, 5).map(notif => (
                   <button 
                     key={notif.id} 
                     onClick={() => handleNotificationClick(notif)}
                     className={`text-left p-4 border-b border-border/50 hover:bg-muted/50 transition-colors flex items-start gap-3 ${!notif.read ? 'bg-primary/5' : ''}`}
                   >
                     <div className={`mt-0.5 p-1.5 rounded-full shrink-0 ${!notif.read ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                        {notif.type === 'status_update' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Bell className="w-3.5 h-3.5" />}
                     </div>
                     <div className="flex-1 space-y-1">
                       <p className={`text-sm ${!notif.read ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}>{notif.message}</p>
                       <p className="text-xs text-muted-foreground">
                         {notif.createdAt?.seconds ? formatDistanceToNow(new Date(notif.createdAt.seconds * 1000), { addSuffix: true }) : 'Just now'}
                       </p>
                     </div>
                     {!notif.read && <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-2" />}
                   </button>
                ))}
                {notifications.length === 0 && (
                   <div className="p-8 text-center text-sm text-muted-foreground">No new notifications</div>
                )}
              </div>
            </div>
          )}
        </div>

        <Link to="/profile" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center font-semibold text-primary">
            {user?.email?.charAt(0).toUpperCase() || 'U'}
          </div>
        </Link>
      </div>
    </header>
  )
}
