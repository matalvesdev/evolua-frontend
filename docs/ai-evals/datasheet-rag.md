# Datasheet — RAG clínico Evolua

## Uso pretendido

Avaliar se a biblioteca recupera evidência relevante e responde com citação rastreável. O sistema deve declarar ausência de evidência e nunca inventar orientação clínica.

## Unidade e campos

Cada item contém `id`, `query`, `relevant_doc_ids` e `retrieved_doc_ids`. O conjunto de produção deverá registrar fonte, versão, licença, especialidade, data de vigência e hash do documento.

## Métricas e cortes

- Recall@3, MRR e cobertura de citações.
- Faithfulness e abstention avaliados por revisão humana clínica.
- Gate inicial: Recall@3 >= 0,80 e MRR >= 0,70.

## Riscos e vieses

Diretrizes médicas gerais não representam automaticamente a prática fonoaudiológica. Conteúdo desatualizado, sintético ou sem licença não deve compor a base clínica de produção. Separar corpus de treino, validação e teste por documento-fonte para evitar vazamento.

## Governança

Owner: AI Engineering + Clinical Governance. Toda fonte precisa de proveniência e data de revisão. Mudança de embedding, chunking ou reranker exige novo baseline.
