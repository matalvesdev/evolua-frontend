# Evolua — Roadmap

## Visão
Transformar o Evolua no padrão de referência para CRM de fonoaudiologia no Brasil,
com IA que realmente agiliza o trabalho clínico e operacional.

## Fases

### Fase 1 — Foundation (Completa ✅)
- [x] MVP: Pacientes, Sessões, Agenda, Prontuário
- [x] WhatsApp Gateway (Evolution API)
- [x] AI Service (Transcrição + Evolução + RAG)
- [x] Billing (AbacatePay + Stripe)
- [x] Frontend React + Landing
- [x] Auth (Supabase)
- [x] Deploy (Vercel + Render + Supabase)

### Fase 2 — Growth (Atual 🔄)
- [x] Teleconsulta
- [x] Dashboard module audit (24 módulos ativos; módulos obsoletos removidos)
- [x] E2E autenticado dos 24 módulos ativos (37 cenários Playwright)
- [x] Supabase staging isolado + migration ledger + usuário E2E
- [x] Content Pipeline (blog automático)
- [x] GEOS integration (growth engineering)
- [x] GEO experiment baseline
- [x] Git Flow + CI/CD profissional (path filters, build-first, permissions, secret scanning)
- [x] Runbook Git Flow/CI-CD
- [x] Validação .doc/.geos no CI
- [ ] Plans/pricing finalizados
- [ ] Landing page de pricing
- [ ] Onboarding otimizado (activation rate)
- [ ] WhatsApp pairing real (QR scaneado)
- [x] Provisionar serviços Render staging e registrar deploy hooks/URLs no GitHub
- [ ] Habilitar proteção de `main`/`develop` após upgrade GitHub Pro ou abertura dos repositórios
- [ ] Blog publicado (30 posts/mês)

### Fase 3 — Scale (Próximo 📋)
- [ ] Mobile app (React Native)
- [ ] Multi-profissional (clínicas com equipe)
- [ ] Marketplace de exercícios
- [ ] Integração com CREFono
- [ ] API pública (parceiros)
- [ ] Automação de marketing completa (GEOS workflows)
- [ ] Email nurture sequences
- [ ] Campaign orchestration
- [ ] Lead scoring e qualification

### Fase 4 — Platform (Futuro 🔮)
- [ ] Fono como plataforma (outras especialidades)
- [ ] Teleconsulta avançada (gravação + análise)
- [ ] IA diagnóstica (risk flags, protocol suggestions)
- [ ] Community features (fórum, mentorship)
- [ ] Academy (cursos, certificações)
- [ ] Analytics avançados (predictive)

## GEOS Growth Roadmap

### GEOS Phase 1 — Knowledge (próximo)
- [ ] Ingerir docs do projeto no GEOS knowledge
- [ ] Configurar RAG sobre documentação técnica
- [ ] SEO audit com GEOS determinístico
- [ ] Research engine para tendências de fonoaudiologia

### GEOS Phase 2 — Content + Distribution
- [ ] Content engine GEOS orquestrando pipeline
- [ ] Blog publisher com aprovação humana
- [ ] Social scheduler (Instagram, LinkedIn)
- [ ] Email nurture sequences

### GEOS Phase 3 — Leads + CRM
- [ ] Lead intelligence (capture, scoring, qualification)
- [ ] CRM pipeline (deals, stages, activities)
- [ ] Meeting scheduling integrado
- [ ] Campaign orchestration

### GEOS Phase 4 — Analytics + Learning
- [ ] Analytics engine (~22 métricas determinísticas)
- [ ] Control center dashboard
- [ ] Self-audit e self-improvement
- [ ] Experiment engine (A/B tests)
