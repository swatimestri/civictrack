import { cn } from '../../utils/cn'

export function Select({ className, children, ...props }) {
  return (
    <select
      className={cn(
        'h-10 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none ring-primary/50 transition focus:ring-2',
        className,
      )}
      {...props}
    >
      {children}
    </select>
  )
}
