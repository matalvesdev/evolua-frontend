# Ações Manuais de Segurança — Evolua CRM

Estas ações NÃO podem ser automatizadas e precisam ser feitas manualmente por você.
Execute na ordem abaixo.

---

## 1. Revogar credenciais expostas

As credenciais abaixo estiveram em repositório público e devem ser consideradas comprometidas.

### Supabase
1. Acesse: https://app.supabase.com → seu projeto → **Settings → API**
2. Clique em **"Rotate"** na `service_role key` e na `anon key`
3. Atualize as novas chaves em:
   - `backend-evolua/backend-evolua/.env` → `SUPABASE_KEY` / `SUPABASE_SERVICE_ROLE_KEY`
   - `frontend-evolua/.env.local` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Variáveis de ambiente na Vercel (painel do projeto)

### HuggingFace
1. Acesse: https://huggingface.co/settings/tokens
2. Delete o token antigo (`hf_qWhzRGt...`)
3. Crie um novo token tipo **"Read"**
4. Atualize em:
   - `backend-evolua/backend-evolua/.env` → `HUGGINGFACE_API_KEY`
   - `.agents/marketing/gerador/.env` → `HUGGINGFACE_API_KEY`

---

## 2. Remover arquivos .env do histórico git

Os arquivos `.env.production` e `.env.development` do frontend foram commitados no passado.
Mesmo após o `.gitignore` corrigido, os dados ainda existem no histórico.

### Instalar git-filter-repo
```bash
pip install git-filter-repo
```

### Executar no repositório do frontend (submodule)
```bash
cd frontend-evolua

git filter-repo --path .env.production --invert-paths --force
git filter-repo --path .env.development --invert-paths --force
```

### Force push para remover do GitHub
```bash
git push origin main --force
```

> **Aviso:** Isso reescreve o histórico. Se houver colaboradores, eles precisarão fazer `git clone` novamente.

---

## 3. Verificar se o GitHub fez varredura automática

O GitHub Secret Scanning tenta detectar credenciais expostas automaticamente.

1. Acesse: https://github.com/SEU_ORG/SEU_REPO → **Security → Secret scanning alerts**
2. Verifique se há alertas ativos
3. Marque como resolvidos após revogar as credenciais

---

## 4. Atualizar variáveis na Vercel

Após rotacionar as chaves no Supabase:

1. Acesse: https://vercel.com → seu projeto → **Settings → Environment Variables**
2. Atualize todos os valores que mudaram
3. Faça um novo deploy para aplicar

---

## 5. Checklist final

- [ ] Supabase `anon key` rotacionada
- [ ] Supabase `service_role key` rotacionada
- [ ] HuggingFace token antigo deletado
- [ ] HuggingFace token novo criado e configurado
- [ ] `.env.*` removidos do histórico git com `git-filter-repo`
- [ ] Force push feito
- [ ] Variáveis atualizadas na Vercel
- [ ] GitHub Secret Scanning alertas revisados
