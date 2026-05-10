/**
 * BentoGrid — MagicUI (local copy)
 * Asymmetric feature grid with optional span control.
 */
import { cn } from '../../lib/utils'

interface BentoGridProps {
  children: React.ReactNode
  className?: string
}

interface BentoCardProps {
  children: React.ReactNode
  className?: string
  /** tailwind col-span-* */
  colSpan?: string
  /** tailwind row-span-* */
  rowSpan?: string
}

export function BentoGrid({ children, className }: BentoGridProps) {
  return (
    <div
      className={cn(
        'grid auto-rows-[minmax(180px,auto)] grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4',
        className,
      )}
    >
      {children}
    </div>
  )
}

export function BentoCard({ children, className, colSpan, rowSpan }: BentoCardProps) {
  return (
    <div className={cn('overflow-hidden', colSpan, rowSpan, className)}>
      {children}
    </div>
  )
}
