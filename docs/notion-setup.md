# Notion Setup — Evolua V2

> Como popular o workspace Notion com o roadmap, tickets e RFCs do projeto.
>
> **Pré-requisito:** MCP `notion` autenticado (rode `opencode` em sessão fresca
> e complete o OAuth, ou cole o token via `setx NOTION_TOKEN ...`).

---

## Fluxo recomendado (passo a passo via MCP)

### 1. Criar a página-raiz "Evolua — Operação"

Peça ao agente:

> "Crie no Notion uma página chamada **Evolua — Operação** sob o workspace
> raiz, com ícone 🚀 e capa padrão. Dentro dela, crie 3 sub-databases:
> **Roadmap**, **Tickets**, **RFCs**. Use o schema definido em
> `docs/notion-payload.json`."

O arquivo `docs/notion-payload.json` (gerado junto com este doc) traz o
schema completo de cada database e os registros iniciais já mapeados a
partir de `docs/ROADMAP.md`.

### 2. Sincronizar status semanalmente

Toda terça (revisão do roadmap):

> "Atualize o database **Evolua — Roadmap** no Notion comparando com o
> arquivo `docs/ROADMAP.md`. Sinalize divergências antes de aplicar."

### 3. Criar tickets a partir de PRs

Quando uma PR for aberta:

> "Crie um ticket no database **Evolua — Tickets** com título igual ao
> da PR #{N}, status `In review`, link para o PR, e propriedade
> `Workstream` inferida pelos paths modificados."

---

## Schema dos databases

### Database: **Evolua — Roadmap**

Espelha as 9 workstreams + marcos do `docs/ROADMAP.md`.

| Propriedade  | Tipo               | Opções / Notas                                                    |
|--------------|--------------------|--------------------------------------------------------------------|
| Name         | Title              | Texto curto                                                        |
| Status       | Select             | `done` 🟢 / `in progress` 🟡 / `blocked` 🔴 / `todo` ⚪              |
| Workstream   | Select             | `Plataforma`, `Backend`, `Billing`, `WhatsApp`, `Frontend`, `Observabilidade`, `Segurança`, `Marketing`, `Suporte` |
| Marco        | Select             | `M0`, `M1`, `M2`, `M3`                                             |
| Owner        | Person             |                                                                    |
| Sprint       | Select             | `Sprint atual`, `+1`, `+2`, `+3`, `Backlog`                         |
| Priority     | Select             | `P0`, `P1`, `P2`, `P3`                                             |
| Estimate     | Number             | Pontos (Fibonacci: 1, 2, 3, 5, 8, 13)                              |
| Last update  | Last edited time   |                                                                    |

### Database: **Evolua — Tickets**

Granularidade de execução; cada item do Roadmap pode gerar N tickets.

| Propriedade  | Tipo            | Opções / Notas                                  |
|--------------|-----------------|--------------------------------------------------|
| Title        | Title           |                                                  |
| Status       | Select          | `Backlog`, `Todo`, `In progress`, `In review`, `Blocked`, `Done` |
| Type         | Select          | `feat`, `fix`, `chore`, `docs`, `refactor`, `test`, `infra` |
| Roadmap item | Relation        | → Evolua — Roadmap                               |
| Priority     | Select          | `P0`, `P1`, `P2`, `P3`                          |
| Estimate     | Number          | Pontos                                           |
| Assignee     | Person          |                                                  |
| PR           | URL             |                                                  |
| Created      | Created time    |                                                  |

### Database: **Evolua — RFCs**

Decisões arquiteturais documentadas (ver lista em `docs/ROADMAP.md` linhas 136-142).

| Propriedade  | Tipo            | Opções / Notas                                  |
|--------------|-----------------|--------------------------------------------------|
| Title        | Title           | Ex.: `RFC-001 — Filas: BullMQ vs pg-boss`       |
| Status       | Select          | `Draft`, `Review`, `Accepted`, `Rejected`, `Superseded` |
| Author       | Person          |                                                  |
| Decision date| Date            |                                                  |
| Trade-offs   | Text            |                                                  |
| Decided by   | Multi-select    | `tech-lead`, `PO`, `team`                       |

---

## Como executar (uma vez autenticado)

```bash
# 1. Verifique que o MCP notion está enabled
cat opencode.json | grep -A2 '"notion"'

# 2. Suba uma sessão nova do opencode (Windows)
setx NOTION_TOKEN "<seu_token_pessoal>"
# feche o terminal e abra outro
opencode

# 3. Cole esse prompt:
#    "Use o MCP notion para criar a estrutura descrita em
#     docs/notion-payload.json sob a página workspace raiz."
```

O agente lerá o JSON, criará os databases com as propriedades corretas e
populará os registros iniciais.

---

## Manutenção

- **Não duplicar** entre Notion e `docs/ROADMAP.md`. O Markdown é a
  fonte de verdade para arquitetura/visão; o Notion é o sistema de
  **execução** (tickets vivos, atribuições, sprints).
- **Pull requests** que alteram `docs/ROADMAP.md` devem mencionar no
  texto se exigem atualização do Notion (`> notion-sync: yes`).
- **Métricas semanais**: rode o prompt `notion-weekly-report` (a criar)
  para extrair burn-down e MRR do board.
