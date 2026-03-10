# Skill: Security

## Descrição
Conhecimento sobre autenticação, autorização, gerenciamento de segredos e mitigação de vulnerabilidades.

## Regras de Implementação

### 1. Autenticação JWT
```typescript
// Validar JWT no middleware
async function validateJWT(token: string) {
  const supabase = createClient()
  const { data: { user }, error } = await supabase.auth.getUser(token)
  
  if (error || !user) {
    throw new UnauthorizedException('Token inválido')
  }
  
  return user
}

// Refresh automático
async function refreshToken() {
  const supabase = createClient()
  const { error } = await supabase.auth.refreshSession()
  
  if (error) {
    window.location.href = '/auth/login'
  }
}
```

### 2. Autorização RBAC
```typescript
// Verificar role
export function useRBAC() {
  const { user } = useAuth()
  const role = user?.user_metadata?.role
  
  const hasPermission = (allowedRoles: string[]) => {
    return role && allowedRoles.includes(role)
  }
  
  return { role, hasPermission }
}

// Guard de rota
export function RouteGuard({ children, allowedRoles }: Props) {
  const { hasPermission } = useRBAC()
  
  if (!hasPermission(allowedRoles)) {
    return <AccessDenied />
  }
  
  return <>{children}</>
}
```

### 3. Sanitização de Inputs
```typescript
// Remover HTML
export function stripHtml(input: string): string {
  return input
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]*>/g, '')
}

// Escapar HTML
export function escapeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
}

// Validação com Zod
const schema = z.object({
  name: z.string().transform(stripHtml).min(1).max(100),
})
```

### 4. Content Security Policy
```typescript
export function buildCSP({ nonce, isDev }: CSPConfig): string {
  const directives = {
    "default-src": "'self'",
    "script-src": isDev ? "'self' 'unsafe-eval'" : `'self' 'nonce-${nonce}'`,
    "style-src": "'self' 'unsafe-inline' fonts.googleapis.com",
    "img-src": "'self' data: blob: *.supabase.co",
    "connect-src": "'self' *.supabase.co https://api.example.com",
    "frame-ancestors": "'none'",
    "object-src": "'none'",
  }
  
  return Object.entries(directives)
    .map(([key, value]) => `${key} ${value}`)
    .join("; ")
}
```

### 5. Rate Limiting
```typescript
// Upstash Redis
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, "60 s"),
})

export async function checkRateLimit(ip: string) {
  const { success, remaining } = await ratelimit.limit(ip)
  
  if (!success) {
    throw new TooManyRequestsException()
  }
  
  return { remaining }
}
```

### 6. Gerenciamento de Segredos
```bash
# .env (NUNCA commitar)
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=xxx
JWT_SECRET=xxx

# .env.example (commitar)
SUPABASE_URL=
SUPABASE_ANON_KEY=
JWT_SECRET=
```

## Boas Práticas

### OWASP Top 10
1. **Broken Access Control**: Validar clinic_id em todas as queries
2. **Cryptographic Failures**: Usar HTTPS, criptografar dados sensíveis
3. **Injection**: Usar prepared statements, validar inputs
4. **Insecure Design**: Implementar RBAC, princípio do menor privilégio
5. **Security Misconfiguration**: CSP, headers de segurança, rate limiting
6. **Vulnerable Components**: Manter dependências atualizadas
7. **Authentication Failures**: JWT com expiração, refresh tokens
8. **Software Integrity Failures**: Verificar integridade de pacotes
9. **Logging Failures**: Logs de auditoria, não logar dados sensíveis
10. **SSRF**: Validar URLs externas

### Headers de Segurança
```typescript
// middleware.ts
response.headers.set("X-Content-Type-Options", "nosniff")
response.headers.set("X-Frame-Options", "DENY")
response.headers.set("X-XSS-Protection", "1; mode=block")
response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")
response.headers.set("Strict-Transport-Security", "max-age=31536000")
```

### LGPD Compliance
- Coletar apenas dados necessários
- Permitir acesso, correção e exclusão de dados
- Criptografar dados em repouso e em trânsito
- Implementar logs de auditoria
- Política de privacidade clara

## Erros Comuns a Evitar

❌ **Expor tokens em logs**
❌ **Não validar ownership (clinic_id)**
❌ **Não sanitizar inputs**
❌ **Não implementar rate limiting**
❌ **Commitar segredos no Git**
❌ **Não usar HTTPS**
❌ **Não implementar CSP**
