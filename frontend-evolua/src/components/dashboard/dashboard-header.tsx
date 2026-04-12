'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/hooks';
import { useAuth } from '@/hooks/use-auth';
import { NotificationPanel, useNotifications } from './notification-panel';
import { listPatients } from '@/lib/api/patients';
import { listReports } from '@/lib/api/reports';

interface SearchResult {
  id: string;
  type: 'patient' | 'report';
  title: string;
  subtitle: string;
  icon: string;
  href: string;
}

export function DashboardHeader() {
  const router = useRouter();
  const { user } = useUser();
  const { logout } = useAuth();
  const { unreadCount } = useNotifications();
  const [notifOpen, setNotifOpen] = useState(false);

  // Search state
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Profile dropdown
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  const userName = (user?.user_metadata?.name ||
    user?.user_metadata?.full_name ||
    'Usuário') as string;
  const userRole = user?.user_metadata?.role === 'therapist' ? 'Fonoaudiólogo(a)' : 'Profissional';
  const userInitial = userName.charAt(0).toUpperCase();

  // Search logic
  const doSearch = useCallback(async (q: string) => {
    if (q.trim().length < 2) {
      setResults([]);
      setSearching(false);
      return;
    }
    setSearching(true);
    try {
      const [patientsRes, reportsRes] = await Promise.all([
        listPatients({ search: q, limit: 5 }),
        listReports({ search: q, limit: 5 }),
      ]);
      const items: SearchResult[] = [];
      patientsRes.data.forEach((p) => {
        items.push({
          id: p.id,
          type: 'patient',
          title: p.name,
          subtitle: p.email || p.phone || `Status: ${p.status}`,
          icon: 'person',
          href: `/dashboard/pacientes/${p.id}`,
        });
      });
      reportsRes.data.forEach((r) => {
        items.push({
          id: r.id,
          type: 'report',
          title: r.title || 'Relatório sem título',
          subtitle: `${r.patientName} • ${r.type}`,
          icon: 'description',
          href: `/dashboard/pacientes/${r.patientId}/revisar-relatorio?reportId=${r.id}`,
        });
      });
      setResults(items);
    } catch {
      setResults([]);
    } finally {
      setSearching(false);
    }
  }, []);

  const handleSearchChange = (value: string) => {
    setQuery(value);
    setShowResults(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(value), 300);
  };

  // Close search on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Close profile on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleResultClick = (result: SearchResult) => {
    setShowResults(false);
    setQuery('');
    setResults([]);
    router.push(result.href);
  };

  const handleLogout = async () => {
    setProfileOpen(false);
    await logout();
  };

  return (
    <header className="w-full px-4 sm:px-6 lg:px-10 py-4 sm:py-5 flex items-center justify-between gap-3 md:gap-4 sticky top-0 z-50 bg-[#F5F6FA]/95 backdrop-blur-md">
      {/* Logo */}
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="bg-[#8A05BE] text-white p-2 rounded-xl">
          <span className="material-symbols-outlined text-2xl">graphic_eq</span>
        </div>
        <span className="font-bold text-xl tracking-tight text-[#8A05BE] hidden md:block">
          Evolua
        </span>
      </div>

      {/* Mobile menu */}
      <div className="flex items-center gap-2 md:hidden">
        <button className="p-2 -ml-2 text-gray-600 hover:text-[#8A05BE] transition-colors">
          <span className="material-symbols-outlined">menu</span>
        </button>
      </div>

      {/* Search */}
      <div
        ref={searchRef}
        className="hidden md:flex flex-1 max-w-md lg:max-w-xl mx-4 lg:mx-8 relative"
      >
        <div className="relative w-full">
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
            {searching ? (
              <span className="material-symbols-outlined text-[#8A05BE] animate-spin text-lg">
                progress_activity
              </span>
            ) : (
              <span className="material-symbols-outlined text-gray-400">search</span>
            )}
          </div>
          <input
            className="w-full pl-12 pr-12 py-2.5 rounded-full bg-white border border-gray-100 focus:border-[#8A05BE] focus:ring-[#8A05BE] shadow-sm text-sm transition-all"
            placeholder="Buscar pacientes, sessões ou relatórios..."
            type="text"
            value={query}
            onChange={(e) => handleSearchChange(e.target.value)}
            onFocus={() => {
              if (query.trim().length >= 2) setShowResults(true);
            }}
          />
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 hidden lg:flex items-center gap-1 px-2 py-1 rounded-md bg-gray-100 text-xs text-gray-500 font-medium border border-gray-200">
            ⌘ K
          </div>
        </div>

        {/* Search results dropdown */}
        {showResults && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden z-50">
            {query.trim().length < 2 ? (
              <div className="py-8 text-center">
                <span className="material-symbols-outlined text-2xl text-gray-300 mb-1 block">
                  search
                </span>
                <p className="text-sm text-gray-400">Digite para pesquisar...</p>
              </div>
            ) : results.length === 0 && !searching ? (
              <div className="py-8 text-center">
                <span className="material-symbols-outlined text-2xl text-gray-300 mb-1 block">
                  search_off
                </span>
                <p className="text-sm text-gray-400">Nenhum resultado encontrado</p>
              </div>
            ) : (
              <div className="max-h-72 overflow-y-auto custom-scrollbar">
                {results.map((r) => (
                  <button
                    key={`${r.type}-${r.id}`}
                    onClick={() => handleResultClick(r)}
                    className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-white/60 transition-colors border-b border-gray-50 last:border-0"
                  >
                    <div
                      className={`p-2 rounded-xl shrink-0 ${r.type === 'patient' ? 'bg-purple-100 text-[#8A05BE]' : 'bg-blue-100 text-blue-600'}`}
                    >
                      <span className="material-symbols-outlined text-lg">{r.icon}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-900 truncate">{r.title}</p>
                      <p className="text-xs text-gray-500 truncate">{r.subtitle}</p>
                    </div>
                    <span className="material-symbols-outlined text-gray-300 text-lg">
                      chevron_right
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right side: notifications + profile */}
      <div className="flex items-center gap-2 sm:gap-3 lg:gap-6 shrink-0">
        {/* Notification bell */}
        <div className="relative">
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
          >
            <span className="material-symbols-outlined">notifications</span>
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white" />
            )}
          </button>
          <NotificationPanel isOpen={notifOpen} onClose={() => setNotifOpen(false)} />
        </div>

        {/* Profile */}
        <div ref={profileRef} className="relative">
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2 sm:gap-3 group cursor-pointer"
          >
            <div className="text-right hidden lg:block">
              <p className="text-sm font-bold text-gray-900 group-hover:text-[#8A05BE] transition-colors">
                {userName}
              </p>
              <p className="text-xs text-gray-500">{userRole}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-[#E9CEF5] flex items-center justify-center text-[#8A05BE] font-bold border-2 border-white shadow-sm overflow-hidden">
              {userInitial}
            </div>
          </button>

          {/* Profile dropdown */}
          {profileOpen && (
            <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden z-50">
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-sm font-bold text-gray-900 truncate">{userName}</p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </div>
              <div className="py-1">
                <button
                  onClick={() => {
                    setProfileOpen(false);
                    router.push('/dashboard/perfil');
                  }}
                  className="w-full text-left px-4 py-2.5 flex items-center gap-3 hover:bg-white/60 transition-colors text-sm text-gray-700"
                >
                  <span className="material-symbols-outlined text-lg">person</span>
                  Ver Perfil
                </button>
                <button
                  onClick={() => {
                    setProfileOpen(false);
                    router.push('/dashboard/configuracoes');
                  }}
                  className="w-full text-left px-4 py-2.5 flex items-center gap-3 hover:bg-white/60 transition-colors text-sm text-gray-700"
                >
                  <span className="material-symbols-outlined text-lg">settings</span>
                  Configurações
                </button>
                <div className="border-t border-gray-100 my-1" />
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2.5 flex items-center gap-3 hover:bg-white/60 transition-colors text-sm text-red-600"
                >
                  <span className="material-symbols-outlined text-lg">logout</span>
                  Sair
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
