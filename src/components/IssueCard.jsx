import { MapPin, ThumbsUp } from 'lucide-react'
import { Link } from 'react-router-dom'
import IssueImage from './IssueImage'
import StatusBadge from './StatusBadge'
import { Card } from './ui/card'

export default function IssueCard({ issue }) {
  return (
    <Link to={`/issues/${issue.id}`}>
      <Card className="overflow-hidden transition hover:-translate-y-1 hover:shadow-lg">
        <div className="aspect-video bg-slate-100">
          <IssueImage src={issue.imageUrl} alt={issue.title} className="h-full w-full object-cover" fallbackClassName="text-slate-400" />
        </div>
        <div className="space-y-3 p-4">
          <div className="flex items-start justify-between gap-2">
            <h3 className="line-clamp-2 text-base font-semibold text-slate-900">{issue.title}</h3>
            <StatusBadge status={issue.status} />
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="rounded-full bg-indigo-100 px-2 py-1 font-medium text-indigo-700">{issue.category}</span>
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" /> {issue.location}
            </span>
          </div>
          <p className="inline-flex items-center gap-1 text-sm text-slate-600">
            <ThumbsUp className="h-4 w-4" /> {issue.upvotes || 0} upvotes
          </p>
        </div>
      </Card>
    </Link>
  )
}
