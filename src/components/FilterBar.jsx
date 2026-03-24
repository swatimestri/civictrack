import { ISSUE_CATEGORIES, ISSUE_STATUSES } from '../utils/constants'
import { Select } from './ui/select'

export default function FilterBar({ filter, setFilter, sortBy, setSortBy }) {
  return (
    <div className="grid grid-cols-1 gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-soft md:grid-cols-3">
      <Select value={filter.category} onChange={(e) => setFilter((prev) => ({ ...prev, category: e.target.value }))}>
        <option value="all">All Categories</option>
        {ISSUE_CATEGORIES.map((category) => (
          <option key={category} value={category}>
            {category}
          </option>
        ))}
      </Select>
      <Select value={filter.status} onChange={(e) => setFilter((prev) => ({ ...prev, status: e.target.value }))}>
        <option value="all">All Statuses</option>
        {Object.entries(ISSUE_STATUSES).map(([key, label]) => (
          <option key={key} value={key}>
            {label}
          </option>
        ))}
      </Select>
      <Select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
        <option value="most_upvoted">Most Upvoted</option>
        <option value="latest">Latest</option>
      </Select>
    </div>
  )
}
