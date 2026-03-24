import { ISSUE_STATUSES, STATUS_STYLES } from '../utils/constants'
import { cn } from '../utils/cn'

export default function StatusBadge({ status }) {
  return (
    <span className={cn('rounded-full border px-2.5 py-1 text-xs font-semibold', STATUS_STYLES[status])}>
      {ISSUE_STATUSES[status] || 'Pending'}
    </span>
  )
}
