'use client';

import { useState, type FormEvent } from 'react';
import { motion, fadeInUp, smoothTransition, viewportConfig } from './motion';

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [phone, setPhone] = useState('');
  const [showHidden, setShowHidden] = useState(false);

  function handleNameInput(value: string) {
    setName(value);
    if (value.length > 0 && !showHidden) {
      setShowHidden(true);
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
  }

  return (
    <section className="py-24 px-6 conversational-container" id="cadastro">
      <motion.div
        initial={fadeInUp.hidden}
        whileInView={fadeInUp.visible}
        viewport={viewportConfig}
        transition={smoothTransition}
        className="text-center mb-16"
      >
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="material-symbols-outlined text-primary text-3xl">favorite</span>
        </div>
        <h2 className="text-4xl font-bold mb-6 tracking-tight">
          Estamos prontos para ser seus parceiros.
        </h2>
        <p className="text-lg text-text-secondary-light">
          Junte-se a fonoaudiólogas que recuperaram sua rotina e voltaram a se apaixonar pela
          clínica. Comece seu teste gratuito de 7 dias agora.
        </p>
      </motion.div>

      <motion.div
        initial={fadeInUp.hidden}
        whileInView={fadeInUp.visible}
        viewport={viewportConfig}
        transition={{ ...smoothTransition, delay: 0.15 }}
        className="bg-white border border-gray-100 shadow-2xl shadow-primary/10 rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16"></div>

        <form
          onSubmit={handleSubmit}
          autoComplete="off"
          aria-label="Formulário de cadastro para teste gratuito"
          className="space-y-6 relative z-10"
        >
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label htmlFor="signup-name" className="block text-sm font-bold text-gray-700 mb-2">
                Nome Completo
              </label>
              <input
                id="signup-name"
                type="text"
                placeholder="Seu nome completo"
                value={name}
                onChange={(e) => handleNameInput(e.target.value)}
                aria-required="true"
                className="w-full px-6 py-4 bg-gray-50 border-none focus:ring-2 focus:ring-primary rounded-2xl transition-all"
              />
            </div>
            <div>
              <label htmlFor="signup-email" className="block text-sm font-bold text-gray-700 mb-2">
                E-mail profissional
              </label>
              <input
                id="signup-email"
                type="email"
                placeholder="voce@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-required="true"
                className="w-full px-6 py-4 bg-gray-50 border-none focus:ring-2 focus:ring-primary rounded-2xl"
              />
            </div>
          </div>

          <div
            id="hidden-fields"
            className={
              showHidden ? 'space-y-6 pt-2 transition-all duration-500 ease-in-out' : 'hidden-step'
            }
          >
            <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10">
              <p className="text-xs text-primary font-bold uppercase tracking-wider mb-4">
                Complete para personalizar seu teste
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="signup-specialty"
                    className="block text-sm font-bold text-gray-700 mb-2"
                  >
                    Sua especialidade
                  </label>
                  <select
                    id="signup-specialty"
                    value={specialty}
                    onChange={(e) => setSpecialty(e.target.value)}
                    className="w-full px-6 py-4 bg-white border-none focus:ring-2 focus:ring-primary rounded-2xl appearance-none cursor-pointer"
                  >
                    <option value="" disabled>
                      Selecione...
                    </option>
                    <option>Linguagem</option>
                    <option>Motricidade Orofacial</option>
                    <option>Audiologia</option>
                    <option>Voz</option>
                    <option>Disfagia</option>
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="signup-phone"
                    className="block text-sm font-bold text-gray-700 mb-2"
                  >
                    WhatsApp
                  </label>
                  <input
                    id="signup-phone"
                    type="tel"
                    placeholder="(00) 00000-0000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-6 py-4 bg-white border-none focus:ring-2 focus:ring-primary rounded-2xl"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4">
            <a
              href="/auth/cadastro"
              className="w-full py-5 px-8 bg-primary hover:bg-primary-hover text-white text-lg font-bold rounded-2xl shadow-xl shadow-primary/30 transition-all transform hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-2 group"
            >
              Quero meu teste grátis agora
              <span className="material-symbols-outlined group-hover:rotate-12 transition-transform">
                rocket_launch
              </span>
            </a>
            <div className="flex flex-col md:flex-row items-center justify-center gap-2 mt-6 text-xs text-text-secondary-light bg-gray-50 py-3 rounded-xl border border-gray-100">
              <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-sm text-primary">
                  credit_card_off
                </span>
                <span>Sem cartão de crédito necessário</span>
              </div>
              <span className="hidden md:inline text-gray-300">|</span>
              <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-sm text-green-600">
                  verified_user
                </span>
                <span>Teste grátis por 7 dias</span>
              </div>
            </div>
          </div>
        </form>
      </motion.div>
    </section>
  );
}
