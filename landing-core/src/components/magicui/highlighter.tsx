/**
 * Highlighter — MagicUI (local copy)
 * Animated text highlighter that draws a colored box behind text on scroll.
 */
import { useRef } from 'react'
import { motion, useInView } from 'motion/react'
import { cn } from '../../lib/utils'

interface HighlighterProps {
  children: React.ReactNode
  className?: string
  color?: string
  delay?: number
}

export function Highlighter({
  children,
  className,
  color = '#EAE8FF',
  delay = 0.3,
}: HighlighterProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true, amount: 0.6 })

  return (
    <span ref={ref} className={cn('relative inline whitespace-nowrap', className)}>
      {/* Highlight sweep */}
      <motion.span
        aria-hidden
        className="absolute inset-x-0 bottom-0 z-0"
        style={{ backgroundColor: color, height: '110%', originX: 0 }}
        initial={{ scaleX: 0 }}
        animate={isInView ? { scaleX: 1 } : { scaleX: 0 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay }}
      />
      <span className="relative z-10">{children}</span>
    </span>
  )
}
