# Dashboard Visual System — Evolua

> Status: active
> Owner: Product + Design
> Last reviewed: 2026-08-27

## Contexto

O dashboard do Evolua adota uma linguagem visual inspirada nas quatro referências em
`/references/`. A referência define a gramática de interface; o brand kit e os fluxos
reais do produto definem identidade, conteúdo e comportamento.

Não são copiados nomes, logos, dados, pacientes ou regras clínicas das referências.
Somente padrões visuais e de composição são traduzidos para o domínio do Evolua.

## Objetivo

Criar uma experiência operacional calma, compacta e confiável para profissionais de
fonoaudiologia, reduzindo ruído visual e mantendo ações e estados críticos visíveis.

## Princípios

1. O shell é uma superfície clara flutuante sobre um canvas cinza quente em desktop.
2. A navegação ativa usa o neon do Evolua em uma faixa inteira, sem barra lateral decorativa.
3. Cards usam branco, borda de baixo contraste, raio amplo e sombra curta.
4. Ícones de seção usam um tile grafite; cores semânticas ficam reservadas a estados.
5. KPIs primários aparecem em uma faixa horizontal única e escaneável.
6. Títulos usam caixa normal e peso moderado; uppercase fica restrito a micro-labels.
7. Informação clínica real prevalece sobre preenchimento visual. Estados vazios permanecem honestos.
8. A interface deve continuar funcional em 375 px, 768 px, 1440 px e 1920 px.

## Tokens visuais

| Papel | Token | Valor inicial |
| --- | --- | --- |
| Canvas externo | `--color-stage` | `#DAD9D4` |
| Canvas do app | `--color-canvas` | `#F7F7F4` |
| Superfície | `--color-surface` | `#FFFFFF` |
| Superfície baixa | `--color-surface-low` | `#F0F0EC` |
| Texto principal | `--color-text-primary` | `#20211F` |
| Texto secundário | `--color-text-secondary` | `#62645F` |
| Grafite operacional | `--color-dark` | `#3D3E3C` |
| Ação/seleção | `--color-neon` | `#C4F135` |
| Marca secundária | `--color-primary` | `#6C63FF` |

## Componentes

### App shell

- Desktop: margem externa de 16 px, raio de 28 px, borda sutil e sombra ampla.
- Mobile: ocupa toda a viewport, sem moldura externa.
- Sidebar e header fazem parte da mesma superfície visual.

### Sidebar

- 240 px expandida e 72 px recolhida.
- Labels de grupo discretos em caixa normal.
- Item ativo com fundo neon, texto grafite e raio de 10 px.
- Itens inativos sem tiles ou barras decorativas.

### Header

- 68 px de altura.
- Título em caixa normal.
- Busca em pill clara; ação primária em pill grafite.
- Controles auxiliares em botões quadrados de superfície baixa.

### Cards e painéis

- Raio padrão de 18 px.
- Borda `1px` de baixo contraste.
- Sombra curta para separar camadas sem aparência de vidro.
- Headers de card usam tile grafite apenas quando o ícone comunica função.

### KPIs

- Um único card horizontal no desktop.
- Separadores verticais entre métricas.
- Cada métrica contém ícone, label, valor e contexto/delta real quando disponível.

## Responsividade

- Abaixo de 768 px, a moldura externa desaparece e a sidebar vira navegação inferior.
- Faixas de KPIs podem rolar horizontalmente quando não couberem sem comprimir texto.
- Alvos interativos têm no mínimo 44 × 44 px.

## Acessibilidade

- Contraste mínimo WCAG AA para texto funcional.
- `focus-visible` preservado em todos os controles.
- Cor nunca é o único meio de comunicar urgência ou status.
- `prefers-reduced-motion` desabilita movimentos não essenciais.

## Métricas de sucesso

- Zero regressões de navegação, loading, error e empty states.
- Build, typecheck e lint aprovados.
- Sem overflow horizontal em 375 px e 768 px.
- Componentes compartilhados cobrem todas as rotas do dashboard.
- A home reproduz a hierarquia das referências sem dados fictícios.

## Riscos

- Rotas antigas podem conter estilos locais que conflitam com os novos tokens.
- A moldura desktop reduz alguns pixels de área útil em notebooks menores.
- A alteração de densidade pode exigir ajustes específicos em tabelas extensas.

## Rollout

1. Tokens, shell, sidebar, header e navegação mobile.
2. Home: KPIs, ações rápidas, agenda, IA, lembretes e pacientes.
3. Auditoria visual das demais rotas e correções locais proporcionais.
