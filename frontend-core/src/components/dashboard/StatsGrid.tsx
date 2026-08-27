import { useDashboardStats } from '@/hooks/use-dashboard'

export function StatsGrid() {
  const { data: stats } = useDashboardStats()

  const sessionsToday  = stats?.todayPendingCount ?? 0
  const sessionsWeek   = stats?.weekAppointmentsCount ?? 0
  const activePatients = stats?.activePatientsCount ?? 0
  const pendingReports = stats?.pendingReportsCount ?? 0
  const revenue = stats?.monthRevenue
    ? `R$\u00a0${(stats.monthRevenue / 100).toLocaleString('pt-BR', { minimumFractionDigits: 0 })}`
    : 'R$\u00a0—'
  const revenueGrowth = stats?.monthRevenueGrowth ?? null

  const metrics = [
    {
      label: 'Receita do mês',
      value: revenue,
      detail: revenueGrowth === null
        ? 'Sem comparação disponível'
        : `${revenueGrowth >= 0 ? '+' : ''}${revenueGrowth}% vs. mês anterior`,
      icon: 'payments',
      detailClass: revenueGrowth !== null && revenueGrowth < 0 ? 'text-danger' : 'text-success',
    },
    {
      label: 'Sessões hoje',
      value: sessionsToday === 0 ? '—' : String(sessionsToday),
      detail: sessionsToday === 1 ? 'sessão pendente' : 'sessões pendentes',
      icon: 'today',
      detailClass: 'text-text-tertiary',
    },
    {
      label: 'Agenda da semana',
      value: sessionsWeek === 0 ? '—' : String(sessionsWeek),
      detail: sessionsWeek === 1 ? 'sessão agendada' : 'sessões agendadas',
      icon: 'calendar_month',
      detailClass: 'text-text-tertiary',
    },
    {
      label: 'Pacientes ativos',
      value: activePatients === 0 ? '—' : String(activePatients),
      detail: 'em acompanhamento',
      icon: 'groups',
      detailClass: 'text-text-tertiary',
    },
    {
      label: 'Relatórios IA',
      value: String(pendingReports),
      detail: pendingReports === 0 ? 'todos revisados' : `${pendingReports} aguardando revisão`,
      icon: 'rate_review',
      detailClass: pendingReports === 0 ? 'text-success' : 'text-warning',
    },
  ]

  return (
    <section className="card p-0 overflow-hidden" aria-label="Indicadores do consultório">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5">
        {metrics.map((metric, index) => (
          <article
            key={metric.label}
            className={`flex min-h-[104px] items-center gap-3 px-4 py-4 xl:px-5 ${
              index < metrics.length - 1 ? 'border-b xl:border-b-0 xl:border-r border-border-soft' : ''
            }`}
          >
            <div className="icon-tile">
              <span
                className="material-symbols-outlined text-lg"
                style={{ fontVariationSettings: '"FILL" 1, "wght" 400' }}
              >
                {metric.icon}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-[11px] text-text-tertiary leading-tight">{metric.label}</p>
              <p className="mt-1 font-display text-[22px] font-medium leading-none tracking-[-0.035em] text-text-primary tabular-nums">
                {metric.value}
              </p>
              <p className={`mt-1.5 text-[10px] font-medium leading-tight ${metric.detailClass}`}>
                {metric.detail}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
