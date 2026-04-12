'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRequireAuth } from '@/hooks/use-auth';
import { RouteGuard } from '@/components/auth/route-guard';
import { SessionWarning } from '@/components/auth/session-warning';
import { SecureErrorBoundary } from '@/components/auth/secure-error-boundary';

const mobileNavItems = [
  { href: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
  { href: '/dashboard/pacientes', icon: 'groups', label: 'Pacientes' },
  { href: '/dashboard/agendamentos', icon: 'calendar_month', label: 'Agenda' },
  { href: '/dashboard/tarefas', icon: 'check_circle', label: 'Tarefas' },
  { href: '/dashboard/financeiro', icon: 'payments', label: 'Financeiro' },
  { href: '/dashboard/relatorios', icon: 'description', label: 'Relatórios' },
];

function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden glass-panel rounded-none border-t border-white/60"
      style={{ borderRadius: 0, paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex items-center justify-around px-1 py-2">
        {mobileNavItems.map((item) => {
          const isActive =
            item.href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex flex-col items-center justify-center gap-0.5 min-w-12 min-h-11 px-2 py-1 rounded-xl transition-colors ${
                isActive ? 'text-[#8A05BE]' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <span
                className="material-symbols-outlined text-xl"
                style={isActive ? { fontVariationSettings: '"FILL" 1' } : undefined}
              >
                {item.icon}
              </span>
              <span
                className={`text-[10px] leading-tight truncate max-w-[56px] ${isActive ? 'font-semibold' : 'font-medium'}`}
              >
                {item.label}
              </span>
              {isActive && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-[#8A05BE]" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useRequireAuth();

  if (loading) {
    return (
      <div
        className="h-screen w-screen flex items-center justify-center"
        style={{
          background:
            'radial-gradient(circle at 10% 20%, rgba(240, 228, 249, 0.6) 0%, transparent 50%), radial-gradient(circle at 90% 80%, rgba(232, 218, 255, 0.4) 0%, transparent 50%), #F5F6FA',
        }}
      >
        <div className="animate-pulse text-gray-400">Carregando...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div
      className="min-h-screen font-display text-gray-800 pb-[calc(5.25rem+env(safe-area-inset-bottom))] md:pb-0"
      style={{
        background:
          'radial-gradient(circle at 10% 20%, rgba(240, 228, 249, 0.6) 0%, transparent 50%), radial-gradient(circle at 90% 80%, rgba(232, 218, 255, 0.4) 0%, transparent 50%), #F5F6FA',
      }}
    >
      <div className="max-w-[1400px] mx-auto">
        <SecureErrorBoundary>
          <RouteGuard>{children}</RouteGuard>
        </SecureErrorBoundary>
      </div>

      <SessionWarning />
      <MobileBottomNav />
    </div>
  );
}
