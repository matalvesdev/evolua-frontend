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
    leadMagnetId: 'ebook-mkt-digital-fono',
    feature: {
      title: 'Automacão de Marketing no WhatsApp',
      description: 'O Evolua dispara mensagens automáticas, lembra pacientes e organiza filas de transmissão sem você levantar um dedo.',
      cta: 'Quero automatizar meu marketing',
      ctaLink: '/planos',
      icon: 'campaign',
    },
  },
  Gestão: {
    leadMagnetId: 'infografico-montar-clinica',
    feature: {
      title: 'Gestão Financeira Automática',
      description: 'Controle de receitas, despesas, inadimplência e fluxo de caixa integrado ao prontuário e à agenda.',
      cta: 'Quero organizar minha gestão',
      ctaLink: '/planos',
      icon: 'account_balance',
    },
  },
  Clínica: {
    leadMagnetId: 'ebook-protocolos',
    feature: {
      title: 'Prontuário Digital Completo',
      description: 'Registros clínicos, evoluções, anamnese, CAA e relatórios CFoF em um só lugar — acessível de qualquer lugar.',
      cta: 'Quero digitalizar minha clínica',
      ctaLink: '/planos',
      icon: 'clinical_notes',
    },
  },
  Carreira: {
    leadMagnetId: 'ebook-protocolos',
    feature: {
      title: 'Documentos Profissionais com IA',
      description: 'Gere laudos, relatórios e encaminhamentos em segundos com inteligência artificial — documentos prontos para assinar e entregar.',
      cta: 'Quero agilizar meus documentos',
      ctaLink: '/planos',
      icon: 'description',
    },
  },
  Tecnologia: {
    leadMagnetId: 'ebook-protocolos',
    feature: {
      title: 'IA + WhatsApp + Gestão',
      description: 'O Evolua une inteligência artificial, automação de WhatsApp e gestão clínica em uma plataforma integrada.',
      cta: 'Quero conhecer a plataforma',
      ctaLink: '/planos',
      icon: 'smart_toy',
    },
  },
}
