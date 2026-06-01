import { createFileRoute, redirect } from '@tanstack/react-router'

const LEAD_MAGNETS: Record<string, { title: string; file: string }> = {
  'checklist-gestao': { title: 'Checklist de Gestão Clínica', file: '/lead-magnets/checklist-gestao.pdf' },
  'planilha-financeiro': { title: 'Planilha de Controle Financeiro', file: '/lead-magnets/planilha-financeiro.xlsx' },
  'ebook-tendencias': { title: 'E-book: Tendências em Fonoaudiologia 2026', file: '/lead-magnets/ebook-tendencias.pdf' },
  'template-relatorio': { title: 'Template de Relatório Clínico', file: '/lead-magnets/template-relatorio.docx' },
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
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-5 bg-canvas">
      <div className="max-w-md w-full text-center">
        <span className="material-symbols-outlined text-5xl text-primary mb-4" style={{ fontVariationSettings: '"FILL" 1' }}>
          download
        </span>
        <h1 className="font-headline font-black text-3xl uppercase tracking-tighter text-ink mb-2">
          {magnet.title}
        </h1>
        <p className="text-ink-soft/80 mb-8">
          Seu download deve começar automaticamente. Caso contrário, clique no botão abaixo.
        </p>
        <a
          href={magnet.file}
          download
          className="inline-block bg-deep text-neon px-8 py-4 text-sm font-bold hover:bg-ink transition-colors"
        >
          Baixar material
        </a>
      </div>
    </div>
  )
}
