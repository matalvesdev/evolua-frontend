import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'

export interface Exercise {
  id: string
  title: string
  area: string
  duration: string
  level: 'Fácil' | 'Médio' | 'Difícil'
  description: string
  videoUrl: string
  tags: string[]
}

export function useExercises() {
  return useQuery<Exercise[]>({
    queryKey: ['exercises'],
    queryFn: async () => {
      const res = await api.get<{ data: Exercise[] } | Exercise[]>('/api/exercises')
      return Array.isArray(res) ? res : (res?.data ?? [])
    },
    staleTime: 60_000,
  })
}

export function usePatientList() {
  return useQuery<{ id: string; name: string }[]>({
    queryKey: ['exercises', 'patients-summary'],
    queryFn: () => api.get<{ id: string; name: string }[]>('/api/patients?pageSize=200'),
    staleTime: 30_000,
  })
}
