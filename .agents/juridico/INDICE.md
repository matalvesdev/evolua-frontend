# Índice — Time Jurídico & Privacidade

## Quando acionar cada agente

| Situação | Agente |
|----------|--------|
| Contratos (Termos de Uso, DPA, B2B), regulatório CFoF/ANVISA, conflitos com clientes, due diligence para investimento, PI | `agente-juridico.md` |
| LGPD, mapeamento de dados, privacidade de nova feature, solicitação de titular, incidente de dados, DPA com fornecedor | `agente-lgpd.md` |

---

## Fluxo de triagem jurídica

```
Demanda jurídica identificada
        │
        ├── Envolve dados pessoais / privacidade? → agente-lgpd.md
        │
        ├── Contrato / regulação / conflito? → agente-juridico.md
        │
        ├── Incidente de segurança com dados? → agente-lgpd.md (urgente)
        │       └── Notificação ANPD em até 72h
        │
        └── Ameaça de processo / notificação extrajudicial? → agente-juridico.md (urgente)
                └── Prazo de resposta: 48h
```

---

## Prazos legais críticos

| Situação | Prazo | Base legal |
|----------|-------|-----------|
| Notificação de incidente à ANPD | 72 horas | LGPD art. 48 |
| Resposta a titular de dados | 15 dias corridos | LGPD art. 18 |
| Retenção de prontuário eletrônico | Mínimo 20 anos | CFoF 427/2013 |
| Retenção de documentos fiscais | 5 anos | Receita Federal |
| Resposta a notificação extrajudicial | 15 dias (recomendado) | Boa prática |

---

## Contatos de referência

- **ANPD:** www.gov.br/anpd
- **CFoF:** www.cffa.org.br
- **DPO interno:** privacidade@evolua.com.br
