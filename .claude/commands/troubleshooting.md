# 🔧 Troubleshooting & Dicas

## Erros Comuns

### ❌ Error: `Cannot find module '@/components/...'`
**Causa**: Path alias incorreto ou arquivo não existe
**Solução**:
1. Verificar que `jsconfig.json` ou `tsconfig.json` tem paths configuradas
2. Verificar que arquivo existe no caminho
3. Limpar `.next/` e recompilar: `rm -rf .next && npm run dev`

### ❌ Error: `Property 'xxx' does not exist on type 'yyy'`
**Causa**: Tipo TS desatualizado ou interface incorreta
**Solução**:
1. Verificar interface de origem: `grep -r "interface yyy" src/`
2. Verificar se precisa fazer override: `Omit<Type, 'field'>`
3. Rodar `npm run type-check` para ver todos os erros

### ❌ Error: `JWT token expired` em requests
**Causa**: Token expirado sem auto-refresh
**Solução**:
1. Verificar middleware em `lib/api/client.ts`
2. Verificar se `refresh_token` está sendo guardado
3. Verificar logs no Supabase console

### ❌ Error: `CORS policy blocker`
**Causa**: Backend não permite origin do frontend
**Solução**:
1. Backend: Adicionar frontend URL em `CORS_ORIGIN`
2. Frontend: Verificar if URL is in CSP `connect-src`
3. Testar com `curl -H "Origin: http://localhost:3000"`

### ❌ Error: `Hydration mismatch` em Next.js
**Causa**: Conteúdo renderizado no servidor diferente do cliente
**Solução**:
1. Remover `useEffect` que muda estado inicial
2. Usar `suppressHydrationWarning` se necessário (evitar)
3. Verificar se component precisa de `'use client'`

### ❌ Error: `Cannot read property 'xxx' of undefined`
**Causa**: Objeto/array being accessed antes de estar pronto
**Solução**:
1. Adicionar optional chaining: `obj?.property?.nested`
2. Verificar carregamento: `if (!data) return <Loading />`
3. Verificar types de React Query response

### ❌ Error: `Mutation failed with 400` 
**Causa**: Validação falhou no backend
**Solução**:
1. Verificar schema Zod no frontend: `npm run type-check`
2. Verificar DTO no backend: `backend-evolua/src/*/dto`
3. Testar com curl/Postman: `curl -X POST http://localhost:3333/patients ...`

### ❌ Error: Docker build `ENOENT: no such file or directory`
**Causa**: Arquivo não encontrado durante build
**Solução**:
1. Verificar paths em `.dockerignore`
2. Verificar que arquivo existe localmente
3. Limpar build cache: `docker builder prune`

---

## Performance

### Query N+1 (Backend)
**Sintoma**: Endpoint muito lento
**Solução**:
```typescript
// ❌ Ruim
const patients = await prisma.patient.findMany()
for (const patient of patients) {
  patient.appointments = await prisma.appointment.findMany({
    where: { patientId: patient.id }
  })
}

// ✅ Bom
const patients = await prisma.patient.findMany({
  include: { appointments: true }
})
```

### React Query Não Cacheando
**Sintoma**: Componente faz refetch toda mudança de página
**Solução**:
```typescript
// Aumentar stale time
useQuery({
  queryKey: ['patients'],
  queryFn: () => api.get('/patients'),
  staleTime: 1000 * 60 * 5, // 5 minutos
})

// Desabilitar refetch automático
useQuery({
  queryKey: ['patients'],
  queryFn: () => api.get('/patients'),
  refetchOnMount: false,
  refetchOnWindowFocus: false,
})
```

### Componente Re-renderizando Muito
**Sintoma**: Component rerenders a cada keypress (mesmo que useCallback)
**Solução**:
1. Separar estado: Logic em hook, UI em componente
2. Usar `useMemo` para valores derivados
3. Verificar se props estão sendo recriadas a cada render
4. Usar React DevTools Profiler

---

## Debugging

### VSCode Debugging com Node
**Arquivo**: `.vscode/launch.json`
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Backend NestJS",
      "program": "${workspaceFolder}/backend-evolua/backend-evolua/node_modules/.bin/nest",
      "args": ["start", "debug"],
      "cwd": "${workspaceFolder}/backend-evolua/backend-evolua"
    }
  ]
}
```

### Browser Debugging
1. Abrir DevTools (F12)
2. Ir em "Network" para ver requests
3. Ir em "Application" para ver localStorage/cookies
4. Ir em "Console" para logs

### Prisma Studio
```bash
cd backend-evolua/backend-evolua
npx prisma studio
# Abre em http://localhost:5555
```

---

## Checklist Pré-Deploy

- [ ] Rodar `npm run type-check` - sem erros TS
- [ ] Rodar `npm run lint` - sem warnings ESLint
- [ ] Rodar `npm run test` - todos testes passando
- [ ] Verificar variáveis de ambiente em `.env`
- [ ] Testar fluxo crítico manualmente (login, criar paciente)
- [ ] Verificar performance em Network tab (DevTools)
- [ ] Commit com mensagem clara e descritiva
- [ ] Criar PR com description do que foi feito

