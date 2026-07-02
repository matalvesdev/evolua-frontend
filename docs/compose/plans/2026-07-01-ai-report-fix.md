# Módulo IA — Correções: Transcrição + Formatação de Relatórios

## Problema Identificado

O fluxo em `sessao.tsx` (gravação → transcrição → relatório) **sempre gera evolução SOAP** via `useGenerateEvolution`, ignorando completamente os templates de relatório (`useGenerateReport`). O usuário seleciona um template mas o AI não o utiliza.

## Fluxo Atual (Quebrado)
```
Gravação → Transcrição → generateEvolution (SOAP fixo) → Salva como 'evolution'
```

## Fluxo Correto
```
Gravação → Transcrição → generateReport (template selecionado) → Salva com tipo correto
```

## Correções Necessárias

### 1. sessao.tsx — Adicionar seleção de template de relatório
- Adicionar seletor de template antes da gravação
- Usar `useGenerateReport` em vez de `useGenerateEvolution` quando template selecionado
- Mapear template para tipo de relatório correto

### 2. AI Service — Melhorar prompt de geração de relatório
- Incluir mais contexto (dados do paciente, histórico)
- Aumentar max_tokens para relatórios detalhados
- Adicionar instruções de formatação mais claras

### 3. AI Service — Adicionar retry logic
- Retry automático em caso de falha transitória
- Fallback para formato simples se JSON parsing falhar

### 4. relatorios.tsx — Conectar fluxo de transcrição
- Permitir upload de áudio diretamente na página de relatórios
- Usar transcrição para gerar relatório com template selecionado
