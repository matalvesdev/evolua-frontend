/**
 * SEO constants and route metadata for the Evolua landing page.
 * Centralizes all title, description, canonical, and image config.
 */

export const SITE = {
  name: 'EVOLUA',
  tagline: 'Agenda Cheia e Gestão de Elite para Fonoaudiólogas',
  url: 'https://useevolua.com.br',
  appUrl: 'https://app.useevolua.com.br',
  locale: 'pt_BR',
  defaultOgImage: 'https://useevolua.com.br/og-image.jpg',
  twitterHandle: '@evoluaapp',
} as const

export interface SeoMeta {
  title: string
  description: string
  canonical?: string
  ogImage?: string
  ogType?: 'website' | 'article'
  noindex?: boolean
}

/**
 * Per-route SEO metadata.
 * Key is the TanStack Router routeId (from routeTree.gen.ts).
 */
export const ROUTE_SEO: Record<string, SeoMeta> = {
  '/': {
    title: 'EVOLUA',
    description:
      'A plataforma feita para fonoaudiólogas extraordinárias. Agenda cheia, pacientes novos, IA e gestão em um só lugar. Teste grátis por 7 dias.',
    ogType: 'website',
  },
  '/blog': {
    title: 'Blog',
    description:
      'Conteúdo que faz sua clínica crescer. Estratégias reais de marketing, gestão e crescimento para fonoaudiólogas que querem mais.',
    ogType: 'website',
  },
  '/planos': {
    title: 'Planos',
    description:
      'Simples, justo e sem pegadinha. 14 dias grátis em qualquer plano. Sistema inteiro desbloqueado. Sem cartão de crédito.',
    ogType: 'website',
  },
  '/sobre': {
    title: 'Sobre',
    description:
      'Construído por quem ama o que fonoaudiólogas fazem. Conheça a história do Evolua, o CRM feito do zero para fonoaudiologia.',
    ogType: 'website',
  },
  '/nosso-jeito': {
    title: 'Nosso Jeito',
    description:
      'A gente acredita que cuidar de pessoas é a profissão mais bonita do mundo. Conheça os valores e o propósito do Evolua.',
    ogType: 'website',
  },
  '/ajuda': {
    title: 'Ajuda',
    description:
      'Tudo o que você precisa saber sobre o Evolua. Perguntas frequentes sobre conta, planos, pagamento, clínica, pacientes e mais.',
    ogType: 'website',
  },
  '/changelog': {
    title: 'Changelog',
    description:
      'A gente lança melhorias toda semana. Aqui fica o registro do que mudou, por que mudou e o que vem por aí no Evolua.',
    ogType: 'website',
  },
  '/contato': {
    title: 'Contato',
    description:
      'Dúvida, sugestão, parceria, imprensa, suporte — qualquer coisa. Resposta em até 1 dia útil. Fale com a gente.',
    ogType: 'website',
  },
  '/termos': {
    title: 'Termos de Uso',
    description: 'Termos de Uso do Evolua — plataforma de gestão clínica para fonoaudiólogas.',
    ogType: 'website',
  },
  '/privacidade': {
    title: 'Política de Privacidade',
    description:
      'Política de Privacidade do Evolua. Conforme a LGPD (Lei 13.709/2018). Saiba como tratamos seus dados.',
    ogType: 'website',
  },
  '/seguranca': {
    title: 'Segurança & LGPD',
    description:
      'Dados clínicos pedem cuidado clínico. Conheça as práticas de segurança, LGPD e certificações do Evolua.',
    ogType: 'website',
  },
  '/cookies': {
    title: 'Política de Cookies',
    description:
      'Política de Cookies do Evolua. Conforme a LGPD (Lei 13.709/2018). Saiba como usamos cookies.',
    ogType: 'website',
  },
  '/materiais': {
    title: 'Materiais Gratuitos',
    description:
      'Ferramentas para crescer. Checklists, planilhas e guias prontos para usar no seu consultório. Baixe grátis.',
    ogType: 'website',
  },
  '/status': {
    title: 'Status do Sistema',
    description: 'Status em tempo real dos serviços do Evolua. Acompanhe a disponibilidade da plataforma.',
    ogType: 'website',
  },
  '/newsletter/cancelar': {
    title: 'Cancelar Inscrição',
    description: 'Cancele sua inscrição na newsletter do Evolua.',
    ogType: 'website',
  },
}

export function buildTitle(pageTitle: string): string {
  if (pageTitle === 'EVOLUA') return 'EVOLUA | Agenda Cheia e Gestão de Elite para Fonoaudiólogas'
  return `${pageTitle} | EVOLUA`
}

export function buildCanonical(path: string): string {
  const clean = path.startsWith('/') ? path : `/${path}`
  return `${SITE.url}${clean}`
}
