---
title: "Modelo de Negócio, Pricing e Métricas"
status: active
owner: "Founder"
last_reviewed: 2026-08-14
---

# Modelo de negócio, pricing e métricas

## Modelo

**VERIFIED:** há modelos de plano, assinatura, invoice e billing com AbacatePay/Stripe. **UNKNOWN:** preço público, ARPA, base de clientes, custos e motion comercial atual. Modelo recomendado: assinatura SaaS ligada a valor e clareza, sem cobrar de maneira que desincentive organização clínica saudável.

## Pricing — Proposed

Testar poucos tiers (por exemplo, individual/profissional/clínica) somente após decidir ICP e value metric. Possíveis métricas: profissional, workspace ou funcionalidades; não paciente como taxa punitiva sem evidência. Avaliar trial versus demo/founder-led, com ativação clara e cancelamento transparente.

## Entitlements

Plano não é a autorização distribuída pelo frontend. Direção: `Plan → Entitlements → Feature access` resolvido no servidor. Não há prova de entitlement completo atual.

## Hierarquia de métricas

Receita: MRR, ARR, new/churned/expansion MRR. Eficiência: CAC, payback, gross margin. Cliente: ativação, retenção, tempo para valor, suporte. Fórmulas e valores são inputs a medir; não há números nesta base documental.

## Custos

Drivers: compute, banco, storage, banda, email, observabilidade, IA, pagamentos e ferramentas. IA = tokens de entrada/saída + embeddings + retrieval/rerank + storage + retry. Estratégias: roteamento, limites de contexto, batch, quota e cache seguro, sem degradar segurança/qualidade.
