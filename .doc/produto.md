# Evolua — Produto

## Visão Geral
CRM completo para fonoaudiólogas com IA nativa, WhatsApp integrado e faturamento automático.

## Módulos (26 módulos auditados)

### Core
| Módulo | Descrição | Status |
|--------|-----------|--------|
| Pacientes | Cadastro, histórico, busca | ✅ |
| Sessões | Agendamento, evolução clínica, transcrição | ✅ |
| Prontuário | Documentação clínica padronizada | ✅ |
| Agenda | Calendário, slots, confirmação | ✅ |
| Teleconsulta | Videochamada integrada | ✅ (novo) |

### Comunicação
| Módulo | Descrição | Status |
|--------|-----------|--------|
| WhatsApp | Gateway nativo (Evolution API) | ✅ |
| Notificações | Lembretes, confirmações | ✅ |

### IA & Conteúdo
| Módulo | Descrição | Status |
|--------|-----------|--------|
| Biblioteca | RAG sobre acervo clínico | ✅ |
| Analytics | Métricas de negócio | ✅ |
| Relatórios | Gerados por IA | ✅ |

### Gestão
| Módulo | Descrição | Status |
|--------|-----------|--------|
| Financeiro | Receitas, despesas, fluxo | ✅ |
| Billing | Assinaturas (AbacatePay + Stripe) | ✅ |
| Tarefas | Kanban de atividades | ✅ |
| Laudos | Geração assistida por IA | ✅ |
| Linha do Tempo | Histórico do paciente | ✅ |
| Encaminhamentos | Referências entre profissionais | ✅ |
| Exercícios | Biblioteca + envio via WhatsApp | ✅ |
| Materiais | Controle de insumos clínicos | ✅ |
| CAA | Comunicação alternativa e augmentativa | ✅ |
| Plano Terapêutico | Planejamento de tratamento | ✅ |

### Configuração
| Módulo | Descrição | Status |
|--------|-----------|--------|
| Configurações | Preferências da clínica | ✅ |
| Perfil | Dados profissionais | ✅ |
| Onboarding | Primeiros passos guiados | ✅ |

### Removidos
| Módulo | Motivo |
|--------|--------|
| Marketing | Feature obsoleta, substituída por GEOS + Content Pipeline |

## Fluxo Principal
1. Paciente chega via WhatsApp ou indicação
2. Cadastro no sistema + histórico inicial
3. Agendamento de sessão (agenda integrada)
4. Durante sessão: transcrição → evolução gerada por IA
5. Após sessão: prontuário atualizado, cobrança automática
6. Follow-up: confirmação próxima sessão via WhatsApp
7. Marketing: conteúdo gerado por GEOS → blog/redes sociais

## Integrations
- **WhatsApp**: Evolution API v2.2.3 (Go gateway)
- **Pagamento**: AbacatePay (PIX/Boleto) + Stripe (Cartão)
- **Email**: Resend (transacional + newsletter)
- **Analytics**: Sentry (erros) + analytics interno
- **IA**: Hugging Face (zephyr-7b-beta) + LangChain
- **Supabase**: Auth + Postgres + Storage
