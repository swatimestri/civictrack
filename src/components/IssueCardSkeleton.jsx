import { Card } from './ui/card'
import { Skeleton } from './ui/skeleton'

export default function IssueCardSkeleton() {
  return (
    <Card className="overflow-hidden flex flex-col h-full border-border bg-card/60 backdrop-blur-sm">
      <Skeleton className="aspect-[4/3] rounded-none w-full" />
      <div className="flex flex-col flex-1 p-4 gap-4">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        
        <div className="mt-auto border-t border-border/50 pt-3 flex justify-between">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-4 w-12" />
        </div>
      </div>
    </Card>
  )
}
