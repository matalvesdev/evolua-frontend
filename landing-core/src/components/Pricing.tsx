import { Link } from '@tanstack/react-router'
import { motion } from 'motion/react'
import { Iphone } from './magicui/iphone'

const plans = [
  {
    number: '01',
    title: 'SÓ VOCÊ',
    subtitle: 'PRONTUÁRIO NATIVO • PROTOCOLOS CLÍNICOS • WHATSAPP INCLUSO',
    highlight: false,
    subtitleColor: 'text-muted',
  },
  {
    number: '02',
    title: 'GALERA',
    subtitle: 'ATÉ 5 PROFISSIONAIS • IA DE SESSÃO • APP DO PACIENTE',
    highlight: true,
    subtitleColor: 'text-primary',
  },
  {
    number: '03',
    title: 'GIGANTE',
    subtitle: 'MÚLTIPLAS UNIDADES • ONBOARDING DEDICADO • SLA GARANTIDO',
    highlight: false,
    subtitleColor: 'text-muted',
  },
]

const diferenciais = [
  { icon: 'description',         texto: 'Prontuário feito pra fono, não adaptado de médico' },
  { icon: 'psychology',          texto: 'IA transcreve a sessão e rascunha a evolução' },
  { icon: 'phone_android',       texto: 'App do paciente com exercícios e aderência em tempo real' },
  { icon: 'verified_user',       texto: 'Assinatura digital com validade jurídica inclusa' },
  { icon: 'chat',                texto: 'Lembretes por WhatsApp automáticos em todos os planos' },
  { icon: 'account_balance_wallet', texto: 'Pix, boleto, convênios e TISS em um só lugar' },
]

/** Chat WhatsApp do Evolua exibido dentro do iPhone mock */
function WhatsAppChat() {
  return (
    <div className="bg-[#ECE5DD] flex flex-col h-full">
      {/* Header WhatsApp */}
      <div className="bg-[#075E54] text-white px-3 py-2.5 flex items-center gap-2.5 shrink-0">
        <span className="material-symbols-outlined text-white text-[18px]">arrow_back</span>
        <div className="w-8 h-8 rounded-full bg-[#EAE8FF] flex items-center justify-center shrink-0">
          <span className="font-headline font-black text-primary text-[10px]">DR</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-[12px] leading-tight truncate">Dra. Renata · Fono</div>
          <div className="text-[9px] text-white/70 leading-tight">online</div>
        </div>
        <span className="material-symbols-outlined text-white text-[18px]">videocam</span>
        <span className="material-symbols-outlined text-white text-[18px]">call</span>
      </div>

      {/* Mensagens */}
      <div className="flex-1 overflow-hidden px-3 py-3 flex flex-col gap-2">
        {/* Data divisor */}
        <div className="self-center bg-[#E1F2FB] text-[8px] font-medium text-ink/60 px-2 py-0.5 rounded-md mb-1">
          HOJE
        </div>

        {/* Msg recebida — boas-vindas com automação */}
        <div className="self-start max-w-[85%] bg-white px-2.5 py-1.5 rounded-lg rounded-tl-sm shadow-sm">
          <p className="text-[10px] text-ink leading-snug">
            Oi Maria! 👋 Aqui estão seus exercícios de hoje. Tenta fazer 3 séries antes do almoço, ok?
          </p>
          <div className="flex items-center justify-end gap-1 mt-0.5">
            <span className="text-[7px] text-ink/40">09:12</span>
          </div>
        </div>

        {/* Msg recebida — vídeo exercício */}
        <div className="self-start max-w-[85%] bg-white p-1.5 rounded-lg rounded-tl-sm shadow-sm">
          <div className="bg-gradient-to-br from-primary/80 to-deep h-20 rounded-md flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-black/20" />
            <div className="relative w-8 h-8 rounded-full bg-white/90 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>play_arrow</span>
            </div>
            <div className="absolute bottom-1 left-1.5 text-white text-[7px] font-semibold">0:42</div>
          </div>
          <p className="text-[9px] text-ink mt-1 leading-snug px-0.5">
            <span className="font-semibold">Exercício Shaker</span> · 3x ao dia
          </p>
          <div className="flex items-center justify-end gap-1 mt-0.5 pr-0.5">
            <span className="text-[7px] text-ink/40">09:12</span>
          </div>
        </div>

        {/* Msg enviada — paciente confirma */}
        <div className="self-end max-w-[80%] bg-[#DCF8C6] px-2.5 py-1.5 rounded-lg rounded-tr-sm shadow-sm">
          <p className="text-[10px] text-ink leading-snug">
            Recebi, doutora! Já vou começar agora 💪
          </p>
          <div className="flex items-center justify-end gap-1 mt-0.5">
            <span className="text-[7px] text-ink/40">09:14</span>
            <span className="material-symbols-outlined text-[#34B7F1] text-[10px]">done_all</span>
          </div>
        </div>

        {/* Msg recebida — lembrete consulta */}
        <div className="self-start max-w-[85%] bg-white px-2.5 py-1.5 rounded-lg rounded-tl-sm shadow-sm">
          <p className="text-[10px] text-ink leading-snug">
            📅 Lembrete: sua consulta é <span className="font-semibold">amanhã às 14h</span>. Confirma pra mim?
          </p>
          <div className="flex gap-1 mt-1.5">
            <button className="flex-1 bg-primary text-white text-[8px] font-bold py-1 rounded">CONFIRMAR</button>
            <button className="flex-1 border border-ink/20 text-ink text-[8px] font-bold py-1 rounded">REMARCAR</button>
          </div>
          <div className="flex items-center justify-end gap-1 mt-1">
            <span className="text-[7px] text-ink/40">09:15</span>
          </div>
        </div>

        {/* Msg enviada digitando */}
        <div className="self-end max-w-[60%] bg-[#DCF8C6] px-3 py-2 rounded-lg rounded-tr-sm shadow-sm flex gap-1 items-center">
          <span className="w-1.5 h-1.5 bg-ink/40 rounded-full animate-pulse" />
          <span className="w-1.5 h-1.5 bg-ink/40 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
          <span className="w-1.5 h-1.5 bg-ink/40 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
        </div>
      </div>

      {/* Input bar */}
      <div className="bg-[#F0F0F0] px-2 py-2 flex items-center gap-2 shrink-0">
        <span className="material-symbols-outlined text-ink/50 text-[18px]">add_circle</span>
        <div className="flex-1 bg-white rounded-full px-3 py-1 text-[10px] text-ink/40">
          Mensagem
        </div>
        <span className="material-symbols-outlined text-[#075E54] text-[20px]">mic</span>
      </div>
    </div>
  )
}

export function Pricing() {
  return (
    <section className="py-20 md:py-32 px-5 md:px-12 bg-surface-low">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">

          {/* ── Left col: copy + planos ── */}
          <motion.div
            className="lg:col-span-5"
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ type: 'spring', stiffness: 50, damping: 18 }}
          >
            <span className="font-label text-[10px] font-bold tracking-[0.4em] uppercase text-primary mb-6 block">
              Comece agora
            </span>
            <h2 className="font-headline font-black text-4xl md:text-5xl lg:text-6xl uppercase tracking-tighter mb-8 leading-[0.9] text-ink">
              14 dias de graça pra você provar<span className="text-primary">.</span>
            </h2>
            <p className="text-base md:text-lg text-ink-soft/80 mb-10 md:mb-14 max-w-lg leading-relaxed">
              Testa o sistema inteiro — prontuário, IA, app do paciente, WhatsApp automático, financeiro — tudo desbloqueado. Se não amar, tudo bem. Mas a gente acha que você não vai querer voltar atrás.
            </p>

            <ul className="space-y-4 md:space-y-5 mb-12 md:mb-16">
              {diferenciais.map((d) => (
                <li key={d.icon} className="flex items-center gap-4">
                  <span className="material-symbols-outlined text-primary text-xl shrink-0">{d.icon}</span>
                  <span className="text-sm md:text-base text-ink-soft/80 leading-snug">{d.texto}</span>
                </li>
              ))}
            </ul>

            <div className="flex flex-col gap-5 md:gap-8">
              {plans.map((plan) => (
                <Link
                  key={plan.number}
                  to="/planos"
                  className="flex items-center gap-5 md:gap-8 group"
                >
                  <div
                    className={`w-12 h-12 md:w-14 md:h-14 flex items-center justify-center shrink-0 transition-all duration-300 ${
                      plan.highlight ? 'bg-primary' : 'bg-lavender border border-outline-variant group-hover:bg-primary'
                    }`}
                  >
                    <span className={`font-headline font-bold text-lg md:text-xl ${plan.highlight ? 'text-white' : 'text-ink group-hover:text-white'}`}>
                      {plan.number}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-headline font-bold uppercase text-base md:text-lg tracking-tight text-ink">{plan.title}</h4>
                    <p className={`text-[9px] font-bold font-label tracking-[0.2em] uppercase mt-0.5 ${plan.subtitleColor}`}>
                      {plan.subtitle}
                    </p>
                  </div>
                  <span className="material-symbols-outlined text-outline-variant ml-auto group-hover:text-primary transition-colors">
                    arrow_forward
                  </span>
                </Link>
              ))}
            </div>
          </motion.div>

          {/* ── Right col: Safari mock ── */}
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.97 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ type: 'spring', stiffness: 42, damping: 18, delay: 0.12 }}
            className="lg:col-span-7 flex flex-col gap-6"
          >
            {/* Label acima */}
            <div className="flex items-center gap-3">
              <span className="font-label text-[10px] font-bold tracking-[0.4em] uppercase text-primary">
                WhatsApp do paciente — ao vivo
              </span>
              <div className="flex-1 h-px bg-outline-variant" />
            </div>

            {/* iPhone frame */}
            <div className="flex justify-center">
              <Iphone>
                <WhatsAppChat />
              </Iphone>
            </div>

            {/* CTA abaixo do Safari */}
            <div className="bg-surface border border-outline-variant p-6 md:p-8 flex flex-col gap-4">
              <Link
                to="/cadastro"
                className="block w-full bg-primary text-white btn-text py-4 md:py-5 text-sm md:text-base hover:bg-primary-dark transition-all text-center"
              >
                Quero testar agora, de graça
              </Link>
              <p className="text-center text-[10px] font-bold tracking-[0.2em] uppercase text-muted">
                Sem cartão · 14 dias grátis · Cancela quando quiser
              </p>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  )
}
