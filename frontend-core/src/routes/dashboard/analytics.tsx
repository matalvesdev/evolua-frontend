import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { useDashboardAnalytics } from '@/hooks/use-dashboard'
import type { AnalyticsSeries } from '@/hooks/use-dashboard'

export const Route = createFileRoute('/dashboard/analytics')({
  component: AnalyticsPage,
})

type Period = '7d' | '30d' | '90d' | '12m'

const PERIODS: Period[] = ['7d', '30d', '90d', '12m']

function sum(values: number[]) {
  return values.reduce((total, value) => total + value, 0)
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(value)
}

function formatRate(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'percent',
    maximumFractionDigits: 1,
  }).format(value)
}

function formatDateLabel(value: string) {
  const parts = value.split('-')
  return parts.length === 3 ? `${parts[2]}/${parts[1]}` : value
}

function KPI({ icon, label, value, sub, color }: {
  icon: string
  label: string
  value: string
  sub: string
  color: string
}) {
  return (
    <div className="metric-band__item">
      <span className={`metric-band__icon material-symbols-outlined text-base ${color}`}>{icon}</span>
      <div className="min-w-0">
        <p className="truncate text-[10px] font-bold uppercase tracking-wide text-text-tertiary">{label}</p>
        <p className="font-display text-2xl font-bold text-text-primary">{value}</p>
        <p className="truncate text-xs text-text-tertiary">{sub}</p>
      </div>
    </div>
  )
}

function BarChart({ series, label, barClass }: {
  series: AnalyticsSeries
  label: string
  barClass: string
}) {
  if (series.values.length === 0 || sum(series.values) === 0) {
    return (
      <div className="empty-state h-40">
        <span className="material-symbols-outlined empty-state__icon">bar_chart</span>
        <p className="text-sm text-text-secondary">Sem dados no período</p>
      </div>
    )
  }

  const maxValue = Math.max(...series.values, 1)
  const chartWidth = Math.max(series.values.length * 14, 280)

  return (
    <div className="overflow-x-auto" role="img" aria-label={label}>
      <svg width={chartWidth} height="144" viewBox={`0 0 ${chartWidth} 144`} className="block max-w-none">
        {series.values.map((value, index) => {
          const height = Math.max((value / maxValue) * 112, 2)
          return (
            <rect
              key={`${series.labels[index]}-${index}`}
              x={index * 14 + 2}
              y={120 - height}
              width="10"
              height={height}
              rx="2"
              className={barClass}
            >
              <title>{`${formatDateLabel(series.labels[index] ?? '')}: ${value}`}</title>
            </rect>
          )
        })}
        <text x="2" y="140" className="fill-text-tertiary text-[10px]">
          {formatDateLabel(series.labels[0] ?? '')}
        </text>
        <text x={chartWidth - 2} y="140" textAnchor="end" className="fill-text-tertiary text-[10px]">
          {formatDateLabel(series.labels.at(-1) ?? '')}
        </text>
      </svg>
    </div>
  )
}

function AnalyticsPage() {
  const [period, setPeriod] = useState<Period>('30d')
  const { data: analytics, isLoading, error, refetch } = useDashboardAnalytics(period)

  if (error) {
    return (
      <div className="dashboard-content">
        <div className="card p-8 text-center">
          <span className="material-symbols-outlined text-4xl text-error">error</span>
          <p className="mt-2 text-sm text-text-secondary">Erro ao carregar analytics</p>
          <p className="mt-1 text-xs text-text-tertiary">{error.message}</p>
          <button onClick={() => void refetch()} className="btn-primary mt-4 px-4 py-2 text-sm">
            Tentar novamente
          </button>
        </div>
      </div>
    )
  }

  const appointmentTotal = sum(analytics?.appointments.values ?? [])
  const revenueTotal = sum(analytics?.revenue.values ?? [])
  const newPatientTotal = sum(analytics?.newPatients.values ?? [])
  const cancellationRate = analytics?.cancellationRate ?? 0
  const noShowRate = analytics?.noShowRate ?? 0

  return (
    <div className="dashboard-content flex flex-col gap-5">
      <div className="page-header mb-0">
        <div className="page-header__main">
          <p className="page-header__eyebrow">Visão da operação</p>
          <h1 className="page-header__title">Analytics</h1>
          <p className="page-header__sub">Indicadores operacionais agregados da clínica</p>
        </div>
        <div className="dashboard-toolbar p-1">
          {PERIODS.map((item) => (
            <button
              key={item}
              onClick={() => setPeriod(item)}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wide transition-colors ${
                period === item ? 'bg-dark text-neon' : 'bg-surface text-text-tertiary hover:text-text-primary'
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <div className="metric-band grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <KPI icon="event" label="Agendamentos" value={isLoading ? '…' : String(appointmentTotal)} sub="no período" color="text-success" />
        <KPI icon="payments" label="Receita" value={isLoading ? '…' : formatCurrency(revenueTotal)} sub="recebida no período" color="text-olive" />
        <KPI icon="person_add" label="Novos pacientes" value={isLoading ? '…' : String(newPatientTotal)} sub="cadastrados no período" color="text-info" />
        <KPI icon="event_busy" label="Cancelamentos" value={isLoading ? '…' : formatRate(cancellationRate)} sub="dos agendamentos" color="text-warning" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="card flex flex-col gap-4 p-5 lg:col-span-2">
          <div className="flex items-center justify-between">
            <p className="dashboard-panel-title">Agendamentos ao longo do período</p>
            <p className="text-xs text-text-tertiary">{period}</p>
          </div>
          <BarChart
            series={analytics?.appointments ?? { labels: [], values: [] }}
            label="Quantidade de agendamentos por dia"
            barClass="fill-neon"
          />
        </div>

        <div className="card flex flex-col gap-4 p-5">
          <p className="dashboard-panel-title">Tipos mais frequentes</p>
          {!analytics?.topProcedures.length ? (
            <p className="text-sm text-text-secondary">Sem agendamentos no período</p>
          ) : (
            <div className="flex flex-col gap-3">
              {analytics.topProcedures.map((procedure, index) => (
                <div key={procedure.name} className="flex items-center gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-surface-high text-xs font-bold text-text-secondary">
                    {index + 1}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm text-text-secondary">{procedure.name}</span>
                  <span className="badge">{procedure.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="card flex flex-col gap-4 p-5">
          <p className="dashboard-panel-title">Novos pacientes</p>
          <BarChart
            series={analytics?.newPatients ?? { labels: [], values: [] }}
            label="Novos pacientes cadastrados por dia"
            barClass="fill-info"
          />
        </div>

        <div className="card flex flex-col gap-4 p-5">
          <p className="dashboard-panel-title">Qualidade da agenda</p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-border-soft bg-surface-low p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-text-tertiary">Cancelamentos</p>
              <p className="mt-2 font-display text-3xl font-bold text-text-primary">{formatRate(cancellationRate)}</p>
              <p className="mt-1 text-xs text-text-tertiary">no período selecionado</p>
            </div>
            <div className="rounded-xl border border-border-soft bg-surface-low p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-text-tertiary">Faltas</p>
              <p className="mt-2 font-display text-3xl font-bold text-text-primary">{formatRate(noShowRate)}</p>
              <p className="mt-1 text-xs text-text-tertiary">no período selecionado</p>
            </div>
          </div>
          <p className="text-xs text-text-tertiary">Percentuais calculados apenas sobre agendamentos registrados.</p>
        </div>
      </div>

      <div className="card flex flex-col gap-4 p-5">
        <div className="flex items-center justify-between">
          <p className="dashboard-panel-title">Receita recebida</p>
          <span className="text-xs font-bold text-olive">{formatCurrency(revenueTotal)}</span>
        </div>
        <BarChart
          series={analytics?.revenue ?? { labels: [], values: [] }}
          label="Receita recebida por dia"
          barClass="fill-olive"
        />
      </div>
    </div>
  )
}
