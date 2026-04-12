'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { usePatients } from '@/hooks';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { getInitials, getAvatarColor } from '@/components/patients/patient-utils';

const ITEMS_PER_PAGE = 10;

const NAV_TABS = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/dashboard/pacientes', label: 'Pacientes' },
  { href: '/dashboard/agendamentos', label: 'Agenda' },
  { href: '/dashboard/financeiro', label: 'Financeiro' },
  { href: '/dashboard/relatorios', label: 'Relatórios' },
  { href: '/dashboard/configuracoes', label: 'Configurações' },
];

export default function PacientesPage() {
  const router = useRouter();
  const pathname = usePathname();
  const [search, setSearch] = React.useState('');
  const [debouncedSearch, setDebouncedSearch] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('');
  const [specialtyFilter, setSpecialtyFilter] = React.useState('');
  const [page, setPage] = React.useState(1);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  React.useEffect(() => {
    setPage(1);
  }, [statusFilter]);

  const { patients, total, totalPages, loading } = usePatients({
    search: debouncedSearch || undefined,
    status: statusFilter || undefined,
    page,
    limit: ITEMS_PER_PAGE,
  });

  const calculateAge = (birthDate?: string) => {
    if (!birthDate) return undefined;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  };

  const statusBadge = (status: string) => {
    const map: Record<string, { bg: string; text: string; dot: string; label: string }> = {
      active: { bg: 'bg-green-100', text: 'text-green-800', dot: 'bg-green-500', label: 'Ativo' },
      inactive: { bg: 'bg-gray-100', text: 'text-gray-600', dot: 'bg-gray-500', label: 'Pausa' },
      discharged: {
        bg: 'bg-slate-100',
        text: 'text-slate-600',
        dot: 'bg-slate-400',
        label: 'Alta',
      },
      'on-hold': {
        bg: 'bg-orange-100',
        text: 'text-orange-700',
        dot: 'bg-orange-500',
        label: 'Em Espera',
      },
    };
    return map[status] || map.active;
  };

  return (
    <>
      <DashboardHeader />

      {/* Navigation tabs */}
      <nav className="hidden md:block bg-transparent mb-8 px-6 lg:px-10">
        <div className="flex items-center justify-start lg:justify-center gap-4 lg:gap-8 overflow-x-auto pb-2 no-scrollbar">
          {NAV_TABS.map((item) => {
            const isActive =
              item.href === '/dashboard'
                ? pathname === '/dashboard'
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-1 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  isActive
                    ? 'border-[#8A05BE] text-gray-900'
                    : 'border-transparent text-gray-500 hover:text-[#8A05BE] hover:border-[#8A05BE]/30'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>

      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-10 scroll-smooth pb-24">
        {/* Page Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-10 gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 mb-2">
              Meus Pacientes 💜
            </h1>
            <p className="text-base text-gray-500">
              Gerencie prontuários, evoluções e agendamentos.
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 mb-8">
          <div className="glass-panel p-5 sm:p-6 rounded-2xl shadow-[0_4px_30px_rgba(0,0,0,0.05)] relative overflow-hidden group hover:shadow-[0_10px_40px_rgba(0,0,0,0.08)] transition-all">
            <div className="absolute top-0 right-0 w-24 h-24 bg-linear-to-br from-purple-100 to-transparent rounded-bl-full opacity-60" />
            <div className="flex justify-between items-start mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                Total de Pacientes
              </span>
              <span className="material-symbols-outlined text-[#8A05BE] text-xl">groups</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-gray-900">{total}</span>
              <span className="flex items-center text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                <span className="material-symbols-outlined text-[14px] mr-0.5">trending_up</span> +3
                este mês
              </span>
            </div>
          </div>

          <div className="glass-panel p-5 sm:p-6 rounded-2xl shadow-[0_4px_30px_rgba(0,0,0,0.05)] relative overflow-hidden group hover:shadow-[0_10px_40px_rgba(0,0,0,0.08)] transition-all">
            <div className="absolute top-0 right-0 w-24 h-24 bg-linear-to-br from-blue-100 to-transparent rounded-bl-full opacity-60" />
            <div className="flex justify-between items-start mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                Ativos na Semana
              </span>
              <span className="material-symbols-outlined text-blue-500 text-xl">
                event_available
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-gray-900">18</span>
              <span className="flex items-center text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                Em dia
              </span>
            </div>
          </div>

          <div className="glass-panel p-5 sm:p-6 rounded-2xl shadow-[0_4px_30px_rgba(0,0,0,0.05)] relative overflow-hidden group hover:shadow-[0_10px_40px_rgba(0,0,0,0.08)] transition-all">
            <div className="absolute top-0 right-0 w-24 h-24 bg-linear-to-br from-yellow-100 to-transparent rounded-bl-full opacity-60" />
            <div className="flex justify-between items-start mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                Relatórios Pendentes
              </span>
              <span className="material-symbols-outlined text-amber-500 text-xl">
                pending_actions
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-gray-900">05</span>
              <span className="flex items-center text-xs font-medium text-amber-600 bg-yellow-50 px-2 py-0.5 rounded-full">
                <span className="material-symbols-outlined text-[14px] mr-0.5">priority_high</span>{' '}
                Atenção
              </span>
            </div>
          </div>
        </div>

        {/* Patient Table Panel */}
        <div className="glass-panel rounded-2xl shadow-[0_4px_30px_rgba(0,0,0,0.05)] overflow-hidden flex flex-col mb-12">
          {/* Toolbar */}
          <div className="p-4 sm:p-6 border-b border-gray-100 flex flex-col xl:flex-row justify-between items-stretch xl:items-center gap-4">
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-4 w-full xl:w-auto">
              <div className="relative w-full sm:w-80">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 material-symbols-outlined text-lg">
                  search
                </span>
                <input
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 focus:border-[#8A05BE] focus:ring-[#8A05BE] text-sm transition-all"
                  placeholder="Buscar por nome..."
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="flex gap-2 w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0 no-scrollbar">
                <select
                  value={specialtyFilter}
                  onChange={(e) => setSpecialtyFilter(e.target.value)}
                  className="pl-3 pr-8 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm text-gray-700 focus:border-[#8A05BE] focus:ring-[#8A05BE] cursor-pointer"
                >
                  <option value="">Especialidade</option>
                  <option value="tea">TEA</option>
                  <option value="caa">CAA</option>
                  <option value="linguagem">Linguagem</option>
                </select>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="pl-3 pr-8 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm text-gray-700 focus:border-[#8A05BE] focus:ring-[#8A05BE] cursor-pointer"
                >
                  <option value="">Status</option>
                  <option value="active">Ativo</option>
                  <option value="inactive">Pausa</option>
                </select>
              </div>
            </div>
            <Link href="/dashboard/pacientes/novo" className="w-full xl:w-auto">
              <button className="w-full xl:w-auto bg-[#8A05BE] hover:bg-[#6D08AF] text-white py-2.5 px-6 rounded-xl font-medium text-sm flex items-center justify-center gap-2 shadow-lg shadow-purple-200 transition-all transform hover:-translate-y-0.5">
                <span className="material-symbols-outlined text-lg">add</span>
                Novo Paciente
              </button>
            </Link>
          </div>

          {/* Table */}
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="flex items-center gap-3 text-gray-400">
                <span className="material-symbols-outlined text-2xl animate-spin">
                  progress_activity
                </span>
                <span className="text-sm font-medium">Carregando pacientes...</span>
              </div>
            </div>
          ) : patients.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-4xl text-gray-300">
                  {debouncedSearch ? 'person_search' : 'group_off'}
                </span>
              </div>
              <p className="text-gray-600 font-medium text-sm mb-1">
                {debouncedSearch ? 'Nenhum paciente encontrado' : 'Nenhum paciente cadastrado'}
              </p>
              <p className="text-gray-400 text-xs mb-4">
                {debouncedSearch
                  ? 'Tente buscar com outros termos.'
                  : 'Comece cadastrando seu primeiro paciente.'}
              </p>
              {!debouncedSearch && (
                <Link href="/dashboard/pacientes/novo">
                  <button className="bg-[#8A05BE] hover:bg-[#6D08AF] text-white rounded-xl px-6 py-2.5 text-sm font-medium shadow-lg shadow-purple-200 flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg">add</span>
                    Cadastrar Primeiro Paciente
                  </button>
                </Link>
              )}
            </div>
          ) : (
            <>
              <div className="md:hidden px-4 pb-4 space-y-3">
                {patients.map((patient) => {
                  const age = calculateAge(patient.birthDate);
                  const sb = statusBadge(patient.status);
                  const diagnosis = patient.medicalHistory?.diagnosis?.[0] || '—';

                  return (
                    <button
                      key={patient.id}
                      onClick={() => router.push(`/dashboard/pacientes/${patient.id}`)}
                      className="w-full text-left bg-white/70 border border-gray-100 rounded-xl p-4 transition-colors hover:bg-purple-50/40"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={`w-10 h-10 rounded-full bg-linear-to-br ${getAvatarColor(patient.name)} flex items-center justify-center font-bold text-sm shrink-0`}
                          >
                            {getInitials(patient.name)}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-gray-900 text-sm truncate">
                              {patient.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {age !== undefined ? `${age} anos` : '—'}
                            </p>
                          </div>
                        </div>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${sb.bg} ${sb.text} shrink-0`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${sb.dot} mr-1.5`} />
                          {sb.label}
                        </span>
                      </div>

                      <div className="mt-3 flex items-center justify-between gap-3">
                        <p className="text-xs text-gray-600 truncate">
                          <span className="font-medium text-gray-700">Diagnóstico:</span>{' '}
                          {diagnosis}
                        </p>
                        <span className="material-symbols-outlined text-gray-400 text-lg shrink-0">
                          chevron_right
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="hidden md:grid xl:hidden px-4 pb-4 grid-cols-1 lg:grid-cols-2 gap-3">
                {patients.map((patient) => {
                  const age = calculateAge(patient.birthDate);
                  const sb = statusBadge(patient.status);
                  const diagnosis = patient.medicalHistory?.diagnosis?.[0] || '—';
                  const specialties = patient.medicalHistory?.diagnosis?.slice(1) || [];

                  return (
                    <button
                      key={patient.id}
                      onClick={() => router.push(`/dashboard/pacientes/${patient.id}`)}
                      className="w-full text-left bg-white/80 border border-gray-100 rounded-2xl p-4 transition-colors hover:bg-purple-50/40"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={`w-11 h-11 rounded-full bg-linear-to-br ${getAvatarColor(patient.name)} flex items-center justify-center font-bold text-sm shrink-0`}
                          >
                            {getInitials(patient.name)}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-gray-900 text-sm truncate">
                              {patient.name}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {age !== undefined ? `${age} anos` : '—'}
                            </p>
                          </div>
                        </div>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${sb.bg} ${sb.text} shrink-0`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${sb.dot} mr-1.5`} />
                          {sb.label}
                        </span>
                      </div>

                      <div className="mt-4 space-y-3">
                        <div>
                          <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                            Diagnóstico
                          </p>
                          <p className="text-sm text-gray-700 mt-1 truncate">{diagnosis}</p>
                        </div>

                        <div>
                          <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400 mb-1.5">
                            Especialidades
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {(specialties.length > 0
                              ? specialties
                              : [diagnosis !== '—' ? diagnosis : '—']
                            ).map((specialty, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-[#F0E4F9] text-[#8A05BE]"
                              >
                                {specialty}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
                        <span>Toque para ver o prontuário</span>
                        <span className="material-symbols-outlined text-lg text-gray-400">
                          chevron_right
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="hidden xl:block overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[900px]">
                  <thead>
                    <tr className="bg-gray-50/50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                      <th className="px-6 py-4 rounded-tl-lg">Paciente</th>
                      <th className="px-6 py-4">Diagnóstico</th>
                      <th className="px-6 py-4">Especialidade</th>
                      <th className="px-6 py-4">Última Sessão</th>
                      <th className="px-6 py-4">Próxima Sessão</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right rounded-tr-lg">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {patients.map((patient) => {
                      const age = calculateAge(patient.birthDate);
                      const sb = statusBadge(patient.status);
                      const diagnosis = patient.medicalHistory?.diagnosis?.[0] || '—';
                      const specialties = patient.medicalHistory?.diagnosis?.slice(1) || [];

                      return (
                        <tr
                          key={patient.id}
                          className="hover:bg-purple-50/30 transition-colors group cursor-pointer"
                          onClick={() => router.push(`/dashboard/pacientes/${patient.id}`)}
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-10 h-10 rounded-full bg-linear-to-br ${getAvatarColor(patient.name)} flex items-center justify-center font-bold text-sm`}
                              >
                                {getInitials(patient.name)}
                              </div>
                              <div>
                                <p className="font-bold text-gray-900 text-sm">{patient.name}</p>
                                <p className="text-xs text-gray-500">
                                  {age !== undefined ? `${age} anos` : '—'}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm text-gray-700">{diagnosis}</span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-1 flex-wrap">
                              {specialties.length > 0 ? (
                                specialties.map((s, i) => (
                                  <span
                                    key={i}
                                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#F0E4F9] text-[#8A05BE]"
                                  >
                                    {s}
                                  </span>
                                ))
                              ) : (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#F0E4F9] text-[#8A05BE]">
                                  {diagnosis !== '—' ? diagnosis : '—'}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">—</td>
                          <td className="px-6 py-4 text-sm font-medium text-[#8A05BE]">—</td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${sb.bg} ${sb.text}`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${sb.dot} mr-1.5`} />
                              {sb.label}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                }}
                                className="p-1.5 text-gray-400 hover:text-green-600 transition-colors rounded-lg hover:bg-green-50"
                                title="WhatsApp"
                              >
                                <span className="material-symbols-outlined text-lg">chat</span>
                              </button>
                              <Link
                                href={`/dashboard/pacientes/${patient.id}`}
                                onClick={(e) => e.stopPropagation()}
                              >
                                <button
                                  className="p-1.5 text-gray-400 hover:text-[#8A05BE] transition-colors rounded-lg hover:bg-purple-50"
                                  title="Ver Perfil"
                                >
                                  <span className="material-symbols-outlined text-lg">
                                    visibility
                                  </span>
                                </button>
                              </Link>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                }}
                                className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100"
                              >
                                <span className="material-symbols-outlined text-lg">more_vert</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* Pagination */}
          {!loading && patients.length > 0 && (
            <div className="px-4 sm:px-6 py-4 border-t border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <span className="text-xs text-gray-500">
                Mostrando {patients.length} de {total} pacientes
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-1.5 rounded hover:bg-gray-100 text-gray-400 disabled:cursor-not-allowed"
                >
                  <span className="material-symbols-outlined text-lg">chevron_left</span>
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages || totalPages <= 1}
                  className="p-1.5 rounded hover:bg-gray-100 text-[#8A05BE] disabled:text-gray-400 disabled:cursor-not-allowed"
                >
                  <span className="material-symbols-outlined text-lg">chevron_right</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="mt-12 border-t border-gray-200 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center text-xs text-gray-400 gap-4">
            <p>© {new Date().getFullYear()} Evolua Premium. Uso exclusivo.</p>
            <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
              <a href="#" className="hover:text-[#8A05BE] transition-colors">
                Suporte Prioritário
              </a>
              <a href="#" className="hover:text-[#8A05BE] transition-colors">
                Privacidade
              </a>
              <a href="#" className="hover:text-[#8A05BE] transition-colors">
                Termos
              </a>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}
