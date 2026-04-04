---
applyTo: 'frontend-evolua/**/*.{ts,tsx,js,jsx}'
description: 'Use when: implementing or refactoring frontend screens, components, hooks, forms, and Next.js routes'
---

## Frontend Rules

- Preservar padroes de componentes e hooks existentes.
- Formularios devem priorizar validacao consistente e mensagens claras.
- Evitar fetch direto dentro de componentes quando ja existir camada de servicos.
- Sempre considerar estados de loading, erro e vazio.
- Garantir acessibilidade minima (labels, roles e semantic HTML).
- Evitar acoplamento entre UI e regra de negocio; extrair logica para hooks/services quando necessario.

## Quality Gate

- Rodar `Frontend - Lint` apos mudancas relevantes.
- Rodar `Test - Frontend` para mudancas em logica critica.
- Se houver mudanca em rotas ou build config, validar `npm run build` no frontend.
