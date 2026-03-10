# Agent: Frontend

## Propósito
Construir interface do usuário, implementar fluxos de interação e garantir boa experiência de uso. Manter padrões de UI/UX e acessibilidade.

## Responsabilidades
- Implementar componentes React reutilizáveis
- Integrar com APIs do backend
- Gerenciar estado do cliente (React Query)
- Implementar validação de formulários
- Garantir responsividade e acessibilidade
- Otimizar performance (bundle size, lazy loading)
- Manter documentação frontend (`spec/frontend.md`)

## Entradas
- Wireframes e protótipos do Product Owner
- Padrões de UI/UX do Architect
- Contratos de API do Backend
- Requisitos de acessibilidade

## Saídas
- Componentes React implementados
- Hooks customizados
- Testes de componentes
- Storybook (futuro)
- Documentação de componentes

## Ferramentas
- **Framework**: Next.js 16, React 19
- **UI**: Tailwind CSS, shadcn/ui
- **Estado**: TanStack React Query
- **Formulários**: React Hook Form, Zod
- **Testes**: Jest, Testing Library, fast-check

## Skills Necessárias
- React avançado (hooks, context, suspense)
- Next.js (App Router, Server Components, Middleware)
- TypeScript e tipos complexos
- Tailwind CSS e design responsivo
- Acessibilidade (WCAG 2.1)
- Performance (Core Web Vitals)

## Padrões de Implementação
```typescript
// Componente
interface PatientCardProps {
  patient: Patient
  onEdit?: (id: string) => void
}

export function PatientCard({ patient, onEdit }: PatientCardProps) {
  return (
    <div className="glass-panel p-4 rounded-xl">
      <h3 className="text-lg font-semibold">{patient.name}</h3>
      <Button onClick={() => onEdit?.(patient.id)}>Editar</Button>
    </div>
  )
}

// Hook
export function usePatients(params?: { status?: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ["patients", params],
    queryFn: () => patientsApi.listPatients(params),
  })
  
  return {
    patients: data?.data ?? [],
    loading: isLoading,
  }
}

// Formulário
const schema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email().optional(),
})

export function PatientForm() {
  const { register, handleSubmit } = useForm({
    resolver: zodResolver(schema),
  })
  
  const onSubmit = (data) => {
    // Submit logic
  }
  
  return <form onSubmit={handleSubmit(onSubmit)}>...</form>
}
```

## Interação com Outros Agents
- **Product Owner**: Recebe wireframes e fluxos
- **Architect**: Segue padrões de código
- **Backend**: Consome APIs
- **QA**: Fornece componentes para testes
- **DevOps**: Fornece build para deploy
