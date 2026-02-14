"use client"

import * as React from "react"
import { useParams, usePathname } from "next/navigation"
import Link from "next/link"
import { usePatient, usePatientReports } from "@/hooks"
import { getInitials } from "@/components/patients/patient-utils"
import {
  formatReportType,
  formatReportDate,
} from "@/components/patient-profile/patient-profile-utils"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"

const NAV_TABS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/dashboard/pacientes", label: "Pacientes" },
  { href: "/dashboard/agendamentos", label: "Agenda" },
  { href: "/dashboard/financeiro", label: "Financeiro" },
  { href: "/dashboard/relatorios", label: "Relatórios" },
  { href: "/dashboard/configuracoes", label: "Configurações" },
]

const CATEGORY_FILTERS = [
  { key: "all", label: "Todos", icon: "folder" },
  { key: "evaluation", label: "Relatórios", icon: "description" },
  { key: "evolution", label: "Exames", icon: "biotech" },
  { key: "anamnese", label: "Anamneses", icon: "assignment" },
  { key: "audio", label: "Áudios", icon: "mic" },
]

function getCategoryBadge(type: string): { label: string; bg: string; text: string } {
  const map: Record<string, { label: string; bg: string; text: string }> = {
    evaluation: { label: "Relatório", bg: "bg-purple-100", text: "text-[#8A05BE]" },
    evolution: { label: "Evolução", bg: "bg-blue-100", text: "text-blue-700" },
    progress: { label: "Progresso", bg: "bg-green-100", text: "text-green-700" },
    discharge: { label: "Alta", bg: "bg-slate-100", text: "text-slate-600" },
    monthly: { label: "Mensal", bg: "bg-amber-100", text: "text-amber-700" },
    school: { label: "Escolar", bg: "bg-teal-100", text: "text-teal-700" },
    medical: { label: "Médico", bg: "bg-red-100", text: "text-red-600" },
    custom: { label: "Personalizado", bg: "bg-gray-100", text: "text-gray-600" },
  }
  return map[type] || { label: formatReportType(type), bg: "bg-gray-100", text: "text-gray-600" }
}

function getFileIcon(type: string): { icon: string; bg: string; color: string } {
  const map: Record<string, { icon: string; bg: string; color: string }> = {
    evaluation: { icon: "picture_as_pdf", bg: "bg-red-50", color: "text-red-500" },
    evolution: { icon: "description", bg: "bg-blue-50", color: "text-blue-500" },
    progress: { icon: "trending_up", bg: "bg-green-50", color: "text-green-500" },
    discharge: { icon: "verified", bg: "bg-slate-50", color: "text-slate-500" },
    monthly: { icon: "calendar_month", bg: "bg-amber-50", color: "text-amber-500" },
  }
  return map[type] || { icon: "folder", bg: "bg-purple-50", color: "text-[#8A05BE]" }
}

export default function DocumentsPage() {
  const params = useParams()
  const pathname = usePathname()
  const patientId = params.id as string
  const { patient, loading } = usePatient(patientId)
  const { reports, total, loading: reportsLoading } = usePatientReports(patientId)

  const [searchQuery, setSearchQuery] = React.useState("")
  const [activeFilter, setActiveFilter] = React.useState("all")

  const filteredReports = React.useMemo(() => {
    let filtered = reports
    if (activeFilter !== "all") {
      filtered = filtered.filter((r) => r.type === activeFilter)
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (r) =>
          r.title?.toLowerCase().includes(q) ||
          r.type?.toLowerCase().includes(q) ||
          r.patientName?.toLowerCase().includes(q)
      )
    }
    return filtered
  }, [reports, activeFilter, searchQuery])

  const age = patient?.birthDate
    ? Math.floor((new Date().getTime() - new Date(patient.birthDate).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
    : null

  const initials = patient ? getInitials(patient.name) : "?"
  const diagnosis = patient?.medicalHistory?.diagnosis?.[0] || "—"

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <span className="material-symbols-outlined animate-spin text-[#8A05BE] text-3xl">progress_activity</span>
          <p className="text-gray-500 mt-3 text-sm">Carregando documentos...</p>
        </div>
      </div>
    )
  }

  if (!patient) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="glass-panel p-8 text-center max-w-md rounded-2xl">
          <span className="material-symbols-outlined text-5xl text-gray-300 mb-4">person_off</span>
          <p className="text-red-600 mb-4">Paciente não encontrado</p>
          <Link href="/dashboard/pacientes">
            <button className="px-4 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50 transition-colors">Voltar para lista</button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <>
      <DashboardHeader />

      {/* Navigation tabs */}
      <nav className="px-6 lg:px-10 bg-transparent mb-6 hidden md:block">
        <div className="flex items-center justify-center gap-8">
          {NAV_TABS.map((item) => {
            const isActive = item.href === "/dashboard/pacientes"
              ? pathname.startsWith("/dashboard/pacientes")
              : item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-1 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  isActive
                    ? "border-[#8A05BE] text-gray-900"
                    : "border-transparent text-gray-500 hover:text-[#8A05BE] hover:border-[#8A05BE]/30"
                }`}
              >
                {item.label}
              </Link>
            )
          })}
        </div>
      </nav>

      <main className="flex-1 overflow-y-auto p-6 lg:p-10 scroll-smooth pb-24">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-6 text-sm text-gray-500">
          <Link href="/dashboard/pacientes" className="hover:text-[#8A05BE] transition-colors flex items-center gap-1">
            <span className="material-symbols-outlined text-base">arrow_back</span>
            Voltar
          </Link>
          <span>/</span>
          <span>Pacientes</span>
          <span>/</span>
          <Link href={`/dashboard/pacientes/${patientId}`} className="hover:text-[#8A05BE] transition-colors">
            {patient.name}
          </Link>
          <span>/</span>
          <span className="text-[#8A05BE] font-medium">Documentos</span>
        </div>

        {/* Patient mini-header card */}
        <div className="glass-panel rounded-2xl p-5 shadow-[0_4px_30px_rgba(0,0,0,0.05)] mb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xl border-2 border-white shadow-sm">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-bold text-gray-900">{patient.name}</h2>
              <p className="text-sm text-gray-500">{diagnosis}{age !== null ? ` • ${age} anos` : ""}</p>
            </div>
            <div className="hidden sm:flex items-center gap-6 text-sm text-gray-500">
              <div className="text-center">
                <span className="text-xs uppercase tracking-wider text-gray-400 block">Última Sessão</span>
                <span className="font-medium text-gray-700">—</span>
              </div>
              <div className="text-center">
                <span className="text-xs uppercase tracking-wider text-gray-400 block">Plano</span>
                <span className="font-medium text-gray-700">Ativo</span>
              </div>
            </div>
          </div>
        </div>

        {/* Documents panel */}
        <div className="glass-panel rounded-2xl shadow-[0_4px_30px_rgba(0,0,0,0.05)] overflow-hidden">
          {/* Toolbar */}
          <div className="p-5 border-b border-gray-100">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <span className="material-symbols-outlined text-[#8A05BE]">folder_open</span>
                Documentos do Paciente
              </h3>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="relative flex-1 sm:flex-initial">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">search</span>
                  <input
                    type="text"
                    placeholder="Buscar documentos..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full sm:w-64 pl-10 pr-4 py-2 rounded-full bg-gray-50 border border-gray-200 text-sm focus:border-[#8A05BE] focus:ring-1 focus:ring-[#8A05BE] transition-all"
                  />
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-[#8A05BE] text-white rounded-full text-sm font-medium hover:bg-[#6D08AF] transition-colors shadow-sm">
                  <span className="material-symbols-outlined text-lg">upload_file</span>
                  <span className="hidden sm:inline">Novo Documento</span>
                </button>
              </div>
            </div>

            {/* Category filter buttons */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {CATEGORY_FILTERS.map((cat) => (
                <button
                  key={cat.key}
                  onClick={() => setActiveFilter(cat.key)}
                  className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                    activeFilter === cat.key
                      ? "bg-[#8A05BE] text-white shadow-sm"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  <span className="material-symbols-outlined text-base">{cat.icon}</span>
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            {reportsLoading ? (
              <div className="flex items-center justify-center py-16">
                <span className="material-symbols-outlined animate-spin text-[#8A05BE] text-2xl">progress_activity</span>
              </div>
            ) : filteredReports.length === 0 ? (
              <div className="text-center py-16">
                <span className="material-symbols-outlined text-5xl text-gray-300 mb-3">folder_off</span>
                <p className="text-gray-500 text-sm">Nenhum documento encontrado</p>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Nome do Arquivo</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Categoria</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Data de Upload</th>
                    <th className="text-right px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReports.map((report) => {
                    const fi = getFileIcon(report.type)
                    const badge = getCategoryBadge(report.type)
                    return (
                      <tr key={report.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors group">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-lg ${fi.bg} flex items-center justify-center ${fi.color} shrink-0`}>
                              <span className="material-symbols-outlined">{fi.icon}</span>
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">{report.title || "Documento sem título"}</p>
                              <p className="text-xs text-gray-400">{formatReportType(report.type)}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
                            {badge.label}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-sm text-gray-500">
                          {formatReportDate(report.createdAt)}
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="p-1.5 rounded-lg text-gray-400 hover:text-[#8A05BE] hover:bg-[#8A05BE]/10 transition-colors" title="Visualizar">
                              <span className="material-symbols-outlined text-lg">visibility</span>
                            </button>
                            <button className="p-1.5 rounded-lg text-gray-400 hover:text-[#8A05BE] hover:bg-[#8A05BE]/10 transition-colors" title="Download">
                              <span className="material-symbols-outlined text-lg">download</span>
                            </button>
                            <button className="p-1.5 rounded-lg text-gray-400 hover:text-[#8A05BE] hover:bg-[#8A05BE]/10 transition-colors" title="Compartilhar">
                              <span className="material-symbols-outlined text-lg">share</span>
                            </button>
                            <button className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors" title="Mais opções">
                              <span className="material-symbols-outlined text-lg">more_vert</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
          {filteredReports.length > 0 && (
            <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100">
              <span className="text-sm text-gray-500">
                Mostrando 1-{filteredReports.length} de {total} documentos
              </span>
              <div className="flex items-center gap-2">
                <button
                  disabled
                  className="px-4 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-400 cursor-not-allowed"
                >
                  Anterior
                </button>
                <button className="px-4 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                  Próximo
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-xs text-gray-400 border-t border-gray-100 mt-auto">
        <p>© 2025 Evolua — Plataforma de Gestão para Fonoaudiólogos</p>
      </footer>
    </>
  )
}
