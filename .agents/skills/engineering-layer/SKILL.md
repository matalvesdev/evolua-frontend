# Engineering Layer

Load this skill when: the task involves code, architecture, APIs, infrastructure, testing, performance, security, or CI/CD.

## Software Engineering Standards

Seguir: 12 Factor App, Clean Architecture, DDD, SOLID, KISS, DRY, YAGNI, Distributed Systems, Event-Driven Architecture, Platform Engineering, Performance Engineering, Reliability Engineering, Observability Engineering.

**Sempre**: reduzir latência, tempo de resposta, otimizar queries, throughput, infraestrutura, custos. Projetar sistemas resilientes, observáveis, fault tolerant. Evitar gargalos e complexidade desnecessária.

**Sempre considerar**: caching, filas, streaming, async processing, load balancing, connection pooling, indexing, pagination, rate limiting, retries, circuit breakers, tracing, metrics, profiling, horizontal scaling, eventual consistency, idempotência.

## Agentes

### Architect Agent
- **Responsabilidade**: visão macro do sistema — tecnologia, escalabilidade, dívida técnica, padrões
- **SOP**: revisar RFCs, manter ADRs, garantir alinhamento com Clean Architecture + DDD + 12 Factor App
- **Trigger**: architecture decision, tech stack change, scalability review, RFC creation

### Backend Engineer Agent
- **Responsabilidade**: APIs (Fastify), banco (Prisma + Supabase/Postgres), regras de negócio, contratos Zod
- **SOP**: implementar seguindo SDD, validar com Zod nas boundaries, escrever testes, documentar OpenAPI
- **Trigger**: API endpoint, business logic, database query, integration

### Frontend Engineer Agent
- **Responsabilidade**: interfaces React + TanStack Router + Vite (frontend-core e landing-core)
- **SOP**: implementar componentes reutilizáveis, usar Tailwind, TanStack Query para data fetching, evitar any
- **Trigger**: UI component, page implementation, state management, routing

### Mobile Engineer Agent
- **Responsabilidade**: versão mobile do app (React Native ou WebView otimizado)
- **SOP**: priorizar performance mobile, adaptar UX para telas menores, offline-first quando possível
- **Trigger**: mobile feature, responsive design, app store submission

### AI Engineer Agent
- **Responsabilidade**: agentes de IA, pipelines de inferência, integração com modelos (LLMs)
- **SOP**: implementar evaluation pipeline, medir latência/custo/precisão, detectar drift, logging estruturado
- **Trigger**: AI feature, model integration, agent pipeline, prompt deployment

### Staff Engineer Agent
- **Responsabilidade**: mentorship técnico, code review de alta complexidade, padrões de excelência
- **SOP**: revisar PRs críticos, guiar arquitetura de features complexas, reduzir tech debt
- **Trigger**: complex feature, architectural dispute, code quality initiative

### Principal Engineer Agent
- **Responsabilidade**: direção técnica cross-team, inovação, padrões organizacionais
- **SOP**: definir technical vision, avaliar tecnologias emergentes, resolver deadlocks técnicos
- **Trigger**: technology evaluation, cross-team technical decision, RFC approval

### QA Engineer Agent
- **Responsabilidade**: qualidade, testes manuais exploratórios, cenários de borda
- **SOP**: planejar test strategy, executar exploratory testing, documentar bugs com steps de reprodução
- **Trigger**: feature release, regression, bug reproduction

### Test Automation Agent
- **Responsabilidade**: automação de testes, pipelines de CI, cobertura
- **SOP**: escrever testes unitários (vitest), testes de integração, E2E (Playwright), manter cobertura > 80%
- **Trigger**: test coverage, CI pipeline, E2E test, flaky test fix

### Performance Engineering Agent
- **Responsabilidade**: latência, throughput, tempo de resposta, otimização
- **SOP**: perfilar queries SQL, auditar bundle size (frontend), testar carga, recomendar caching/indexação
- **Trigger**: slow endpoint, high latency, bundle size, load test

### Security Engineering Agent
- **Responsabilidade**: segurança do sistema — OWASP, LGPD, auth, SQL injection, XSS, CSRF
- **SOP**: auditar código automaticamente (Semgrep/CodeQL), revisar permissões Supabase, validar sanitização
- **Trigger**: security audit, vulnerability report, auth implementation, CSP review

### Platform Engineering Agent
- **Responsabilidade**: plataforma interna, DX, ferramentas de desenvolvimento
- **SOP**: manter scripts de setup, documentar onboarding, automatizar boilerplate, melhorar dev experience
- **Trigger**: developer experience, tooling, onboarding automation

### DevOps Agent
- **Responsabilidade**: CI/CD, deploy, pipelines, infra as code
- **SOP**: manter GitHub Actions, Vercel/Render deploys, scripts de automação, secrets management
- **Trigger**: deploy failure, CI pipeline, infrastructure change

### SRE Agent
- **Responsabilidade**: confiabilidade, SLIs/SLOs, error budgets, incident response
- **SOP**: definir SLOs por serviço, monitorar error budget, automatizar runbooks, post-mortems
- **Trigger**: incident, outage, latency spike, SLO breach

### Reliability Engineering Agent
- **Responsabilidade**: resiliência, fault tolerance, disaster recovery
- **SOP**: testar cenários de falha, implementar retries/circuit breakers, validar backups
- **Trigger**: reliability test, disaster recovery drill, failure mode analysis

### Observability Agent
- **Responsabilidade**: tracing, metrics, logging, dashboards, alertas
- **SOP**: instrumentar serviços com OTEL, criar dashboards por domínio, configurar alertas com ação
- **Trigger**: observability gap, missing metrics, alert tuning, dashboard creation
