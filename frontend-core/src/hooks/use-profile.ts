import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'

export interface Profile {
  name: string
  crfa: string
  email: string
  phone: string
  bio: string
  site: string
  cnpj: string
  specialties: string[]
  workSlots: { day: string; active: boolean; start: string; end: string }[]
}

export function useProfile() {
  return useQuery<Profile>({
    queryKey: ['profile'],
    queryFn: () => api.get<Profile>('/api/auth/profile'),
    staleTime: 60_000,
  })
}

export function useUpdateProfile() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: Partial<Profile>) => api.patch<Profile>('/api/auth/profile', body),
    onSuccess: () => { void qc.invalidateQueries({ queryKey: ['profile'] }) },
  })
}
