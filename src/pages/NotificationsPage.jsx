import { useState } from 'react'
import { motion } from 'framer-motion'
import { Bell, CheckCircle2, FileText, CheckCheck } from 'lucide-react'
import { Button } from '../components/ui/button'
import { useNotifications } from '../context/NotificationContext'
import { formatDistanceToNow } from 'date-fns'
import { Link } from 'react-router-dom'

const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } }
const itemVariants = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }

export default function NotificationsPage() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications()
  const [filter, setFilter] = useState('all')

  const displayedNotifications = notifications.filter(n => filter === 'all' ? true : !n.read)

  return (
    <div className="max-w-4xl mx-auto w-full space-y-8 animate-in fade-in zoom-in-95 duration-500">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Notifications</h1>
          <p className="mt-1 text-sm text-muted-foreground">Stay updated on your civic reports and local activities.</p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="flex bg-muted p-1 rounded-lg">
             <button onClick={() => setFilter('all')} className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${filter === 'all' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground'}`}>All</button>
             <button onClick={() => setFilter('unread')} className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all flex items-center gap-1.5 ${filter === 'unread' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground'}`}>Unread {unreadCount > 0 && <span className="bg-primary text-primary-foreground text-[10px] px-1.5 py-0.5 rounded-full">{unreadCount}</span>}</button>
          </div>
          {unreadCount > 0 && (
             <Button variant="outline" size="sm" onClick={markAllAsRead} className="h-9 whitespace-nowrap"><CheckCheck className="w-4 h-4 mr-2" /> Mark all read</Button>
          )}
        </div>
      </div>

      <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-4">
        {displayedNotifications.length === 0 ? (
          <div className="col-span-full border-2 border-dashed border-border rounded-2xl p-12 text-center bg-card/30 glass">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4 text-muted-foreground">
              <Bell className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">You're all caught up!</h3>
            <p className="mt-2 text-muted-foreground max-w-sm mx-auto">No new notifications right now. We'll alert you when there's an update.</p>
          </div>
        ) : (
          displayedNotifications.map(notif => (
            <motion.div key={notif.id} variants={itemVariants} className={`group relative flex items-start gap-4 p-5 rounded-2xl border transition-all ${!notif.read ? 'bg-primary/5 border-primary/20 shadow-sm' : 'bg-card border-border hover:bg-accent/50'}`}>
              <div className={`p-3 rounded-full shrink-0 ${!notif.read ? 'bg-primary text-primary-foreground shadow-glow' : 'bg-muted text-muted-foreground'}`}>
                 {notif.type === 'status_update' ? <CheckCircle2 className="w-5 h-5" /> : notif.type === 'comment' ? <FileText className="w-5 h-5" /> : <Bell className="w-5 h-5" />}
              </div>
              <div className="flex-1 space-y-1">
                 <p className={`text-base ${!notif.read ? 'font-semibold text-foreground' : 'text-foreground/80'}`}>{notif.message}</p>
                 <p className="text-sm text-muted-foreground flex items-center gap-2">
                   {notif.createdAt?.seconds ? formatDistanceToNow(new Date(notif.createdAt.seconds * 1000), { addSuffix: true }) : 'Just now'}
                 </p>
                 {notif.link && (
                    <div className="pt-2">
                      <Link to={notif.link} onClick={() => !notif.read && markAsRead(notif.id)} className="text-sm font-medium text-primary hover:underline inline-flex items-center gap-1">View Details</Link>
                    </div>
                 )}
              </div>
              {!notif.read && (
                <Button variant="ghost" size="sm" onClick={() => markAsRead(notif.id)} className="opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shrink-0 text-muted-foreground hover:text-foreground">
                   Mark as read
                </Button>
              )}
            </motion.div>
          ))
        )}
      </motion.div>
    </div>
  )
}
