'use client';

import {
  motion,
  fadeInUp,
  fadeIn,
  staggerContainer,
  smoothTransition,
  viewportConfig,
} from './motion';
import PricingCard from './PricingCard';

const plans = [
  {
    name: 'Essencial',
    price: '49',
    period: '/mês',
    highlighted: false,
    description: 'Para quem está começando a organizar o consultório.',
    features: ['Até 30 pacientes ativos', 'Prontuário digital básico', 'Agenda simples'],
    ctaLabel: 'Começar Essencial',
  },
  {
    name: 'Evolua Pro',
    price: '89',
    period: '/mês',
    highlighted: true,
    description: 'A experiência completa de inteligência para sua clínica.',
    features: [
      'Pacientes ilimitados',
      '<strong>Relatórios com IA (Voz para Texto)</strong>',
      'Confirmação via WhatsApp automática',
      'Gestão financeira completa',
    ],
    ctaLabel: 'Quero ser Pro',
  },
];

export default function Pricing() {
  return (
    <section
      className="min-h-[calc(100vh-80px)] flex flex-col justify-center py-24 px-6 conversational-container section-fade overflow-hidden"
      id="pricing"
    >
      <motion.div
        initial={fadeInUp.hidden}
        whileInView={fadeInUp.visible}
        viewport={viewportConfig}
        transition={smoothTransition}
        className="mb-16"
      >
        <h2 className="text-3xl font-bold mb-6">Planos simples, como a sua clínica deve ser</h2>
        <p className="text-lg text-text-secondary-light leading-relaxed">
          Sem contratos de fidelidade complicados. Transparência total para você crescer.
        </p>
      </motion.div>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={viewportConfig}
        className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center"
      >
        {plans.map((plan) => (
          <motion.div key={plan.name} variants={fadeInUp} transition={smoothTransition}>
            <PricingCard {...plan} />
          </motion.div>
        ))}
      </motion.div>

      <motion.div
        initial={fadeIn.hidden}
        whileInView={fadeIn.visible}
        viewport={viewportConfig}
        transition={{ ...smoothTransition, delay: 0.3 }}
        className="mt-12 flex justify-end"
      >
        <a
          href="/auth/cadastro"
          className="text-primary font-bold flex items-center gap-1 hover:underline"
        >
          Vamos começar? <span className="material-symbols-outlined text-sm">arrow_forward</span>
        </a>
      </motion.div>
    </section>
  );
}
