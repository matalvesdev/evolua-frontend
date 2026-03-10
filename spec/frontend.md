# Especificação de Arquitetura Frontend - Evolua CRM

## Visão Geral

O frontend do Evolua CRM é uma aplicação web moderna construída com **Next.js 16** (App Router), **React 19**, **TypeScript** e **Tailwind CSS**. A arquitetura segue princípios de componentização, separação de responsabilidades e otimização de performance para oferecer uma experiência fluida aos terapeutas.

## Stack Tecnológica

### Core Framework
- **Next.js 16.1.1** - Framework React com SSR, SSG e App Router
- **React 19.2.3** - Biblioteca de UI com Server Components
- **TypeScript 5.9.3** - Tipagem estática e segurança de tipos

### Estilização e UI
- **Tailwind CSS 4** - Framework CSS utility-first
- **Radix UI** - Componentes acessíveis e sem estilo
- **Lucide React** - Biblioteca de ícones
- **Tabler Icons** - Ícones adicionais
- **shadcn/ui** - Sistema de componentes reutilizáveis
- **class-variance-authority** - Gerenciamento de variantes de componentes
- **tailwind-merge** - Merge inteligente de classes Tailwind

### Gerenciamento de Estado e Dados
- **TanStack Query (React Query) 5.90** - Cache, sincronização e gerenciamento de estado servidor
- **React Hook Form 7.71** - Gerenciamento de formulários performático
- **Zod 4.3** - Validação de schemas e tipos
- **@hookform/resolvers** - Integração Zod + React Hook Form

### Autenticação e Backend
- **Supabase Client 2.89** - Cliente JavaScript para Supabase
- **@supabase/ssr** - Integração SSR com Supabase
- **Upstash Redis** - Cache e rate limiting
- **@upstash/ratelimit** - Proteção contra abuso de APIs

### Utilitários
- **date-fns 4.1** - Manipulação de datas
- **react-day-picker 9.13** - Seletor de datas
- **jspdf 4.1** - Geração de PDFs
- **sonner 2.0** - Sistema de notificações toast
- **clsx** - Utilitário para classes condicionais

### Analytics e Monitoramento
- **@himetrica/tracker-js** - Analytics e rastreamento de eventos

### Testes
- **Jest 30.2** - Framework de testes
- **@fast-check/jest** - Property-based testing
- **fast-check 4.5** - Geração de dados para testes
- **ts-jest** - Suporte TypeScript no Jest

## Arquitetura de Componentes

### Estrutura de Diretórios

```
src/
├── app/                          # App Router (Next.js 16)
│   ├── auth/                     # Páginas de autenticação
│   │   ├── login/
│   │   └── cadastro/             # Fluxo de onboarding
│   ├── dashboard/                # Área autenticada
│   │   ├── page.tsx              # Dashboard principal
│   │   ├── layout.tsx            # Layout compartilhado
│   │   ├── pacientes/            # Gestão de pacientes
│   │   ├── agendamentos/         # Agenda e consultas
│   │   ├── financeiro/           # Controle financeiro
│   │   ├── relatorios/           # Relatórios clínicos
│   │   ├── tarefas/              # Tarefas e lembretes
│   │   ├── perfil/               # Perfil do terapeuta
│   │   └── configuracoes/        # Configurações
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Landing page
│   └── globals.css               # Estilos globais
│
├── components/                   # Componentes reutilizáveis
│   ├── ui/                       # Componentes base (shadcn)
│   ├── dashboard/                # Componentes do dashboard
│   ├── patient-management/       # Gestão de pacientes
│   ├── patient-profile/          # Perfil do paciente
│   ├── appointment-booking/      # Agendamento de consultas
│   ├── calendar/                 # Calendário e agenda
│   ├── finances/                 # Componentes financeiros
│   ├── tasks/                    # Tarefas e lembretes
│   ├── audio/                    # Gravação de áudio
│   ├── audio-recorder/           # Gravador de áudio avançado
│   ├── report-review/            # Revisão de relatórios
│   ├── patient-documents/        # Documentos do paciente
│   ├── patient-goals/            # Metas terapêuticas
│   ├── patient-communication/    # Histórico de comunicação
│   ├── whatsapp/                 # Integração WhatsApp
│   ├── onboarding/               # Componentes de cadastro
│   ├── auth/                     # Autenticação e segurança
│   ├── analytics/                # Analytics (Himetrica)
│   └── transactions/             # Transações financeiras
│
├── lib/                          # Utilitários e configurações
│   ├── supabase/                 # Cliente Supabase
│   ├── utils/                    # Funções utilitárias
│   ├── validations/              # Schemas Zod
│   └── hooks/                    # Custom hooks
│
├── types/                        # Definições de tipos TypeScript
│   ├── database.types.ts         # Tipos do banco de dados
│   ├── patient.types.ts          # Tipos de paciente
│   └── appointment.types.ts      # Tipos de agendamento
│
└── styles/                       # Estilos adicionais
    └── globals.css               # Estilos globais Tailwind
```

### Padrões de Componentes

#### 1. Componentes de UI Base (ui/)
Componentes primitivos reutilizáveis baseados em Radix UI e shadcn/ui:
- **Button** - Botões com variantes (primary, secondary, ghost, etc.)
- **Input** - Campos de entrada com validação
- **Dialog** - Modais e diálogos
- **Card** - Containers de conteúdo
- **Badge** - Tags e labels
- **Avatar** - Imagens de perfil
- **Calendar** - Seletor de datas
- **Checkbox, Radio, Switch** - Controles de formulário
- **Select, Combobox** - Seletores dropdown
- **Tabs** - Navegação por abas
- **Sheet** - Painéis laterais deslizantes

#### 2. Componentes de Domínio
Componentes específicos do negócio organizados por funcionalidade:

**Dashboard:**
- `DashboardHeader` - Cabeçalho com notificações e perfil
- `QuickActionsBar` - Barra de ações rápidas
- `RecentPatients` - Lista de pacientes recentes
- `ScheduleCard` - Agenda do dia
- `RemindersPanel` - Painel de lembretes
- `StatsCards` - Cards de estatísticas
- `NotificationPanel` - Painel de notificações

**Patient Management:**
- `PatientList` - Lista de pacientes com filtros
- `PatientCard` - Card de paciente
- `PatientRegistrationForm` - Formulário de cadastro
- `PatientProfileEditor` - Editor de perfil
- `MedicalHistoryForm` - Histórico médico
- `TreatmentTimeline` - Linha do tempo do tratamento

**Appointment Booking:**
- `DatePickerCalendar` - Calendário de seleção
- `TimeSlotGrid` - Grade de horários disponíveis
- `PatientSearchInput` - Busca de pacientes
- `AppointmentSummary` - Resumo do agendamento
- `AppointmentProgressBar` - Barra de progresso

**Audio Recording:**
- `AudioRecorder` - Gravador de áudio
- `AudioWaveform` - Visualização de forma de onda
- `RecordingControls` - Controles de gravação
- `AudioTranscriptionReviewModal` - Revisão de transcrição

#### 3. Componentes de Layout
- `DashboardLayout` - Layout principal do dashboard
- `DashboardSidebar` - Sidebar de navegação
- `OnboardingLayout` - Layout do fluxo de cadastro

#### 4. Componentes de Autenticação
- `LoginForm` - Formulário de login
- `RouteGuard` - Proteção de rotas
- `RBACGuard` - Controle de acesso baseado em roles
- `SessionWarning` - Aviso de sessão expirando
- `SecureErrorBoundary` - Tratamento seguro de erros

## Gerenciamento de Estado

### Estado do Servidor (TanStack Query)
Gerencia dados assíncronos do backend com cache automático:

```typescript
// Exemplo: Buscar pacientes
const { data: patients, isLoading } = useQuery({
  queryKey: ['patients'],
  queryFn: fetchPatients,
  staleTime: 5 * 60 * 1000, // 5 minutos
});

// Exemplo: Criar paciente
const mutation = useMutation({
  mutationFn: createPatient,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['patients'] });
  },
});
```

**Estratégias de Cache:**
- **Stale-while-revalidate** - Dados em cache são servidos enquanto revalidam em background
- **Invalidação automática** - Mutations invalidam queries relacionadas
- **Prefetching** - Dados são pré-carregados em navegação antecipada
- **Optimistic updates** - UI atualiza antes da confirmação do servidor

### Estado Local (React Hooks)
- **useState** - Estado de componente simples
- **useReducer** - Estado complexo com lógica de transição
- **useContext** - Compartilhamento de estado entre componentes

### Estado de Formulários (React Hook Form)
```typescript
const form = useForm<FormData>({
  resolver: zodResolver(schema),
  defaultValues: {
    name: '',
    email: '',
  },
});

const onSubmit = form.handleSubmit(async (data) => {
  await mutation.mutateAsync(data);
});
```

**Benefícios:**
- Validação com Zod
- Performance otimizada (re-renders mínimos)
- Integração com componentes controlados
- Tratamento de erros automático

## Integração com APIs

### Cliente Supabase
Configuração SSR-safe para autenticação e dados:

```typescript
// lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr';

export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
```

### Padrão de Requisições
```typescript
// Exemplo: Buscar pacientes
export async function fetchPatients() {
  const { data, error } = await supabase
    .from('patients')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}
```

### Rate Limiting (Upstash)
Proteção contra abuso de APIs:

```typescript
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '10 s'),
});

// Aplicar rate limit
const { success } = await ratelimit.limit(userId);
if (!success) throw new Error('Rate limit exceeded');
```

## Padrões de UI/UX

### Design System
- **Cores** - Paleta consistente definida em Tailwind
- **Tipografia** - Hierarquia clara de textos
- **Espaçamento** - Sistema de espaçamento 4px base
- **Bordas** - Raios de borda consistentes
- **Sombras** - Elevação visual com sombras

### Responsividade
Breakpoints Tailwind:
- **sm** - 640px (mobile landscape)
- **md** - 768px (tablet)
- **lg** - 1024px (desktop)
- **xl** - 1280px (desktop large)
- **2xl** - 1536px (desktop extra large)

```tsx
// Exemplo de componente responsivo
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Conteúdo */}
</div>
```

### Acessibilidade
- **Semântica HTML** - Tags apropriadas (button, nav, main, etc.)
- **ARIA labels** - Atributos para leitores de tela
- **Navegação por teclado** - Suporte completo a Tab, Enter, Esc
- **Contraste de cores** - WCAG AA compliance
- **Focus visible** - Indicadores de foco claros

### Feedback Visual
- **Loading states** - Skeletons e spinners
- **Empty states** - Mensagens quando não há dados
- **Error states** - Mensagens de erro claras
- **Success feedback** - Toasts e confirmações
- **Optimistic UI** - Atualizações instantâneas

## Otimização de Performance

### Next.js Optimizations
```typescript
// next.config.ts
const nextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60 * 60 * 24, // 24 horas
  },
  experimental: {
    optimizePackageImports: [
      '@tabler/icons-react',
      'lucide-react',
      '@supabase/supabase-js',
    ],
  },
  compress: true,
};
```

### Code Splitting
- **Dynamic imports** - Componentes carregados sob demanda
- **Route-based splitting** - Cada rota é um bundle separado
- **Component-level splitting** - Componentes pesados são lazy-loaded

```tsx
// Exemplo: Lazy loading de modal
const ReportModal = dynamic(() => import('./report-modal'), {
  loading: () => <Skeleton />,
});
```

### Image Optimization
```tsx
import Image from 'next/image';

<Image
  src="/avatar.jpg"
  alt="Avatar"
  width={40}
  height={40}
  loading="lazy"
  placeholder="blur"
/>
```

### Memoization
```tsx
// Evitar re-renders desnecessários
const MemoizedComponent = React.memo(ExpensiveComponent);

// Memoizar valores computados
const sortedPatients = useMemo(
  () => patients.sort((a, b) => a.name.localeCompare(b.name)),
  [patients]
);

// Memoizar callbacks
const handleClick = useCallback(() => {
  // lógica
}, [dependencies]);
```

## Validação e Tratamento de Erros

### Validação com Zod
```typescript
import { z } from 'zod';

const patientSchema = z.object({
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  email: z.string().email('Email inválido'),
  phone: z.string().regex(/^\d{10,11}$/, 'Telefone inválido'),
  birthDate: z.date().max(new Date(), 'Data não pode ser futura'),
});

type PatientFormData = z.infer<typeof patientSchema>;
```

### Error Boundaries
```tsx
<SecureErrorBoundary fallback={<ErrorFallback />}>
  <DashboardContent />
</SecureErrorBoundary>
```

### Tratamento de Erros de API
```typescript
try {
  const data = await fetchPatients();
  return data;
} catch (error) {
  if (error instanceof SupabaseError) {
    toast.error('Erro ao buscar pacientes');
  }
  throw error;
}
```

## Testes

### Estrutura de Testes
```
__tests__/
├── components/
│   ├── ui/
│   └── dashboard/
├── lib/
│   └── utils/
└── integration/
```

### Tipos de Testes

#### 1. Testes Unitários (Jest)
```typescript
describe('PatientCard', () => {
  it('should render patient name', () => {
    render(<PatientCard patient={mockPatient} />);
    expect(screen.getByText('João Silva')).toBeInTheDocument();
  });
});
```

#### 2. Property-Based Testing (fast-check)
```typescript
import fc from 'fast-check';

test('patient name should always be trimmed', () => {
  fc.assert(
    fc.property(fc.string(), (name) => {
      const patient = createPatient({ name });
      expect(patient.name).toBe(name.trim());
    })
  );
});
```

#### 3. Testes de Integração
```typescript
test('should create patient and show in list', async () => {
  const { user } = renderWithProviders(<PatientManagement />);
  
  await user.click(screen.getByText('Novo Paciente'));
  await user.type(screen.getByLabelText('Nome'), 'João Silva');
  await user.click(screen.getByText('Salvar'));
  
  expect(await screen.findByText('João Silva')).toBeInTheDocument();
});
```

## Segurança

### Autenticação
- **Supabase Auth** - Gerenciamento de sessões
- **JWT tokens** - Tokens seguros com expiração
- **Refresh tokens** - Renovação automática de sessão
- **Session warnings** - Avisos antes de expirar

### Autorização
- **RBAC** - Controle baseado em roles (admin, therapist)
- **Route guards** - Proteção de rotas por permissão
- **API guards** - Validação de permissões no backend

### Proteção de Dados
- **Input sanitization** - Limpeza de inputs do usuário
- **XSS prevention** - Escape de HTML
- **CSRF protection** - Tokens CSRF em formulários
- **Rate limiting** - Proteção contra abuso

### Variáveis de Ambiente
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
NEXT_PUBLIC_HIMETRICA_API_KEY=xxx
UPSTASH_REDIS_REST_URL=xxx
UPSTASH_REDIS_REST_TOKEN=xxx
```

## Analytics e Monitoramento

### Himetrica Analytics
```tsx
import { HimetricaProvider } from '@/components/analytics/himetrica-provider';

<HimetricaProvider apiKey={process.env.NEXT_PUBLIC_HIMETRICA_API_KEY}>
  <App />
</HimetricaProvider>
```

### Eventos Rastreados
- **Page views** - Visualizações de página
- **User actions** - Cliques, submissões de formulário
- **Errors** - Erros de aplicação
- **Performance** - Métricas de performance (LCP, FID, CLS)

## Fluxo de Deploy

### Build
```bash
npm run build
```

### Verificações Pré-Deploy
- TypeScript compilation
- ESLint validation
- Jest tests
- Build success

### Ambientes
- **Development** - Local development
- **Staging** - Testes pré-produção
- **Production** - Ambiente de produção

## Convenções de Código

### Nomenclatura
- **Componentes** - PascalCase (ex: `PatientCard`)
- **Funções** - camelCase (ex: `fetchPatients`)
- **Constantes** - UPPER_SNAKE_CASE (ex: `API_URL`)
- **Arquivos** - kebab-case (ex: `patient-card.tsx`)

### Estrutura de Componente
```tsx
// 1. Imports
import React from 'react';
import { Button } from '@/components/ui/button';

// 2. Types
interface PatientCardProps {
  patient: Patient;
  onEdit: (id: string) => void;
}

// 3. Component
export function PatientCard({ patient, onEdit }: PatientCardProps) {
  // 3.1 Hooks
  const [isEditing, setIsEditing] = useState(false);
  
  // 3.2 Handlers
  const handleEdit = () => {
    setIsEditing(true);
    onEdit(patient.id);
  };
  
  // 3.3 Render
  return (
    <div className="p-4 border rounded-lg">
      <h3>{patient.name}</h3>
      <Button onClick={handleEdit}>Editar</Button>
    </div>
  );
}
```

### Imports
```tsx
// 1. External libraries
import React from 'react';
import { useQuery } from '@tanstack/react-query';

// 2. Internal modules
import { Button } from '@/components/ui/button';
import { fetchPatients } from '@/lib/api/patients';

// 3. Types
import type { Patient } from '@/types/patient.types';

// 4. Styles (se necessário)
import styles from './component.module.css';
```

## Próximos Passos

### Melhorias Planejadas
1. **Server Components** - Migrar mais componentes para Server Components
2. **Streaming SSR** - Implementar streaming para melhor performance
3. **PWA** - Transformar em Progressive Web App
4. **Offline support** - Suporte offline com Service Workers
5. **Real-time updates** - WebSockets para atualizações em tempo real
6. **Advanced caching** - Estratégias de cache mais sofisticadas
7. **Micro-frontends** - Modularização em micro-frontends

### Refatorações Necessárias
1. Consolidar componentes duplicados
2. Melhorar tipagem TypeScript
3. Aumentar cobertura de testes
4. Otimizar bundle size
5. Melhorar acessibilidade
6. Documentar componentes com Storybook
