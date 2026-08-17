# Evolua

Evolua é uma plataforma web para organizar a rotina de fonoaudiologia. O produto contém fluxos de pacientes, agenda, registros, relatórios, planos, exercícios, comunicação, billing e recursos assistidos por IA. Não substitui julgamento profissional nem faz promessas de resultado clínico.

> Para contexto institucional, arquitetura, segurança e roadmap, comece em [docs/README.md](docs/README.md).

## Stack verificada

| Camada | Tecnologia |
| --- | --- |
| App | React, TanStack Router, Vite, Tailwind |
| Landing | React e Vite, com deploy Vercel |
| API | Fastify, TypeScript, Zod e Prisma |
| IA | FastAPI, LangChain e pgvector |
| WhatsApp | Go, chi e Evolution API |
| Dados/Auth | Postgres e Supabase Auth |
| Deploy atual | Vercel (web), Render (API/IA), Supabase (dados) |

## Estrutura

- `frontend-core/`: SPA autenticada.
- `landing-core/`: landing e blog.
- `backend-core/`: **repositório Git separado** com API, IA, gateway WhatsApp, Prisma e contratos.
- `supabase/migrations/`: migrations SQL e RLS complementares.
- `.github/workflows/`: CI, deploy, backups e conteúdo.
- `.doc/` e `openspec/`: documentação operacional/especificações preservadas.

## Desenvolvimento

Consulte os comandos verificados no [AGENTS.md](AGENTS.md) e os manifests de cada app. O backend não faz parte do workspace pnpm raiz: execute seus comandos no contexto de `backend-core/`. Nunca copie segredos para documentação ou código; use a configuração de ambiente apropriada.

Para frontend/landing, rode build antes de typecheck/lint, pois o build gera artefatos de rota. Para detalhes de CI, deploy, ambientes e migrations, veja [Deployment](docs/05-architecture/22_DEPLOYMENT.md).

## Contribuição e segurança

Leia [CONTRIBUTING.md](CONTRIBUTING.md) e [SECURITY.md](SECURITY.md). O fluxo Git é `main → develop → feature`; não faça push direto em `main`.

## Licença

Privado — todos os direitos reservados.
