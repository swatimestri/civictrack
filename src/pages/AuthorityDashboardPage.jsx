import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import StatusBadge from '../components/StatusBadge'
import { Card } from '../components/ui/card'
import { useIssues } from '../context/IssueContext'

export default function AuthorityDashboardPage() {
  const { issues, firestoreError } = useIssues()

  const metrics = useMemo(() => {
    const pending = issues.filter((item) => item.status === 'pending').length
    const resolved = issues.filter((item) => item.status === 'resolved').length
    return { total: issues.length, pending, resolved }
  }, [issues])

  const prioritized = useMemo(
    () => issues.slice().sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0)).slice(0, 8),
    [issues],
  )

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Authority Dashboard</h1>
        <p className="text-sm text-slate-600">Monitor issue pipeline and prioritize high-impact reports.</p>
      </div>
      {firestoreError ? <p className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{firestoreError}</p> : null}

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-4">
          <p className="text-sm text-slate-500">Total Issues</p>
          <p className="text-2xl font-bold text-indigo-700">{metrics.total}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-slate-500">Pending</p>
          <p className="text-2xl font-bold text-amber-600">{metrics.pending}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-slate-500">Resolved</p>
          <p className="text-2xl font-bold text-emerald-600">{metrics.resolved}</p>
        </Card>
      </div>

      <Card className="overflow-hidden">
        <div className="border-b border-slate-200 p-4">
          <h2 className="font-semibold text-slate-900">Most Prioritized Issues</h2>
        </div>
        <div className="divide-y divide-slate-100">
          {prioritized.map((issue) => (
            <div key={issue.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
              <div>
                <Link to={`/issues/${issue.id}`} className="font-medium text-indigo-700 hover:underline">
                  {issue.title}
                </Link>
                <p className="text-sm text-slate-500">
                  {issue.location} • {issue.category}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <p className="text-sm text-slate-600">{issue.upvotes || 0} upvotes</p>
                <StatusBadge status={issue.status} />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
