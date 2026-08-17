# Avaliação de IA — ASR e RAG

Este diretório define o gate reproduzível de qualidade para transcrição e recuperação clínica. Os dados versionados são sintéticos e não contêm dados pessoais. Dados reais só podem entrar após consentimento, anonimização, revisão LGPD e aprovação clínica.

## Execução

```bash
python backend-core/apps/ai/evals/run_benchmarks.py
```

Critérios iniciais do MVP:

- ASR: WER <= 0,20 no conjunto sintético; acompanhar separadamente termos clínicos.
- RAG: Recall@3 >= 0,80 e MRR >= 0,70.
- Nenhum resultado de benchmark autoriza diagnóstico ou conduta automatizada.

## Fontes candidatas

- ASR geral PT-BR: Common Voice; validar licença e versão antes do download.
- ASR sintético: `yuriyvnv/synthetic_transcript_pt` (Apache-2.0), somente como complemento, nunca como substituto de fala real.
- RAG geral PT-BR: `Madras1/rag-qa-fulltext-ptbr` (ODC-By 1.0).
- RAG clínico: `igor-eduardo-research/mirage-pt` e documentos oficiais do Ministério da Saúde, sujeitos a revisão de licença, proveniência e escopo.
- Factualidade clínica: `hugo/healthbench-br` (CC-BY-4.0), que não mede fonoaudiologia especificamente.

Não foi encontrado corpus público validado e específico de sessões fonoaudiológicas em PT-BR. Portanto, a próxima coleta deve ser prospectiva, consentida, anonimizada e estratificada por idade, sotaque, ambiente, dispositivo e área clínica.
