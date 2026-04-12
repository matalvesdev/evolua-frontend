/**
 * Formulário para criar nova meta terapêutica
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useGoalMutations } from '@/hooks/use-goals';

const createGoalSchema = z.object({
  title: z.string().min(5, 'Título deve ter no mínimo 5 caracteres').max(100),
  description: z.string().min(10, 'Descrição deve ter no mínimo 10 caracteres').max(500),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
});

type CreateGoalFormData = z.infer<typeof createGoalSchema>;

interface CreateGoalFormProps {
  patientId: string;
}

export function CreateGoalForm({ patientId }: CreateGoalFormProps) {
  const router = useRouter();
  const { createGoal, isCreating } = useGoalMutations(patientId);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateGoalFormData>({
    resolver: zodResolver(createGoalSchema),
    defaultValues: {
      priority: 'medium',
    },
  });

  const onSubmit = async (data: CreateGoalFormData) => {
    try {
      setError(null);
      await createGoal({
        patientId,
        title: data.title,
        description: data.description,
        priority: data.priority,
      });

      // Voltar para a página de metas após criar
      router.push(`/dashboard/pacientes/${patientId}/planos-metas`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar meta');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 sm:space-y-6">
      {/* Título */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
          Título da Meta <span className="text-red-500">*</span>
        </label>
        <input
          id="title"
          type="text"
          placeholder="Ex: Aquisição do Fonema /r/"
          {...register('title')}
          className="w-full px-4 py-2.5 sm:py-3 rounded-lg border border-gray-200 bg-white text-gray-900 placeholder-gray-400 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-[#8A05BE] focus:border-transparent transition-all"
        />
        {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
      </div>

      {/* Descrição */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
          Descrição da Meta <span className="text-red-500">*</span>
        </label>
        <textarea
          id="description"
          placeholder="Descreva em detalhes qual é o objetivo terapêutico..."
          rows={4}
          {...register('description')}
          className="w-full px-4 py-2.5 sm:py-3 rounded-lg border border-gray-200 bg-white text-gray-900 placeholder-gray-400 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-[#8A05BE] focus:border-transparent transition-all resize-y min-h-[120px]"
        />
        {errors.description && (
          <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
        )}
      </div>

      {/* Prioridade */}
      <div>
        <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-2">
          Prioridade
        </label>
        <select
          id="priority"
          {...register('priority')}
          className="w-full px-4 py-2.5 sm:py-3 rounded-lg border border-gray-200 bg-white text-gray-900 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-[#8A05BE] focus:border-transparent transition-all"
        >
          <option value="low">Baixa</option>
          <option value="medium">Média</option>
          <option value="high">Alta</option>
          <option value="urgent">Urgente</option>
        </select>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Buttons */}
      <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2 sm:pt-4 md:pt-6">
        <button
          type="button"
          onClick={() => router.back()}
          className="w-full sm:flex-1 px-6 py-3 rounded-lg border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isCreating}
          className="w-full sm:flex-1 px-6 py-3 rounded-lg bg-[#8A05BE] text-white font-medium hover:bg-[#6D08AF] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          {isCreating && (
            <span className="material-symbols-outlined text-sm animate-spin">
              progress_activity
            </span>
          )}
          {isCreating ? 'Salvando...' : 'Salvar Meta'}
        </button>
      </div>
    </form>
  );
}
