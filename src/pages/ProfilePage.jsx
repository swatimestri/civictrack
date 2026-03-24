import { CalendarClock, CheckCircle2, Clock3, Mail, PlusCircle, Trophy, Medal, Star, Award } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import IssueCard from '../components/IssueCard'
import { Button } from '../components/ui/button'
import { Card } from '../components/ui/card'
import { useAuth } from '../context/AuthContext'
import { useIssues } from '../context/IssueContext'

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
}

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
  const latestIssue = myIssues.sort((a,b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))[0]

  // Gamification logic
  const reputationScore = (myIssues.length * 50) + (totalUpvotes * 10) + (resolvedCount * 100)
  
  const getBadge = (score) => {
    if (score >= 1000) return { title: 'Local Hero', icon: Trophy, color: 'text-yellow-500', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20' }
    if (score >= 500) return { title: 'Community Leader', icon: Star, color: 'text-purple-500', bg: 'bg-purple-500/10', border: 'border-purple-500/20' }
    if (score >= 200) return { title: 'Active Citizen', icon: Medal, color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20' }
    return { title: 'Civic Starter', icon: Award, color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' }
  }

  const currentBadge = getBadge(reputationScore)

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-8 max-w-6xl mx-auto">
      <motion.div variants={itemVariants} className="relative rounded-3xl border border-primary/20 bg-gradient-to-r from-primary/10 via-background to-blue-500/5 p-8 overflow-hidden glass shadow-sm flex flex-col md:flex-row items-center gap-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2 pointer-events-none" />
        
        <div className="relative z-10 w-24 h-24 rounded-full bg-gradient-to-br from-primary to-blue-600 p-1 shrink-0 shadow-glow">
          <div className="w-full h-full rounded-full bg-background flex items-center justify-center text-4xl font-bold text-primary">
            {user?.email?.[0].toUpperCase() || 'U'}
          </div>
          <div className={`absolute -bottom-2 -right-2 p-1.5 rounded-full ${currentBadge.bg} ${currentBadge.color} border-2 border-background`}>
             <currentBadge.icon className="w-5 h-5" />
          </div>
        </div>

        <div className="relative z-10 flex-1 text-center md:text-left">
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">{user?.email?.split('@')[0]}</h1>
          <p className="inline-flex items-center gap-1.5 text-muted-foreground mt-1">
            <Mail className="h-4 w-4" /> {user?.email}
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-center md:justify-start gap-4">
             <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${currentBadge.bg} border ${currentBadge.border}`}>
               <currentBadge.icon className={`w-4 h-4 ${currentBadge.color}`} />
               <span className={`text-sm font-bold ${currentBadge.color}`}>{currentBadge.title}</span>
             </div>
             <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-background border border-border shadow-sm">
               <span className="text-base font-bold text-foreground">{reputationScore}</span>
               <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Rep Points</span>
             </div>
          </div>
        </div>

        <Link to="/issues/new" className="relative z-10 shrink-0 w-full md:w-auto">
           <Button variant="premium" className="w-full shadow-glow rounded-full h-12 px-6">
             <PlusCircle className="mr-2 w-5 h-5" /> Report New Issue
           </Button>
        </Link>
      </motion.div>

      <motion.div variants={itemVariants} className="grid gap-4 grid-cols-2 md:grid-cols-4">
        {[
          { label: 'Total Reports', value: myIssues.length, icon: CalendarClock, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
          { label: 'Pending Assessment', value: pendingCount, icon: Clock3, color: 'text-amber-500', bg: 'bg-amber-500/10' },
          { label: 'In Progress', value: inProgressCount, icon: Clock3, color: 'text-blue-500', bg: 'bg-blue-500/10' },
          { label: 'Resolved Successfully', value: resolvedCount, icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
        ].map((stat, i) => (
          <Card key={i} className="p-5 glass-card flex flex-col md:flex-row items-center gap-4 text-center md:text-left border-none bg-background/50">
            <div className={`p-3 rounded-xl ${stat.bg} ${stat.color} shrink-0`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
            </div>
          </Card>
        ))}
      </motion.div>

      <motion.div variants={itemVariants} className="flex flex-col md:flex-row gap-4 items-center justify-between bg-card p-2 rounded-xl border border-border shadow-sm">
        <div className="flex flex-wrap gap-1 p-1 bg-muted/50 rounded-lg w-full md:w-auto">
          {[
            ['all', 'All Reports'],
            ['pending', 'Pending'],
            ['in_progress', 'In Progress'],
            ['resolved', 'Resolved'],
          ].map(([key, label]) => (
            <button 
              key={key} 
              onClick={() => setStatusFilter(key)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex-1 md:flex-none ${statusFilter === key ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-background/50'}`}
            >
              {label}
            </button>
          ))}
        </div>
        {latestIssue && (
           <div className="hidden lg:flex items-center gap-2 px-4 text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">Latest:</span> 
              <span className="truncate max-w-[250px]">{latestIssue.title}</span>
           </div>
        )}
      </motion.div>

      <motion.div variants={itemVariants} className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {filteredIssues.map((issue) => (
          <IssueCard key={issue.id} issue={issue} />
        ))}
        {!filteredIssues.length && (
          <div className="col-span-full border-2 border-dashed border-border rounded-2xl p-12 text-center bg-card/30 glass">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4 text-muted-foreground">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">No reports found</h3>
            <p className="mt-2 text-muted-foreground max-w-sm mx-auto">
              You haven't reported any issues matching this status yet. Make a difference by reporting one today!
            </p>
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}
