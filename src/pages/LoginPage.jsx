import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/button'
import { Card } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const { login, firebaseInitError } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(form.email.trim(), form.password)
      navigate(location.state?.from || '/home', { replace: true })
    } catch (err) {
      if (err.code === 'auth/invalid-credential') {
        setError('Invalid email or password. Please try again.')
      } else {
        setError(err.message || 'Login failed.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
      <Card className="w-full max-w-md p-6">
        <h1 className="text-2xl font-bold text-slate-900">Welcome back</h1>
        <p className="mt-1 text-sm text-slate-500">Login to continue reporting and tracking issues.</p>
        {firebaseInitError ? (
          <p className="mt-3 rounded-lg bg-rose-50 p-2 text-xs text-rose-700">{firebaseInitError}</p>
        ) : null}
        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <Input type="email" placeholder="Email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} required />
          <Input type="password" placeholder="Password" value={form.password} onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))} required />
          {error ? <p className="text-sm text-rose-600">{error}</p> : null}
          <Button className="w-full" disabled={loading}>
            {loading ? 'Signing in...' : 'Login'}
          </Button>
        </form>
        <p className="mt-4 text-sm text-slate-600">
          New here? <Link className="font-medium text-indigo-700" to="/signup">Create account</Link>
        </p>
      </Card>
    </div>
  )
}
