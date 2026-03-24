import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-6 text-sm text-slate-600 md:flex-row md:items-center md:justify-between">
        <p>© {new Date().getFullYear()} CivicTrack Lite. Better communities, together.</p>
        <div className="flex items-center gap-4">
          <Link className="hover:text-indigo-700" to="/home">
            Dashboard
          </Link>
          <Link className="hover:text-indigo-700" to="/issues/new">
            Report Issue
          </Link>
          <Link className="hover:text-indigo-700" to="/profile">
            Profile
          </Link>
        </div>
      </div>
    </footer>
  )
}
