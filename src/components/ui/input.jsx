import { cn } from '../../utils/cn'

export function Input({ className, ...props }) {
  return (
    <input
      className={cn(
        'h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none ring-indigo-300 transition focus:ring-2',
        className,
      )}
      {...props}
    />
  )
}
