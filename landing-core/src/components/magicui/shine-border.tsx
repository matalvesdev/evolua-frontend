/**
 * ShineBorder — MagicUI (local copy)
 * Animated shine border around a card/div.
 * Usage: <ShineBorder className="...">content</ShineBorder>
 */
import { cn } from '../../lib/utils'

interface ShineBorderProps {
  children: React.ReactNode
  className?: string
  borderWidth?: number
  duration?: number
  color?: string | string[]
  borderRadius?: number
}

export function ShineBorder({
  children,
  className,
  borderWidth = 2,
  duration = 8,
  color = ['#6C63FF', '#C4F135', '#a78bfa'],
  borderRadius = 0,
}: ShineBorderProps) {
  const gradient = Array.isArray(color) ? color.join(', ') : color

  return (
    <div
      className={cn('relative overflow-hidden', className)}
      style={{ borderRadius }}
    >
      {/* Shine pseudo via inline CSS animation */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-10"
        style={{
          borderRadius,
          padding: borderWidth,
          background: `linear-gradient(var(--shine-angle, 45deg), ${gradient})`,
          WebkitMask:
            'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'xor',
          maskComposite: 'exclude',
          animation: `shine-border ${duration}s linear infinite`,
        }}
      />
      {children}
    </div>
  )
}
