import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import FilterBar from '../components/FilterBar'
import IssueCard from '../components/IssueCard'
import IssueCardSkeleton from '../components/IssueCardSkeleton'
import { Button } from '../components/ui/button'
import { Card } from '../components/ui/card'
import { useIssues } from '../context/IssueContext'

export default function DashboardPage() {
  const { issues, loadingIssues, firestoreError } = useIssues()
  const [filter, setFilter] = useState({ category: 'all', status: 'all' })
  const [sortBy, setSortBy] = useState('most_upvoted')

  const filtered = useMemo(() => {
    return issues
      .filter((issue) => (filter.category === 'all' ? true : issue.category === filter.category))
      .filter((issue) => (filter.status === 'all' ? true : issue.status === filter.status))
      .sort((a, b) => {
        if (sortBy === 'latest') {
          return (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)
        }
        return (b.upvotes || 0) - (a.upvotes || 0)
      })
  }, [issues, filter, sortBy])

  const topUrgent = filtered.slice().sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0)).slice(0, 3)
  const resolvedCount = issues.filter((issue) => issue.status === 'resolved').length
  const inProgressCount = issues.filter((issue) => issue.status === 'in_progress').length

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50 to-white p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Community Dashboard</h1>
            <p className="text-sm text-slate-600">Discover, prioritize, and track civic issues around you.</p>
          </div>
          <Link to="/issues/new">
            <Button>Report New Issue</Button>
          </Link>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <Card className="p-4">
            <p className="text-sm text-slate-500">Total issues</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{issues.length}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-slate-500">In progress</p>
            <p className="mt-1 text-2xl font-bold text-blue-700">{inProgressCount}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-slate-500">Resolved</p>
            <p className="mt-1 text-2xl font-bold text-emerald-700">{resolvedCount}</p>
          </Card>
        </div>
      </div>

      <FilterBar filter={filter} setFilter={setFilter} sortBy={sortBy} setSortBy={setSortBy} />
      {firestoreError ? <p className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{firestoreError}</p> : null}

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">Top Urgent Issues</h2>
        {loadingIssues ? (
          <div className="grid gap-4 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <IssueCardSkeleton key={`urgent-skeleton-${index}`} />
            ))}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-3">
            {topUrgent.map((issue) => (
              <IssueCard key={issue.id} issue={issue} />
            ))}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">All Issues</h2>
        {loadingIssues ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <IssueCardSkeleton key={`all-skeleton-${index}`} />
            ))}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((issue) => (
              <IssueCard key={issue.id} issue={issue} />
            ))}
          </div>
        )}
        {!loadingIssues && !filtered.length ? (
          <Card className="p-6 text-center">
            <p className="text-slate-700">No issues match your current filters.</p>
            <p className="mt-1 text-sm text-slate-500">Try changing status/category filters or report a new issue.</p>
          </Card>
        ) : null}
      </section>
    </div>
  )
}
