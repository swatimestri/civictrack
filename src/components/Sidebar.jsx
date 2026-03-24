import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Home, LayoutDashboard, UserCircle2, PlusCircle, LogOut } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { cn } from '../utils/cn'

const navItems = [
  { name: 'Dashboard', path: '/home', icon: Home },
  { name: 'Report Issue', path: '/issues/new', icon: PlusCircle },
  { name: 'Authority Panel', path: '/authority', icon: LayoutDashboard },
  { name: 'Profile', path: '/profile', icon: UserCircle2 },
]

export default function Sidebar() {
  const { pathname } = useLocation()
  const { logout } = useAuth()

  return (
    <aside className="w-64 border-r border-border bg-card flex flex-col h-screen sticky top-0 hidden md:flex">
      <div className="h-16 flex items-center px-6 border-b border-border">
        <Link to="/home" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shadow-glow">
            <span className="text-white font-bold text-lg">C</span>
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">CivicTrack</span>
        </Link>
      </div>

      <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.path || pathname.startsWith(item.path + '/')
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group relative",
                isActive ? "text-primary" : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="active-nav-bg"
                  className="absolute inset-0 bg-primary/10 rounded-lg border border-primary/20"
                  initial={false}
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <item.icon className={cn("w-5 h-5 relative z-10", isActive && "text-primary")} />
              <span className="relative z-10">{item.name}</span>
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-border mt-auto">
        <button
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all w-full"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  )
}
