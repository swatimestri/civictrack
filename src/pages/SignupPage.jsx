import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/button'
import { Card } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { useAuth } from '../context/AuthContext'

export default function SignupPage() {
  const { signup, firebaseInitError } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await signup(form.email.trim(), form.password)
      navigate('/home')
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') {
        setError('Email is already registered. Please login.')
      } else {
        setError(err.message || 'Signup failed.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
      <Card className="w-full max-w-md p-6">
        <h1 className="text-2xl font-bold text-slate-900">Create account</h1>
        <p className="mt-1 text-sm text-slate-500">Join your community and report issues.</p>
        {firebaseInitError ? (
          <p className="mt-3 rounded-lg bg-rose-50 p-2 text-xs text-rose-700">{firebaseInitError}</p>
        ) : null}
        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <Input type="email" placeholder="Email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} required />
          <Input type="password" placeholder="Password (min 6 chars)" value={form.password} onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))} minLength={6} required />
          {error ? <p className="text-sm text-rose-600">{error}</p> : null}
          <Button className="w-full" disabled={loading}>
            {loading ? 'Creating...' : 'Sign up'}
          </Button>
        </form>
        <p className="mt-4 text-sm text-slate-600">
          Already have an account? <Link className="font-medium text-indigo-700" to="/login">Login</Link>
        </p>
      </Card>
    </div>
  )
}
