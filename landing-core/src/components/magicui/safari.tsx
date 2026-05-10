/**
 * Safari — MagicUI (local copy)
 * Browser chrome mockup (Safari style) to show product screenshots.
 */
import { cn } from '../../lib/utils'

interface SafariProps {
  url?: string
  children?: React.ReactNode
  className?: string
  /** src for screenshot image */
  imageSrc?: string
  imageAlt?: string
}

export function Safari({
  url = 'app.evolua.com.br',
  children,
  className,
  imageSrc,
  imageAlt = 'Screenshot do app Evolua',
}: SafariProps) {
  return (
    <div className={cn('w-full rounded-none overflow-hidden shadow-2xl', className)}>
      {/* Browser toolbar */}
      <div className="flex items-center gap-2 bg-[#1e1e2e] px-4 py-3 border-b border-white/10">
        {/* Traffic lights */}
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
          <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
          <div className="w-3 h-3 rounded-full bg-[#28c840]" />
        </div>
        {/* URL bar */}
        <div className="flex-1 mx-3">
          <div className="bg-white/10 rounded-sm px-3 py-1 text-[11px] text-white/60 font-mono truncate text-center">
            {url}
          </div>
        </div>
        {/* Share icon placeholder */}
        <div className="w-4 h-4 opacity-0" />
      </div>
      {/* Content */}
      <div className="bg-white">
        {imageSrc ? (
          <img
            src={imageSrc}
            alt={imageAlt}
            className="w-full object-cover object-top"
          />
        ) : (
          children
        )}
      </div>
    </div>
  )
}
