'use client';

import * as React from 'react';
import { useParams, useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { usePatient, usePatientMutations, usePatientReports, useAppointments } from '@/hooks';
import { useGoals } from '@/hooks/use-goals';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  formatReportType,
  formatReportDate,
} from '@/components/patient-profile/patient-profile-utils';
import { WhatsAppMessageModal } from '@/components/whatsapp/whatsapp-message-modal';
import type { MessageTemplateType } from '@/lib/utils/whatsapp-utils';
import { getInitials } from '@/components/patients/patient-utils';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';

const NAV_TABS = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/dashboard/pacientes', label: 'Pacientes' },
  { href: '/dashboard/agendamentos', label: 'Agenda' },
  { href: '/dashboard/financeiro', label: 'Financeiro' },
  { href: '/dashboard/relatorios', label: 'Relatórios' },
  { href: '/dashboard/configuracoes', label: 'Configurações' },
];

export default function PatientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const patientId = params.id as string;
  const { patient, loading, error, refetch } = usePatient(patientId);
  const { reports, loading: reportsLoading } = usePatientReports(patientId);
  const { appointments } = useAppointments({ patientId });
  const { goals: patientGoals } = useGoals(patientId);
  const { remove, discharge, reactivate, loading: mutationLoading } = usePatientMutations();
  const [whatsappOpen, setWhatsappOpen] = React.useState(false);
  const [whatsappTemplate, setWhatsappTemplate] = React.useState<MessageTemplateType>('free');

  const handleDelete = async () => {
    const result = await remove(patientId);
    if (result.success) router.push('/dashboard/pacientes');
  };
  const handleDischarge = async () => {
    const result = await discharge(patientId, 'Alta médica');
    if (result.success) refetch();
  };
  const handleReactivate = async () => {
    const result = await reactivate(patientId);
    if (result.success) refetch();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <span className="material-symbols-outlined animate-spin text-[#8A05BE] text-3xl">
            progress_activity
          </span>
          <p className="text-gray-500 mt-3 text-sm">Carregando perfil...</p>
        </div>
      </div>
    );
  }

  if (error || !patient) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="glass-panel p-8 text-center max-w-md rounded-2xl">
          <span className="material-symbols-outlined text-5xl text-gray-300 mb-4">person_off</span>
          <p className="text-red-600 mb-4">{error?.message || 'Paciente não encontrado'}</p>
          <Link href="/dashboard/pacientes">
            <Button variant="outline">Voltar para lista</Button>
          </Link>
        </div>
      </div>
    );
  }

  const age = patient.birthDate
    ? Math.floor(
        (new Date().getTime() - new Date(patient.birthDate).getTime()) /
          (365.25 * 24 * 60 * 60 * 1000)
      )
    : null;

  const now = new Date();
  const upcoming = appointments
    .filter(
      (a) => new Date(a.dateTime) > now && a.status !== 'cancelled' && a.status !== 'completed'
    )
    .sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());
  const nextApt = upcoming[0];
  const completed = appointments
    .filter((a) => a.status === 'completed')
    .sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime());

  const sbMap: Record<string, { bg: string; text: string; dot: string; label: string }> = {
    active: { bg: 'bg-green-100', text: 'text-green-800', dot: 'bg-green-500', label: 'Ativo' },
    inactive: { bg: 'bg-gray-100', text: 'text-gray-600', dot: 'bg-gray-500', label: 'Pausa' },
    discharged: { bg: 'bg-slate-100', text: 'text-slate-600', dot: 'bg-slate-400', label: 'Alta' },
    'on-hold': {
      bg: 'bg-orange-100',
      text: 'text-orange-700',
      dot: 'bg-orange-500',
      label: 'Em Espera',
    },
  };
  const sb = sbMap[patient.status] || sbMap.active;
  const diagnosis = patient.medicalHistory?.diagnosis?.[0] || '—';
  const specialties = patient.medicalHistory?.diagnosis?.slice(1) || [];
  const initials = getInitials(patient.name);

  return (
    <>
      <DashboardHeader />

      {/* Navigation tabs */}
      <nav className="px-6 lg:px-10 bg-transparent mb-6 hidden md:block">
        <div className="flex items-center justify-center gap-8">
          {NAV_TABS.map((item) => {
            const isActive =
              item.href === '/dashboard/pacientes'
                ? pathname.startsWith('/dashboard/pacientes')
                : item.href === '/dashboard'
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

      <main className="flex-1 overflow-y-auto p-6 lg:p-10 scroll-smooth pb-24">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-6 text-sm text-gray-500">
          <Link
            href="/dashboard/pacientes"
            className="hover:text-[#8A05BE] transition-colors flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-base">arrow_back</span>
            Voltar
          </Link>
          <span>/</span>
          <span>Pacientes</span>
          <span>/</span>
          <span className="text-[#8A05BE] font-medium">{patient.name}</span>
        </div>

        {/* Patient Hero Card */}
        <div className="glass-panel rounded-2xl p-6 md:p-8 shadow-[0_4px_30px_rgba(0,0,0,0.05)] mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-linear-to-br from-purple-100 to-transparent rounded-bl-full opacity-40 pointer-events-none" />
          <div className="flex flex-col lg:flex-row justify-between items-center gap-8 relative z-10">
            {/* Left: Avatar + Name */}
            <div className="flex flex-col sm:flex-row items-center gap-6 w-full lg:w-auto text-center sm:text-left">
              <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-3xl shadow-md border-4 border-white">
                {initials}
              </div>
              <div>
                <div className="flex items-center justify-center sm:justify-start gap-3 mb-1">
                  <h1 className="text-2xl font-bold text-gray-900">{patient.name}</h1>
                  <Link href={`/dashboard/pacientes/${patientId}/editar`}>
                    <button
                      className="p-1.5 rounded-full text-gray-400 hover:text-[#8A05BE] hover:bg-[#8A05BE]/10 transition-colors"
                      title="Editar Perfil"
                    >
                      <span className="material-symbols-outlined text-lg">edit</span>
                    </button>
                  </Link>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${sb.bg} ${sb.text} ml-1`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${sb.dot} mr-1.5`} />
                    {sb.label}
                  </span>
                </div>
                <p className="text-gray-500 text-lg">{age !== null ? `${age} anos` : '—'}</p>
              </div>
            </div>

            {/* Center: Diagnosis + Specialty */}
            <div className="flex flex-col items-center justify-center gap-2 w-full lg:w-auto border-y lg:border-y-0 lg:border-x border-gray-100 py-4 lg:py-0 lg:px-12">
              <div className="text-center">
                <span className="text-xs uppercase tracking-wider text-gray-400 font-semibold mb-1 block">
                  Diagnóstico Principal
                </span>
                <span className="text-lg font-bold text-gray-800">{diagnosis}</span>
              </div>
              <div className="w-8 h-px bg-gray-200 lg:hidden" />
              <div className="text-center">
                <span className="text-xs uppercase tracking-wider text-gray-400 font-semibold mb-1 block">
                  Especialidade
                </span>
                <div className="flex gap-1 flex-wrap justify-center">
                  {specialties.length > 0 ? (
                    specialties.map((s, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-[#F0E4F9] text-[#8A05BE]"
                      >
                        {s}
                      </span>
                    ))
                  ) : (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-[#F0E4F9] text-[#8A05BE]">
                      {diagnosis !== '—' ? diagnosis : '—'}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
              <button
                onClick={() => {
                  setWhatsappTemplate('free');
                  setWhatsappOpen(true);
                }}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-white text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all font-medium text-sm shadow-sm"
              >
                <span className="material-symbols-outlined text-green-500">chat</span>
                WhatsApp
              </button>
              <Link
                href={`/dashboard/pacientes/${patientId}/novo-relatorio`}
                className="w-full sm:w-auto"
              >
                <button className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[#8A05BE] text-white hover:bg-[#6D08AF] transition-all rounded-xl font-medium text-sm shadow-lg shadow-purple-200">
                  <span className="material-symbols-outlined text-[20px]">mic</span>
                  Gravar Relatório
                </button>
              </Link>
              <Link
                href={`/dashboard/agendamentos/novo?patientId=${patientId}`}
                className="w-full sm:w-auto"
              >
                <button className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[#8A05BE]/10 hover:bg-[#8A05BE]/20 text-[#8A05BE] transition-all rounded-xl font-medium text-sm">
                  <span className="material-symbols-outlined text-[20px]">calendar_today</span>
                  Agendar Sessão
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* 3-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-8">
          {/* Left Column: Dados Pessoais */}
          <div className="lg:col-span-3 space-y-6">
            <div className="glass-panel rounded-2xl p-6 shadow-[0_4px_30px_rgba(0,0,0,0.05)] h-full">
              <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-[#8A05BE] text-xl">person_pin</span>
                Dados Pessoais
              </h3>
              <div className="space-y-5">
                {/* Responsável */}
                {patient.guardianName && (
                  <div className="group">
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide block mb-1">
                      Responsável
                    </span>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 font-bold text-xs">
                        {patient.guardianName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-800">
                          {patient.guardianName}
                          {patient.guardianRelationship ? ` (${patient.guardianRelationship})` : ''}
                        </p>
                        <p className="text-xs text-gray-400">Principal</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* CPF */}
                {patient.cpf && (
                  <div className="border-t border-gray-100 pt-4">
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide block mb-1">
                      CPF
                    </span>
                    <p className="text-sm font-medium text-gray-800">{patient.cpf}</p>
                  </div>
                )}

                {/* Endereço */}
                {patient.address && (
                  <div className="border-t border-gray-100 pt-4">
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide block mb-1">
                      Endereço
                    </span>
                    <p className="text-sm font-medium text-gray-800">
                      {[patient.address.street, patient.address.number].filter(Boolean).join(', ')}
                      {patient.address.complement ? `, ${patient.address.complement}` : ''}
                    </p>
                    <p className="text-xs text-gray-500">
                      {[patient.address.neighborhood, patient.address.city]
                        .filter(Boolean)
                        .join(', ')}
                    </p>
                  </div>
                )}

                {/* Histórico Rápido */}
                {patient.medicalHistory &&
                  (patient.medicalHistory.medications?.length ||
                    patient.medicalHistory.allergies?.length) && (
                    <div className="border-t border-gray-100 pt-4">
                      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide block mb-1">
                        Histórico Rápido
                      </span>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {patient.medicalHistory.allergies?.map((a, i) => (
                          <span
                            key={`a-${i}`}
                            className="px-2 py-1 bg-yellow-50 text-yellow-700 text-xs rounded-md border border-yellow-100"
                          >
                            Alergia: {a}
                          </span>
                        ))}
                        {patient.medicalHistory.medications?.map((m, i) => (
                          <span
                            key={`m-${i}`}
                            className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-md border border-blue-100"
                          >
                            {m}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
              </div>
            </div>
          </div>

          {/* Center Column: Linha do Tempo */}
          <div className="lg:col-span-6">
            <div className="glass-panel rounded-2xl p-6 shadow-[0_4px_30px_rgba(0,0,0,0.05)] h-full flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#8A05BE] text-xl">history</span>
                  Linha do Tempo Terapêutica
                </h3>
                <button className="p-1.5 text-gray-400 hover:text-[#8A05BE] transition-colors hover:bg-gray-100 rounded-lg">
                  <span className="material-symbols-outlined text-lg">filter_list</span>
                </button>
              </div>

              <div className="relative pl-2 space-y-0 overflow-y-auto max-h-[600px] pr-2">
                {/* Next appointment */}
                {nextApt && (
                  <div className="relative pl-8 pb-8">
                    <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gray-200 ml-[1.15rem]" />
                    <div className="absolute left-0 top-0 mt-1.5 w-10 h-10 rounded-full bg-white border-2 border-[#8A05BE] flex items-center justify-center z-10 shadow-sm">
                      <span className="material-symbols-outlined text-[#8A05BE]">event</span>
                    </div>
                    <div className="bg-white border border-[#8A05BE]/20 p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-bold text-gray-900">Sessão Agendada</h4>
                          <p className="text-sm text-gray-500">
                            {new Date(nextApt.dateTime).toLocaleDateString('pt-BR', {
                              weekday: 'long',
                              day: 'numeric',
                              month: 'short',
                            })}
                            ,{' '}
                            {new Date(nextApt.dateTime).toLocaleTimeString('pt-BR', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                        <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-600 text-xs font-bold uppercase tracking-wider">
                          Futura
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">
                        Foco: {nextApt.type || 'Sessão terapêutica'}
                      </p>
                      <button className="text-sm text-[#8A05BE] font-medium hover:underline flex items-center gap-1">
                        Ver detalhes do planejamento{' '}
                        <span className="material-symbols-outlined text-sm">arrow_forward</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Completed sessions */}
                {completed.slice(0, 3).map((apt, idx) => (
                  <div key={apt.id} className="relative pl-8 pb-8">
                    <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gray-200 ml-[1.15rem]" />
                    <div
                      className={`absolute left-0 top-0 mt-1.5 w-10 h-10 rounded-full flex items-center justify-center z-10 ${
                        idx === 0 ? 'bg-[#F0E4F9]' : 'bg-gray-100'
                      }`}
                    >
                      <span
                        className={`material-symbols-outlined text-sm ${idx === 0 ? 'text-[#8A05BE]' : 'text-gray-400'}`}
                      >
                        check
                      </span>
                    </div>
                    <div className="bg-white/60 border border-gray-100 p-4 rounded-xl hover:bg-white transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-bold text-gray-900">Sessão de Terapia</h4>
                          <p className="text-sm text-gray-500">
                            {new Date(apt.dateTime).toLocaleDateString('pt-BR', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                            ,{' '}
                            {new Date(apt.dateTime).toLocaleTimeString('pt-BR', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                        <span className="px-2.5 py-1 rounded-lg bg-green-50 text-green-600 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                          <span className="material-symbols-outlined text-[10px]">description</span>{' '}
                          Pronto
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {apt.type ? `${apt.type} — ` : ''}
                        {apt.duration} min
                      </p>
                    </div>
                  </div>
                ))}

                {/* Reports in timeline */}
                {reports
                  .filter((r) => r.status === 'draft' || r.status === 'pending_review')
                  .slice(0, 2)
                  .map((report) => (
                    <div key={report.id} className="relative pl-8 pb-8">
                      <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gray-200 ml-[1.15rem]" />
                      <div className="absolute left-0 top-0 mt-1.5 w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center z-10">
                        <span className="material-symbols-outlined text-gray-400 text-sm">
                          check
                        </span>
                      </div>
                      <div className="bg-white/60 border border-gray-100 p-4 rounded-xl hover:bg-white transition-colors">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-bold text-gray-900">
                              {report.title || 'Relatório'}
                            </h4>
                            <p className="text-sm text-gray-500">
                              {formatReportDate(report.createdAt)}
                            </p>
                          </div>
                          <span className="px-2.5 py-1 rounded-lg bg-yellow-50 text-yellow-600 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                            <span className="material-symbols-outlined text-[10px]">edit</span>{' '}
                            Pendente
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{formatReportType(report.type)}</p>
                        <div className="mt-3">
                          <Link
                            href={`/dashboard/pacientes/${patientId}/revisar-relatorio?reportId=${report.id}`}
                          >
                            <button className="text-xs font-medium text-[#8A05BE] border border-[#8A05BE]/30 bg-[#8A05BE]/5 hover:bg-[#8A05BE]/10 px-3 py-1.5 rounded-lg transition-colors">
                              Completar Relatório
                            </button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}

                {completed.length === 0 && !nextApt && reports.length === 0 && (
                  <div className="text-center py-8">
                    <span className="material-symbols-outlined text-4xl text-gray-300 mb-2">
                      timeline
                    </span>
                    <p className="text-sm text-gray-500">Nenhum evento registrado ainda.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Plano Terapêutico + Documentos */}
          <div className="lg:col-span-3 space-y-6">
            {/* Plano Terapêutico */}
            <div className="glass-panel rounded-2xl p-6 shadow-[0_4px_30px_rgba(0,0,0,0.05)]">
              <div className="flex justify-between items-center mb-5">
                <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wide">
                  Plano Terapêutico
                </h3>
                <Link href={`/dashboard/pacientes/${patientId}/planos-metas/novo`}>
                  <button className="flex items-center gap-1 text-xs text-[#8A05BE] font-medium hover:bg-[#8A05BE]/10 px-2 py-1 rounded-lg transition-colors">
                    <span className="material-symbols-outlined text-sm">add</span> Adicionar Meta
                  </button>
                </Link>
              </div>

              {/* Progress bars */}
              <div className="space-y-5">
                {patientGoals.length > 0 ? (
                  patientGoals
                    .slice(0, 3)
                    .map((goal) => (
                      <ProgressBar key={goal.id} label={goal.title} value={goal.progress} />
                    ))
                ) : (
                  <p className="text-sm text-gray-400 text-center py-2">
                    Nenhuma meta criada ainda
                  </p>
                )}
              </div>

              {/* Metas Clínicas */}
              {patientGoals.length > 0 && (
                <div className="mt-6 pt-5 border-t border-gray-100">
                  <h4 className="font-bold text-gray-900 text-xs uppercase tracking-wide mb-3">
                    Metas Clínicas
                  </h4>
                  <div className="space-y-3">
                    {patientGoals.slice(0, 3).map((goal) => (
                      <GoalCheckbox
                        key={goal.id}
                        label={goal.title}
                        checked={goal.status === 'completed' || goal.progress === 100}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Documentos */}
            <div className="glass-panel rounded-2xl p-6 shadow-[0_4px_30px_rgba(0,0,0,0.05)]">
              <div className="flex justify-between items-center mb-5">
                <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wide">
                  Documentos
                </h3>
                <Link href={`/dashboard/pacientes/${patientId}/documentos`}>
                  <button className="w-6 h-6 rounded-full bg-[#8A05BE]/10 text-[#8A05BE] hover:bg-[#8A05BE]/20 flex items-center justify-center transition-colors">
                    <span className="material-symbols-outlined text-sm">add</span>
                  </button>
                </Link>
              </div>
              <div className="space-y-3">
                {reportsLoading ? (
                  <div className="flex justify-center py-4">
                    <span className="material-symbols-outlined animate-spin text-[#8A05BE]">
                      progress_activity
                    </span>
                  </div>
                ) : reports.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">Nenhum documento.</p>
                ) : (
                  reports.slice(0, 3).map((report) => {
                    const icMap: Record<string, { icon: string; bg: string; color: string }> = {
                      evaluation: {
                        icon: 'picture_as_pdf',
                        bg: 'bg-red-50',
                        color: 'text-red-500',
                      },
                      evolution: { icon: 'description', bg: 'bg-blue-50', color: 'text-blue-500' },
                    };
                    const ic = icMap[report.type] || {
                      icon: 'folder',
                      bg: 'bg-purple-50',
                      color: 'text-[#8A05BE]',
                    };
                    return (
                      <button
                        key={report.id}
                        onClick={() =>
                          router.push(
                            `/dashboard/pacientes/${patientId}/revisar-relatorio?reportId=${report.id}`
                          )
                        }
                        className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white transition-colors border border-transparent hover:border-gray-100 group w-full text-left"
                      >
                        <div
                          className={`w-10 h-10 rounded-lg ${ic.bg} flex items-center justify-center ${ic.color}`}
                        >
                          <span className="material-symbols-outlined">{ic.icon}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate">
                            {report.title || 'Relatório'}
                          </p>
                          <p className="text-xs text-gray-400">
                            {formatReportType(report.type)} • {formatReportDate(report.createdAt)}
                          </p>
                        </div>
                        <span className="material-symbols-outlined text-gray-300 group-hover:text-[#8A05BE] transition-colors">
                          download
                        </span>
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* Ações */}
            <div className="glass-panel rounded-2xl p-6 shadow-[0_4px_30px_rgba(0,0,0,0.05)]">
              <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wide mb-4">
                Ações
              </h3>
              <div className="flex flex-col gap-2">
                {patient.status === 'active' && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <button
                        disabled={mutationLoading}
                        className="w-full flex items-center gap-3 p-3 rounded-xl bg-white border border-gray-100 hover:border-amber-300 hover:shadow-md transition-all text-left group"
                      >
                        <div className="bg-amber-50 text-amber-600 p-2 rounded-lg">
                          <span className="material-symbols-outlined text-lg">school</span>
                        </div>
                        <span className="text-sm font-bold text-gray-900 group-hover:text-amber-700 transition-colors">
                          Dar Alta
                        </span>
                      </button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Confirmar Alta</AlertDialogTitle>
                        <AlertDialogDescription>
                          Tem certeza que deseja dar alta para {patient.name}?
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDischarge}
                          className="bg-[#8A05BE] hover:bg-[#8A05BE]/90"
                        >
                          Confirmar
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
                {patient.status === 'discharged' && (
                  <button
                    onClick={handleReactivate}
                    disabled={mutationLoading}
                    className="w-full flex items-center gap-3 p-3 rounded-xl bg-white border border-gray-100 hover:border-green-300 hover:shadow-md transition-all text-left group"
                  >
                    <div className="bg-green-50 text-green-600 p-2 rounded-lg">
                      <span className="material-symbols-outlined text-lg">refresh</span>
                    </div>
                    <span className="text-sm font-bold text-gray-900 group-hover:text-green-700 transition-colors">
                      Reativar
                    </span>
                  </button>
                )}
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <button
                      disabled={mutationLoading}
                      className="w-full flex items-center gap-3 p-3 rounded-xl bg-white border border-gray-100 hover:border-red-300 hover:shadow-md transition-all text-left group"
                    >
                      <div className="bg-red-50 text-red-500 p-2 rounded-lg">
                        <span className="material-symbols-outlined text-lg">delete</span>
                      </div>
                      <span className="text-sm font-bold text-gray-900 group-hover:text-red-600 transition-colors">
                        Excluir Paciente
                      </span>
                    </button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                      <AlertDialogDescription>
                        Tem certeza que deseja excluir {patient.name}? Esta ação não pode ser
                        desfeita.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDelete}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Excluir
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-12 border-t border-gray-200 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center text-xs text-gray-400 gap-4">
            <p>© {new Date().getFullYear()} Evolua Premium. Uso exclusivo.</p>
            <div className="flex gap-6">
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

      <WhatsAppMessageModal
        open={whatsappOpen}
        onClose={() => setWhatsappOpen(false)}
        patient={{
          id: patientId,
          name: patient.name,
          guardianName: patient.guardianName,
          guardianPhone: patient.guardianPhone,
          guardianRelationship: patient.guardianRelationship,
        }}
        nextAppointment={
          nextApt
            ? { dateTime: nextApt.dateTime, type: nextApt.type, duration: nextApt.duration }
            : null
        }
        defaultTemplate={whatsappTemplate}
      />
    </>
  );
}

function ProgressBar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-1.5">
        <span className="font-medium text-gray-700">{label}</span>
        <span className="font-bold text-[#8A05BE]">{value}%</span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-2">
        <div
          className="bg-[#8A05BE] h-2 rounded-full transition-all duration-500"
          style={{ width: `${value}%`, opacity: value >= 70 ? 1 : value >= 50 ? 0.9 : 0.8 }}
        />
      </div>
    </div>
  );
}

function GoalCheckbox({ label, checked }: { label: string; checked: boolean }) {
  const [isChecked, setIsChecked] = React.useState(checked);
  return (
    <div className="flex items-start gap-3 group">
      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={isChecked}
          onChange={() => setIsChecked(!isChecked)}
          className="w-5 h-5 rounded border-2 border-gray-300 text-[#8A05BE] focus:ring-[#8A05BE] mt-0.5"
        />
        <span
          className={`text-sm text-gray-600 group-hover:text-[#8A05BE] transition-colors leading-snug ${isChecked ? 'line-through opacity-70' : ''}`}
        >
          {label}
        </span>
      </label>
    </div>
  );
}
