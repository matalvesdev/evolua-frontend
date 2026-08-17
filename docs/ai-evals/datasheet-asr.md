# Datasheet — ASR Evolua

## Uso pretendido

Medir transcrição de fala em português brasileiro para apoio à documentação da sessão. Não é instrumento diagnóstico e não substitui revisão da fonoaudióloga.

## Unidade e campos

Cada item contém `id`, `reference`, `prediction`, `clinical_terms`, `consent`, `synthetic` e metadados técnicos. O fixture versionado é sintético.

## Métricas e cortes

- Word Error Rate global e por estrato.
- Taxa de preservação de termos clínicos.
- Latência p50/p95 e taxa de falhas do provedor quando executado online.
- Gate inicial: WER <= 0,20; zero vazamento de identificadores.

## Riscos e vieses

Fala infantil, disfluência, voz alterada, ruído, sobreposição e sotaques podem elevar erro. Áudio real exige consentimento explícito, minimização, criptografia, retenção definida e processo de exclusão. Não treinar com áudio de paciente por padrão.

## Governança

Owner: AI Engineering + Clinical Experience. Revisão trimestral ou após troca de modelo/provedor. Falhas clínicas graves devem gerar caso de regressão anonimizado ou sintético equivalente.
