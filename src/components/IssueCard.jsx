import { MapPin, ThumbsUp, Clock, TrendingUp } from 'lucide-react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { formatDistanceToNow } from 'date-fns'
import IssueImage from './IssueImage'
import StatusBadge from './StatusBadge'
import { Card } from './ui/card'
import { Badge } from './ui/badge'

export default function IssueCard({ issue, isTrending = false }) {
  const timeAgo = issue.createdAt?.seconds 
    ? formatDistanceToNow(new Date(issue.createdAt.seconds * 1000), { addSuffix: true })
    : 'Recently'

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="h-full"
    >
      <Link to={`/issues/${issue.id}`} className="block h-full">
        <Card className="overflow-hidden h-full flex flex-col group border-border bg-card/60 backdrop-blur-sm hover:shadow-glow transition-all duration-300">
          <div className="relative aspect-[4/3] bg-muted overflow-hidden">
            <IssueImage 
              src={issue.imageUrl} 
              alt={issue.title} 
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" 
              fallbackClassName="text-muted-foreground" 
            />
            {/* Dark gradient for text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80" />
            
            <div className="absolute top-3 w-full px-3 flex justify-between items-start z-10">
              <StatusBadge status={issue.status} />
              {isTrending && (
                <Badge variant="destructive" className="bg-rose-500/90 backdrop-blur-md text-white border-none gap-1 shadow-sm">
                  <TrendingUp className="w-3 h-3" /> Trending
                </Badge>
              )}
            </div>
            
            <h3 className="absolute bottom-3 left-4 right-4 line-clamp-2 text-base font-bold text-white tracking-wide z-10">
              {issue.title}
            </h3>
          </div>
          
          <div className="flex flex-col flex-1 p-4 gap-4 bg-card/40">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5 font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">
                {issue.category}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> {timeAgo}
              </span>
            </div>
            
            <div className="mt-auto flex items-center justify-between border-t border-border/50 pt-3">
              <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4 text-primary" /> 
                <span className="truncate max-w-[120px]">{issue.location}</span>
              </span>
              <span className="flex items-center gap-1.5 text-sm font-medium text-foreground group-hover:text-emerald-500 transition-colors">
                <ThumbsUp className="w-4 h-4" /> 
                {issue.upvotes || 0}
              </span>
            </div>
          </div>
        </Card>
      </Link>
    </motion.div>
  )
}
