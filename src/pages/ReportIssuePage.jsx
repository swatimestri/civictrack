import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/button'
import { Card } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Select } from '../components/ui/select'
import { Textarea } from '../components/ui/textarea'
import { useAuth } from '../context/AuthContext'
import { useIssues } from '../context/IssueContext'
import { useToast } from '../context/ToastContext'
import { ISSUE_CATEGORIES } from '../utils/constants'

export default function ReportIssuePage() {
  const { user } = useAuth()
  const { createIssue, firestoreError } = useIssues()
  const { pushToast } = useToast()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: ISSUE_CATEGORIES[0],
    location: '',
    image: null,
  })

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    try {
      await createIssue(form, user.uid)
      setMessage('Issue submitted successfully.')
      pushToast('Issue submitted successfully.', 'success')
      navigate('/home')
    } catch (err) {
      setMessage(err.message || 'Unable to submit issue.')
      pushToast(err.message || 'Unable to submit issue.', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="mx-auto max-w-2xl p-6">
      <h1 className="text-2xl font-bold text-slate-900">Report an Issue</h1>
      <p className="mt-1 text-sm text-slate-600">Share details so your community can prioritize the issue faster.</p>
      {firestoreError ? <p className="mt-2 rounded-lg bg-rose-50 p-2 text-xs text-rose-700">{firestoreError}</p> : null}
      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        <Input placeholder="Title" value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} required />
        <Textarea placeholder="Description" value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} required />
        <Select value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}>
          {ISSUE_CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </Select>
        <Input placeholder="Location" value={form.location} onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))} required />
        <label className="block rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600">
          Upload image (optional)
          <Input className="mt-2" type="file" accept="image/*" onChange={(e) => setForm((p) => ({ ...p, image: e.target.files?.[0] || null }))} />
        </label>
        {message ? <p className="text-sm text-slate-600">{message}</p> : null}
        <Button className="w-full" disabled={loading}>
          {loading ? 'Submitting...' : 'Submit Issue'}
        </Button>
      </form>
    </Card>
  )
}
