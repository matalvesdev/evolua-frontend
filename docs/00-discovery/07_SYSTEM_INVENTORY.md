---
title: "Inventário de Sistemas"
status: active
owner: "Engineering"
last_reviewed: 2026-08-14
---

# Inventário de sistemas

| Sistema | Finalidade | Ambiente/deploy conhecido | Estado |
| --- | --- | --- | --- |
| Frontend | aplicativo autenticado | Vercel | VERIFIED |
| Landing | site, blog e captação | Vercel | VERIFIED |
| API | aplicação e integrações | Render | VERIFIED |
| Serviço IA | ASR, RAG e geração | Render; domínio padrão confirmado | VERIFIED |
| WhatsApp gateway | integração Evolution API | Go/chi; deploy separado | VERIFIED |
| Supabase | Postgres, Auth e Storage | externo | VERIFIED |
| GEOS | knowledge/growth local-first (SQLite) | `.geos/` | VERIFIED |
| Conteúdo | pipeline GitHub Actions + OpenRouter/Supabase/Resend | agendado | VERIFIED |
| Backup | workflow `pg-backup.yml` semanal | GitHub Actions | VERIFIED; restore precisa evidência |
