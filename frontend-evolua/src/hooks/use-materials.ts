import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as materialsApi from '@/lib/api/materials';
import type { CreateMaterialInput, UpdateMaterialInput, MaterialType, TherapeuticArea, AgeGroup } from '@/lib/api/materials';

export type { TherapeuticMaterial, MaterialType, TherapeuticArea, AgeGroup } from '@/lib/api/materials';

export function useMaterials(params?: {
  patientId?: string;
  type?: MaterialType;
  therapeuticArea?: TherapeuticArea;
  ageGroup?: AgeGroup;
  search?: string;
  page?: number;
  limit?: number;
}) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['materials', params],
    queryFn: () => materialsApi.listMaterials(params),
  });
  return {
    materials: data?.data ?? [],
    total: data?.total ?? 0,
    loading: isLoading,
    error,
  };
}

export function useMaterial(id: string) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['material', id],
    queryFn: () => materialsApi.getMaterial(id),
    enabled: !!id,
  });
  return { material: data, loading: isLoading, error };
}

export function useMaterialMutations() {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (input: CreateMaterialInput) => materialsApi.createMaterial(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['materials'] }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...input }: UpdateMaterialInput & { id: string }) =>
      materialsApi.updateMaterial(id, input),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['materials'] });
      queryClient.invalidateQueries({ queryKey: ['material', vars.id] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => materialsApi.deleteMaterial(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['materials'] }),
  });

  const duplicateMutation = useMutation({
    mutationFn: (id: string) => materialsApi.duplicateMaterial(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['materials'] }),
  });

  return {
    createMaterial: createMutation.mutateAsync,
    updateMaterial: updateMutation.mutateAsync,
    deleteMaterial: deleteMutation.mutateAsync,
    duplicateMaterial: duplicateMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isDuplicating: duplicateMutation.isPending,
  };
}
