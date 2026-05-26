# Plano de Otimização Evolua — Nubank + Bruno Nardon

## Diagnóstico: Nossos Produtos vs Filosofia de Inovação do Nubank

### O que o Nubank faz para inovar (fontes: building.nubank.com)

1. **Cultura de cliente, não cultura de produto** — toda inovação parte de uma dor real. A pergunta não é "que feature vamos lançar?" mas "qual burocracia estamos eliminando?"
2. **Framework 3D**: Discover (descobrir a dor) → Deliver (entregar com qualidade, iterando) → Delight (encantar)
3. **MVP invisível**: lógica roda meses no backend antes de ganhar UI
4. **Iteração com erros assumidos**: errar rápido, ajustar, repetir. Roadmap não é linear.
5. **NPS como guardrail**: não escala sem NPS saudável. NPS > volume.
6. **Evals-first para IA**: TNPS + LLM-as-judge auditando 100% das conversas. Prompt optimization com DSPy/Japa. Mover lógica determinística para tools (composite tools).
7. **Design como sistema**: NuDS, revisões recorrentes entre áreas, engenharia participa da experiência desde o início.
8. **Uma feature de cada vez**: Nubank lançou com 1 produto (cartão sem anuidade). NuCel é a 2ª vertical em 12 anos.

### Onde o Evolua está hoje

| Princípio Nubank | Status | Problema |
|---|---|---|
| Cultura de cliente | 🟡 Parcial | Produto nichado para fono, mas sem evidência de customer discovery CONTÍNUO. O manifesto mostra que entendem a dor, mas quando foi a última entrevista com fono? |
| Framework 3D | 🟡 Parcial | Muita entrega (32 módulos!), pouco discover e pouco delight mensurável |
| MVP invisível | 🔴 Ausente | Quase tudo foi construído completo (front+back) antes de validar |
| Iteração com erros | 🔴 Ausente | Roadmap linear M0→M1→M2→M3. Não há ciclos curtos de feedback |
| NPS guardrail | 🔴 Ausente | NPS não é tracking nem métrica de negócio |
| Evals-first IA | 🔴 Ausente | zephyr-7b-beta sem evals, sem TNPS, sem prompt optimization. Perigoso em contexto clínico |
| Design como sistema | 🟡 Parcial | Tailwind CSS, mas sem design system explícito ou revisões entre áreas |
| Uma feature de cada vez | 🔴 Ausente | 32 módulos em pré-lançamento. Nubank tinha 1 produto no lançamento |

### Riscos Identificados

1. **Feature overload**: 32 módulos é produto de empresa de 50 pessoas, não de startup em pré-lançamento. Risco alto de dispersão e manutenção insustentável.
2. **IA sem evals em contexto clínico**: zephyr-7b-beta gerando relatórios, evoluções e materiais terapêuticos sem nenhum sistema de avaliação. Erro de IA em laudo pode ter consequência legal e de credibilidade.
3. **Cold start e latência**: IA rodando no HuggingFace Inference API (gratuita) — instável, lenta, sem SLA. Fono não pode esperar 30s para gerar um relatório.
4. **Sem NPS**: não dá para saber se o produto está realmente resolvendo o problema. Decisões são baseadas em achismo.
5. **Sem discovery contínuo**: produto foi construído com base em suposições iniciais que podem estar desatualizadas.

---

## O Plano (Atualizado)

### Fase 0 — Parar de Dispersar (Agora)

Antes de qualquer código novo:

- [ ] **Congelar novos módulos**: nada de novas features. Foco em terminar e validar o que já existe.
- [ ] **Entrevistar 10 fonoaudiólogos reais** esta semana. Perguntar: qual a sua maior dor? O que você mais odeia no seu dia a dia? (Discover)
- [ ] **Instalar tracking de NPS** no produto. NPS é a primeira métrica.
- [ ] **Identificar o módulo mais crítico** (o que resolve a maior dor) e matá-lo de excelência. Sugestão: **Sessão → Relatório** (a dor de 2-3h/dia em burocracia).

### Fase 1 — Nosso Próprio Agente de Suporte (Meses 1-2)

Sem G4OS. Vamos construir nosso próprio agente multiagentes.

#### Arquitetura Proposta

```
Fono (WhatsApp/App)
    ↓
[Agente de Triagem] — classifica a solicitação
    ↓
[Agente Especialista 1] → Agenda e faltas
[Agente Especialista 2] → Convênios e glosas
[Agente Especialista 3] → Prontuário e relatórios
    ↓ (se não resolver)
[Humano (fallback)] — resolve e alimenta o feedback loop
    ↓
[Feedback Loop] — modelo aprende com a resolução humana
```

#### Stack Recomendada

| Componente | Escolha | Motivo |
|---|---|---|
| LLM principal | Gemini 2.0 Flash (Google AI Studio) | Melhor custo-benefício BR, contexto longo, rápido |
| LLM fallback | Claude 3 Haiku (Anthropic) | Para casos complexos que exigem mais segurança |
| Orquestração | LangGraph ou n8n | Controle de fluxo multiagentes |
| RAG | pgvector (já temos no Supabase) | Base de convênios, procedimentos, FAQs |
| Evals | LangFuse + LLM-as-judge | Auditar 100% das interações (igual Nubank) |
| Prompt Mgmt | DSPy | Prompt optimization automatizado |
| Observabilidade | LangFuse + Sentry | Tracing, logging, métricas |
| Frontend | React (já temos) | Chat widget no app |

#### Métricas do Agente

| Métrica | Meta | Como medir |
|---|---|---|
| Taxa de auto-resolução | 40% (mês 1) → 80% (mês 6) | LLM-as-judge |
| TNPS | ≥ 70 | Transacional após cada interação |
| Tempo médio de resolução | < 2 min (IA) vs 15 min (humano) | LangFuse tracing |
| Custo por conversa | < R$ 0,05 | Log de tokens |
| Economia mensal | R$ 5-10k (mês 3) | Custo evitado de suporte humano |

### Fase 2 — Corrigir o Core (Meses 2-4)

- [ ] **Substituir zephyr-7b-beta** por Gemini 2.0 Flash no serviço de IA. zephyr é pequeno e instável para produção.
- [ ] **Implementar evals-first**: antes de qualquer resposta de IR ao cliente, um LLM-as-judge avalia corretude, concisão e tom.
- [ ] **Criar NuDS (Evolua Design System)**: consistência visual entre os 32 módulos.
- [ ] **Estabelecer NPS como guardrail**: não lançar feature nova sem NPS saudável.
- [ ] **Customer discovery quinzenal**: 2 entrevistas com fonoaudiólogos a cada 2 semanas.

### Fase 3 — Foco Cirúrgico (Meses 4-6)

- [ ] **Matar ou hibernar** módulos com baixo uso/impacto. Cada módulo mantido = custo de manutenção.
- [ ] **Uma feature de cada vez**: escolher a feature de maior impacto e fazer excepcionalmente bem.
- [ ] **Prompt optimization**: parar de escrever prompts manualmente. Usar DSPy com exemplos rotulados.
- [ ] **Composite tools**: lógica determinística (ex: cálculo de glosa de convênio) não passa pelo LLM. Vai para uma tool dedicada.
- [ ] **Beta fechado**: 5-10 clínicas pagantes. NPS como critério de saída para beta público.

---

## Nossos Produtos — Diagnóstico Final

| Produto | Estágio | Avaliação Nubank | Próximo Passo |
|---|---|---|---|
| **CRM (core)** | 32 módulos, pré-lançamento | 🟡 Bom potencial, mas overfeatured | Congelar novos módulos. Validar com clientes reais. |
| **IA (transcrição + relatórios)** | zephyr-7b-beta + HF Inference | 🔴 Risco clínico sem evals | Migrar para Gemini 2.0 Flash + implementar evals |
| **WhatsApp CRM** | Evolution API v2 + Go gateway | 🟢 Excelente. Canal certo, execução boa. | Manter e expandir. |
| **Landing page** | useevolua.com.br | 🟢 Boa. Manifesto forte, dores claras. | Adicionar NPS social proof quando houver. |
| **Agente de Suporte** | Não existe ainda | 🔴 Necessário urgente | Construir com arquitetura multiagentes própria (fase 1) |
| **Billing** | AbacatePay + Stripe | 🟢 Sólido. 13/13 testes. | Manter. |
| **Marketing** | OpenCode agents + blog | 🟡 Automatizado mas sem métrica de conversão | Medir CAC, LTV, conversão por canal. |

---

## O Essencial (Resumo para o Time)

> **"Nós não somos uma empresa de features. Somos uma empresa que elimina a burocracia do fonoaudiólogo."**

1. **Pare de construir.** O produto já tem 32 módulos. Valide o que existe antes de adicionar mais.
2. **Troque o modelo de IA.** zephyr-7b-beta não é seguro para produção clínica. Gemini 2.0 Flash é a escolha.
3. **Instale NPS hoje.** Sem NPS você não sabe se está no caminho certo.
4. **Construa seu próprio agente de suporte.** Multiagentes com triagem + especialistas + feedback loop. Sem G4OS, sem terceiros.
5. **Entreviste fonoaudiólogos toda semana.** Customer discovery não é uma fase, é um processo contínuo.
6. **Uma feature de cada vez.** O Nubank lançou com uma feature. Nós também podemos.
7. **Evals-first.** Toda resposta de IA precisa ser avaliada antes de chegar ao cliente.
