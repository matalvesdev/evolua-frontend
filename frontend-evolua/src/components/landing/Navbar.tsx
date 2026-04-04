'use client';

import { useState } from 'react';

const navLinks = [
  { label: 'Diferenciais', href: '#pergunta-1' },
  { label: 'Demonstração', href: '#demo-section' },
  { label: 'Depoimentos', href: '#social-proof' },
  { label: 'Preços', href: '#pricing' },
];

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  function handleNavClick(e: React.MouseEvent<HTMLAnchorElement>, href: string) {
    e.preventDefault();
    const el = document.getElementById(href.replace('#', ''));
    if (el) el.scrollIntoView({ behavior: 'smooth' });
    setIsMenuOpen(false);
  }

  return (
    <nav
      className="fixed top-0 w-full z-50 bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100 transition-all duration-300"
      aria-label="Navegação principal"
    >
      <div className="max-w-6xl mx-auto px-6 h-20 flex justify-between items-center">
        {/* Logo */}
        <a href="#" className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-primary group-hover:bg-primary-hover transition-colors rounded-lg flex items-center justify-center text-white">
            <span className="material-symbols-outlined text-xl">graphic_eq</span>
          </div>
          <span className="text-xl font-bold tracking-tight text-gray-900">Evolua</span>
        </a>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => handleNavClick(e, link.href)}
              className="text-sm font-medium text-gray-600 hover:text-primary transition-colors"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Desktop Buttons */}
        <div className="hidden md:flex items-center gap-6">
          <a
            href="https://app.useevolua.com.br/auth/login"
            className="text-sm font-medium text-gray-600 hover:text-primary transition-colors"
          >
            Login
          </a>
          <a
            href="https://app.useevolua.com.br/auth/cadastro"
            className="bg-primary hover:bg-primary-hover text-white px-6 py-2.5 rounded-full text-sm font-bold transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
          >
            Começar Agora
          </a>
        </div>

        {/* Mobile Hamburger */}
        <button
          className="md:hidden text-gray-600 hover:text-primary"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label={isMenuOpen ? 'Fechar menu' : 'Abrir menu'}
          aria-expanded={isMenuOpen}
        >
          <span className="material-symbols-outlined">{isMenuOpen ? 'close' : 'menu'}</span>
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div
          className="md:hidden bg-white border-t border-gray-100 px-6 py-4 space-y-3"
          role="menu"
          aria-label="Menu de navegação mobile"
        >
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => handleNavClick(e, link.href)}
              className="block text-sm font-medium text-gray-600 hover:text-primary transition-colors py-2"
            >
              {link.label}
            </a>
          ))}
          <hr className="border-gray-100" />
          <a
            href="https://app.useevolua.com.br/auth/login"
            className="block text-sm font-medium text-gray-600 hover:text-primary transition-colors py-2"
          >
            Login
          </a>
          <a
            href="https://app.useevolua.com.br/auth/cadastro"
            className="block w-full text-center bg-primary hover:bg-primary-hover text-white px-6 py-2.5 rounded-full text-sm font-bold transition-all"
          >
            Começar Agora
          </a>
        </div>
      )}
    </nav>
  );
}
