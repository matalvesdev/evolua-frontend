import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { useReports, useCreateReport, useUpdateReport, useSubmitReport, type ReportType } from '@/hooks/use-reports'
import type { Report as HookReport } from '@/hooks/use-reports'
import { usePatients } from '@/hooks/use-patients'
import { useProfile } from '@/hooks/use-profile'
import {
  useGenerateReport,
  sectionsToText,
  REPORT_TEMPLATES,
  type ReportTemplate,
} from '@/hooks/use-report-generation'

export const Route = createFileRoute('/dashboard/relatorios')({
  component: RelatoriosPage,
})

// Mapeia o template de IA para o enum de tipo persistido (ReportTypeSchema).
const TEMPLATE_TO_TYPE: Record<ReportTemplate, ReportType> = {
  'resumo': 'progress',
  'evolucao-mensal': 'evolution',
  'avaliacao-inicial': 'evaluation',
  'encaminhamento': 'referral',
  'alta': 'discharge',
}

// ── Types ──────────────────────────────────────────────────────────────────────

type ReportStatus = 'pending' | 'reviewed' | 'exported'

interface Report {
  id: string
  patient: string
  type: string
  date: string
  duration: string
  status: ReportStatus
  aiGenerated: boolean
  summary: string
  content: string
}

function toLocalReport(r: HookReport): Report {
  return {
    id: r.id,
    patient: r.patientName,
    type: r.type,
    date: r.createdAt.split('T')[0],
    duration: '',
    status: r.status === 'sent' ? 'exported' : r.status === 'approved' || r.status === 'signed' ? 'reviewed' : 'pending',
    aiGenerated: false,
    summary: r.content.slice(0, 200),
    content: r.content,
  }
}

const STATUS_CONFIG: Record<ReportStatus, { label: string; color: string; icon: string }> = {
  pending:  { label:'Aguardando revisão', color:'text-warning bg-warning-surface', icon:'rate_review' },
  reviewed: { label:'Revisado',           color:'text-info bg-info-surface',       icon:'check_circle' },
  exported: { label:'Exportado',          color:'text-success bg-success-surface', icon:'task_alt' },
}

function formatDate(d: string) {
  return new Date(d + 'T00:00:00').toLocaleDateString('pt-BR', { day:'2-digit', month:'short', year:'numeric' })
}

// ── Drawer de visualização ─────────────────────────────────────────────────────

function ReportDrawer({ report, onClose, onSave, saving, error }: { report: Report; onClose: () => void; onSave: (r: Report, status: ReportStatus) => void; saving: boolean; error: boolean }) {
  const fallback = `## Relatório — ${report.patient || '[Paciente]'}\n**Data:** ${formatDate(report.date)} | **Tipo:** ${report.type}\n\n### Resumo\n[Descreva o resumo clínico]\n\n### Evolução Clínica\n[Edite conforme necessário]\n\n### Conduta\n[Edite conforme necessário]`
  const [text, setText] = useState(report.content?.trim() ? report.content : fallback)
  const [patientName, setPatientName] = useState(report.patient)
  const isNew = !report.patient

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/40" onClick={onClose} />
      <div className="w-full max-w-2xl bg-surface shadow-[var(--shadow-dark)] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 bg-dark border-b border-dark-border flex-shrink-0">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-neon/60">Relatório</p>
            <p className="font-display font-bold text-sm text-white">{isNew ? 'Novo Relatório' : report.patient}</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => { window.print() }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-neon/10 border border-neon/20 rounded text-xs font-bold text-neon hover:bg-neon/20 transition-colors">
              <span className="material-symbols-outlined text-sm">download</span>
              PDF
            </button>
            <button onClick={onClose} className="text-white/50 hover:text-white transition-colors">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
        </div>
        <div className="flex items-center gap-3 px-6 py-3 bg-surface-low border-b border-border-soft flex-shrink-0">
          {isNew ? (
            <input
              value={patientName}
              onChange={e => setPatientName(e.target.value)}
              placeholder="Nome do paciente..."
              className="input text-sm flex-1"
            />
          ) : (
            <>
              <span className={`text-[9px] font-bold uppercase tracking-wide px-2 py-1 rounded ${STATUS_CONFIG[report.status].color}`}>
                {STATUS_CONFIG[report.status].label}
              </span>
              {report.aiGenerated && (
                <span className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wide text-olive bg-neon-surface px-2 py-1 rounded">
                  <span className="material-symbols-outlined text-[12px]">auto_awesome</span>
                  Gerado por IA
                </span>
              )}
            </>
          )}
          <span className="text-xs text-text-tertiary ml-auto">{formatDate(report.date)} · {report.duration}</span>
        </div>
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          className="flex-1 w-full p-6 text-sm text-text-secondary leading-relaxed font-sans resize-none border-0 outline-none bg-surface"
        />
        <div className="flex gap-3 px-6 py-4 border-t border-border-soft flex-shrink-0">
          {error && (
            <p className="flex items-center gap-1.5 text-xs text-red-600 self-center mr-auto">
              <span className="material-symbols-outlined text-[14px]">error</span>
              Falha ao salvar. Tente novamente.
            </p>
          )}
          <button onClick={onClose} className="btn-outline" disabled={saving}>Cancelar</button>
          <button
            onClick={() => onSave({ ...report, patient: patientName, content: text }, 'reviewed')}
            disabled={saving}
            className="btn-primary flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed">
            <span className="material-symbols-outlined text-sm">save</span>
            {saving ? 'Salvando...' : 'Salvar e revisar'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Modal: gerar relatório com IA (transcrição + template) ──────────────────────

function GenerateReportModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const { data: patientsResp, isLoading: loadingPatients } = usePatients({ status: 'active', pageSize: 100 })
  const patients = patientsResp?.data ?? []
  const { data: profile } = useProfile()
  const generate = useGenerateReport()
  const createReport = useCreateReport()

  const [patientId, setPatientId] = useState('')
  const [template, setTemplate] = useState<ReportTemplate>('resumo')
  const [transcription, setTranscription] = useState('')
  const [draft, setDraft] = useState('')

  const patient = patients.find((p) => p.id === patientId)
  const canGenerate = transcription.trim().length >= 10 && !generate.isPending
  const canSave = Boolean(patientId) && draft.trim().length > 0 && !createReport.isPending

  async function handleGenerate() {
    if (!canGenerate) return
    const res = await generate.mutateAsync({
      transcription: transcription.trim(),
      template,
      patientName: patient?.name,
    })
    if (res.success && res.sections?.length) {
      setDraft(sectionsToText(res.sections, patient?.name))
    }
  }

  async function handleSave() {
    if (!canSave) return
    const patientName = patient?.name ?? 'Paciente'
    const templateLabel = REPORT_TEMPLATES.find((t) => t.id === template)?.label ?? 'Relatório'
    await createReport.mutateAsync({
      patientId,
      patientName,
      therapistName: profile?.name ?? 'Terapeuta',
      therapistCrfa: profile?.crfa ?? '',
      type: TEMPLATE_TO_TYPE[template],
      title: `${templateLabel} — ${patientName}`,
      content: draft,
    })
    onSaved()
  }

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/40" onClick={onClose} />
      <div className="w-full max-w-2xl bg-surface shadow-[var(--shadow-dark)] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-dark border-b border-dark-border flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-neon" style={{ fontVariationSettings: '"FILL" 1' }}>auto_awesome</span>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-neon/60">Gerar com IA</p>
              <p className="font-display font-bold text-sm text-white">Novo Relatório</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/50 hover:text-white transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-5">
          {/* Paciente */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wide text-text-tertiary">Paciente *</label>
            <select value={patientId} onChange={(e) => setPatientId(e.target.value)} className="input w-full"
              disabled={loadingPatients}>
              <option value="">{loadingPatients ? 'Carregando...' : 'Selecione o paciente'}</option>
              {patients.map((p) => (<option key={p.id} value={p.id}>{p.name}</option>))}
            </select>
          </div>

          {/* Template */}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold uppercase tracking-wide text-text-tertiary">Modelo de relatório</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {REPORT_TEMPLATES.map((t) => (
                <button key={t.id} onClick={() => setTemplate(t.id)}
                  className={`flex flex-col gap-1 p-3 rounded border text-left transition-colors ${
                    template === t.id ? 'bg-dark text-neon border-dark' : 'bg-surface border-border-soft text-text-secondary hover:border-olive/40'
                  }`}>
                  <span className="material-symbols-outlined text-base">{t.icon}</span>
                  <span className="text-xs font-bold">{t.label}</span>
                  <span className={`text-[9px] leading-tight ${template === t.id ? 'text-neon/70' : 'text-text-tertiary'}`}>{t.description}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Transcrição */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wide text-text-tertiary">Transcrição / notas da sessão *</label>
            <textarea value={transcription} onChange={(e) => setTranscription(e.target.value)}
              placeholder="Cole aqui a transcrição da sessão ou suas anotações clínicas..."
              rows={6} className="input w-full resize-y text-xs leading-relaxed" />
            <button onClick={handleGenerate} disabled={!canGenerate}
              className="btn-primary self-start flex items-center gap-2 text-xs px-4 py-2 disabled:opacity-40 disabled:cursor-not-allowed">
              <span className="material-symbols-outlined text-sm">auto_awesome</span>
              {generate.isPending ? 'Gerando...' : 'Gerar relatório'}
            </button>
            {generate.isError && (
              <p className="text-xs text-danger bg-danger-surface rounded px-3 py-2">Falha ao gerar relatório. Tente novamente.</p>
            )}
            {generate.data && !generate.data.success && (
              <p className="text-xs text-danger bg-danger-surface rounded px-3 py-2">{generate.data.error ?? 'Falha ao gerar relatório.'}</p>
            )}
          </div>

          {/* Resultado editável */}
          {draft && (
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wide text-text-tertiary flex items-center gap-1">
                <span className="material-symbols-outlined text-[12px] text-olive">auto_awesome</span>
                Relatório gerado (editável)
              </label>
              <textarea value={draft} onChange={(e) => setDraft(e.target.value)}
                rows={14} className="input w-full resize-y text-xs leading-relaxed font-sans" />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-4 border-t border-border-soft flex-shrink-0">
          <button onClick={onClose} className="btn-outline flex-1">Cancelar</button>
          <button onClick={handleSave} disabled={!canSave}
            className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed">
            <span className="material-symbols-outlined text-sm">save</span>
            {createReport.isPending ? 'Salvando...' : 'Salvar relatório'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Página principal ──────────────────────────────────────────────────────────

function RelatoriosPage() {
  const { data: hookReports = [] }  = useReports()
  const updateReport                = useUpdateReport()
  const submitReport                = useSubmitReport()
  const reports                     = hookReports.map(toLocalReport)
  const [filter, setFilter]       = useState<'all'|ReportStatus>('all')
  const [search, setSearch]       = useState('')
  const [selected, setSelected]   = useState<Report | null>(null)
  const [showNew, setShowNew]     = useState(false)

  async function saveReport(r: Report, status: ReportStatus) {
    await updateReport.mutateAsync({ id: r.id, body: { content: r.content } })
    if (status === 'reviewed') await submitReport.mutateAsync(r.id)
    setSelected(null)
  }

  const filtered = reports.filter(r => {
    const matchFilter = filter === 'all' || r.status === filter
    const matchSearch = search === '' ||
      r.patient.toLowerCase().includes(search.toLowerCase()) ||
      r.type.toLowerCase().includes(search.toLowerCase())
    return matchFilter && matchSearch
  })

  const pending  = reports.filter(r => r.status === 'pending').length
  const reviewed = reports.filter(r => r.status === 'reviewed').length
  const exported = reports.filter(r => r.status === 'exported').length

  return (
    <div className="flex flex-col gap-6 p-6">
      {selected && (
        <ReportDrawer
          report={selected}
          onClose={() => setSelected(null)}
          onSave={saveReport}
          saving={updateReport.isPending || submitReport.isPending}
          error={updateReport.isError || submitReport.isError}
        />
      )}
      {showNew && (
        <GenerateReportModal
          onClose={() => setShowNew(false)}
          onSaved={() => setShowNew(false)}
        />
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl uppercase tracking-wider text-text-primary">Relatórios</h1>
          <p className="text-sm text-text-secondary mt-0.5">{reports.length} relatórios gerados este mês</p>
        </div>
        <button onClick={() => setShowNew(true)} className="btn-primary flex items-center gap-2 self-start sm:self-auto">
          <span className="material-symbols-outlined text-sm">add</span>
          Novo Relatório
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label:'Total',             value: reports.length,      icon:'description',  color:'text-text-primary' },
          { label:'Aguardando revisão',value: pending,             icon:'rate_review',  color:'text-warning' },
          { label:'Revisados',         value: reviewed,            icon:'check_circle', color:'text-info' },
          { label:'Exportados',        value: exported,            icon:'task_alt',     color:'text-success' },
        ].map(s => (
          <div key={s.label} className="card p-4 flex flex-col gap-1 cursor-pointer hover:bg-surface-low transition-colors" onClick={() => { if(s.label !== 'Total') setFilter(s.label === 'Aguardando revisão' ? 'pending' : s.label === 'Revisados' ? 'reviewed' : 'exported') }}>
            <span className={`material-symbols-outlined ${s.color}`} style={{fontVariationSettings:'"FILL" 1'}}>{s.icon}</span>
            <p className={`font-display font-bold text-2xl ${s.color}`}>{s.value}</p>
            <p className="text-[10px] font-bold uppercase tracking-wide text-text-tertiary">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-text-tertiary text-[13px] leading-none">search</span>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por paciente ou tipo..."
            className="input w-full pl-9"
          />
        </div>
        <div className="flex rounded border border-border-soft overflow-hidden flex-shrink-0">
          {([['all','Todos'],['pending','Pendentes'],['reviewed','Revisados'],['exported','Exportados']] as const).map(([v, l]) => (
            <button key={v} onClick={() => setFilter(v)}
              className={`px-3 py-2 text-xs font-bold uppercase tracking-wide transition-colors ${
                filter === v ? 'bg-dark text-neon' : 'bg-surface text-text-tertiary hover:text-text-primary'
              }`}>
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* Lista de relatórios */}
      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state__icon">
            <span className="material-symbols-outlined">folder_open</span>
          </div>
          <p className="empty-state__title">Nenhum relatório encontrado</p>
          <p className="empty-state__desc">Gere relatórios mensais, trimestrais ou personalizados para acompanhar a evolução dos pacientes.</p>
        </div>
      ) : (
        <div className="card p-0 overflow-hidden">
          <div className="divide-y divide-border-soft">
            {filtered.map(report => (
              <div key={report.id}
                className="flex items-start gap-4 p-5 hover:bg-surface-low transition-colors cursor-pointer"
                onClick={() => setSelected(report)}
              >
                {/* Avatar */}
                <div className="w-10 h-10 rounded bg-neon-surface border border-border-neon flex items-center justify-center flex-shrink-0">
                  <span className="font-display font-bold text-olive text-sm">
                    {report.patient.split(' ').map(w => w[0]).slice(0,2).join('')}
                  </span>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <p className="font-bold text-sm text-text-primary">{report.patient}</p>
                    {report.aiGenerated && (
                      <span className="flex items-center gap-0.5 text-[9px] font-bold uppercase tracking-wide text-olive bg-neon-surface px-1.5 py-0.5 rounded">
                        <span className="material-symbols-outlined text-[10px]">auto_awesome</span>
                        IA
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-text-tertiary mb-2">{report.type} · {formatDate(report.date)} · {report.duration}</p>
                  <p className="text-xs text-text-secondary leading-relaxed line-clamp-2">{report.summary}</p>
                </div>

                {/* Status + ações */}
                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  <span className={`text-[9px] font-bold uppercase tracking-wide px-2 py-1 rounded whitespace-nowrap ${STATUS_CONFIG[report.status].color}`}>
                    {STATUS_CONFIG[report.status].label}
                  </span>
                  <div className="flex gap-1">
                    <button className="p-1.5 hover:bg-surface-high rounded transition-colors" title="Editar" onClick={e => { e.stopPropagation(); setSelected(report) }}>
                      <span className="material-symbols-outlined text-sm text-text-secondary">edit</span>
                    </button>
                    <button className="p-1.5 hover:bg-surface-high rounded transition-colors" title="Exportar PDF" onClick={e => e.stopPropagation()}>
                      <span className="material-symbols-outlined text-sm text-text-secondary">download</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
