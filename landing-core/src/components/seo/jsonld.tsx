/**
 * JSON-LD structured data helpers for rich search results.
 * Each function returns a plain object ready to pass to <SeoHead jsonLd={[...]} />.
 */

import { SITE } from '../../lib/seo'

/* ─── Organization (required for Google Knowledge Panel) ─── */

export function organizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'EVOLUA',
    url: SITE.url,
    logo: `${SITE.url}/logo.png`,
    sameAs: [
      'https://www.instagram.com/useevolua/',
      'https://www.linkedin.com/company/useevolua/',
      'https://www.youtube.com/@useevolua',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'support',
      email: 'suporte@useevolua.com.br',
      availableLanguage: ['Portuguese'],
    },
  }
}

/* ─── Product / SoftwareApplication (for pricing/service pages) ─── */

export function productJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'EVOLUA',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    description:
      'A plataforma feita para fonoaudiólogas extraordinárias. Agenda, prontuário, faturamento, whatsapp e IA em um só lugar.',
    url: SITE.url,
    offers: [
      { '@type': 'Offer', price: '29', priceCurrency: 'BRL', name: 'Start' },
      { '@type': 'Offer', price: '59', priceCurrency: 'BRL', name: 'Essencial' },
      { '@type': 'Offer', price: '99', priceCurrency: 'BRL', name: 'Premium' },
      { '@type': 'Offer', price: '179', priceCurrency: 'BRL', name: 'Elite' },
    ],
  }
}

/* ─── BlogPosting (for individual blog articles) ─── */

export interface BlogPostLdParams {
  headline: string
  description: string
  url: string
  imageUrl: string
  datePublished: string
  dateModified?: string
  authorName: string
}

export function blogPostingJsonLd(params: BlogPostLdParams) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: params.headline,
    description: params.description,
    url: params.url,
    image: params.imageUrl,
    datePublished: params.datePublished,
    dateModified: params.dateModified ?? params.datePublished,
    author: {
      '@type': 'Person',
      name: params.authorName,
    },
    publisher: {
      '@type': 'Organization',
      name: 'EVOLUA',
      logo: `${SITE.url}/logo.png`,
    },
    inLanguage: 'pt-BR',
  }
}

/* ─── FAQPage (for ajuda/faq and planos pages) ─── */

export interface FaqItemLd {
  question: string
  answer: string
}

export function faqPageJsonLd(items: FaqItemLd[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  }
}
