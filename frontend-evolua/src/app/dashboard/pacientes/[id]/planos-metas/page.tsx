"use client"

import { use } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  PatientGoalHeader,
  TherapeuticObjective,
  GoalCard,
  WeeklyActivitiesPlan,
} from "@/components/patient-goals"
import { usePatient } from "@/hooks/use-patients"
import { useGoals } from "@/hooks/use-goals"

interface GoalsPageProps {
  params: Promise<{ id: string }>
}

export default function GoalsPage({ params }: GoalsPageProps) {
  const { id } = use(params)
  const router = useRouter()
  const { patient, loading: patientLoading } = usePatient(id)
  const { goals, isLoading: goalsLoading } = useGoals(id)

  // Calcular progresso geral
  const overallProgress = goals.length > 0 ? Math.round(goals.reduce((sum, g) => sum + g.progress, 0) / goals.length) : 0

  // Mock dados terapêuticos (substituir por API quando disponível)
  const therapeuticObjective = {
    title: "Objetivo Terapêutico Principal",
    description: "Acompanhe as metas do paciente selecionado para gerenciar o plano terapêutico.",
    definedDate: new Date().toLocaleDateString("pt-BR"),
  }

  // Atividades semanais (mock por enquanto)
  const weeklyActivities = [
    {
      id: "1",
      title: "Atividade 1",
      description: "Descrição da atividade",
      location: "office" as const,
      duration: "15 min",
      completed: false,
    },
  ]

  const handleAddGoal = () => {
    router.push(`/dashboard/pacientes/${id}/planos-metas/novo`)
  }

  const handleAddActivity = () => {
    console.log("Adicionar nova atividade")
  }

  const handleActivityToggle = (activityId: string, checked: boolean) => {
    console.log(`Atividade ${activityId} marcada como ${checked ? "concluída" : "pendente"}`)
  }

  if (patientLoading || goalsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <span className="material-symbols-outlined animate-spin text-[#8A05BE] text-3xl">
            progress_activity
          </span>
          <p className="text-gray-500 mt-3">Carregando plano terapêutico...</p>
        </div>
      </div>
    )
  }

  if (!patient) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="glass-panel p-8 text-center max-w-md rounded-2xl">
          <span className="material-symbols-outlined text-5xl text-gray-300 mb-4">person_off</span>
          <p className="text-red-600 mb-4">Paciente não encontrado</p>
          <Link href="/dashboard/pacientes">
            <button className="px-6 py-2 bg-[#8A05BE] text-white rounded-lg hover:bg-[#6D08AF]">
              Voltar
            </button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen">
      {/* Gradient Orbs */}
      <div className="fixed top-20 right-20 w-96 h-96 bg-[#8A05BE]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-20 left-20 w-80 h-80 bg-blue-300/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 md:px-8 py-8 pb-32">
        {/* Breadcrumbs */}
        <div className="mb-6 flex items-center gap-2 text-sm text-gray-600">
          <Link href="/dashboard/pacientes" className="hover:text-[#8A05BE] transition-colors">
            Pacientes
          </Link>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <Link href={`/dashboard/pacientes/${id}`} className="hover:text-[#8A05BE] transition-colors">
            {patient.name}
          </Link>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span className="text-[#8A05BE] font-medium">Plano e Metas</span>
        </div>

        <div className="flex flex-col gap-6">
          {/* Patient Header */}
          <PatientGoalHeader
            patientId={id}
            patientName={patient.name}
            patientImage=""
            status={patient.status === "on-hold" ? "inactive" : (patient.status as "active" | "inactive" | "discharged")}
            age={patient.birthDate ? Math.floor((new Date().getTime() - new Date(patient.birthDate).getTime()) / (365.25 * 24 * 60 * 60 * 1000)) : 0}
            birthDate={patient.birthDate ? new Date(patient.birthDate).toLocaleDateString("pt-BR") : "—"}
            specialty={patient.medicalHistory?.diagnosis?.[0] || "Terapia"}
            schooling={patient.address?.city || "—"}
            startDate={patient.createdAt ? new Date(patient.createdAt).toLocaleDateString("pt-BR") : "—"}
            overallProgress={overallProgress}
          />

          {/* Therapeutic Objective */}
          <TherapeuticObjective
            title={therapeuticObjective.title}
            description={therapeuticObjective.description}
            definedDate={therapeuticObjective.definedDate}
          />

          {/* Short-term Goals */}
          <section>
            <div className="flex items-center justify-between mb-6 px-2">
              <div className="flex items-center gap-3">
                <div className="bg-[#8A05BE]/10 p-1.5 rounded-lg text-[#8A05BE]">
                  <span className="material-symbols-outlined text-[20px]">target</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900">Metas de Curto Prazo</h3>
              </div>
              <span className="text-sm font-medium px-3 py-1 bg-white/50 rounded-full text-gray-600 border border-white/50 shadow-sm">
                {goals.length} {goals.length === 1 ? "meta ativa" : "metas ativas"}
              </span>
            </div>

            {goals.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {goals.map((goal) => (
                  <GoalCard
                    key={goal.id}
                    id={goal.id}
                    title={goal.title}
                    description={goal.description}
                    progress={goal.progress}
                    status={goal.status === "completed" ? "in-progress" : (goal.status as "in-progress" | "attention" | "started")}
                    iconName="graphic_eq"
                    colorScheme="purple"
                    patientId={id}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                  <span className="material-symbols-outlined text-2xl text-gray-400">inbox</span>
                </div>
                <p className="text-gray-600 font-medium mb-2">Nenhuma meta criada ainda</p>
                <p className="text-gray-500 text-sm mb-4">Comece adicionando uma nova meta terapêutica</p>
                <button
                  onClick={handleAddGoal}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#8A05BE] text-white rounded-lg hover:bg-[#6D08AF] transition-colors"
                >
                  <span className="material-symbols-outlined text-base">add</span>
                  Adicionar Primeira Meta
                </button>
              </div>
            )}
          </section>

          {/* Weekly Activities Plan */}
          <WeeklyActivitiesPlan
            patientId={id}
            activities={weeklyActivities}
            onAddActivity={handleAddActivity}
            onActivityToggle={handleActivityToggle}
          />
        </div>
      </div>

      {/* Floating Action Button */}
      <button
        onClick={handleAddGoal}
        className="fixed bottom-8 right-8 size-16 bg-[#8A05BE] hover:bg-[#7A04AA] text-white rounded-2xl shadow-xl hover:scale-105 hover:shadow-[#8A05BE]/40 transition-all flex items-center justify-center group z-50"
      >
        <span className="material-symbols-outlined text-[32px] group-hover:rotate-90 transition-transform duration-300">
          add
        </span>
        <div className="absolute right-full mr-4 bg-white/90 backdrop-blur-md text-gray-900 px-4 py-2 rounded-xl text-sm font-bold shadow-lg opacity-0 translate-x-4 group-hover:translate-x-0 group-hover:opacity-100 transition-all whitespace-nowrap pointer-events-none border border-white/50">
          Adicionar Nova Meta
        </div>
      </button>
    </div>
  )
}
