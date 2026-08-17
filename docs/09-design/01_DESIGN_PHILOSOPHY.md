---
title: "Filosofia, Sistema e UX"
status: active
owner: "Product/Design"
last_reviewed: 2026-08-14
---

# Filosofia, sistema e UX

Evolua deve transmitir confiança, calma, clareza, profissionalismo, acolhimento e precisão. A pessoa deve sentir “Evolua entende meu trabalho”, não “Evolua tem muitas funcionalidades”.

## Princípios

- calm software: reduzir ansiedade e carga cognitiva;
- progressive disclosure: mostrar complexidade quando necessária;
- workflow over navigation: organizar por tarefa, não por tabela;
- fewer clicks, fewer decisions;
- estado claro para atendimento, documento, pagamento, tarefa e paciente;
- performance, acessibilidade e mobile são UX.

## Inventário observado

Frontend possui layout, header, rotas de dashboard, hooks React Query e estados de loading/error em módulos auditados. Auditar visualmente tokens, tipografia, cores, espaçamento, componentes, responsividade e navegação antes de documentar consistência como fato. O uso de HTML de blog exige UX segura e sanitização comprovada.

## Padrões

Empty state ensina próximo passo; erro diz o que ocorreu, ação possível e se dados estão seguros; loading usa skeleton/progresso para espera previsível e não simula sucesso em operação clínica/destrutiva. Acessibilidade: semântica, label, contraste, foco, teclado, mensagens associadas a campos e respeito a movimento. WCAG é referência; conformidade não foi auditada.
