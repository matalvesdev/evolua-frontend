/**
 * TextReveal — MagicUI (local copy)
 * Words fade from muted to full color as user scrolls.
 */
import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'motion/react'
import { cn } from '../../lib/utils'

interface TextRevealProps {
  text: string
  className?: string
}

export function TextReveal({ text, className }: TextRevealProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start 0.85', 'end 0.5'],
  })

  const words = text.split(' ')

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <p className="flex flex-wrap gap-x-2 gap-y-1">
        {words.map((word, i) => {
          const start = i / words.length
          const end = (i + 1) / words.length
          return (
            <Word key={i} progress={scrollYProgress} range={[start, end]}>
              {word}
            </Word>
          )
        })}
      </p>
    </div>
  )
}

function Word({
  children,
  progress,
  range,
}: {
  children: string
  progress: ReturnType<typeof useScroll>['scrollYProgress']
  range: [number, number]
}) {
  const opacity = useTransform(progress, range, [0.15, 1])
  const y = useTransform(progress, range, [6, 0])

  return (
    <motion.span style={{ opacity, y }} className="inline-block">
      {children}
    </motion.span>
  )
}
