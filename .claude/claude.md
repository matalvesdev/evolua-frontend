# Manual Operacional da IA - Evolua CRM

## Visão Geral do Projeto

O **Evolua** é um CRM para fonoaudiólogos que simplifica gestão de pacientes, agendamentos, relatórios clínicos e controle financeiro. Construído com Next.js 16, React 19, TypeScript, Supabase e AWS.

## Stack Tecnológica

### Frontend
- **Framework**: Next.js 16.1.1 (App Router)
- **UI**: React 19.2.3 + TypeScript 5.9.3
- **Estilização**: Tailwind CSS 4 + shadcn/ui
- **Estado**: TanStack React Query v5
- **Formulários**: React Hook Form + Zod
- **Autenticação**: Supabase Auth (JWT)

### Backend
- **Framework**: NestJS (TypeScript)
- **Deploy**: AWS App Runner
- **API**: REST com paginação

### Banco de Dados
- **Database**: Supabase PostgreSQL
- **Segurança**: Row-Level Security (RLS)
- **Isolamento**: Multi-tenant por `clinic_id`

### Infraestrutura
- **Frontend Hosting**: AWS Amplify
- **Backend Hosting**: AWS App Runner
- **Rate Limiting**: Upstash Redis
- **Analytics**: Himetrica

## Padrões Arquiteturais

### Estrutura de Pastas
```
frontend-evolua/
├── src/
│   ├── app/              # Rotas Next.js (App Router)
│   ├── components/       # Componentes React
│   │   ├── ui/           # Componentes base (shadcn/ui)
│   │   └── [feature]/    # Componentes por funcionalidade
│   ├── hooks/            # Custom hooks
│   ├── lib/              # Utilitários
│   │   ├── api/          # Cliente HTTP + endpoints
│   │   ├── security/     # CSP, RBAC, sanitização
│   │   └── supabase/     # Cliente Supabase
│   └── middleware.ts     # Middleware (auth, CSP, rate limit)
```

### Padrão de API Client
```typescript
// lib/api/client.ts
export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) => request<T>(path, { method: "POST", body: JSON.stringify(body) }),
  patch: <T>(path: string, body: unknown) => request<T>(path, { method: "PATCH", body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
}
```

**Características**:
- Injeção automática de JWT no header `Authorization`
- Retry com backoff exponencial (1s, 2s, 4s)
- Timeout de 30 segundos
- Refresh automático de token em 401
- Sanitização de erros antes de exibir

### Padrão de Hooks
```typescript
// hooks/use-patients.ts
export function usePatients(params?: { status?: string; search?: string }) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["patients", params],
    queryFn: () => patientsApi.listPatients(params),
  })
  
  return {
    patients: data?.data ?? [],
    total: data?.total ?? 0,
    loading: isLoading,
    error,
    refetch,
  }
}

export function usePatientMutations() {
  const queryClient = useQueryClient()
  
  const createMutation = useMutation({
    mutationFn: (input: CreatePatientInput) => patientsApi.createPatient(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["patients"] }),
  })
  
  return {
    createPatient: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
  }
}
```

### Padrão de Componentes
```typescript
// components/patients/patient-card.tsx
interface PatientCardProps {
  patient: Patient
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
}

export function PatientCard({ patient, onEdit, onDelete }: PatientCardProps) {
  // Lógica do componente
  return (
    <div className="glass-panel p-4 rounded-xl">
      {/* UI do componente */}
    </div>
  )
}
```

## Convenções de Código

### Nomenclatura
- **Arquivos**: kebab-case (`patient-card.tsx`, `use-patients.ts`)
- **Componentes**: PascalCase (`PatientCard`, `DashboardHeader`)
- **Funções**: camelCase (`createPatient`, `getAuthHeaders`)
- **Constantes**: UPPER_SNAKE_CASE (`API_BASE_URL`, `MAX_RETRIES`)
- **Tipos/Interfaces**: PascalCase (`Patient`, `CreatePatientInput`)

### TypeScript
- **Modo Strict**: Sempre ativado
- **Tipos Explícitos**: Preferir tipos explícitos em funções públicas
- **Interfaces vs Types**: Usar `interface` para objetos, `type` para unions/intersections
- **Generics**: Usar quando necessário para reutilização

### React
- **Functional Components**: Sempre usar function components
- **Hooks**: Seguir regras dos hooks (não em loops/condicionais)
- **Props**: Desestruturar props no parâmetro
- **Estado**: Usar React Query para estado do servidor, useState para UI local
- **Efeitos**: Minimizar useEffect, preferir React Query

### Estilização
- **Tailwind**: Usar classes utilitárias
- **Componentes**: Usar shadcn/ui como base
- **Cores**: Usar variáveis CSS (`text-[#8A05BE]` para roxo principal)
- **Responsividade**: Mobile-first (`md:`, `lg:` para desktop)

## Padrões de Testes

### Property-Based Testing
```typescript
// __tests__/patient-card.test.tsx
import fc from "fast-check"

describe("PatientCard", () => {
  it("should render patient name correctly", () => {
    fc.assert(
      fc.property(
        fc.record({
          id: fc.uuid(),
          name: fc.string({ minLength: 1, maxLength: 100 }),
          status: fc.constantFrom("active", "inactive", "discharged"),
        }),
        (patient) => {
          const { getByText } = render(<PatientCard patient={patient} />)
          expect(getByText(patient.name)).toBeInTheDocument()
        }
      )
    )
  })
})
```

### Testes de Integração
```typescript
// __tests__/api/patients.test.ts
describe("Patients API", () => {
  it("should create patient", async () => {
    const input = {
      name: "João Silva",
      email: "joao@example.com",
      phone: "(11) 98765-4321",
    }
    
    const patient = await createPatient(input)
    
    expect(patient.id).toBeDefined()
    expect(patient.name).toBe(input.name)
  })
})
```

## Boas Práticas de Segurança

### Input Sanitization
```typescript
import { stripHtml, escapeHtml, sanitizedString } from "@/lib/security/sanitize"

// Remover HTML de inputs
const cleanName = stripHtml(userInput)

// Escapar HTML para exibição
const safeHtml = escapeHtml(userInput)

// Validação com Zod
const schema = z.object({
  name: sanitizedString().min(1).max(100),
})
```

### Autenticação
```typescript
// middleware.ts
export async function middleware(request: NextRequest) {
  const supabase = createServerClient(...)
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user && isProtectedRoute) {
    return NextResponse.redirect(new URL("/auth/login", request.url))
  }
  
  return NextResponse.next()
}
```

### RBAC
```typescript
import { useRBAC } from "@/lib/security/rbac"

export function AdminOnlyComponent() {
  const { hasPermission } = useRBAC()
  
  if (!hasPermission(["admin"])) {
    return <AccessDenied />
  }
  
  return <AdminPanel />
}
```

## Regras de Documentação

### JSDoc para Funções Públicas
```typescript
/**
 * Cria um novo paciente no sistema.
 * 
 * @param input - Dados do paciente a ser criado
 * @returns Promise com o paciente criado incluindo ID
 * @throws ApiError se a validação falhar ou houver erro no servidor
 * 
 * @example
 * const patient = await createPatient({
 *   name: "João Silva",
 *   email: "joao@example.com",
 * })
 */
export async function createPatient(input: CreatePatientInput): Promise<Patient> {
  return api.post<Patient>("/patients", input)
}
```

### Comentários em Código
- **Quando**: Explicar "por quê", não "o quê"
- **Evitar**: Comentários óbvios
- **Preferir**: Código auto-explicativo com nomes descritivos

### README
- Manter atualizado com instruções de setup
- Incluir variáveis de ambiente necessárias
- Documentar scripts disponíveis

## Fluxo de Deploy

### Desenvolvimento Local
```bash
# Instalar dependências
npm ci

# Configurar variáveis de ambiente
cp .env.example .env.local

# Rodar em modo dev
npm run dev
```

### Build e Deploy
```bash
# Build de produção
npm run build

# Testar build localmente
npm run start

# Deploy automático via AWS Amplify
git push origin main  # Deploy para produção
git push origin develop  # Deploy para dev
```

### Ambientes
- **develop branch** → `develop.d13ha6b4opi2ib.amplifyapp.com`
- **main branch** → `main.d13ha6b4opi2ib.amplifyapp.com`

## Princípios de Refatoração

### Quando Refatorar
- Código duplicado (DRY)
- Funções muito longas (>50 linhas)
- Componentes muito complexos (>200 linhas)
- Lógica de negócio em componentes (extrair para hooks)
- Queries N+1 (otimizar com joins)

### Como Refatorar
1. **Escrever testes** antes de refatorar
2. **Pequenos passos** incrementais
3. **Commit frequente** após cada passo
4. **Validar** que testes continuam passando
5. **Revisar** performance e legibilidade

### Padrões de Refatoração
- **Extract Function**: Extrair lógica complexa para função separada
- **Extract Hook**: Extrair lógica de estado para custom hook
- **Extract Component**: Extrair UI repetida para componente
- **Inline**: Remover abstrações desnecessárias
- **Rename**: Melhorar nomes de variáveis/funções

## Comandos Úteis

```bash
# Desenvolvimento
npm run dev              # Rodar em modo dev
npm run build            # Build de produção
npm run start            # Rodar build de produção
npm run lint             # Rodar ESLint
npm run test             # Rodar testes

# Análise
npm run analyze          # Analisar bundle size (futuro)
npm run type-check       # Verificar tipos TypeScript

# Database
npm run db:migrate       # Rodar migrações (futuro)
npm run db:seed          # Popular banco com dados de teste (futuro)
```

## Troubleshooting Comum

### Erro de Autenticação
- Verificar se JWT está sendo enviado no header
- Verificar se token não expirou
- Verificar se Supabase URL/Key estão corretos

### Erro de CORS
- Verificar se backend permite origin do frontend
- Verificar se headers estão corretos

### Erro de CSP
- Verificar se domínio está em `connect-src`
- Verificar se nonce está sendo gerado corretamente

### Performance Lenta
- Verificar queries N+1 no backend
- Verificar se React Query está cacheando corretamente
- Verificar se imagens estão otimizadas

## Recursos Adicionais

- **Documentação Next.js**: https://nextjs.org/docs
- **Documentação React Query**: https://tanstack.com/query/latest
- **Documentação Supabase**: https://supabase.com/docs
- **Documentação Tailwind**: https://tailwindcss.com/docs
- **Documentação shadcn/ui**: https://ui.shadcn.com
