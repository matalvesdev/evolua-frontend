# Skill: Frontend Development

## Descrição
Conhecimento sobre composição de UI, gerenciamento de estado, acessibilidade e otimização de performance no frontend.

## Regras de Implementação

### 1. Composição de Componentes
```typescript
// Componente Base (Atomic)
export function Button({ children, variant = "primary", ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "px-4 py-2 rounded-lg font-medium transition-colors",
        variant === "primary" && "bg-purple-600 text-white hover:bg-purple-700",
        variant === "secondary" && "bg-gray-200 text-gray-800 hover:bg-gray-300"
      )}
      {...props}
    >
      {children}
    </button>
  )
}

// Componente Composto
export function PatientCard({ patient, onEdit, onDelete }: PatientCardProps) {
  return (
    <div className="glass-panel p-4 rounded-xl">
      <h3 className="text-lg font-semibold">{patient.name}</h3>
      <p className="text-sm text-gray-600">{patient.email}</p>
      <div className="flex gap-2 mt-4">
        <Button variant="primary" onClick={() => onEdit(patient.id)}>
          Editar
        </Button>
        <Button variant="secondary" onClick={() => onDelete(patient.id)}>
          Excluir
        </Button>
      </div>
    </div>
  )
}
```

### 2. Gerenciamento de Estado

**Estado do Servidor (React Query)**:
```typescript
// Query
export function usePatients(params?: { status?: string }) {
  return useQuery({
    queryKey: ["patients", params],
    queryFn: () => patientsApi.listPatients(params),
    staleTime: 5 * 60 * 1000, // 5 minutos
  })
}

// Mutation
export function useCreatePatient() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: patientsApi.createPatient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patients"] })
    },
  })
}
```

**Estado Local (useState)**:
```typescript
export function PatientForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { mutateAsync: createPatient } = useCreatePatient()
  
  const handleSubmit = async (data: CreatePatientInput) => {
    setIsSubmitting(true)
    try {
      await createPatient(data)
      toast.success("Paciente criado com sucesso")
    } catch (error) {
      toast.error("Erro ao criar paciente")
    } finally {
      setIsSubmitting(false)
    }
  }
  
  return <form onSubmit={handleSubmit}>...</form>
}
```

### 3. Formulários com Validação
```typescript
const schema = z.object({
  name: z.string().min(1, "Nome é obrigatório").max(100),
  email: z.string().email("Email inválido").optional(),
  phone: z.string().regex(/^\(\d{2}\) \d{5}-\d{4}$/, "Telefone inválido").optional(),
})

export function PatientForm() {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  })
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Input
        {...register("name")}
        error={errors.name?.message}
        label="Nome"
      />
      <Input
        {...register("email")}
        error={errors.email?.message}
        label="Email"
        type="email"
      />
      <Button type="submit">Salvar</Button>
    </form>
  )
}
```

### 4. Acessibilidade
```typescript
// Semântica HTML
<nav aria-label="Navegação principal">
  <ul>
    <li><a href="/dashboard">Dashboard</a></li>
    <li><a href="/patients">Pacientes</a></li>
  </ul>
</nav>

// ARIA Labels
<button aria-label="Fechar modal" onClick={onClose}>
  <X className="w-4 h-4" />
</button>

// Focus Management
const dialogRef = useRef<HTMLDivElement>(null)

useEffect(() => {
  if (isOpen) {
    dialogRef.current?.focus()
  }
}, [isOpen])

// Keyboard Navigation
<div
  role="button"
  tabIndex={0}
  onKeyDown={(e) => {
    if (e.key === "Enter" || e.key === " ") {
      onClick()
    }
  }}
>
  Clique aqui
</div>
```

### 5. Performance

**Lazy Loading**:
```typescript
const PatientDetails = lazy(() => import("./patient-details"))

export function PatientPage() {
  return (
    <Suspense fallback={<Loading />}>
      <PatientDetails />
    </Suspense>
  )
}
```

**Memoização**:
```typescript
const filteredPatients = useMemo(() => {
  return patients.filter(p => p.name.includes(search))
}, [patients, search])

const handleEdit = useCallback((id: string) => {
  router.push(`/patients/${id}/edit`)
}, [router])
```

**Virtualização (futuro)**:
```typescript
import { useVirtualizer } from "@tanstack/react-virtual"

export function PatientList({ patients }: { patients: Patient[] }) {
  const parentRef = useRef<HTMLDivElement>(null)
  
  const virtualizer = useVirtualizer({
    count: patients.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 80,
  })
  
  return (
    <div ref={parentRef} className="h-[600px] overflow-auto">
      <div style={{ height: `${virtualizer.getTotalSize()}px` }}>
        {virtualizer.getVirtualItems().map((item) => (
          <PatientCard key={item.key} patient={patients[item.index]} />
        ))}
      </div>
    </div>
  )
}
```

## Boas Práticas

### Responsividade
- Mobile-first: Começar com mobile e adicionar breakpoints
- Usar Tailwind breakpoints: `sm:`, `md:`, `lg:`, `xl:`
- Testar em múltiplos dispositivos

### Acessibilidade
- Usar elementos semânticos (`<nav>`, `<main>`, `<article>`)
- Adicionar labels em inputs
- Garantir contraste de cores (WCAG AA)
- Suportar navegação por teclado

### Performance
- Lazy load rotas e componentes pesados
- Otimizar imagens (Next.js Image)
- Minimizar re-renders (memo, useMemo, useCallback)
- Code splitting automático (Next.js)

## Erros Comuns a Evitar

❌ **Não usar React Query para estado do servidor**
❌ **Não validar formulários**
❌ **Não adicionar loading states**
❌ **Não tratar erros de API**
❌ **Não usar semântica HTML**
❌ **Não testar responsividade**
