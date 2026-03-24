import { CalendarClock, CheckCircle2, Clock3, Mail, MapPin, PlusCircle } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import IssueCard from '../components/IssueCard'
import { Button } from '../components/ui/button'
import { Card } from '../components/ui/card'
import { useAuth } from '../context/AuthContext'
import { useIssues } from '../context/IssueContext'

export default function ProfilePage() {
  const { user } = useAuth()
  const { issues } = useIssues()
  const [statusFilter, setStatusFilter] = useState('all')

  const myIssues = useMemo(() => issues.filter((item) => item.userId === user?.uid), [issues, user])
  const resolvedCount = myIssues.filter((item) => item.status === 'resolved').length
  const pendingCount = myIssues.filter((item) => item.status === 'pending').length
  const inProgressCount = myIssues.filter((item) => item.status === 'in_progress').length
  const totalUpvotes = myIssues.reduce((sum, item) => sum + (item.upvotes || 0), 0)
  const filteredIssues = myIssues.filter((item) => (statusFilter === 'all' ? true : item.status === statusFilter))
  const latestIssue = myIssues[0]

  return (
    <div className="space-y-6">
      <Card className="grid gap-4 p-6 md:grid-cols-4">
        <div>
          <p className="text-sm text-slate-500">Account</p>
          <p className="inline-flex items-center gap-1 font-semibold text-slate-900">
            <Mail className="h-4 w-4 text-indigo-600" /> {user?.email}
          </p>
        </div>
        <div>
          <p className="text-sm text-slate-500">Total reports</p>
          <p className="text-2xl font-bold text-indigo-700">{myIssues.length}</p>
        </div>
        <div>
          <p className="text-sm text-slate-500">Resolved</p>
          <p className="text-2xl font-bold text-emerald-700">{resolvedCount}</p>
        </div>
        <div>
          <p className="text-sm text-slate-500">Total upvotes earned</p>
          <p className="text-2xl font-bold text-slate-900">{totalUpvotes}</p>
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="p-4">
          <p className="inline-flex items-center gap-1 text-sm text-slate-500">
            <Clock3 className="h-4 w-4 text-amber-600" /> Pending
          </p>
          <p className="mt-1 text-xl font-bold text-amber-700">{pendingCount}</p>
        </Card>
        <Card className="p-4">
          <p className="inline-flex items-center gap-1 text-sm text-slate-500">
            <CalendarClock className="h-4 w-4 text-blue-600" /> In progress
          </p>
          <p className="mt-1 text-xl font-bold text-blue-700">{inProgressCount}</p>
        </Card>
        <Card className="p-4">
          <p className="inline-flex items-center gap-1 text-sm text-slate-500">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Resolved
          </p>
          <p className="mt-1 text-xl font-bold text-emerald-700">{resolvedCount}</p>
        </Card>
        <Card className="flex items-center justify-between p-4">
          <div>
            <p className="text-sm text-slate-500">Quick action</p>
            <p className="font-semibold text-slate-900">Raise new issue</p>
          </div>
          <Link to="/issues/new">
            <Button className="gap-1">
              <PlusCircle className="h-4 w-4" /> Report
            </Button>
          </Link>
        </Card>
      </div>

      <Card className="p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-slate-900">Issue Filters</p>
            <p className="text-xs text-slate-500">Narrow down your personal reports by status.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              ['all', 'All'],
              ['pending', 'Pending'],
              ['in_progress', 'In Progress'],
              ['resolved', 'Resolved'],
            ].map(([key, label]) => (
              <Button key={key} variant={statusFilter === key ? 'default' : 'outline'} onClick={() => setStatusFilter(key)}>
                {label}
              </Button>
            ))}
          </div>
        </div>
      </Card>

      {latestIssue ? (
        <Card className="p-4">
          <p className="text-sm text-slate-500">Latest report</p>
          <p className="mt-1 font-semibold text-slate-900">{latestIssue.title}</p>
          <p className="mt-1 inline-flex items-center gap-1 text-sm text-slate-600">
            <MapPin className="h-4 w-4" /> {latestIssue.location}
          </p>
        </Card>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filteredIssues.map((issue) => (
          <IssueCard key={issue.id} issue={issue} />
        ))}
      </div>
      {!filteredIssues.length ? (
        <Card className="p-6 text-center text-slate-600">No reports found for this filter.</Card>
      ) : null}
    </div>
  )
}
