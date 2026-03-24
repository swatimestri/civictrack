import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { CheckCircle2, Clock, AlertCircle, TrendingUp, GripVertical } from 'lucide-react'
import { toast } from 'sonner'
import StatusBadge from '../components/StatusBadge'
import { Card } from '../components/ui/card'
import { useIssues } from '../context/IssueContext'
import InteractiveMap from '../components/InteractiveMap'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#a855f7', '#ef4444']

export default function AuthorityDashboardPage() {
  const { issues, firestoreError, updateIssueStatus } = useIssues()
  const [activeTab, setActiveTab] = useState('kanban')

  const metrics = useMemo(() => {
    const pending = issues.filter((item) => item.status === 'pending').length
    const resolved = issues.filter((item) => item.status === 'resolved').length
    const inProgress = issues.filter((item) => item.status === 'in_progress').length
    return { total: issues.length, pending, resolved, inProgress }
  }, [issues])

  const categoryData = useMemo(() => {
    const counts = {}
    issues.forEach(i => counts[i.category] = (counts[i.category] || 0) + 1)
    return Object.keys(counts).map(k => ({ name: k, value: counts[k] }))
  }, [issues])

  const statusData = [
    { name: 'Pending', count: metrics.pending },
    { name: 'In Progress', count: metrics.inProgress },
    { name: 'Resolved', count: metrics.resolved },
  ]

  const handleDragStart = (e, issueId) => {
    e.dataTransfer.setData("issueId", issueId)
  }

  const handleDrop = async (e, newStatus) => {
    e.preventDefault()
    const issueId = e.dataTransfer.getData("issueId")
    if(issueId) {
      const issue = issues.find(i => i.id === issueId)
      if (issue && issue.status !== newStatus) {
        try {
          await updateIssueStatus(issueId, newStatus)
          toast.success(`Moved to ${newStatus}`)
        } catch(err) {
          toast.error("Failed to update status")
        }
      }
    }
  }

  const handleDragOver = (e) => e.preventDefault()
  
  const getIssuesByStatus = (status) => issues.filter(i => i.status === status).sort((a,b) => (b.upvotes || 0) - (a.upvotes || 0))

  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
      <div className="flex flex-col md:flex-row items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Authority Portal</h1>
          <p className="mt-1 text-sm text-muted-foreground">Monitor, assign, and resolve civic issues systematically.</p>
        </div>
        <div className="flex p-1 bg-muted rounded-lg w-full md:w-auto overflow-x-auto shrink-0">
          {['kanban', 'analytics', 'map'].map(tab => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 md:w-32 py-2 px-4 text-sm font-medium rounded-md capitalize transition-all whitespace-nowrap ${activeTab === tab ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {firestoreError ? <div className="rounded-xl bg-destructive/10 text-destructive p-4 flex items-center gap-2 border border-destructive/20"><AlertCircle className="w-5 h-5"/> {firestoreError}</div> : null}

      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        {[
          { label: 'Total Issues', value: metrics.total, icon: AlertCircle, color: 'text-blue-500', bg: 'bg-blue-500/10' },
          { label: 'Pending Assessment', value: metrics.pending, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-500/10' },
          { label: 'In Progress', value: metrics.inProgress, icon: TrendingUp, color: 'text-purple-500', bg: 'bg-purple-500/10' },
          { label: 'Resolved', value: metrics.resolved, icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
        ].map(stat => (
          <Card key={stat.label} className="p-5 glass-card flex items-center gap-4">
            <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
            </div>
          </Card>
        ))}
      </div>

      {activeTab === 'analytics' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid gap-6 md:grid-cols-2 mt-6">
          <Card className="p-6 glass-card">
            <h3 className="font-semibold text-lg text-foreground mb-6">Issues by Category</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={categoryData} cx="50%" cy="50%" innerRadius={70} outerRadius={90} paddingAngle={2} dataKey="value" label>
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}/>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
          <Card className="p-6 glass-card">
            <h3 className="font-semibold text-lg text-foreground mb-6">Resolution Progress</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusData}>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip cursor={{ fill: 'rgba(150,150,150,0.1)' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                  <Bar dataKey="count" fill="#6366f1" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </motion.div>
      )}

      {activeTab === 'map' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6">
          <Card className="p-4 glass-card h-[600px] flex flex-col z-0">
             <h3 className="font-semibold text-lg text-foreground mb-4 shrink-0">Live Issue Map</h3>
             <div className="flex-1 rounded-xl overflow-hidden relative z-0">
               <InteractiveMap issues={issues} />
             </div>
          </Card>
        </motion.div>
      )}

      {activeTab === 'kanban' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[600px]">
            {['pending', 'in_progress', 'resolved'].map((status) => (
              <div 
                key={status} 
                className="flex flex-col bg-muted/20 rounded-2xl border border-border p-4 h-full overflow-hidden"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, status)}
              >
                <div className="flex items-center justify-between mb-4 px-2 shrink-0">
                  <h3 className="font-semibold text-foreground capitalize flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${status === 'pending' ? 'bg-amber-500' : status === 'in_progress' ? 'bg-purple-500' : 'bg-emerald-500'}`} />
                    {status.replace('_', ' ')}
                  </h3>
                  <span className="bg-background text-muted-foreground px-2 py-0.5 rounded-full text-xs font-medium border border-border flex items-center justify-center">
                    {getIssuesByStatus(status).length}
                  </span>
                </div>
                
                <div className="flex-1 overflow-y-auto space-y-3 pr-1" style={{ scrollbarWidth: 'thin' }}>
                  {getIssuesByStatus(status).map(issue => (
                    <div 
                      key={issue.id} 
                      draggable
                      onDragStart={(e) => handleDragStart(e, issue.id)}
                      className="bg-card p-4 rounded-xl shadow-sm border border-border/50 cursor-grab active:cursor-grabbing hover:border-primary/50 transition-colors group relative"
                    >
                      <GripVertical className="absolute right-3 top-4 w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      <Link to={`/issues/${issue.id}`} className="block mb-2 font-medium text-sm pr-6 hover:text-primary transition-colors line-clamp-2">
                        {issue.title}
                      </Link>
                      <div className="flex items-center justify-between mt-auto pt-2">
                        <span className="bg-primary/10 text-primary text-[10px] px-2 py-1 rounded-full font-medium truncate max-w-[120px]">
                          {issue.category}
                        </span>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground font-medium bg-muted/50 px-2 py-1 rounded-md">
                          <TrendingUp className="w-3.5 h-3.5" /> {issue.upvotes || 0}
                        </div>
                      </div>
                    </div>
                  ))}
                  {getIssuesByStatus(status).length === 0 && (
                     <div className="h-full min-h-[100px] flex items-center justify-center text-sm text-muted-foreground font-medium border-2 border-dashed border-border rounded-xl">
                       Drag issues here
                     </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}
