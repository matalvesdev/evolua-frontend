# Checklist de Lançamento

## Pré-lançamento

- [ ] Vercel: redeploy landing + frontend (CSP, sitemap, robots)
- [ ] Render: verificar health checks (/readyz) de api + ai
- [ ] Supabase: rodar migrations pendentes (002_leads_onboarding_newsletter)
- [ ] Supabase: verificar RLS policies das novas tabelas
- [ ] WhatsApp: parear instância Evolution via QR code
- [ ] Credenciais: rodar `scripts/credential-rotation.sh` e atualizar secret managers
- [ ] Credenciais: revogar chaves antigas após confirmação

## Conteúdo

- [ ] Blog: publicar 2 posts iniciais (semana 1-2 do calendário editorial)
- [ ] Instagram: publicar bio + primeiro post/série de apresentação
- [ ] LinkedIn: publicar post de lançamento do fundador
- [ ] Lead magnets: verificar entrega por email (Make/Zapier)
- [ ] Newsletter: enviar primeiro email de boas-vindas para lead magnets

## Infra

- [ ] Terraform: aplicar `terraform apply` no bootstrap para state remoto
- [ ] Domínios: verificar DNS de api.useevolua.com.br, ai.useevolua.com.br
- [ ] CI/CD: configurar GitHub Actions (lint + typecheck em PR)
- [ ] Sentry: verificar se erros estão chegando no dashboard

## Pós-lançamento

- [ ] Ads: ativar campanhas Meta Ads + Google Ads
- [ ] Analytics: configurar metas de conversão (signup, trial, lead magnet)
- [ ] WhatsApp: testar fluxo de cobrança (PIX/cartão via Evolution)
- [ ] QA: testar fluxo completo de cadastro → onboarding → prontuário → sessão
- [ ] Hotjar/Clarity: configurar gravação de sessão para análise de UX
