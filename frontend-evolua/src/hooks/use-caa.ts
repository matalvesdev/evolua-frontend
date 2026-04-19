import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as caaApi from '@/lib/api/caa';
import type { CreateCAABoardInput, UpdateCAABoardInput } from '@/lib/api/caa';

export type { CAABoard, CAACell, ArasaacPictogram } from '@/lib/api/caa';

export function useCAABoards(params?: { patientId?: string; category?: string }) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['caa-boards', params],
    queryFn: () => caaApi.listCAABoards(params),
  });
  return { boards: data ?? [], loading: isLoading, error };
}

export function useCAABoard(id: string) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['caa-board', id],
    queryFn: () => caaApi.getCAABoard(id),
    enabled: !!id,
  });
  return { board: data, loading: isLoading, error };
}

export function useArasaacSearch(keyword: string, language = 'pt') {
  const { data, isLoading, error } = useQuery({
    queryKey: ['arasaac-search', keyword, language],
    queryFn: () => caaApi.searchArasaacPictograms(keyword, language),
    enabled: keyword.length >= 2,
    staleTime: 1000 * 60 * 60, // 1 hour — pictograms don't change
  });
  return { pictograms: data ?? [], loading: isLoading, error };
}

export function useCAAboadMutations() {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (input: CreateCAABoardInput) => caaApi.createCAABoard(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['caa-boards'] }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...input }: UpdateCAABoardInput & { id: string }) =>
      caaApi.updateCAABoard(id, input),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['caa-boards'] });
      queryClient.invalidateQueries({ queryKey: ['caa-board', vars.id] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => caaApi.deleteCAABoard(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['caa-boards'] }),
  });

  return {
    createBoard: createMutation.mutateAsync,
    updateBoard: updateMutation.mutateAsync,
    deleteBoard: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
