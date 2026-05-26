# Separar Projetos Supabase (dev/prod)

## Passos

### 1. Criar projeto dev
1. Acessar https://supabase.com/dashboard
2. **New project**
   - Name: `evolua-dev`
   - Database Password: (diferente do prod!)
   - Region: `South America (São Paulo)`
   - Pricing Plan: **Free**
3. Anotar Project URL e anon/service_role keys

### 2. Copiar schema do prod para dev
```bash
# Pull schema do prod
supabase db pull --db-url "$SUPABASE_PROD_DB_URL"

# Push schema para dev
supabase db push --db-url "$SUPABASE_DEV_DB_URL"
```

### 3. Configurar ambientes
Criar `.env.development` no `frontend-core/`:
```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
VITE_API_URL=https://api-staging.useevolua.com.br
```

Criar `.env.production` no `frontend-core/`:
```env
VITE_SUPABASE_URL=https://diiaoaboykraaiavgdqs.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
VITE_API_URL=https://api.useevolua.com.br
```

### 4. Atualizar GitHub Actions
- Adicionar `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` para ambos ambientes
- Executar: `bash scripts/set-github-secrets.sh`
