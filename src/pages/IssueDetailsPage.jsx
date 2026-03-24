import { MapPin, ThumbsUp } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import Loader from '../components/Loader'
import IssueImage from '../components/IssueImage'
import StatusBadge from '../components/StatusBadge'
import { Button } from '../components/ui/button'
import { Card } from '../components/ui/card'
import { Select } from '../components/ui/select'
import { useAuth } from '../context/AuthContext'
import { useIssues } from '../context/IssueContext'
import { useToast } from '../context/ToastContext'
import { ISSUE_STATUSES } from '../utils/constants'

export default function IssueDetailsPage() {
  const { issueId } = useParams()
  const { user } = useAuth()
  const { getIssueById, hasUserVoted, upvoteIssue, updateIssueStatus } = useIssues()
  const { pushToast } = useToast()
  const issue = useMemo(() => getIssueById(issueId), [getIssueById, issueId])
  const [hasVoted, setHasVoted] = useState(false)
  const [voting, setVoting] = useState(false)
  const [statusLoading, setStatusLoading] = useState(false)

  useEffect(() => {
    let mounted = true
    if (!issue || !user) return
    hasUserVoted(issue.id, user.uid).then((voted) => {
      if (mounted) setHasVoted(voted)
    })
    return () => {
      mounted = false
    }
  }, [issue, user, hasUserVoted])

  if (!issue) return <Loader label="Loading issue details..." />

  async function handleUpvote() {
    if (hasVoted || !user) return
    setHasVoted(true)
    setVoting(true)
    try {
      await upvoteIssue(issue.id, user.uid)
      pushToast('Upvote added.', 'success')
    } catch {
      setHasVoted(false)
      pushToast('You already voted for this issue.', 'error')
    } finally {
      setVoting(false)
    }
  }

  async function handleStatusChange(nextStatus) {
    setStatusLoading(true)
    await updateIssueStatus(issue.id, nextStatus)
    setStatusLoading(false)
    pushToast('Issue status updated.', 'success')
  }

  return (
    <Card className="overflow-hidden">
      <div className="aspect-[16/6] bg-slate-100">
        <IssueImage src={issue.imageUrl} alt={issue.title} className="h-full w-full object-cover" fallbackClassName="text-slate-400" />
      </div>
      <div className="space-y-4 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-bold text-slate-900">{issue.title}</h1>
          <StatusBadge status={issue.status} />
        </div>
        <p className="text-slate-700">{issue.description}</p>
        <p className="inline-flex items-center gap-1 text-sm text-slate-500">
          <MapPin className="h-4 w-4" /> {issue.location}
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <Button onClick={handleUpvote} disabled={hasVoted || voting} className="gap-2">
            <ThumbsUp className="h-4 w-4" /> {hasVoted ? 'Upvoted' : 'Upvote'}
          </Button>
          <p className="text-sm text-slate-600">{issue.upvotes || 0} total upvotes</p>
        </div>
        {issue.userId === user?.uid ? (
          <div className="max-w-xs space-y-1">
            <p className="text-sm font-medium text-slate-700">Update issue status</p>
            <Select value={issue.status} disabled={statusLoading} onChange={(e) => handleStatusChange(e.target.value)}>
              {Object.entries(ISSUE_STATUSES).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </Select>
          </div>
        ) : null}
      </div>
    </Card>
  )
}
