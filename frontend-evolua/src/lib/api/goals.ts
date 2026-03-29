/**
 * Goals API Client
 * Communicates with NestJS backend endpoints for patient goals management
 */

import { api } from "./client"

export interface CreateGoalInput {
  patientId: string
  title: string
  description: string
  status?: "started" | "in-progress" | "completed"
  progress?: number
}

export interface UpdateGoalInput {
  title?: string
  description?: string
  progress?: number
  status?: "started" | "in-progress" | "completed"
}

export interface GoalResponse {
  id: string
  patientId: string
  title: string
  description: string
  progress: number
  status: "started" | "in-progress" | "completed"
  createdAt: string
  updatedAt: string
}

export interface GoalsListResponse {
  data: GoalResponse[]
  total: number
  skip: number
  take: number
}

export interface ProgressEntry {
  id: string
  goalId: string
  progress: number
  note?: string
  createdAt: string
}

/**
 * Criar novo objetivo terapêutico (meta)
 */
export async function createGoal(input: CreateGoalInput): Promise<GoalResponse> {
  return api.post<GoalResponse>("/patient-goals", {
    patientId: input.patientId,
    title: input.title,
    description: input.description,
    status: input.status || "started",
    progress: input.progress || 0,
  })
}

/**
 * Listar metas de um paciente
 */
export async function listGoals(
  patientId: string,
  options?: { status?: string; skip?: number; take?: number }
): Promise<GoalsListResponse> {
  const params = new URLSearchParams()
  params.append("patientId", patientId)
  if (options?.status) params.append("status", options.status)
  if (options?.skip) params.append("skip", String(options.skip))
  if (options?.take) params.append("take", String(options.take))

  return api.get<GoalsListResponse>(`/patient-goals?${params.toString()}`)
}

/**
 * Buscar meta específica
 */
export async function getGoal(goalId: string): Promise<GoalResponse> {
  return api.get<GoalResponse>(`/patient-goals/${goalId}`)
}

/**
 * Atualizar meta
 */
export async function updateGoal(goalId: string, input: UpdateGoalInput): Promise<GoalResponse> {
  return api.patch<GoalResponse>(`/patient-goals/${goalId}`, input)
}

/**
 * Deletar meta
 */
export async function deleteGoal(goalId: string): Promise<void> {
  await api.delete(`/patient-goals/${goalId}`)
}

/**
 * Completar meta
 */
export async function completeGoal(goalId: string): Promise<GoalResponse> {
  return api.patch<GoalResponse>(`/patient-goals/${goalId}`, { status: "completed", progress: 100 })
}

/**
 * Adicionar progresso na meta
 */
export async function addGoalProgress(
  goalId: string,
  progress: number,
  note?: string
): Promise<ProgressEntry> {
  return api.post<ProgressEntry>(`/patient-goals/${goalId}/progress`, {
    progress,
    note,
  })
}

/**
 * Obter histórico de progresso
 */
export async function getGoalProgress(goalId: string): Promise<ProgressEntry[]> {
  return api.get<ProgressEntry[]>(`/patient-goals/${goalId}/progress`)
}
