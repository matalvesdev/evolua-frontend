import type { PricingPlan } from '@/types';

export default function PricingCard({
  name,
  price,
  period,
  features,
  highlighted,
  ctaLabel,
  description,
}: PricingPlan & { description?: string }) {
  if (highlighted) {
    return (
      <div className="bg-primary p-6 rounded-[2rem] text-white shadow-2xl shadow-primary/30 transform md:scale-105 relative overflow-hidden">
        <div className="absolute top-0 right-0 bg-white/10 px-4 py-1 rounded-bl-xl text-xs font-bold uppercase tracking-wide">
          Mais Escolhido
        </div>
        <h3 className="text-2xl font-bold mb-2">{name}</h3>
        <div className="text-4xl font-bold mb-4">
          R$ {price}
          <span className="text-base font-normal text-primary-light/80">{period}</span>
        </div>
        {description && <p className="text-sm text-primary-light mb-6">{description}</p>}
        <ul className="space-y-3 mb-6 text-left">
          {features.map((feature) => (
            <li key={feature} className="flex items-center gap-3 text-sm text-white">
              <span className="bg-white/20 p-1 rounded-full">
                <span className="material-symbols-outlined text-sm">check</span>
              </span>
              <span dangerouslySetInnerHTML={{ __html: feature }} />
            </li>
          ))}
        </ul>
        <a
          href="https://app.useevolua.com.br/auth/cadastro"
          className="block w-full py-3 px-6 bg-white hover:bg-gray-50 text-primary font-bold rounded-xl transition-colors text-center shadow-lg"
        >
          {ctaLabel}
        </a>
      </div>
    );
  }

  return (
    <div className="bg-white p-8 rounded-[2rem] border border-gray-200 text-center md:text-left h-fit">
      <h3 className="text-xl font-bold text-gray-900 mb-2">{name}</h3>
      <div className="text-3xl font-bold text-gray-900 mb-6">
        R$ {price}
        <span className="text-sm font-normal text-gray-500">{period}</span>
      </div>
      {description && <p className="text-sm text-text-secondary-light mb-8">{description}</p>}
      <ul className="space-y-4 mb-8 text-left">
        {features.map((feature) => (
          <li key={feature} className="flex items-center gap-3 text-sm text-gray-700">
            <span className="material-symbols-outlined text-primary text-base">check</span>
            {feature}
          </li>
        ))}
      </ul>
      <a
        href="https://app.useevolua.com.br/auth/cadastro"
        className="block w-full py-3 px-6 bg-gray-100 hover:bg-gray-200 text-gray-900 font-bold rounded-xl transition-colors text-center"
      >
        {ctaLabel}
      </a>
    </div>
  );
}
