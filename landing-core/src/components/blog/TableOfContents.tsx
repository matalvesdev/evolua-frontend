import { useEffect, useState, useCallback } from 'react'
import type { TocItem } from './toc-utils'

interface TableOfContentsProps {
  sections: TocItem[]
}

export function TableOfContents({ sections }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>('')
  const [isOpen, setIsOpen] = useState(false)

  const observerCallback = useCallback((entries: IntersectionObserverEntry[]) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        setActiveId(entry.target.id)
        break
      }
    }
  }, [])

  useEffect(() => {
    if (sections.length === 0) return

    const els = sections
      .map((s) => document.getElementById(s.id))
      .filter(Boolean) as HTMLElement[]

    const observer = new IntersectionObserver(observerCallback, {
      rootMargin: '-80px 0px -80% 0px',
      threshold: 0,
    })

    els.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [sections, observerCallback])

  if (sections.length < 2) return null

  return (
    <>
      {/* Mobile: collapsible */}
      <div className="lg:hidden mb-8">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-on-surface-variant hover:text-ink transition-colors"
        >
          <span className="material-symbols-outlined text-base">{isOpen ? 'expand_less' : 'expand_more'}</span>
          Sumário
        </button>
        {isOpen && (
          <nav className="mt-3 border border-outline-variant bg-surface p-4">
            <ul className="space-y-2">
              {sections.map((s) => (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    onClick={(e) => { e.preventDefault(); document.getElementById(s.id)?.scrollIntoView({ behavior: 'smooth' }); setIsOpen(false) }}
                    className={`block text-xs transition-colors ${activeId === s.id ? 'text-primary font-bold' : 'text-on-surface-variant hover:text-ink'}`}
                  >
                    {s.text}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </div>

      {/* Desktop: sticky sidebar */}
      <nav className="hidden lg:block sticky top-20">
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-on-surface-variant mb-4">Neste artigo</p>
        <ul className="space-y-2.5 border-l border-outline-variant">
          {sections.map((s) => (
            <li key={s.id}>
              <a
                href={`#${s.id}`}
                onClick={(e) => { e.preventDefault(); document.getElementById(s.id)?.scrollIntoView({ behavior: 'smooth' }) }}
                className={`block text-xs py-1 pl-4 border-l-2 -ml-px transition-all ${
                  activeId === s.id
                    ? 'border-primary text-ink font-bold'
                    : 'border-transparent text-on-surface-variant hover:text-ink hover:border-outline-variant'
                }`}
              >
                {s.text}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </>
  )
}
