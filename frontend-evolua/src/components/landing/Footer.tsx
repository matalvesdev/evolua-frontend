export default function Footer() {
  return (
    <footer className="bg-gray-50 py-16 px-6" role="contentinfo">
      <div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center text-white">
            <span className="material-symbols-outlined text-lg">graphic_eq</span>
          </div>
          <span className="text-xl font-bold tracking-tight">Evolua</span>
        </div>
        <div className="flex gap-8 text-sm font-medium text-text-secondary-light">
          <a href="#" className="hover:text-primary transition-colors">
            Suporte
          </a>
          <a href="#" className="hover:text-primary transition-colors">
            Privacidade
          </a>
          <a href="#" className="hover:text-primary transition-colors">
            Termos
          </a>
        </div>
      </div>
      <div className="max-w-4xl mx-auto mt-12 pt-8 border-t border-gray-200">
        <p className="text-center text-xs text-gray-400">
          © 2024 Evolua. Criado com 💜 para fonoaudiólogas que buscam excelência.
        </p>
      </div>
    </footer>
  );
}
