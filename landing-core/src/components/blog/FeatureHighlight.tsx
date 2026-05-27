import { Link } from '@tanstack/react-router'
import type { FeatureHighlightData } from './placement-data'

interface FeatureHighlightProps {
  feature: FeatureHighlightData
  variant?: 'sidebar' | 'inline'
}

export function FeatureHighlight({ feature, variant = 'inline' }: FeatureHighlightProps) {
  const isSidebar = variant === 'sidebar'

  return (
    <div
      data-placement="feature-highlight"
      className={
        isSidebar
          ? 'border border-outline-variant bg-surface p-4'
          : 'border border-outline-variant bg-surface p-6 md:p-8 my-10 md:my-12'
      }
    >
      <div className={`flex items-start gap-3 ${isSidebar ? '' : 'flex-col md:flex-row md:items-center'}`}>
        <div className={`${isSidebar ? 'w-8 h-8' : 'w-10 h-10'} bg-primary/10 flex items-center justify-center shrink-0`}>
          <span
            className={`material-symbols-outlined text-primary ${isSidebar ? 'text-base' : 'text-xl'}`}
            style={{ fontVariationSettings: '"FILL" 1' }}
          >
            {feature.icon}
          </span>
        </div>
        <div className="min-w-0">
          <h3 className={`font-headline font-bold text-ink ${isSidebar ? 'text-xs' : 'text-sm md:text-base'}`}>
            {feature.title}
          </h3>
          {!isSidebar && (
            <p className="text-xs text-on-surface-variant leading-relaxed mt-1.5 mb-4">
              {feature.description}
            </p>
          )}
          <Link
            to={feature.ctaLink}
            className={`inline-flex items-center gap-1 font-bold ${isSidebar ? 'text-[10px]' : 'text-xs'} text-primary hover:text-primary-dark transition-colors`}
          >
            {feature.cta}
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
