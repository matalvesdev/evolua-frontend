/**
 * Goals API Client
 * Communicates with NestJS backend endpoints for patient goals management
 */

import { api } from './client';

export type GoalStatus = 'in_progress' | 'completed' | 'on_hold' | 'abandoned';
export type GoalPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface CreateGoalInput {
  patientId: string;
  title: string;
  description?: string;
  targetDate?: string;
  priority?: GoalPriority;
}

export interface UpdateGoalInput {
  title?: string;
  description?: string;
  targetDate?: string;
  status?: GoalStatus;
  priority?: GoalPriority;
}

export interface GoalResponse {
  id: string;
  clinicId: string;
  patientId: string;
  therapistId: string;
  title: string;
  description?: string;
  status: GoalStatus;
  priority: GoalPriority;
  progress: number;
  startDate: string;
  targetDate?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GoalsListResponse {
  data: GoalResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ProgressEntry {
  id: string;
  goalId: string;
  therapistId: string;
  progress: number;
  notes?: string;
  createdAt: string;
}

/**
 * Criar novo objetivo terapêutico (meta)
 */
export async function createGoal(input: CreateGoalInput): Promise<GoalResponse> {
  return api.post<GoalResponse>('/patient-goals', {
    patientId: input.patientId,
    title: input.title,
    description: input.description,
    targetDate: input.targetDate,
    priority: input.priority ?? 'medium',
  });
}

/**
 * Listar metas de um paciente
 */
export async function listGoals(
  patientId: string,
  options?: { status?: string; page?: number; limit?: number }
): Promise<GoalsListResponse> {
  const params = new URLSearchParams();
  params.append('patientId', patientId);
  if (options?.status) params.append('status', options.status);
  if (options?.page) params.append('page', String(options.page));
  if (options?.limit) params.append('limit', String(options.limit));

  return api.get<GoalsListResponse>(`/patient-goals?${params.toString()}`);
}

/**
 * Buscar meta específica
 */
export async function getGoal(goalId: string): Promise<GoalResponse> {
  return api.get<GoalResponse>(`/patient-goals/${goalId}`);
}

/**
 * Atualizar meta
 */
export async function updateGoal(goalId: string, input: UpdateGoalInput): Promise<GoalResponse> {
  return api.patch<GoalResponse>(`/patient-goals/${goalId}`, input);
}

/**
 * Deletar meta
 */
export async function deleteGoal(goalId: string): Promise<void> {
  await api.delete(`/patient-goals/${goalId}`);
}

/**
 * Completar meta (endpoint dedicado)
 */
export async function completeGoal(goalId: string, notes?: string): Promise<GoalResponse> {
  return api.patch<GoalResponse>(`/patient-goals/${goalId}/complete`, { notes });
}

/**
 * Adicionar progresso na meta
 */
export async function addGoalProgress(
  goalId: string,
  progress: number,
  notes?: string
): Promise<ProgressEntry> {
  return api.post<ProgressEntry>(`/patient-goals/${goalId}/progress`, {
    progress,
    notes,
  });
}

/**
 * Obter histórico de progresso
 */
export async function getGoalProgress(goalId: string): Promise<ProgressEntry[]> {
  return api.get<ProgressEntry[]>(`/patient-goals/${goalId}/progress`);
}
