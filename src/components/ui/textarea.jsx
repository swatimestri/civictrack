import { cn } from '../../utils/cn'

export function Textarea({ className, ...props }) {
  return (
    <textarea
      className={cn(
        'min-h-24 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-indigo-300 transition focus:ring-2',
        className,
      )}
      {...props}
    />
  )
}
