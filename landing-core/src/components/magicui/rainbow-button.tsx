/**
 * RainbowButton — MagicUI (local copy)
 * A button with an animated rainbow border/glow effect.
 */
import React from 'react'
import { cn } from '../../lib/utils'

interface RainbowButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
  className?: string
  as?: 'button' | 'a'
  href?: string
}

export function RainbowButton({
  children,
  className,
  as: Tag = 'button',
  href,
  ...props
}: RainbowButtonProps) {
  const sharedClass = cn(
    'relative inline-flex cursor-pointer items-center justify-center overflow-hidden',
    'px-8 py-5 font-headline font-black uppercase tracking-tighter text-white',
    'transition-all duration-300 active:scale-95',
    'rainbow-button',
    className,
  )

  if (Tag === 'a') {
    return (
      <a href={href} className={sharedClass}>
        <span className="relative z-10">{children}</span>
      </a>
    )
  }

  return (
    <button className={sharedClass} {...props}>
      <span className="relative z-10">{children}</span>
    </button>
  )
}
