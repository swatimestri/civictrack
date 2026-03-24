import { LayoutDashboard, LogOut, UserCircle2 } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Button } from './ui/button'

export default function Navbar() {
  const { logout } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4">
        <Link to="/home" className="text-lg font-bold text-indigo-700">
          CivicTrack Lite
        </Link>
        <div className="flex items-center gap-2">
          <Link to="/issues/new">
            <Button>Report Issue</Button>
          </Link>
          <Link to="/profile">
            <Button variant="outline" className="gap-2">
              <UserCircle2 className="h-4 w-4" /> Profile
            </Button>
          </Link>
          <Link to="/authority">
            <Button variant="outline" className="gap-2">
              <LayoutDashboard className="h-4 w-4" /> Authority
            </Button>
          </Link>
          <Button variant="ghost" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  )
}
