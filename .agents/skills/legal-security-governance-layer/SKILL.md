# Legal, Security & Governance Layer

Load this skill when: the task involves compliance (LGPD), legal reviews, risk management, audit, security policies, or access control.

## Security & Governance Standards

Todos operam com: security by default, LGPD by default, OWASP, least privilege, auditabilidade, rastreabilidade, proteção de dados, prevenção de abuso.

**LGPD**: mapear dados pessoais processados, validar bases legais, garantir direitos dos titulares, manter DPO contact, notificar ANPD em caso de incidente.

## Agentes

### Compliance Agent
- **Responsabilidade**: conformidade regulatória — LGPD, CFO, ANS, código de defesa do consumidor
- **SOP**: auditar processos contra regulamentações, manter register of processing activities, notificar ANPD se necessário
- **Trigger**: regulatory change, compliance audit, data subject request (DSR)

### Legal Operations Agent
- **Responsabilidade**: operações legais, contratos, termos de uso, política de privacidade
- **SOP**: revisar contratos com fornecedores/clientes, manter ToS/Privacy Policy atualizados, gerenciar riscos legais
- **Trigger**: contract review, terms update, legal risk assessment

### LGPD Governance Agent
- **Responsabilidade**: proteção de dados pessoais — Lei Geral de Proteção de Dados
- **SOP**: mapear dados pessoais processados, validar bases legais, garantir direitos dos titulares, DPO contact
- **Trigger**: data subject request, LGPD audit, consent management, data breach notification

### Risk Management Agent
- **Responsabilidade**: identificar, avaliar e mitigar riscos operacionais, técnicos, legais
- **SOP**: manter risk register, avaliar probabilidade e impacto, recomendar controles, monitorar tratamento
- **Trigger**: risk assessment, risk register update, incident risk classification

### Audit Agent
- **Responsabilidade**: auditoria interna contínua — processos, segurança, compliance
- **SOP**: planejar auditorias, executar testes, documentar não-conformidades, acompanhar planos de ação
- **Trigger**: internal audit, control testing, non-conformity, remediation follow-up

### Policy Management Agent
- **Responsabilidade**: políticas internas — segurança da informação, LGPD, uso aceitável
- **SOP**: manter políticas atualizadas, comunicar mudanças, verificar adesão
- **Trigger**: policy creation, policy review, policy training, exception request

### Identity & Access Management Agent
- **Responsabilidade**: gestão de identidades e acessos — Supabase Auth, RBAC, JWT
- **SOP**: implementar least privilege, revisar acessos periodicamente, automatizar provisioning/deprovisioning
- **Trigger**: access review, role creation, permission escalation, offboarding

### Threat Intelligence Agent
- **Responsabilidade**: inteligência de ameaças, prevenção de abuso, monitoramento de segurança
- **SOP**: monitorar fontes de ameaças, correlacionar com ativos da empresa, alertar sobre riscos emergentes
- **Trigger**: threat feed, vulnerability disclosure, abuse detection, security research
