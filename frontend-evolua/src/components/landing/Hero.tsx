'use client';

import { motion, fadeInUp, smoothTransition } from './motion';

export default function Hero() {
  return (
    <section className="min-h-[80vh] flex flex-col justify-center px-6 conversational-container text-center mb-24">
      <motion.span
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...smoothTransition, delay: 0.1 }}
        className="text-primary font-bold tracking-[0.2em] uppercase text-xs mb-6"
      >
        Uma nova era na Fonoaudiologia
      </motion.span>
      <motion.h1
        initial={fadeInUp.hidden}
        animate={fadeInUp.visible}
        transition={{ ...smoothTransition, delay: 0.25 }}
        className="text-5xl md:text-6xl font-bold leading-tight mb-8 tracking-tight"
      >
        E se você pudesse focar apenas no <span className="text-primary">cuidado</span>?
      </motion.h1>
      <motion.p
        initial={fadeInUp.hidden}
        animate={fadeInUp.visible}
        transition={{ ...smoothTransition, delay: 0.4 }}
        className="text-xl text-text-secondary-light leading-relaxed mb-12"
      >
        Sabemos que sua paixão é transformar vidas através da comunicação. Mas a burocracia e os
        relatórios intermináveis muitas vezes roubam seu tempo precioso.
      </motion.p>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ ...smoothTransition, delay: 0.6 }}
        className="flex flex-col items-center gap-4"
      >
        <a
          href="#pergunta-1"
          className="group flex items-center gap-2 text-primary font-bold text-lg animate-bounce"
        >
          Descubra como{' '}
          <span className="material-symbols-outlined" aria-hidden="true">
            expand_more
          </span>
        </a>
      </motion.div>
    </section>
  );
}
