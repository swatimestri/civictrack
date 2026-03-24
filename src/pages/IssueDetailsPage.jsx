import { MapPin, ThumbsUp, Send, CheckCircle2, Clock, CalendarClock, Camera, Loader2, Image as ImageIcon } from 'lucide-react'
import { useEffect, useMemo, useState, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { format, formatDistanceToNow } from 'date-fns'
import { motion, AnimatePresence } from 'framer-motion'
import Loader from '../components/Loader'
import IssueImage from '../components/IssueImage'
import StatusBadge from '../components/StatusBadge'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Card } from '../components/ui/card'
import { Select } from '../components/ui/select'
import { useAuth } from '../context/AuthContext'
import { useIssues } from '../context/IssueContext'
import { useToast } from '../context/ToastContext'
import { useComments } from '../hooks/useComments'
import { uploadIssueImageToSupabase } from '../services/supabase'
import { doc, updateDoc } from 'firebase/firestore'
import { db } from '../services/firebase'
import { ISSUE_STATUSES } from '../utils/constants'

export default function IssueDetailsPage() {
  const { issueId } = useParams()
  const { user } = useAuth()
  const { getIssueById, hasUserVoted, upvoteIssue, updateIssueStatus } = useIssues()
  const { comments, addComment } = useComments(issueId)
  const { pushToast } = useToast()
  
  const issue = useMemo(() => getIssueById(issueId), [getIssueById, issueId])
  const [hasVoted, setHasVoted] = useState(false)
  const [voting, setVoting] = useState(false)
  const [statusLoading, setStatusLoading] = useState(false)

  // Comments & Proof
  const [commentText, setCommentText] = useState('')
  const [addingComment, setAddingComment] = useState(false)
  const [proofFile, setProofFile] = useState(null)
  const [uploadingProof, setUploadingProof] = useState(false)
  const fileRef = useRef(null)

  useEffect(() => {
    let mounted = true
    if (!issue || !user) return
    hasUserVoted(issue.id, user.uid).then((voted) => {
      if (mounted) setHasVoted(voted)
    })
    return () => { mounted = false }
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
    if (nextStatus === issue.status) return
    setStatusLoading(true)
    try {
      await updateIssueStatus(issue.id, nextStatus)
      pushToast(`Status updated to ${nextStatus}`, 'success')
      if (nextStatus !== 'resolved') setProofFile(null) // Reset proof if moved backwards
    } catch (err) {
      pushToast('Failed to update status', 'error')
    } finally {
      setStatusLoading(false)
    }
  }

  async function handleAddComment(e) {
    e.preventDefault()
    if (!commentText.trim() || !user) return
    setAddingComment(true)
    try {
      await addComment(user.uid, user.email, commentText.trim())
      setCommentText('')
    } catch (err) {
      pushToast('Failed to post comment', 'error')
    } finally {
      setAddingComment(false)
    }
  }

  async function handleUploadProof() {
    if (!proofFile || !db) return
    setUploadingProof(true)
    try {
      const url = await uploadIssueImageToSupabase(proofFile)
      await updateDoc(doc(db, 'issues', issue.id), { resolutionProofUrl: url })
      pushToast('Resolution proof uploaded successfully', 'success')
      setProofFile(null)
    } catch (err) {
      pushToast('Failed to upload proof', 'error')
    } finally {
      setUploadingProof(false)
    }
  }

  const timelineSteps = [
    { key: 'pending', label: 'Reported', icon: Clock },
    { key: 'in_progress', label: 'In Progress', icon: CalendarClock },
    { key: 'resolved', label: 'Resolved', icon: CheckCircle2 }
  ]
  const currentStepIndex = timelineSteps.findIndex(s => s.key === issue.status)

  return (
    <div className="max-w-5xl mx-auto w-full space-y-8 animate-in fade-in duration-500 pb-12">
      
      <Card className="overflow-hidden glass-card rounded-3xl border border-border shadow-soft">
        <div className="aspect-video md:aspect-[21/9] bg-muted relative">
          <IssueImage src={issue.imageUrl} alt={issue.title} className="h-full w-full object-cover" fallbackClassName="text-muted-foreground" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          <div className="absolute bottom-6 left-6 right-6 z-10">
            <div className="flex flex-wrap items-center gap-3 mb-3">
              <span className="bg-primary/90 backdrop-blur text-primary-foreground px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase">
                {issue.category}
              </span>
              <StatusBadge status={issue.status} />
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight leadng-tight mb-2">
              {issue.title}
            </h1>
            <p className="flex items-center gap-1.5 text-slate-200">
              <MapPin className="w-4 h-4" /> {issue.location}
            </p>
          </div>
        </div>

        <div className="p-6 md:p-8 space-y-8 bg-card/50">
          
          {/* Transparency Timeline */}
          <section className="space-y-4">
             <h2 className="text-xl font-bold text-foreground">Resolution Timeline</h2>
             <div className="relative flex justify-between items-center max-w-2xl mt-8">
                <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 w-full bg-muted rounded-full overflow-hidden">
                   <motion.div 
                     initial={{ width: 0 }} 
                     animate={{ width: `${currentStepIndex === 0 ? 0 : currentStepIndex === 1 ? 50 : 100}%` }} 
                     className="h-full bg-primary transition-all duration-700 ease-out"
                   />
                </div>
                {timelineSteps.map((step, idx) => {
                  const isCompleted = idx <= currentStepIndex
                  const isCurrent = idx === currentStepIndex
                  return (
                    <div key={step.key} className="relative z-10 flex flex-col items-center gap-2">
                       <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 transition-colors duration-500 ${isCompleted ? 'bg-primary border-background text-primary-foreground shadow-glow' : 'bg-muted border-background text-muted-foreground'}`}>
                         <step.icon className="w-5 h-5" />
                       </div>
                       <span className={`text-sm font-semibold ${isCurrent ? 'text-primary' : isCompleted ? 'text-foreground' : 'text-muted-foreground'}`}>{step.label}</span>
                    </div>
                  )
                })}
             </div>
          </section>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-8">
              <section className="space-y-4">
                <h2 className="text-xl font-bold text-foreground">Issue Details</h2>
                <div className="p-5 rounded-2xl bg-muted/30 border border-border whitespace-pre-wrap text-foreground/90 leading-relaxed">
                  {issue.description}
                </div>
                <div className="flex flex-wrap items-center gap-4 pt-2">
                  <Button onClick={handleUpvote} disabled={hasVoted || voting || !user} className="gap-2 rounded-full shadow-sm" variant={hasVoted ? "secondary" : "default"}>
                    <ThumbsUp className={`w-4 h-4 ${hasVoted ? "text-primary fill-primary" : ""}`} /> 
                    {hasVoted ? 'You upvoted this' : 'Upvote to prioritize'}
                  </Button>
                  <div className="flex -space-x-2">
                    <span className="text-sm font-medium text-muted-foreground bg-muted px-4 py-2 rounded-full border border-border">
                      {issue.upvotes || 0} local citizens support this
                    </span>
                  </div>
                </div>
              </section>

              {/* Comments Section */}
              <section className="space-y-4 pt-6 border-t border-border">
                 <h2 className="text-xl font-bold text-foreground">Community Comments</h2>
                 <div className="space-y-4">
                   {comments.map(comment => (
                     <div key={comment.id} className="flex gap-4">
                       <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20 shrink-0">
                         <span className="font-bold text-primary">{comment.userEmail?.charAt(0).toUpperCase()}</span>
                       </div>
                       <div className="bg-muted/40 border border-border rounded-2xl rounded-tl-none p-4 flex-1 shadow-sm">
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-semibold text-sm text-foreground">{comment.userEmail?.split('@')[0]}</span>
                            <span className="text-xs text-muted-foreground">
                              {comment.createdAt?.seconds ? formatDistanceToNow(new Date(comment.createdAt.seconds * 1000), { addSuffix: true }) : 'Just now'}
                            </span>
                          </div>
                          <p className="text-sm text-foreground/80">{comment.text}</p>
                       </div>
                     </div>
                   ))}
                   {comments.length === 0 && (
                     <p className="text-sm text-muted-foreground text-center py-6 bg-muted/20 rounded-2xl border border-dashed border-border">No comments yet. Be the first to start the discussion!</p>
                   )}
                 </div>

                 {user ? (
                   <form onSubmit={handleAddComment} className="flex gap-3 pt-4">
                     <Input 
                       placeholder="Add a comment..." 
                       value={commentText} 
                       onChange={e => setCommentText(e.target.value)} 
                       className="flex-1 rounded-full bg-background"
                     />
                     <Button type="submit" disabled={addingComment || !commentText.trim()} className="rounded-full shadow-glow shrink-0 w-12 h-12 p-0 flex items-center justify-center">
                       {addingComment ? <Loader2 className="w-5 h-5 animate-spin"/> : <Send className="w-5 h-5 ml-1" />}
                     </Button>
                   </form>
                 ) : (
                   <p className="text-sm text-muted-foreground text-center pt-4">Log in to comment.</p>
                 )}
              </section>
            </div>

            {/* Authority / Proof Sidebar */}
            <div className="space-y-6">
              <Card className="p-5 glass border-border shadow-sm">
                <h3 className="font-semibold text-foreground mb-4">Official Status</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider font-semibold">Reported On</p>
                    <p className="text-sm font-medium text-foreground">
                      {issue.createdAt?.seconds ? format(new Date(issue.createdAt.seconds * 1000), 'PPP') : 'Recently'}
                    </p>
                  </div>
                  
                  {/* Internal Authority Tools */}
                  {user && (
                    <div className="pt-4 border-t border-border">
                      <label className="text-xs text-muted-foreground mb-2 block uppercase tracking-wider font-semibold">Authority Actions</label>
                      <Select value={issue.status} disabled={statusLoading} onChange={(e) => handleStatusChange(e.target.value)}>
                        {Object.entries(ISSUE_STATUSES).map(([key, label]) => (
                          <option key={key} value={key}>{label}</option>
                        ))}
                      </Select>
                    </div>
                  )}

                  {/* Resolution Proof System */}
                  {(issue.status === 'resolved' || issue.resolutionProofUrl) && (
                    <div className="pt-4 border-t border-border space-y-3">
                      <label className="text-xs flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 mb-2 uppercase tracking-wider font-semibold">
                         <CheckCircle2 className="w-4 h-4" /> Resolution Proof
                      </label>
                      
                      {issue.resolutionProofUrl ? (
                        <div className="rounded-xl overflow-hidden border border-border shadow-sm relative group">
                          <img src={issue.resolutionProofUrl} alt="Resolution Proof" className="w-full aspect-video object-cover" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                             <a href={issue.resolutionProofUrl} target="_blank" rel="noreferrer" className="text-white text-xs font-semibold bg-black/50 px-3 py-1.5 rounded-full backdrop-blur">View Full Image</a>
                          </div>
                        </div>
                      ) : user ? (
                        <div className="space-y-3">
                          <input type="file" accept="image/*" className="hidden" ref={fileRef} onChange={(e) => setProofFile(e.target.files?.[0])} />
                          {proofFile ? (
                             <div className="flex items-center justify-between text-sm bg-muted rounded-lg p-2">
                               <span className="truncate max-w-[150px]">{proofFile.name}</span>
                               <Button size="sm" onClick={handleUploadProof} disabled={uploadingProof} className="h-7 text-xs">
                                  {uploadingProof ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Upload'}
                               </Button>
                             </div>
                          ) : (
                             <Button variant="outline" size="sm" className="w-full border-dashed" onClick={() => fileRef.current?.click()}>
                               <Camera className="w-4 h-4 mr-2 text-muted-foreground" /> Add Proof Photo
                             </Button>
                          )}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground italic">Authorities are verifying this resolution.</p>
                      )}
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
