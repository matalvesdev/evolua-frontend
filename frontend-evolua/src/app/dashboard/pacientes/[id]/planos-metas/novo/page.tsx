/**
 * Página para criar nova meta terapêutica do paciente
 */

'use client';

import { use } from 'react';
import Link from 'next/link';
import { CreateGoalForm } from '@/components/patient-goals/create-goal-form';
import { usePatient } from '@/hooks/use-patients';

interface CreateGoalPageProps {
  params: Promise<{ id: string }>;
}

export default function CreateGoalPage({ params }: CreateGoalPageProps) {
  const { id } = use(params);
  const { patient, loading, error } = usePatient(id);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <span className="material-symbols-outlined animate-spin text-[#8A05BE] text-3xl">
            progress_activity
          </span>
          <p className="text-gray-500 mt-3">Carregando dados do paciente...</p>
        </div>
      </div>
    );
  }

  if (error || !patient) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="glass-panel p-8 text-center max-w-md rounded-2xl">
          <span className="material-symbols-outlined text-5xl text-gray-300 mb-4">person_off</span>
          <p className="text-red-600 mb-4">Paciente não encontrado</p>
          <Link href="/dashboard/pacientes">
            <button className="px-6 py-2 bg-[#8A05BE] text-white rounded-lg hover:bg-[#6D08AF]">
              Voltar para Pacientes
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      {/* Gradient Orbs */}
      <div className="fixed top-16 -right-24 md:right-20 w-64 h-64 md:w-96 md:h-96 bg-[#8A05BE]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed -bottom-10 -left-20 md:bottom-20 md:left-20 w-56 h-56 md:w-80 md:h-80 bg-blue-300/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 md:px-8 py-6 md:py-8">
        {/* BREADCRUMBS */}
        <div className="mb-6 md:mb-8 flex items-center gap-2 text-xs sm:text-sm text-gray-600 overflow-x-auto whitespace-nowrap pb-1">
          <Link href="/dashboard/pacientes" className="hover:text-[#8A05BE] transition-colors">
            Pacientes
          </Link>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <Link
            href={`/dashboard/pacientes/${id}`}
            className="hover:text-[#8A05BE] transition-colors"
          >
            {patient.name}
          </Link>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <Link
            href={`/dashboard/pacientes/${id}/planos-metas`}
            className="hover:text-[#8A05BE] transition-colors"
          >
            Plano e Metas
          </Link>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span className="text-[#8A05BE] font-medium">Nova Meta</span>
        </div>

        {/* HEADER */}
        <div className="mb-6 md:mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-[#8A05BE] to-purple-600 flex items-center justify-center text-white font-bold text-2xl shadow-lg">
              <span className="material-symbols-outlined text-[28px] sm:text-3xl">goal</span>
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 leading-tight">
                Nova Meta Terapêutica
              </h1>
              <p className="text-sm sm:text-base text-gray-600 break-words">
                Criando plano para <span className="font-medium text-gray-900">{patient.name}</span>
              </p>
            </div>
          </div>
        </div>

        {/* FORM CARD */}
        <div className="glass-panel rounded-2xl p-4 sm:p-6 md:p-8 shadow-[0_4px_30px_rgba(0,0,0,0.05)]">
          <CreateGoalForm patientId={id} />
        </div>

        {/* TIPS SECTION */}
        <div className="mt-6 md:mt-8 glass-panel rounded-2xl p-4 sm:p-6 bg-blue-50/50 border border-blue-100">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-start sm:items-center gap-2 text-sm sm:text-base">
            <span className="material-symbols-outlined text-blue-600 text-xl">lightbulb</span>
            Dicas para Criar Metas Efetivas
          </h3>
          <ul className="space-y-3 text-sm text-gray-700">
            <li className="flex gap-3">
              <span className="text-blue-600 font-bold">1.</span>
              <span>
                <strong>Seja específico:</strong> Defina exatamente qual é o objetivo (ex: não
                &quot;melhorar fala&quot;, mas &quot;aquisição do fonema /r/&quot;)
              </span>
            </li>
            <li className="flex gap-3">
              <span className="text-blue-600 font-bold">2.</span>
              <span>
                <strong>Mensurável:</strong> Inclua critérios observáveis de sucesso
              </span>
            </li>
            <li className="flex gap-3">
              <span className="text-blue-600 font-bold">3.</span>
              <span>
                <strong>Realista:</strong> Considere a idade e capacidade atual da criança
              </span>
            </li>
            <li className="flex gap-3">
              <span className="text-blue-600 font-bold">4.</span>
              <span>
                <strong>Com prazo:</strong> Defina para quando espera alcançar o objetivo
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
