---
title: "Gap Analysis"
status: active
owner: "Founder"
last_reviewed: 2026-08-17
---

# Gap Analysis

| Área | Estado atual | Estado desejado | Gap | Risco | Prioridade |
| --- | --- | --- | --- | --- | --- |
| Fluxo clínico central | módulos implementados | jornadas testadas e observáveis | aceite E2E/telemetria do fluxo completo | alto | P0 |
| Tenant/access control | RLS, JWT e código de API existem | matriz e testes de isolamento por recurso | evidência transversal incompleta | crítico | P0 |
| Registros/IA | persistência e IA existem | revisão, versão, avaliação e fallback consistentes | integridade e qualidade precisam prova contínua | alto | P0 |
| Configuração | múltiplos env/configs | uma referência atual por ambiente | README/env/Terraform legados conflitam | alto | P1 |
| Privacidade | controles técnicos parciais | ciclo de dados e decisões legais validadas | retenção, bases legais, subprocessadores | alto | P1 |
| Ativação/analytics | módulos de analytics | eventos mínimos ligados a valor | North Star e funil não confirmados | médio | P1 |
| GTM | conteúdo e GEOS | ICP/mensagem/atribuição validados | estratégia ainda é hipótese | médio | P1 |
| Claims públicos | landing contém números, depoimentos e alegações regulatórias | comunicação factual e evidenciável | claims não possuem fonte verificável no repositório | crítico | P0 |
| Escala | Render/Supabase e modularidade | SLO/capacidade sob demanda | sem necessidade de microservices agora | médio | P2 |
