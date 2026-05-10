/**
 * NeonGradientCard — MagicUI (local copy)
 * A card with animated neon gradient border glow.
 */
import { cn } from '../../lib/utils'

interface NeonGradientCardProps {
  children: React.ReactNode
  className?: string
  borderSize?: number
  borderRadius?: number
  neonColors?: { firstColor: string; secondColor: string }
}

export function NeonGradientCard({
  children,
  className,
  borderSize = 2,
  borderRadius = 0,
  neonColors = { firstColor: '#6C63FF', secondColor: '#C4F135' },
}: NeonGradientCardProps) {
  return (
    <div
      className={cn('relative', className)}
      style={
        {
          '--border-size': `${borderSize}px`,
          '--border-radius': `${borderRadius}px`,
          '--neon-first-color': neonColors.firstColor,
          '--neon-second-color': neonColors.secondColor,
        } as React.CSSProperties
      }
    >
      {/* Glow layer */}
      <div
        aria-hidden
        className="neon-glow pointer-events-none absolute inset-0 z-0"
        style={{ borderRadius }}
      />
      {/* Border layer */}
      <div
        aria-hidden
        className="neon-border pointer-events-none absolute inset-0 z-0"
        style={{
          borderRadius,
          padding: borderSize,
          background: `linear-gradient(135deg, var(--neon-first-color), var(--neon-second-color))`,
          WebkitMask:
            'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'xor',
          maskComposite: 'exclude',
        }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  )
}
