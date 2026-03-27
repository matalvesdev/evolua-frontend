# 🔄 Guia de Migração de Domínios: useevolua.com → useevolua.com.br + useevolua.online

**Status**: Já tem deploy Vercel  
**Objetivo**: Migrar para novos domínios e manter API backend funcionando

---

## 📋 Resumo da Mudança

| Componente | Anterior | Novo |
|-----------|----------|------|
| Frontend Principal | useevolua.com | **useevolua.com.br** |
| Domínio Alternativo | — | **useevolua.online** |
| API Backend | api.useevolua.com | **api.useevolua.com.br** |
| DNS Provider | Route53 | Route53 (mesmo) |
| Host Frontend | Vercel | Vercel (mesma) |
| Host Backend | EC2 (api.useevolua.com) | EC2 (api.useevolua.com.br) |

---

## ✅ Passo 1: Atualizar Domínios no Vercel

### 1.1 Remover Domínio Antigo
Na console Vercel:
1. Acesse projeto → **Settings** → **Domains**
2. Clique no domínio `useevolua.com`
3. Clique em **Remove Domain** (não deleta conta, apenas desassocia)
4. Confirme

### 1.2 Adicionar Novos Domínios
1. Clique em **Add Domain**
2. Digite: `useevolua.com.br`
3. Clique em **Add**
4. Copie a configuração DNS que Vercel exibir:
   ```
   Type: A
   Name: useevolua.com.br
   Value: 76.76.21.21
   ```

5. Repita o processo para `useevolua.online`:
   ```
   Clique em **Add Domain**
   Digite: useevolua.online
   Type: A
   Value: 76.76.21.21
   ```

6. Adicione também os subdomínios `www`:
   ```
   www.useevolua.com.br → CNAME: cname.vercel-dns.com
   www.useevolua.online → CNAME: cname.vercel-dns.com
   ```

**Esperado após passo 1**: Vercel exibe "Pending Verification" para cada domínio

---

## ✅ Passo 2: Atualizar DNS no Route53

### 2.1 Criar/Atualizar Hosted Zones

**Para `useevolua.com.br`:**

AWS Route53 → **Create Hosted Zone**:
- Domain name: `useevolua.com.br`
- Type: Public hosted zone
- Clique **Create hosted zone**

Vercel informará os nameservers que devem apontar. No seu registrar (ex: GoDaddy, Namecheap):
- Atualize nameservers para os que Vercel forneceu

**Para `useevolua.online`:**

Repita o mesmo processo para `useevolua.online`

### 2.2 Criar Records em Ambas Zonas

**Em `useevolua.com.br` zone:**

| Name | Type | Value | TTL |
|------|------|-------|-----|
| (root) | A | 76.76.21.21 | 300 |
| www | CNAME | cname.vercel-dns.com | 300 |
| api | A | `<Elastic-IP>` | 300 |

**Em `useevolua.online` zone:**

| Name | Type | Value | TTL |
|------|------|-------|-----|
| (root) | A | 76.76.21.21 | 300 |
| www | CNAME | cname.vercel-dns.com | 300 |
| api | A | `<Elastic-IP>` | 300 |

### 2.3 Como obter Elastic IP

```bash
cd terraform
terraform output backend_public_ip
# Copie o IP retornado
```

---

## ✅ Passo 3: Atualizar Terraform

Arquivo: `terraform/route53.tf`

```hcl
# Remova:
# resource "aws_route53_zone" "main" { name = "useevolua.com" }

# Adicione:
resource "aws_route53_zone" "main_br" {
  name = "useevolua.com.br"
  tags = {
    Name = "${var.project_name}-hosted-zone-br"
  }
}

resource "aws_route53_zone" "main_online" {
  name = "useevolua.online"
  tags = {
    Name = "${var.project_name}-hosted-zone-online"
  }
}

# Root A records
resource "aws_route53_record" "root_br" {
  zone_id = aws_route53_zone.main_br.zone_id
  name    = "useevolua.com.br"
  type    = "A"
  ttl     = 300
  records = ["76.76.21.21"]
}

resource "aws_route53_record" "root_online" {
  zone_id = aws_route53_zone.main_online.zone_id
  name    = "useevolua.online"
  type    = "A"
  ttl     = 300
  records = ["76.76.21.21"]
}

# WWW CNAME records
resource "aws_route53_record" "www_br" {
  zone_id = aws_route53_zone.main_br.zone_id
  name    = "www.useevolua.com.br"
  type    = "CNAME"
  ttl     = 300
  records = ["cname.vercel-dns.com"]
}

resource "aws_route53_record" "www_online" {
  zone_id = aws_route53_zone.main_online.zone_id
  name    = "www.useevolua.online"
  type    = "CNAME"
  ttl     = 300
  records = ["cname.vercel-dns.com"]
}

# API records
resource "aws_route53_record" "api_br" {
  zone_id = aws_route53_zone.main_br.zone_id
  name    = "api.useevolua.com.br"
  type    = "A"
  ttl     = 300
  records = [aws_eip.backend.public_ip]
}

resource "aws_route53_record" "api_online" {
  zone_id = aws_route53_zone.main_online.zone_id
  name    = "api.useevolua.online"
  type    = "A"
  ttl     = 300
  records = [aws_eip.backend.public_ip]
}
```

**Executar:**
```bash
cd terraform
terraform plan        # Revise mudanças
terraform apply      # Aplique
```

---

## ✅ Passo 4: Configurar SSL no Backend (Nginx)

No servidor EC2, com certbot:

```bash
# Connect SSH
ssh -i evolua-key.pem ubuntu@<ELASTIC_IP>

# Gerar certificados para os novos domínios
sudo certbot --nginx -d api.useevolua.com.br -d api.useevolua.online

# Responda:
# - Email: seu-email@example.com
# - Agree

# Reincie Nginx
sudo systemctl restart nginx

# Confirme SSL
sudo systemctl status nginx
```

---

## ✅ Passo 5: Atualizar Environment Variables

Se o frontend chamar API, atualize em Vercel:

Settings → Environment Variables:

```
NEXT_PUBLIC_API_URL=https://api.useevolua.com.br/api
NEXT_PUBLIC_APP_URL=https://useevolua.com.br
```

Redeploy:
```bash
git commit --allow-empty -m "chore: update env vars for new domains"
git push origin main
```

---

## 🧪 Passo 6: Validação

Execute health check atualizado:

```bash
# 1. Frontend principal
curl -I https://useevolua.com.br
curl -I https://www.useevolua.com.br
curl -I https://useevolua.online
curl -I https://www.useevolua.online

# 2. API backend
curl -I https://api.useevolua.com.br/api/health
curl -I https://api.useevolua.online/api/health

# 3. DNS
dig useevolua.com.br +short
dig api.useevolua.com.br +short
dig useevolua.online +short
dig api.useevolua.online +short
```

**Esperado**: Todas retornam **200 OK** ou status HTTP válido

---

## ⏱️ Timeline Esperada

| Etapa | Tempo |
|-------|-------|
| Atualizar Vercel | 5 min |
| Criar Route53 zones | 10 min |
| Criar DNS records | 5 min |
| Atualizar Terraform | 5 min |
| DNS propagação | 5-30 min |
| Certbot SSL | 5 min |
| Validação final | 5 min |
| **Total** | **40-60 min** |

---

## 🔄 Changelog

- **Antes**: `useevolua.com` + `api.useevolua.com`
- **Depois**: `useevolua.com.br` + `useevolua.online` (ambos com API)

Ambos os domínios apontam para:
- ✅ Mesma Vercel app (frontend)
- ✅ Mesmo EC2 (backend)
- ✅ Mesmo banco Supabase

---

## 🚨 Importante: Migração de Tráfego

### Opção A: Hard Switch (agora)
- Remover domínios antigos hoje
- Redirects implementados
- TTL baixo (300s)

### Opção B: Gradual Migration (recomendado)
- Manter ambos domínios por 2-4 semanas
- Aplicar 301 redirects `useevolua.com → useevolua.com.br`
- Monitorar tráfego em Analytics
- Remover depois

**Recomendação**: Uso Opção B para não perder tráfego SEO

---

## 📝 Redirects (Optional)

Se quiser manter `useevolua.com` como alias:

**Em `terraform/route53.tf` (zona antiga):**
```hcl
resource "aws_route53_record" "redirect_old" {
  zone_id = aws_route53_zone.old.zone_id
  name    = "useevolua.com"
  type    = "A"
  ttl     = 300
  records = ["76.76.21.21"]  # Continua apontando Vercel
}
```

No `next.config.ts` (se quiser redirecionar no código):
```typescript
async redirects() {
  return [
    {
      source: '/:path*',
      destination: 'https://useevolua.com.br/:path*',
      permanent: true, // 301 redirect
    }
  ]
}
```

---

## 📲 Comunicação com Usuários

- [ ] Email para clientes: "Novo domínio: useevolua.com.br (domínio antigo ainda funciona)"
- [ ] Update no landing page
- [ ] Update em redes sociais

---

**Próxima ação**: Seguir passos 1-6 acima e compartilhar resultado de validação

