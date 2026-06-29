import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { useAppointments, useCreateAppointment, useUpdateAppointment } from '@/hooks/use-appointments'
import { usePatients } from '@/hooks/use-patients'
import { useUser } from '@/hooks/use-auth'
import { appointmentToVM, type AppointmentVM as CalEvent } from '@/lib/view-models'
import { supabase } from '@/lib/supabase'

export const Route = createFileRoute('/dashboard/agenda')({
  component: AgendaPage,
})

// ── Types ─────────────────────────────────────────────────────────────────────
type Modality = 'presencial' | 'teleconsulta'
type Status   = 'confirmed' | 'scheduled' | 'completed' | 'cancelled'

// ── Helpers ───────────────────────────────────────────────────────────────────
const DAYS   = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb']
const MONTHS = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']

function pad(n: number) { return String(n).padStart(2,'0') }
function toDateStr(y: number, m: number, d: number) { return `${y}-${pad(m+1)}-${pad(d)}` }

const STATUS_COLOR: Record<Status, string> = {
  confirmed: 'bg-info text-white',
  scheduled: 'bg-warning text-dark',
  completed: 'bg-success text-white',
  cancelled: 'bg-danger text-white',
}
const STATUS_LABEL: Record<Status, string> = {
  confirmed: 'Confirmada', scheduled: 'Agendada', completed: 'Concluída', cancelled: 'Cancelada',
}
const MODALITY_ICON: Record<Modality, string> = {
  presencial: 'person', teleconsulta: 'video_call',
}

const TYPE_LABELS: Record<string, string> = {
  evaluation: 'Avaliação',
  session: 'Sessão Terapêutica',
  reevaluation: 'Reavaliação',
  family_meeting: 'Reunião Familiar',
  other: 'Outro',
}

const TYPE_TO_BACKEND: Record<string, 'evaluation' | 'session' | 'reevaluation' | 'family_meeting' | 'other'> = {
  'Avaliação': 'evaluation',
  'Terapia de Linguagem': 'session',
  'Atraso de Fala': 'session',
  'Gagueira': 'session',
  'TEA': 'session',
  'Disfonia': 'session',
  'Deglutição': 'session',
  'Dislexia': 'session',
  'Voz': 'session',
  'Motricidade Orofacial': 'session',
  'Sessão Terapêutica': 'session',
  'Reavaliação': 'reevaluation',
  'Reunião Familiar': 'family_meeting',
  'Outro': 'other',
}

// ── Mock data ─────────────────────────────────────────────────────────────────
// Removido — origem dos eventos agora é o backend via useAppointments()

// ── Google Calendar integration hook ─────────────────────────────────────────
// OAuth2 via Supabase Auth (provider: google, scope: https://www.googleapis.com/auth/calendar)
// O access_token é obtido via supabase.auth.getSession() → session.provider_token

type GCalStatus = 'disconnected' | 'connecting' | 'connected' | 'error'

function useGoogleCalendar() {
  const [status, setStatus]   = useState<GCalStatus>('disconnected')
  const [syncing, setSyncing] = useState(false)
  const [lastSync, setLastSync] = useState<Date | null>(null)

  const connect = useCallback(async () => {
    setStatus('connecting')
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        scopes: 'https://www.googleapis.com/auth/calendar',
        redirectTo: window.location.href,
      },
    })
    if (error) {
      setStatus('error')
      return
    }
    setStatus('connected')
    setLastSync(new Date())
  }, [])

  const disconnect = useCallback(() => {
    supabase.auth.signOut()
    setStatus('disconnected')
    setLastSync(null)
  }, [])

  const sync = useCallback(async () => {
    if (status !== 'connected') return
    setSyncing(true)
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.provider_token) {
      setSyncing(false)
      return
    }
    try {
      const now = new Date()
      const timeMin = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
      const timeMax = new Date(now.getFullYear(), now.getMonth() + 2, 0).toISOString()
      await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${timeMin}&timeMax=${timeMax}&singleEvents=true&orderBy=startTime`,
        { headers: { Authorization: `Bearer ${session.provider_token}` } }
      )
    } catch {
      // Google Calendar API call failed — non-critical
    }
    setSyncing(false)
    setLastSync(new Date())
  }, [status])

  useEffect(() => {
    if (status !== 'connected') return
    const id = setInterval(sync, 5 * 60 * 1000)
    return () => clearInterval(id)
  }, [status, sync])

  return { status, syncing, lastSync, connect, disconnect, sync }
}

// ── Google Calendar Banner ────────────────────────────────────────────────────
function GCalBanner({ gcal }: { gcal: ReturnType<typeof useGoogleCalendar> }) {
  if (gcal.status === 'connected') {
    return (
      <div className="flex items-center gap-3 px-4 py-2.5 bg-success-surface border border-success/20 text-sm">
        <span className="material-symbols-outlined text-base text-success" style={{ fontVariationSettings:'"FILL" 1' }}>sync</span>
        <div className="flex-1 min-w-0">
          <span className="font-medium text-success">Google Agenda conectado</span>
          {gcal.lastSync && (
            <span className="text-text-tertiary text-xs ml-2">
              Sincronizado {gcal.lastSync.toLocaleTimeString('pt-BR', { hour:'2-digit', minute:'2-digit' })}
            </span>
          )}
        </div>
        <button
          onClick={gcal.sync}
          disabled={gcal.syncing}
          className="flex items-center gap-1.5 px-3 py-1 text-xs font-bold text-success border border-success/30 hover:bg-success/10 transition-colors disabled:opacity-50"
        >
          <span className={`material-symbols-outlined text-sm ${gcal.syncing ? 'animate-spin' : ''}`}>refresh</span>
          {gcal.syncing ? 'Sincronizando...' : 'Sincronizar'}
        </button>
        <button
          onClick={gcal.disconnect}
          className="text-text-tertiary hover:text-danger transition-colors text-xs"
        >
          Desconectar
        </button>
      </div>
    )
  }

  if (gcal.status === 'connecting') {
    return (
      <div className="flex items-center gap-3 px-4 py-2.5 bg-info-surface border border-info/20 text-sm">
        <span className="material-symbols-outlined text-base text-info animate-spin">sync</span>
        <span className="font-medium text-info">Conectando ao Google Agenda...</span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3 px-4 py-2.5 bg-surface-low border border-border-soft text-sm">
      <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none">
        <path d="M19.5 3h-2.25V1.5h-1.5V3h-7.5V1.5h-1.5V3H4.5A1.5 1.5 0 003 4.5v15A1.5 1.5 0 004.5 21h15a1.5 1.5 0 001.5-1.5v-15A1.5 1.5 0 0019.5 3z" fill="#4285F4"/>
        <path d="M3 9h18v1.5H3V9z" fill="#4285F4"/>
        <rect x="7" y="13" width="2" height="2" rx="0.5" fill="#34A853"/>
        <rect x="11" y="13" width="2" height="2" rx="0.5" fill="#FBBC05"/>
        <rect x="15" y="13" width="2" height="2" rx="0.5" fill="#EA4335"/>
      </svg>
      <div className="flex-1 min-w-0">
        <span className="font-medium text-text-primary">Sincronize com Google Agenda</span>
        <span className="text-text-tertiary text-xs ml-2">Veja e crie eventos direto do celular</span>
      </div>
      <button
        onClick={gcal.connect}
        className="flex items-center gap-1.5 px-3 py-1 text-xs font-bold bg-dark text-neon hover:opacity-90 transition-opacity"
      >
        <span className="material-symbols-outlined text-sm">link</span>
        Conectar
      </button>
    </div>
  )
}

// ── Modal de novo agendamento ─────────────────────────────────────────────────
function NewAppointmentModal({
  onClose,
  onSave,
  defaultDate,
  syncToGCal,
  saving,
}: {
  onClose: () => void
  onSave: (input: { patientId: string; patient: string; type: string; date: string; time: string; endTime: string; modality: Modality; notes: string; addToGCal: boolean }) => void
  defaultDate: string
  syncToGCal: boolean
  saving: boolean
}) {
  const [form, setForm] = useState({
    patientId: '', patient: '', type: 'Sessão Terapêutica', date: defaultDate,
    time: '09:00', endTime: '09:50', modality: 'presencial' as Modality, notes: '', addToGCal: syncToGCal,
  })
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const patientsQuery = usePatients({ search: search.length >= 2 ? search : undefined, pageSize: 10 })
  const patients = patientsQuery.data?.data ?? []

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function selectPatient(p: { id: string; name: string }) {
    setForm(f => ({ ...f, patientId: p.id, patient: p.name }))
    setSearch(p.name)
    setOpen(false)
  }

  function save() {
    if (!form.patientId || !form.patient.trim() || saving) return
    onSave(form)
  }

  const isValid = form.patientId && form.patient.trim()

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="bg-surface shadow-[var(--shadow-dark)] w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 bg-dark border-b border-dark-border">
          <h2 className="font-display font-bold text-sm uppercase tracking-widest text-neon">Novo Agendamento</h2>
          <button onClick={onClose} className="text-white/50 hover:text-white transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <div className="p-6 flex flex-col gap-4 max-h-[80vh] overflow-y-auto">
          <div ref={ref} className="relative">
            <label className="section-label block mb-1.5">Paciente *</label>
            <input
              value={search}
              onChange={e => { setSearch(e.target.value); setOpen(true); setForm(f => ({...f, patientId: '', patient: ''})) }}
              onFocus={() => setOpen(true)}
              placeholder="Buscar paciente..."
              className="input w-full"
            />
            {open && search.length >= 2 && (
              <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-surface border border-border-soft shadow-lg max-h-48 overflow-y-auto">
                {patientsQuery.isLoading ? (
                  <div className="p-3 text-xs text-text-tertiary text-center">Buscando...</div>
                ) : patients.length === 0 ? (
                  <div className="p-3 text-xs text-text-tertiary text-center">Nenhum paciente encontrado</div>
                ) : (
                  patients.map(p => (
                    <button
                      key={p.id}
                      onClick={() => selectPatient(p)}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-surface-low transition-colors flex items-center gap-2"
                    >
                      <span className="w-6 h-6 rounded-full bg-neon-surface text-olive flex items-center justify-center text-[10px] font-bold">
                        {p.name.split(' ').map(w => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase()}
                      </span>
                      <div className="min-w-0">
                        <p className="font-medium text-text-primary truncate">{p.name}</p>
                        <p className="text-[10px] text-text-tertiary truncate">{p.phone ?? p.email ?? '—'}</p>
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}
            {form.patient && !open && (
              <div className="mt-1 flex items-center gap-2 px-2 py-1 bg-success-surface border border-success/20 text-xs text-success">
                <span className="material-symbols-outlined text-sm">check_circle</span>
                {form.patient}
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="section-label block mb-1.5">Data</label>
              <input type="date" value={form.date}
                onChange={e => setForm(f => ({...f, date: e.target.value}))}
                className="input w-full" />
            </div>
            <div>
              <label className="section-label block mb-1.5">Início</label>
              <input type="time" value={form.time}
                onChange={e => setForm(f => ({...f, time: e.target.value}))}
                className="input w-full" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="section-label block mb-1.5">Fim</label>
              <input type="time" value={form.endTime}
                onChange={e => setForm(f => ({...f, endTime: e.target.value}))}
                className="input w-full" />
            </div>
            <div>
              <label className="section-label block mb-1.5">Tipo de Sessão</label>
              <select value={form.type}
                onChange={e => setForm(f => ({...f, type: e.target.value}))}
                className="input w-full">
                {Object.entries(TYPE_LABELS).map(([value, label]) => (
                  <option key={value} value={label}>{label}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="section-label block mb-1.5">Modalidade</label>
            <div className="flex gap-2">
              {(['presencial','teleconsulta'] as Modality[]).map(m => (
                <button key={m}
                  onClick={() => setForm(f => ({...f, modality: m}))}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold uppercase tracking-wide border transition-colors ${
                    form.modality === m
                      ? 'bg-neon-surface border-border-neon text-olive'
                      : 'border-border-soft text-text-tertiary hover:border-border'
                  }`}
                >
                  <span className="material-symbols-outlined text-sm">{MODALITY_ICON[m]}</span>
                  {m}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="section-label block mb-1.5">Observações</label>
            <textarea value={form.notes}
              onChange={e => setForm(f => ({...f, notes: e.target.value}))}
              placeholder="Observações opcionais..."
              rows={2}
              className="input w-full resize-none" />
          </div>

          {/* Google Calendar toggle */}
          {syncToGCal && (
            <label className="flex items-center gap-3 cursor-pointer px-3 py-2.5 bg-success-surface border border-success/20">
              <input
                type="checkbox"
                checked={form.addToGCal}
                onChange={e => setForm(f => ({...f, addToGCal: e.target.checked}))}
                className="w-4 h-4 accent-[var(--color-olive)]"
              />
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <path d="M19.5 3h-2.25V1.5h-1.5V3h-7.5V1.5h-1.5V3H4.5A1.5 1.5 0 003 4.5v15A1.5 1.5 0 004.5 21h15a1.5 1.5 0 001.5-1.5v-15A1.5 1.5 0 0019.5 3z" fill="#4285F4"/>
                </svg>
                <span className="text-xs font-medium text-text-primary">Adicionar ao Google Agenda</span>
              </div>
            </label>
          )}

          <div className="flex gap-3 pt-2">
            <button onClick={onClose} className="flex-1 btn-outline">Cancelar</button>
            <button onClick={save} disabled={!isValid || saving} className="flex-1 btn-primary disabled:opacity-50">
              {saving ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Salvando...
                </span>
              ) : (
                <>Agendar{form.addToGCal && <span className="ml-1 text-[10px] opacity-70">+ Google</span>}</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Componente principal ──────────────────────────────────────────────────────
function AgendaPage() {
  const today    = new Date()
  const navigate = useNavigate()
  const gcal     = useGoogleCalendar()
  const { user } = useUser()

  const [view, setView]           = useState<'month'|'week'>('week')
  const [year, setYear]           = useState(today.getFullYear())
  const [month, setMonth]         = useState(today.getMonth())
  const [selectedDate, setSelectedDate] = useState(toDateStr(today.getFullYear(), today.getMonth(), today.getDate()))
  const [showModal, setShowModal] = useState(false)
  const [errorMsg, setErrorMsg]   = useState<string | null>(null)

  // Janela de busca: 60 dias antes ↔ 90 dias depois para cobrir navegação razoável
  const range = useMemo(() => {
    const now = new Date()
    const start = new Date(now)
    start.setDate(start.getDate() - 60)
    const end = new Date(now)
    end.setDate(end.getDate() + 90)
    return {
      startDate: start.toISOString(),
      endDate: end.toISOString(),
    }
  }, [])
  const apptQuery = useAppointments({ ...range, pageSize: 200 })
  const createAppt = useCreateAppointment()
  const updateAppt = useUpdateAppointment()
  const events: CalEvent[] = useMemo(
    () => (apptQuery.data?.data ?? []).map(appointmentToVM),
    [apptQuery.data],
  )

  const therapistName = user?.user_metadata?.full_name ?? user?.user_metadata?.name ?? ''

  function cancelEvent(id: string) {
    if (!window.confirm('Cancelar esta sessão?')) return
    updateAppt.mutate({ id, body: { status: 'cancelled' } })
  }

  function addEvent(input: { patientId: string; patient: string; type: string; date: string; time: string; endTime: string; modality: Modality; notes: string; addToGCal: boolean }) {
    setErrorMsg(null)
    const backendType = TYPE_TO_BACKEND[input.type] ?? 'session'
    const dateTime = new Date(`${input.date}T${input.time}:00`).toISOString()
    const duration = (() => {
      const [h1, m1] = input.time.split(':').map(Number)
      const [h2, m2] = input.endTime.split(':').map(Number)
      return (h2 * 60 + m2) - (h1 * 60 + m1)
    })()
    createAppt.mutate(
      {
        patientId: input.patientId,
        patientName: input.patient,
        therapistName: therapistName || 'Profissional',
        dateTime,
        duration: Math.max(duration, 15),
        type: backendType,
        notes: input.notes || undefined,
      },
      {
        onSuccess: () => {
          setSelectedDate(input.date)
          setShowModal(false)
        },
        onError: (err) => {
          const message = err instanceof Error ? err.message : 'Erro ao criar agendamento'
          setErrorMsg(message)
        },
      },
    )
  }

  function prevMonth() { if (month === 0) { setMonth(11); setYear(y => y-1) } else setMonth(m => m-1) }
  function nextMonth() { if (month === 11) { setMonth(0); setYear(y => y+1) } else setMonth(m => m+1) }

  function getWeekDates(dateStr: string) {
    const d = new Date(dateStr + 'T00:00:00')
    const dow = d.getDay()
    return Array.from({length:7}, (_, i) => {
      const dd = new Date(d)
      dd.setDate(d.getDate() - dow + i)
      return toDateStr(dd.getFullYear(), dd.getMonth(), dd.getDate())
    })
  }

  function getMonthDays() {
    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month+1, 0).getDate()
    const days: (number|null)[] = Array(firstDay).fill(null)
    for (let d = 1; d <= daysInMonth; d++) days.push(d)
    while (days.length % 7 !== 0) days.push(null)
    return days
  }

  const eventsForDate  = useCallback((d: string) => events.filter(e => e.date === d), [events])
  const todayStr       = toDateStr(today.getFullYear(), today.getMonth(), today.getDate())
  const weekDates      = getWeekDates(selectedDate)
  const monthDays      = getMonthDays()
  const selectedEvents = eventsForDate(selectedDate)
  const gcalCount      = events.filter(e => e.googleEventId).length

  if (apptQuery.isLoading) {
    return (
      <div className="flex flex-col gap-6 p-6">
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 border-2 border-olive border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-text-tertiary">Carregando agenda...</span>
        </div>
      </div>
    )
  }

  if (apptQuery.isError) {
    return (
      <div className="flex flex-col gap-6 p-6">
        <div className="card p-6">
          <div className="flex flex-col items-center gap-3 text-center">
            <span className="material-symbols-outlined text-3xl text-error">error</span>
            <p className="text-sm font-bold text-text-primary">Erro ao carregar agenda</p>
            <p className="text-xs text-text-tertiary">{apptQuery.error?.message ?? 'Tente novamente mais tarde.'}</p>
            <button onClick={() => apptQuery.refetch()} className="btn-primary text-sm mt-2">Tentar novamente</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-0 p-6">
      {showModal && (
        <NewAppointmentModal
          onClose={() => { setShowModal(false); setErrorMsg(null) }}
          onSave={addEvent}
          defaultDate={selectedDate}
          syncToGCal={gcal.status === 'connected'}
          saving={createAppt.isPending}
        />
      )}

      {errorMsg && (
        <div className="mb-4 px-4 py-3 bg-danger-surface border border-danger/20 text-sm text-danger flex items-center gap-2">
          <span className="material-symbols-outlined text-base">error</span>
          <span>{errorMsg}</span>
          <button onClick={() => setErrorMsg(null)} className="ml-auto text-danger/60 hover:text-danger">
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>
      )}

      {/* Google Calendar banner */}
      <div className="mb-4">
        <GCalBanner gcal={gcal} />
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display font-bold text-2xl uppercase tracking-wider text-text-primary">Agenda</h1>
          <p className="text-sm text-text-secondary mt-0.5">
            {events.filter(e => e.status !== 'cancelled').length} sessões ativas
            {gcal.status === 'connected' && (
              <span className="ml-2 inline-flex items-center gap-1 text-success">
                <span className="material-symbols-outlined text-xs">sync</span>
                {gcalCount} do Google Agenda
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex border border-border-soft overflow-hidden">
            {(['week','month'] as const).map(v => (
              <button key={v} onClick={() => setView(v)}
                className={`px-4 py-2 text-xs font-bold uppercase tracking-wide transition-colors ${
                  view === v ? 'bg-dark text-neon' : 'bg-surface text-text-tertiary hover:text-text-primary'
                }`}>
                {v === 'week' ? 'Semana' : 'Mês'}
              </button>
            ))}
          </div>
          <button onClick={() => { setSelectedDate(todayStr); setYear(today.getFullYear()); setMonth(today.getMonth()) }}
            className="btn-outline text-xs px-3 py-2">
            Hoje
          </button>
          <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">add</span>
            Novo Agendamento
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Calendário ── */}
        <div className="lg:col-span-2 flex flex-col gap-4">

          {/* Navegação mês */}
          <div className="card p-4 flex items-center justify-between">
            <button onClick={prevMonth} className="p-1 hover:bg-surface-low transition-colors">
              <span className="material-symbols-outlined text-text-tertiary">chevron_left</span>
            </button>
            <h2 className="font-display font-bold text-sm uppercase tracking-widest text-text-primary">
              {MONTHS[month]} {year}
            </h2>
            <button onClick={nextMonth} className="p-1 hover:bg-surface-low transition-colors">
              <span className="material-symbols-outlined text-text-tertiary">chevron_right</span>
            </button>
          </div>

          {view === 'month' ? (
            <div className="card overflow-hidden">
              <div className="grid grid-cols-7 border-b border-border-soft">
                {DAYS.map(d => (
                  <div key={d} className="py-2 text-center text-[10px] font-bold uppercase tracking-wider text-text-tertiary">{d}</div>
                ))}
              </div>
              <div className="grid grid-cols-7">
                {monthDays.map((day, i) => {
                  const dateStr = day ? toDateStr(year, month, day) : ''
                  const dayEvs  = day ? eventsForDate(dateStr) : []
                  const isToday = dateStr === todayStr
                  const isSel   = dateStr === selectedDate
                  return (
                    <button key={i} disabled={!day}
                      onClick={() => day && setSelectedDate(dateStr)}
                      className={`min-h-[72px] p-1.5 text-left border-b border-r border-border-soft transition-colors ${
                        !day ? 'bg-surface-low' :
                        isSel ? 'bg-neon-surface' :
                        isToday ? 'bg-dark/5' :
                        'hover:bg-surface-low'
                      }`}
                    >
                      {day && (
                        <>
                          <div className="flex items-center gap-1">
                            <span className={`text-xs font-bold leading-none ${
                              isToday ? 'inline-flex items-center justify-center w-5 h-5 bg-dark text-neon rounded-full' :
                              isSel ? 'text-olive' : 'text-text-secondary'
                            }`}>{day}</span>
                            {dayEvs.some(e => e.googleEventId) && (
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" title="Sincronizado com Google Agenda" />
                            )}
                          </div>
                          <div className="mt-1 flex flex-col gap-0.5">
                            {dayEvs.slice(0,2).map(ev => (
                              <div key={ev.id} className={`text-[9px] px-1 py-px truncate font-bold ${
                                ev.status === 'completed' ? 'bg-success/20 text-success' :
                                ev.status === 'confirmed' ? 'bg-info/20 text-info' :
                                ev.status === 'cancelled' ? 'bg-danger/20 text-danger' :
                                'bg-warning/20 text-warning'
                              }`}>
                                {ev.time} {ev.patient.split(' ')[0]}
                              </div>
                            ))}
                            {dayEvs.length > 2 && (
                              <div className="text-[9px] text-text-tertiary px-1">+{dayEvs.length-2}</div>
                            )}
                          </div>
                        </>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          ) : (
            /* Vista semanal */
            <div className="card overflow-hidden">
              <div className="grid grid-cols-7 border-b border-border-soft">
                {weekDates.map(dateStr => {
                  const d      = new Date(dateStr + 'T00:00:00')
                  const isToday = dateStr === todayStr
                  const isSel   = dateStr === selectedDate
                  const hasGcal = eventsForDate(dateStr).some(e => e.googleEventId)
                  return (
                    <button key={dateStr}
                      onClick={() => setSelectedDate(dateStr)}
                      className={`py-3 flex flex-col items-center gap-1 transition-colors ${isSel ? 'bg-dark' : 'hover:bg-surface-low'}`}
                    >
                      <span className={`text-[10px] font-bold uppercase tracking-wider ${isSel ? 'text-neon/60' : 'text-text-tertiary'}`}>
                        {DAYS[d.getDay()]}
                      </span>
                      <span className={`flex items-center justify-center w-7 h-7 text-sm font-bold rounded-full ${
                        isToday && isSel ? 'bg-neon text-dark' :
                        isToday ? 'bg-dark text-neon' :
                        isSel ? 'bg-neon/20 text-neon' :
                        'text-text-primary'
                      }`}>{d.getDate()}</span>
                      <div className="flex gap-0.5 flex-wrap justify-center">
                        {eventsForDate(dateStr).map(ev => (
                          <div key={ev.id} className={`w-1.5 h-1.5 rounded-full ${
                            ev.status === 'completed' ? 'bg-success' :
                            ev.status === 'confirmed' ? 'bg-info' :
                            ev.status === 'cancelled' ? 'bg-danger' : 'bg-warning'
                          }`} />
                        ))}
                        {hasGcal && <div className="w-1.5 h-1.5 rounded-full bg-blue-400 border border-blue-600" title="Google Agenda" />}
                      </div>
                    </button>
                  )
                })}
              </div>
              <div className="overflow-y-auto max-h-[480px]">
                {Array.from({length: 12}, (_, i) => {
                  const hour = i + 7
                  const timeStr = `${pad(hour)}:00`
                  return (
                    <div key={hour} className="grid grid-cols-[3rem_1fr] border-b border-border-soft min-h-[56px]">
                      <div className="flex items-start justify-end pr-2 pt-1">
                        <span className="text-[10px] text-text-tertiary">{timeStr}</span>
                      </div>
                      <div className="grid grid-cols-7 border-l border-border-soft">
                        {weekDates.map(dateStr => {
                          const ev = events.find(e => e.date === dateStr && e.time.startsWith(pad(hour)))
                          return (
                            <div key={dateStr}
                              className={`border-r border-border-soft last:border-r-0 p-0.5 cursor-pointer ${
                                dateStr === selectedDate ? 'bg-neon-surface/50' : 'hover:bg-surface-low'
                              }`}
                              onClick={() => { setSelectedDate(dateStr); if (!ev) setShowModal(true) }}
                            >
                              {ev && (
                                <div className={`w-full text-left p-1 text-[9px] font-bold leading-tight ${
                                  ev.status === 'completed' ? 'bg-success/20 text-success' :
                                  ev.status === 'confirmed' ? 'bg-info/20 text-info' :
                                  ev.status === 'cancelled' ? 'bg-danger/20 text-danger' :
                                  'bg-warning/20 text-warning'
                                }`}>
                                  <p className="truncate">{ev.patient.split(' ')[0]}</p>
                                  <p className="font-normal opacity-70 truncate">{ev.type}</p>
                                  {ev.googleEventId && (
                                    <div className="flex items-center gap-0.5 mt-0.5 opacity-60">
                                      <div className="w-1 h-1 rounded-full bg-blue-500" />
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* ── Painel direito ── */}
        <div className="flex flex-col gap-4">

          {/* Sessões do dia */}
          <div className="card p-0 overflow-hidden">
            <div className="px-4 py-3 bg-dark flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-neon/60">Sessões do dia</p>
                <p className="font-display font-bold text-sm text-white">
                  {new Date(selectedDate + 'T00:00:00').toLocaleDateString('pt-BR', {weekday:'long',day:'numeric',month:'short'})}
                </p>
              </div>
              <span className="flex items-center justify-center w-7 h-7 bg-neon/10 border border-neon/20 font-display font-bold text-sm text-neon">
                {selectedEvents.length}
              </span>
            </div>

            {selectedEvents.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state__icon">
                  <span className="material-symbols-outlined">event_available</span>
                </div>
                <p className="empty-state__title">Nenhuma sessão neste dia</p>
                <p className="empty-state__desc">Aproveite para agendar um novo atendimento ou bloquear o horário.</p>
                <div className="empty-state__actions">
                  <button onClick={() => setShowModal(true)} className="bk-btn bk-btn-primary">
                    <span className="material-symbols-outlined" style={{ fontSize: 16 }}>add</span>
                    Agendar sessão
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col divide-y divide-border-soft">
                {selectedEvents.map((ev, idx) => (
                  <div key={ev.id} className="flex items-start gap-3 p-4 hover:bg-surface-low transition-colors">
                    <div className="flex flex-col items-center min-w-[2.5rem]">
                      <span className="font-display font-bold text-xs text-text-primary">{ev.time}</span>
                      <div className="w-px flex-1 bg-border-soft my-1 min-h-[20px]" />
                      <span className="text-[9px] text-text-tertiary">{ev.endTime}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className={`text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 ${STATUS_COLOR[ev.status]}`}>
                          {STATUS_LABEL[ev.status]}
                        </span>
                        <span className="material-symbols-outlined text-sm text-text-secondary" title={ev.modality}>
                          {MODALITY_ICON[ev.modality]}
                        </span>
                        {ev.googleEventId && (
                          <span title="Sincronizado com Google Agenda" className="text-[9px] text-blue-500 flex items-center gap-0.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                            GCal
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-bold text-text-primary truncate">{ev.patient}</p>
                      <p className="text-xs text-text-tertiary truncate">{ev.type}</p>
                      {ev.notes && <p className="text-xs text-text-tertiary italic truncate mt-0.5">{ev.notes}</p>}
                      {ev.status !== 'completed' && ev.status !== 'cancelled' && (
                        <div className="flex gap-3 mt-2">
                          <button
                            onClick={() => navigate({ to: '/dashboard/sessao' })}
                            className="text-[10px] font-bold text-olive hover:underline">
                            Iniciar
                          </button>
                          {ev.modality === 'teleconsulta' && (
                            <button
                              onClick={() => navigate({ to: '/dashboard/teleconsulta' })}
                              className="text-[10px] font-bold text-info hover:underline">
                              Link
                            </button>
                          )}
                          <button
                            onClick={() => cancelEvent(ev.id)}
                            className="text-[10px] text-text-tertiary hover:text-danger transition-colors">
                            Cancelar
                          </button>
                        </div>
                      )}
                    </div>
                    <span className="text-[10px] font-bold text-text-tertiary">{String(idx+1).padStart(2,'0')}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Stats do dia */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label:'Concluídas', value: selectedEvents.filter(e=>e.status==='completed').length, icon:'task_alt',    color:'text-success' },
              { label:'Confirmadas', value: selectedEvents.filter(e=>e.status==='confirmed').length, icon:'check_circle', color:'text-info' },
              { label:'Aguardando', value: selectedEvents.filter(e=>e.status==='scheduled').length, icon:'schedule',    color:'text-warning' },
              { label:'Canceladas', value: selectedEvents.filter(e=>e.status==='cancelled').length, icon:'cancel',      color:'text-danger' },
            ].map(stat => (
              <div key={stat.label} className="card p-3 flex flex-col gap-1">
                <span className={`material-symbols-outlined text-lg ${stat.color}`}>{stat.icon}</span>
                <p className="font-display font-bold text-xl text-text-primary">{stat.value}</p>
                <p className="text-[10px] font-bold uppercase tracking-wide text-text-tertiary">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Legenda Google Calendar */}
          {gcal.status === 'connected' && (
            <div className="card p-3">
              <p className="section-label mb-2">Legenda</p>
              <div className="flex flex-col gap-1.5 text-xs text-text-secondary">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  <span>Evento do Google Agenda</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-success rounded-full" />
                  <span>Sessão concluída</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-info rounded-full" />
                  <span>Confirmada</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-warning rounded-full" />
                  <span>Aguardando confirmação</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
