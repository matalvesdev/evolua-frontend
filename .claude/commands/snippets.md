# ⚡ Snippets & Macros

## Componentes Prontos para Copiar

### Componente com Formulário (React Hook Form + Zod)
```typescript
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const formSchema = z.object({
  name: z.string().min(1, 'Campo obrigatório'),
  email: z.string().email('Email inválido'),
})

type FormData = z.infer<typeof formSchema>

interface FormComponentProps {
  onSubmit: (data: FormData) => Promise<void>
  isLoading?: boolean
}

export function FormComponent({ onSubmit, isLoading }: FormComponentProps) {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
  })

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <Input
        {...form.register('name')}
        placeholder="Nome"
      />
      {form.formState.errors.name && (
        <span className="text-red-500">{form.formState.errors.name.message}</span>
      )}
      
      <Input
        {...form.register('email')}
        placeholder="Email"
        type="email"
      />
      {form.formState.errors.email && (
        <span className="text-red-500">{form.formState.errors.email.message}</span>
      )}
      
      <Button type="submit" disabled={isLoading}>
        {isLoading ? 'Carregando...' : 'Enviar'}
      </Button>
    </form>
  )
}
```

### Componente com React Query
```typescript
'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api/client'
import type { Patient } from '@/lib/types'

export function PatientsList() {
  const queryClient = useQueryClient()
  
  const { data: patients = [], isLoading, error } = useQuery({
    queryKey: ['patients'],
    queryFn: () => api.get<Patient[]>('/patients'),
  })

  const { mutateAsync: deletePatient } = useMutation({
    mutationFn: (id: string) => api.delete(`/patients/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] })
    },
  })

  if (isLoading) return <div>Carregando...</div>
  if (error) return <div>Erro ao carregar</div>

  return (
    <div>
      {patients.map((patient) => (
        <div key={patient.id}>
          <h3>{patient.name}</h3>
          <button onClick={() => deletePatient(patient.id)}>Deletar</button>
        </div>
      ))}
    </div>
  )
}
```

### Modal Padrão
```typescript
'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

export function ModalExample() {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Abrir Modal</Button>
      </DialogTrigger>
      
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Título do Modal</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Conteúdo aqui */}
        </div>
      </DialogContent>
    </Dialog>
  )
}
```

### Tabela com Dados
```typescript
'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface Patient {
  id: string
  name: string
  email: string
  phone: string
}

interface PatientsTableProps {
  patients: Patient[]
}

export function PatientsTable({ patients }: PatientsTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nome</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Telefone</TableHead>
          <TableHead>Ações</TableHead>
        </TableRow>
      </TableHeader>
      
      <TableBody>
        {patients.map((patient) => (
          <TableRow key={patient.id}>
            <TableCell>{patient.name}</TableCell>
            <TableCell>{patient.email}</TableCell>
            <TableCell>{patient.phone}</TableCell>
            <TableCell>
              <button onClick={() => console.log(patient.id)}>Editar</button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
```

---

## Comandos Úteis

### Frontend
```bash
# Desenvolvimento
npm run dev              # Rodar em modo dev
npm run build            # Build de produção
npm run type-check       # Verificar tipos TS
npm run lint             # ESLint
npm run test             # Rodar testes

# Limpeza
rm -rf .next node_modules
npm install && npm run dev
```

### Backend
```bash
# Desenvolvimento
npm run start:dev        # Rodar em modo dev
npm run build            # Build de produção
npm run start            # Rodar build

# Database
npx prisma migrate dev --name "migration name"
npx prisma db push
npx prisma studio
```

### Git
```bash
# Criar feature
git checkout -b feature/nome-descritivo

# Commit
git add .
git commit -m "feat: descrição do que foi feito"
git push origin feature/nome-descritivo

# Rebase (sincronizar com develop)
git fetch origin
git rebase origin/develop
git push -f origin feature/nome-descritivo
```

---

## Variáveis de Ambiente

### Frontend (`.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:3333
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxxx
```

### Backend (`.env`)
```env
NODE_ENV=development
DATABASE_URL=postgresql://user:password@localhost:5432/evolua
JWT_SECRET=seu-secret-aqui
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_KEY=xxxx
```

