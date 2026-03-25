# 📋 Padrões TypeScript/React

## 1. Componentes React

### Template Base
```typescript
'use client'

import React from 'react'
import { cn } from '@/lib/utils'

interface ComponentNameProps {
  title: string
  children?: React.ReactNode
  className?: string
}

/**
 * ComponentName - Descrição breve do componente
 * 
 * @param {ComponentNameProps} props - Props do componente
 * @returns {JSX.Element} Elemento renderizado
 * 
 * @example
 * ```tsx
 * <ComponentName title="Meu Título">
 *   Conteúdo aqui
 * </ComponentName>
 * ```
 */
export function ComponentName({ 
  title, 
  children, 
  className 
}: ComponentNameProps): JSX.Element {
  return (
    <div className={cn('base-styles', className)}>
      <h2>{title}</h2>
      {children}
    </div>
  )
}
```

### Regras Obrigatórias
- ✅ `'use client'` em componentes com interatividade
- ✅ Props com interface/type explícita
- ✅ JSDoc com `@param`, `@returns`, `@example`
- ✅ Desestruturação de props
- ✅ Usar `cn()` para classes condicionais
- ✅ Retorno explícito do tipo: `: JSX.Element`

---

## 2. Custom Hooks

### Template Base
```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { UseQueryResult, UseMutationResult } from '@tanstack/react-query'
import { api } from '@/lib/api/client'

/**
 * usePatients - Hook para gerenciar dados de pacientes
 * 
 * @param {Object} params - Parâmetros da query
 * @param {string} [params.status] - Filtrar por status
 * @param {string} [params.search] - Buscar por texto
 * @returns {Object} - Pacientes, loading, error, refetch
 * 
 * @example
 * ```tsx
 * const { patients, loading, error } = usePatients({ status: 'active' })
 * ```
 */
export function usePatients(params?: { 
  status?: string
  search?: string 
}): {
  patients: Patient[]
  total: number
  loading: boolean
  error: Error | null
  refetch: () => Promise<any>
} {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['patients', params],
    queryFn: () => api.get<{ data: Patient[], total: number }>('/patients', { params }),
  })
  
  return {
    patients: data?.data ?? [],
    total: data?.total ?? 0,
    loading: isLoading,
    error: error as Error | null,
    refetch,
  }
}

/**
 * usePatientActions - Hook para criar/editar/deletar pacientes
 */
export function usePatientActions() {
  const queryClient = useQueryClient()
  
  const createMutation = useMutation({
    mutationFn: (input: CreatePatientInput) => api.post<Patient>('/patients', input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['patients'] }),
  })
  
  return {
    create: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    error: createMutation.error as Error | null,
  }
}
```

### Regras Obrigatórias
- ✅ JSDoc completo com exemplos
- ✅ Retorno tipado explicitamente
- ✅ Invalidar queries após mutations
- ✅ Retornar estado de loading/error sempre
- ✅ Usar camelCase: `usePatients`, `usePatientActions`

---

## 3. API Client

### Padrão
```typescript
// lib/api/endpoints/patients.ts
import { api } from './client'

export interface Patient {
  id: string
  name: string
  email: string
  phone: string
  status: 'active' | 'inactive' | 'archived'
}

export interface CreatePatientInput {
  name: string
  email: string
  phone: string
}

export const patientsApi = {
  list: (params?: { status?: string; search?: string }) =>
    api.get<{ data: Patient[]; total: number }>('/patients', { params }),
  
  getById: (id: string) =>
    api.get<Patient>(`/patients/${id}`),
  
  create: (input: CreatePatientInput) =>
    api.post<Patient>('/patients', input),
  
  update: (id: string, input: Partial<CreatePatientInput>) =>
    api.patch<Patient>(`/patients/${id}`, input),
  
  delete: (id: string) =>
    api.delete<void>(`/patients/${id}`),
}
```

### Regras Obrigatórias
- ✅ Tipos definidos junto com endpoints
- ✅ Retorno com tipos genéricos `<T>`
- ✅ Métodos nomeados descritivamente
- ✅ Agrupar por recurso (patients, appointments, etc)

---

## 4. Validação com Zod

### Padrão
```typescript
import { z } from 'zod'

export const createPatientSchema = z.object({
  name: z.string().min(1, 'Nome obrigatório').max(100),
  email: z.string().email('Email inválido'),
  phone: z.string().regex(/^\(\d{2}\)\s?\d{4,5}-\d{4}$/, 'Telefone inválido'),
  status: z.enum(['active', 'inactive']).default('active'),
})

export type CreatePatientInput = z.infer<typeof createPatientSchema>

// Uso em formulário
export function PatientForm() {
  const form = useForm<CreatePatientInput>({
    resolver: zodResolver(createPatientSchema),
  })
  
  return <form onSubmit={form.handleSubmit(onSubmit)} />
}
```

### Regras Obrigatórias
- ✅ Mensagens de erro em português
- ✅ `z.infer<>` para tipos
- ✅ Validações customizadas quando necessário
- ✅ Colocar schemas em `lib/schemas/`

---

## 5. Convenções de Nomenclatura

| Item | Exemplo | Regra |
|------|---------|-------|
| Arquivos | `patient-card.tsx` | kebab-case |
| Componentes | `PatientCard` | PascalCase |
| Funções | `createPatient()` | camelCase |
| Constantes | `MAX_RETRIES` | UPPER_SNAKE_CASE |
| Tipos/Interfaces | `Patient`, `CreatePatientInput` | PascalCase |
| Variáveis | `patientName`, `isLoading` | camelCase |
| Booleanos | `isLoading`, `hasError`, `canDelete` | is/has/can + PascalCase |

---

## 6. Imports

### Ordem Recomendada
```typescript
// 1. React
import React, { useState } from 'react'

// 2. Bibliotecas externas
import { useQuery } from '@tanstack/react-query'

// 3. Componentes internos
import { Button } from '@/components/ui/button'

// 4. Hooks/Utils
import { usePatients } from '@/hooks/use-patients'
import { cn } from '@/lib/utils'

// 5. Types
import type { Patient } from '@/lib/types'
```

### Regras
- ✅ Agrupar imports por categoria
- ✅ Usar absolute imports: `@/` em vez de relativos
- ✅ Importações de types com `import type`
- ✅ Organizar alfabeticamente dentro de cada grupo

