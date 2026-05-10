/**
 * AuroraText — MagicUI (local copy)
 * Animates each letter with a shifting aurora gradient.
 * Usage: <AuroraText>palavra</AuroraText>
 */
import { useEffect, useRef } from 'react'
import { cn } from '../../lib/utils'

interface AuroraTextProps {
  children: string
  className?: string
  colors?: string[]
  speed?: number // seconds per full cycle
}

export function AuroraText({
  children,
  className,
  colors = ['#6C63FF', '#C4F135', '#a78bfa', '#818cf8'],
  speed = 3,
}: AuroraTextProps) {
  const spanRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (!spanRef.current) return
    const el = spanRef.current
    el.style.setProperty('--aurora-colors', colors.join(', '))
    el.style.setProperty('--aurora-speed', `${speed}s`)
  }, [colors, speed])

  return (
    <span
      ref={spanRef}
      className={cn('aurora-text', className)}
    >
      {children.split('').map((char, i) => (
        <span
          key={i}
          className="aurora-letter"
          style={{ animationDelay: `${(i / children.length) * speed}s` }}
        >
          {char === ' ' ? '\u00A0' : char}
        </span>
      ))}
    </span>
  )
}
