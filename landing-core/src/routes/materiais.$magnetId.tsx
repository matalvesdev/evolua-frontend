import { useEffect } from 'react'
import { createFileRoute, redirect } from '@tanstack/react-router'

const FILE_INFO: Record<string, { ext: string; label: string }> = {
  pdf: { ext: 'PDF', label: 'Documento PDF' },
}

const LEAD_MAGNETS: Record<string, { title: string; file: string }> = {
  'ebook-tendencias': { title: 'E-book: Tendências em Fonoaudiologia 2026', file: '/lead-magnets/ebook-tendencias.pdf' },
  'ebook-protocolos': { title: 'E-book: Guia de Protocolos Clínicos', file: '/lead-magnets/ebook-protocolos.pdf' },
  'ebook-mkt-digital-fono': { title: 'E-book: Marketing Digital para Fonoaudiólogas', file: '/lead-magnets/ebook-mkt-digital-fono.pdf' },
  'infografico-marcos-fala': { title: 'Infográfico: Marcos do Desenvolvimento da Fala', file: '/lead-magnets/infografico-marcos-fala.pdf' },
  'infografico-montar-clinica': { title: 'Infográfico: Como Montar sua Clínica de Fonoaudiologia', file: '/lead-magnets/infografico-montar-clinica.pdf' },
  'ebook-whatsapp': { title: 'E-book: WhatsApp Profissional para Fonoaudiólogas', file: '/lead-magnets/ebook-whatsapp.pdf' },
  'infografico-precos': { title: 'Infográfico: Estratégia de Preços para Fonoaudiólogas', file: '/lead-magnets/infografico-precos.pdf' },
  'infografico-humanizado': { title: 'Infográfico: Atendimento Humanizado na Fonoaudiologia', file: '/lead-magnets/infografico-atendimento-humanizado.pdf' },
}

export const Route = createFileRoute('/materiais/$magnetId')({
  loader: ({ params }) => {
    const magnet = LEAD_MAGNETS[params.magnetId]
    if (!magnet) {
      throw redirect({ to: '/materiais' })
    }
    return magnet
  },
  component: DownloadPage,
})

function DownloadPage() {
  const magnet = Route.useLoaderData()
  const ext = magnet.file.split('.').pop() ?? ''
  const info = FILE_INFO[ext] ?? { ext: ext.toUpperCase(), label: `Arquivo ${ext.toUpperCase()}` }

  useEffect(() => {
    const a = document.createElement('a')
    a.href = magnet.file
    a.download = magnet.file.split('/').pop() ?? 'download'
    a.click()
  }, [magnet.file])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-5 bg-canvas">
      <div className="max-w-md w-full text-center">
        <span className="material-symbols-outlined text-5xl text-primary mb-4" style={{ fontVariationSettings: '"FILL" 1' }}>
          downloading
        </span>
        <h1 className="font-headline font-black text-3xl uppercase tracking-tighter text-ink mb-2">
          {magnet.title}
        </h1>
        <span className="inline-block bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded mb-4">
          {info.label}
        </span>
        <p className="text-ink-soft/80 mb-8">
          Seu download deve começar automaticamente. Caso contrário, clique no botão abaixo.
        </p>
        <a
          href={magnet.file}
          download
          className="inline-flex items-center gap-2 bg-deep text-neon px-8 py-4 text-sm font-bold hover:bg-ink transition-colors"
        >
          <span className="material-symbols-outlined text-lg">download</span>
          Baixar {info.ext}
        </a>
      </div>
    </div>
  )
}
