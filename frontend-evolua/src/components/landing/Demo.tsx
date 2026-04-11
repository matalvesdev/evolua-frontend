'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import {
  motion,
  fadeInUp,
  scaleIn,
  staggerContainer,
  smoothTransition,
  viewportConfig,
} from './motion';

const slides = [
  { src: '/screenshots/dashboard.png', alt: 'Dashboard - Visão geral da clínica' },
  { src: '/screenshots/relatorios.png', alt: 'Relatórios e Evoluções com IA' },
  { src: '/screenshots/gravando.png', alt: 'Gravação de evolução por voz' },
  { src: '/screenshots/evolucao.png', alt: 'Revisão de evolução gerada por IA' },
  { src: '/screenshots/pacientes.png', alt: 'Gestão de pacientes' },
  { src: '/screenshots/prontuario.png', alt: 'Prontuário do paciente' },
  { src: '/screenshots/agenda.png', alt: 'Agenda inteligente' },
  { src: '/screenshots/tarefas.png', alt: 'Gerenciamento de tarefas' },
];

export default function Demo() {
  const [current, setCurrent] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % slides.length);
  }, []);

  const prev = useCallback(() => {
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  }, []);

  useEffect(() => {
    if (isHovered) return;
    const timer = setInterval(next, 4000);
    return () => clearInterval(timer);
  }, [isHovered, next]);

  return (
    <section
      className="min-h-[calc(100vh-80px)] flex flex-col justify-center py-24 px-6"
      id="demo-section"
    >
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={fadeInUp.hidden}
          whileInView={fadeInUp.visible}
          viewport={viewportConfig}
          transition={smoothTransition}
          className="mb-16 text-center"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Veja a Evolua em ação</h2>
          <p className="text-lg text-text-secondary-light leading-relaxed max-w-xl mx-auto">
            Uma interface desenhada para clareza mental. Tudo o que você precisa, onde você espera
            encontrar.
          </p>
        </motion.div>

        {/* iPad Pro Mockup */}
        <motion.div
          initial={scaleIn.hidden}
          whileInView={scaleIn.visible}
          viewport={viewportConfig}
          transition={{ ...smoothTransition, delay: 0.15 }}
          className="ipad-mockup"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          role="region"
          aria-label="Carrossel de demonstração do sistema"
          aria-roledescription="carrossel"
        >
          <div className="ipad-mockup-frame">
            <img
              src="/screenshots/ipad-pro-mockup.png"
              alt=""
              role="presentation"
              draggable={false}
            />
            <div className="ipad-screen-area" aria-live="polite" aria-atomic="true">
              <Image
                src={slides[current].src}
                alt={slides[current].alt}
                fill
                unoptimized
                className="object-cover object-top"
                priority={current === 0}
              />

              {/* Prev/Next */}
              <button
                onClick={prev}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 hover:bg-white rounded-full shadow-lg flex items-center justify-center transition-all z-20 focus:opacity-100"
                style={{ opacity: isHovered ? 1 : 0 }}
                aria-label={`Slide anterior. Atualmente exibindo slide ${current + 1} de ${slides.length}`}
              >
                <span
                  className="material-symbols-outlined text-gray-700 text-sm"
                  aria-hidden="true"
                >
                  chevron_left
                </span>
              </button>
              <button
                onClick={next}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 hover:bg-white rounded-full shadow-lg flex items-center justify-center transition-all z-20 focus:opacity-100"
                style={{ opacity: isHovered ? 1 : 0 }}
                aria-label={`Próximo slide. Atualmente exibindo slide ${current + 1} de ${slides.length}`}
              >
                <span
                  className="material-symbols-outlined text-gray-700 text-sm"
                  aria-hidden="true"
                >
                  chevron_right
                </span>
              </button>

              {/* Dots */}
              <div
                className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 z-20"
                role="tablist"
                aria-label="Slides da demonstração"
              >
                {slides.map((slide, i) => (
                  <button
                    key={i}
                    role="tab"
                    aria-selected={i === current}
                    onClick={() => setCurrent(i)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      i === current ? 'bg-primary w-5' : 'bg-white/60 hover:bg-white/80'
                    }`}
                    aria-label={`Ir para slide ${i + 1}: ${slide.alt}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={viewportConfig}
          className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-center max-w-2xl mx-auto"
        >
          <motion.div variants={fadeInUp} transition={smoothTransition}>
            <div className="text-4xl font-bold text-primary">98%</div>
            <div className="text-text-secondary-light mt-2">Precisão na transcrição clínica</div>
          </motion.div>
          <motion.div variants={fadeInUp} transition={smoothTransition}>
            <div className="text-4xl font-bold text-primary">2h</div>
            <div className="text-text-secondary-light mt-2">Economizadas por dia em média</div>
          </motion.div>
          <motion.div variants={fadeInUp} transition={smoothTransition}>
            <div className="text-4xl font-bold text-primary">Zero</div>
            <div className="text-text-secondary-light mt-2">Configuração técnica necessária</div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
