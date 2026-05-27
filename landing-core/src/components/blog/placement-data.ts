export interface FeatureHighlightData {
  title: string
  description: string
  cta: string
  ctaLink: string
  icon: string
}

export interface CategoryPlacement {
  leadMagnetId: string
  feature: FeatureHighlightData
}

export const PLACEMENT_BY_CATEGORY: Record<string, CategoryPlacement> = {
  Marketing: {
    leadMagnetId: 'checklist-gestao',
    feature: {
      title: 'Automacão de Marketing no WhatsApp',
      description: 'O Evolua dispara mensagens automáticas, lembra pacientes e organiza filas de transmissão sem você levantar um dedo.',
      cta: 'Quero automatizar meu marketing',
      ctaLink: '/planos',
      icon: 'campaign',
    },
  },
  Gestão: {
    leadMagnetId: 'planilha-financeiro',
    feature: {
      title: 'Gestão Financeira Automática',
      description: 'Controle de receitas, despesas, inadimplência e fluxo de caixa integrado ao prontuário e à agenda.',
      cta: 'Quero organizar minha gestão',
      ctaLink: '/planos',
      icon: 'account_balance',
    },
  },
  Clínica: {
    leadMagnetId: 'template-relatorio',
    feature: {
      title: 'Prontuário Digital Completo',
      description: 'Registros clínicos, evoluções, anamnese, CAA e relatórios CFoF em um só lugar — acessível de qualquer lugar.',
      cta: 'Quero digitalizar minha clínica',
      ctaLink: '/planos',
      icon: 'clinical_notes',
    },
  },
  Carreira: {
    leadMagnetId: 'ebook-tendencias',
    feature: {
      title: 'Encaminhamentos Inteligentes',
      description: 'Receba encaminhamentos de pacientes compatíveis com seu perfil, especialidade e região de atendimento.',
      cta: 'Quero receber pacientes',
      ctaLink: '/planos',
      icon: 'group_add',
    },
  },
  Tecnologia: {
    leadMagnetId: 'ebook-tendencias',
    feature: {
      title: 'IA + WhatsApp + Gestão',
      description: 'O Evolua une inteligência artificial, automação de WhatsApp e gestão clínica em uma plataforma integrada.',
      cta: 'Quero conhecer a plataforma',
      ctaLink: '/planos',
      icon: 'smart_toy',
    },
  },
}
