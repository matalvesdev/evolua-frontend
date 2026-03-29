/**
 * Hook para gerenciar Goals (Metas Terapêuticas)
 * Usa React Query para caching e sincronização com backend
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import * as goalsApi from "@/lib/api/goals"

/**
 * Hook para listar metas de um paciente
 */
export function useGoals(patientId: string, options?: { status?: string }) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["goals", patientId, options?.status],
    queryFn: () => goalsApi.listGoals(patientId, options),
    enabled: !!patientId,
  })

  return {
    goals: data?.data ?? [],
    total: data?.total ?? 0,
    isLoading,
    error: error as Error | null,
    refetch,
  }
}

/**
 * Hook para buscar uma meta específica
 */
export function useGoal(goalId: string) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["goal", goalId],
    queryFn: () => goalsApi.getGoal(goalId),
    enabled: !!goalId,
  })

  return {
    goal: data,
    isLoading,
    error: error as Error | null,
    refetch,
  }
}

/**
 * Hook para obter histórico de progresso de uma meta
 */
export function useGoalProgress(goalId: string) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["goalProgress", goalId],
    queryFn: () => goalsApi.getGoalProgress(goalId),
    enabled: !!goalId,
  })

  return {
    progress: data ?? [],
    isLoading,
    error: error as Error | null,
  }
}

/**
 * Hooks para mutações (criar, atualizar, deletar metas)
 */
export function useGoalMutations(patientId: string) {
  const queryClient = useQueryClient()

  const createMutation = useMutation({
    mutationFn: (input: goalsApi.CreateGoalInput) => goalsApi.createGoal(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals", patientId] })
    },
    onError: (error: Error) => {
      console.error("Erro ao criar meta:", error)
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ goalId, input }: { goalId: string; input: goalsApi.UpdateGoalInput }) =>
      goalsApi.updateGoal(goalId, input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["goals", patientId] })
      queryClient.invalidateQueries({ queryKey: ["goal", data.id] })
    },
    onError: (error: Error) => {
      console.error("Erro ao atualizar meta:", error)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (goalId: string) => goalsApi.deleteGoal(goalId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals", patientId] })
    },
    onError: (error: Error) => {
      console.error("Erro ao deletar meta:", error)
    },
  })

  const completeMutation = useMutation({
    mutationFn: (goalId: string) => goalsApi.completeGoal(goalId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["goals", patientId] })
      queryClient.setQueryData(["goal", data.id], data)
    },
    onError: (error: Error) => {
      console.error("Erro ao completar meta:", error)
    },
  })

  const addProgressMutation = useMutation({
    mutationFn: ({ goalId, progress, note }: { goalId: string; progress: number; note?: string }) =>
      goalsApi.addGoalProgress(goalId, progress, note),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["goalProgress", data.goalId] })
      queryClient.invalidateQueries({ queryKey: ["goals", patientId] })
    },
    onError: (error: Error) => {
      console.error("Erro ao adicionar progresso:", error)
    },
  })

  return {
    createGoal: createMutation.mutateAsync,
    updateGoal: updateMutation.mutateAsync,
    deleteGoal: deleteMutation.mutateAsync,
    completeGoal: completeMutation.mutateAsync,
    addProgress: addProgressMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isCompleting: completeMutation.isPending,
    isAddingProgress: addProgressMutation.isPending,
  }
}
