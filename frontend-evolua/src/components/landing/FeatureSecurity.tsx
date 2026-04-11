'use client';

import {
  motion,
  fadeInUp,
  fadeIn,
  staggerContainer,
  smoothTransition,
  viewportConfig,
} from './motion';

export default function FeatureSecurity() {
  return (
    <section
      className="min-h-[calc(100vh-80px)] flex flex-col justify-center py-24 px-6 conversational-container section-fade"
      id="pergunta-3"
    >
      <motion.div
        initial={fadeInUp.hidden}
        whileInView={fadeInUp.visible}
        viewport={viewportConfig}
        transition={smoothTransition}
        className="mb-12"
      >
        <h2 className="text-3xl font-bold mb-6">
          Onde está guardada a evolução de quem você cuida?
        </h2>
        <p className="text-lg text-text-secondary-light leading-relaxed">
          Seu prontuário não é apenas papel ou um arquivo digital. É a história clínica de uma
          pessoa. Na Evolua, garantimos segurança máxima com a leveza de uma interface feita para
          seres humanos.
        </p>
      </motion.div>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={viewportConfig}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        <motion.div
          variants={fadeInUp}
          transition={smoothTransition}
          className="p-6 bg-primary-light/30 rounded-2xl"
        >
          <span className="material-symbols-outlined text-primary mb-4" aria-hidden="true">
            folder_shared
          </span>
          <h4 className="font-bold mb-2">Prontuário Digital</h4>
          <p className="text-sm text-text-secondary-light">
            Histórico completo e linha do tempo de evolução em um só lugar.
          </p>
        </motion.div>
        <motion.div
          variants={fadeInUp}
          transition={smoothTransition}
          className="p-6 bg-green-50 rounded-2xl"
        >
          <span className="material-symbols-outlined text-green-600 mb-4" aria-hidden="true">
            verified_user
          </span>
          <h4 className="font-bold mb-2">Sigilo Total</h4>
          <p className="text-sm text-text-secondary-light">
            Dados criptografados conforme as normas de saúde e LGPD.
          </p>
        </motion.div>
      </motion.div>

      <motion.div
        initial={fadeIn.hidden}
        whileInView={fadeIn.visible}
        viewport={viewportConfig}
        transition={{ ...smoothTransition, delay: 0.3 }}
        className="mt-12 flex justify-end"
      >
        <a
          href="#demo-section"
          className="text-primary font-bold flex items-center gap-1 hover:underline"
        >
          Ver na prática <span className="material-symbols-outlined text-sm">arrow_forward</span>
        </a>
      </motion.div>
    </section>
  );
}
