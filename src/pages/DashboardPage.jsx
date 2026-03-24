import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FileText, Clock, CheckCircle2, TrendingUp, AlertCircle } from 'lucide-react'
import FilterBar from '../components/FilterBar'
import IssueCard from '../components/IssueCard'
import IssueCardSkeleton from '../components/IssueCardSkeleton'
import { Button } from '../components/ui/button'
import { Card } from '../components/ui/card'
import { useIssues } from '../context/IssueContext'

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

export default function DashboardPage() {
  const { issues, loadingIssues, firestoreError } = useIssues()
  const [filter, setFilter] = useState({ category: 'all', status: 'all' })
  const [sortBy, setSortBy] = useState('most_upvoted')

  // The trending algorithm uses a mixture of recency and upvotes to assign a score
  const trendingFiltered = useMemo(() => {
    const now = Date.now() / 1000
    return issues.map(issue => {
        const upvotes = issue.upvotes || 0
        const createdAt = issue.createdAt?.seconds || now
        const ageHours = (now - createdAt) / 3600
        
        // Priority formula: (upvotes * 10) / (age in hours + 2)^1.5 + (severity weight could be here)
        const priorityScore = (upvotes * 10) / Math.pow(ageHours + 2, 1.5)
        return { ...issue, priorityScore }
      })
      .filter((issue) => (filter.category === 'all' ? true : issue.category === filter.category))
      .filter((issue) => (filter.status === 'all' ? true : issue.status === filter.status))
      .sort((a, b) => b.priorityScore - a.priorityScore)
  }, [issues, filter])

  const sortedFiltered = useMemo(() => {
    return trendingFiltered.slice().sort((a, b) => {
        if (sortBy === 'latest') {
          return (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)
        }
        return (b.upvotes || 0) - (a.upvotes || 0)
    })
  }, [trendingFiltered, sortBy])

  const topUrgent = trendingFiltered.slice(0, 3)
  const resolvedCount = issues.filter((issue) => issue.status === 'resolved').length
  const inProgressCount = issues.filter((issue) => issue.status === 'in_progress').length

  return (
    <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
      <motion.div 
        className="rounded-3xl border border-primary/10 bg-gradient-to-br from-primary/10 via-background to-blue-500/5 p-8 relative overflow-hidden glass shadow-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2" />
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div>
            <h1 className="text-3xl font-extrabold text-foreground tracking-tight sm:text-4xl text-gradient block pb-1">
              Community Dashboard
            </h1>
            <p className="mt-2 text-base text-muted-foreground max-w-xl">
              Discover, prioritize, and track civic issues in your neighborhood. Help your community by reporting problems and upvoting important ones.
            </p>
          </div>
          <Link to="/issues/new" className="shrink-0">
            <Button variant="premium" size="lg" className="rounded-full shadow-glow">
              <AlertCircle className="w-5 h-5 mr-2" /> Report an Issue
            </Button>
          </Link>
        </div>

        <div className="mt-8 grid gap-4 grid-cols-2 md:grid-cols-3">
          <Card className="p-5 glass-card border-none bg-background/50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 text-primary rounded-lg"><FileText className="w-5 h-5" /></div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Issues</p>
                <p className="text-2xl font-bold text-foreground">{issues.length}</p>
              </div>
            </div>
          </Card>
          <Card className="p-5 glass-card border-none bg-background/50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 text-blue-500 rounded-lg"><Clock className="w-5 h-5" /></div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">In Progress</p>
                <p className="text-2xl font-bold text-foreground">{inProgressCount}</p>
              </div>
            </div>
          </Card>
          <Card className="p-5 glass-card border-none bg-background/50 md:col-span-1 col-span-2">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg"><CheckCircle2 className="w-5 h-5" /></div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Resolved</p>
                <p className="text-2xl font-bold text-foreground">{resolvedCount}</p>
              </div>
            </div>
          </Card>
        </div>
      </motion.div>

      <FilterBar filter={filter} setFilter={setFilter} sortBy={sortBy} setSortBy={setSortBy} />
      
      {firestoreError && (
        <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive flex items-center gap-2">
          <AlertCircle className="w-5 h-5" /> {firestoreError}
        </div>
      )}

      {topUrgent.length > 0 && !loadingIssues && filter.category === 'all' && filter.status === 'all' && (
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-rose-500" /> Trending & Urgent
            </h2>
          </div>
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          >
            {topUrgent.map((issue) => (
              <IssueCard key={issue.id} issue={issue} isTrending />
            ))}
          </motion.div>
        </section>
      )}

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-foreground">All Reported Issues</h2>
        {loadingIssues ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 6 }).map((_, index) => (
              <IssueCardSkeleton key={`all-skeleton-${index}`} />
            ))}
          </div>
        ) : (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          >
            {sortedFiltered.map((issue) => (
              <IssueCard key={issue.id} issue={issue} />
            ))}
          </motion.div>
        )}
        
        {!loadingIssues && !sortedFiltered.length ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="col-span-full border-2 border-dashed border-border rounded-2xl p-12 text-center bg-card/30 glass"
          >
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4 text-muted-foreground">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">No issues found</h3>
            <p className="mt-2 text-muted-foreground max-w-sm mx-auto">
              We couldn't find any issues matching your active filters. Try clearing them or report a new one.
            </p>
            <Button variant="outline" className="mt-6" onClick={() => setFilter({ category: 'all', status: 'all' })}>
              Clear Filters
            </Button>
          </motion.div>
        ) : null}
      </section>
    </div>
  )
}
