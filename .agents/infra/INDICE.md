# Time de Infraestrutura & DevOps — Índice
**Evolua CRM | Squad de Infra**

---

## Estrutura

```
.agents/infra/
├── INDICE.md                      ← Este arquivo
├── agente-devops.md               ← DevOps / CI/CD / deploy
├── agente-cloud.md                ← Arquitetura cloud / Terraform
├── agente-sre.md                  ← SRE / confiabilidade / on-call
└── agente-database-ops.md         ← Operações de banco / backup / migrations
```

---

## Infraestrutura atual do Evolua

```
CLOUD PROVIDER: AWS (principal) + Supabase (managed)

SERVIÇOS AWS:
├── ECS/Fargate         ← Containers do backend e rag-service
├── ECR                 ← Registro de imagens Docker
├── RDS (opcional)      ← PostgreSQL adicional se necessário
├── S3                  ← Backups, assets estáticos
├── CloudFront          ← CDN para frontend
├── Route53             ← DNS
├── ACM                 ← Certificados SSL
├── Secrets Manager     ← Variáveis de ambiente sensíveis
└── CloudWatch          ← Logs e monitoramento

SUPABASE (managed):
├── PostgreSQL          ← Banco principal
├── Auth                ← Autenticação
├── Storage             ← Arquivos (áudios, PDFs, imagens)
└── Realtime            ← WebSockets (futuro)

FRONTEND:
└── Vercel              ← Deploy do Next.js
```

---

## Ambientes

| Ambiente | Branch | URL | Banco |
|----------|--------|-----|-------|
| Produção | `main` | app.evolua.com.br | Supabase prod |
| Staging | `develop` | staging.evolua.com.br | Supabase staging |
| Local | qualquer | localhost:3000 | Supabase local / Docker |

---

## SLAs definidos

| Serviço | Uptime alvo | RTO | RPO |
|---------|------------|-----|-----|
| API principal | 99.5% | 30min | 1h |
| Frontend | 99.9% | 10min | N/A |
| Banco de dados | 99.9% | 15min | 1h |
| Geração de prontuário (IA) | 99% | 1h | N/A |

---

## On-call rotation

```
Severidade 1 (produção down): resposta em 15min
Severidade 2 (feature crítica degradada): resposta em 1h
Severidade 3 (bug não bloqueante): resposta em 24h
```
