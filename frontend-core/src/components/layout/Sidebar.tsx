import { Link, useRouterState } from '@tanstack/react-router'
import { useState } from 'react'
import { Logo } from '@/components/Logo'

// ── Grupos de navegação ───────────────────────────────────────────────────────
const NAV_GROUPS = [
  {
    label: 'Principal',
    items: [
      { to: '/dashboard',            icon: 'space_dashboard', label: 'Dashboard'       },
      { to: '/dashboard/pacientes',  icon: 'groups',          label: 'Pacientes'       },
      { to: '/dashboard/agenda',     icon: 'calendar_month',  label: 'Agenda'          },
    ]
  },
  {
    label: 'Clínico',
    items: [
      { to: '/dashboard/sessao',             icon: 'mic',              label: 'Sessão ao Vivo'     },
      { to: '/dashboard/prontuario',         icon: 'clinical_notes',   label: 'Prontuário'         },
      { to: '/dashboard/plano-terapeutico',  icon: 'target',           label: 'Plano Terapêutico'  },
      { to: '/dashboard/linha-do-tempo',     icon: 'timeline',         label: 'Linha do Tempo'     },
      { to: '/dashboard/teleconsulta',       icon: 'video_call',       label: 'Teleconsulta'       },
      { to: '/dashboard/exercicios',         icon: 'fitness_center',   label: 'Exercícios'         },
      { to: '/dashboard/laudos',             icon: 'verified',         label: 'Laudos'             },
      { to: '/dashboard/encaminhamentos',    icon: 'send',             label: 'Encaminhamentos'    },
    ]
  },
  {
    label: 'Gestão',
    items: [
      { to: '/dashboard/financeiro',  icon: 'payments',         label: 'Financeiro'      },
      { to: '/dashboard/relatorios',  icon: 'description',      label: 'Relatórios'      },
      { to: '/dashboard/analytics',   icon: 'bar_chart',        label: 'Analytics'       },
      { to: '/dashboard/whatsapp',    icon: 'chat',             label: 'WhatsApp'        },
      { to: '/dashboard/tarefas',     icon: 'task_alt',         label: 'Tarefas'         },
    ]
  },
  {
    label: 'Recursos',
    items: [
      { to: '/dashboard/onboarding',  icon: 'rocket_launch',    label: 'Onboarding'      },
      { to: '/dashboard/caa',         icon: 'grid_view',        label: 'CAA'             },
      { to: '/dashboard/materiais',   icon: 'article',          label: 'Materiais'       },
      { to: '/dashboard/biblioteca',  icon: 'local_library',    label: 'Biblioteca'      },
    ]
  },
]

const NAV_BOTTOM = [
  { to: '/dashboard/configuracoes', icon: 'settings', label: 'Configurações' },
  { to: '/dashboard/perfil',        icon: 'person',   label: 'Meu Perfil'   },
]

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const { location } = useRouterState()
  const path = location.pathname

  const isActive = (to: string) =>
    to === '/dashboard' ? path === '/dashboard' : path.startsWith(to)

  return (
    <aside
      className={`hidden md:flex flex-col h-full bg-canvas border-r border-border-soft transition-all duration-300 shrink-0 ${
        collapsed ? 'w-[72px]' : 'w-60'
      }`}
    >
      {/* ── Logo ── */}
      <div className={`flex items-center shrink-0 h-[68px] ${collapsed ? 'justify-center px-0' : 'px-5 gap-2.5'}`}>
        {collapsed ? (
          <span className="material-symbols-outlined text-dark" style={{ fontVariationSettings: '"FILL" 1, "wght" 600' }}>graphic_eq</span>
        ) : (
          <Logo variant="mono-ink" size="sm" className="flex-1" />
        )}
        {!collapsed && (
          <button onClick={() => setCollapsed(true)} className="control-tile !min-w-8 !min-h-8 w-8 h-8 shrink-0" title="Recolher menu">
            <span className="material-symbols-outlined text-base">left_panel_close</span>
          </button>
        )}
      </div>

      {/* Botão expandir collapsed */}
      {collapsed && (
        <button onClick={() => setCollapsed(false)} className="control-tile w-10 h-10 mx-auto mt-2" title="Expandir menu">
          <span className="material-symbols-outlined text-base">left_panel_open</span>
        </button>
      )}

      {/* ── Nav grupos ── */}
      <nav className="flex-1 flex flex-col px-3 py-3 overflow-y-auto no-scrollbar">
        {NAV_GROUPS.map(group => (
          <div key={group.label} className="flex flex-col gap-1 mb-4">
            {!collapsed && (
              <p className="px-2 mb-1 text-[11px] font-medium text-text-tertiary">{group.label}</p>
            )}
            {group.items.map(({ to, icon, label }) => {
              const active = isActive(to)
              return (
                <Link
                  key={to}
                  to={to}
                  title={collapsed ? label : undefined}
                  className={`relative flex items-center gap-3 transition-all duration-150 group ${
                    collapsed ? 'justify-center px-0 py-3' : 'px-3 py-2.5'
                  } ${
                    active
                      ? 'nav-active rounded-[10px] shadow-[inset_0_1px_rgba(255,255,255,.28)]'
                      : 'text-text-secondary rounded-[10px] hover:bg-surface-low hover:text-text-primary'
                  }`}
                >
                  <span
                    className={`material-symbols-outlined text-lg shrink-0 transition-colors ${
                      active ? 'text-dark' : 'text-text-secondary group-hover:text-text-primary'
                    }`}
                    style={{ fontVariationSettings: active ? '"FILL" 1' : '"FILL" 0' }}
                  >
                    {icon}
                  </span>
                  {!collapsed && (
                    <span className={`text-[13px] leading-none ${active ? 'font-semibold text-dark' : 'font-medium'}`}>
                      {label}
                    </span>
                  )}
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      {/* ── Nav bottom ── */}
      <div className="px-3 pb-4 pt-2 flex flex-col gap-1">
        {!collapsed && (
          <p className="px-2 mb-1 text-[11px] font-medium text-text-tertiary">Conta</p>
        )}
        {NAV_BOTTOM.map(({ to, icon, label }) => {
          const active = isActive(to)
          return (
            <Link
              key={to}
              to={to}
              title={collapsed ? label : undefined}
              className={`relative flex items-center gap-3 transition-all duration-150 group ${
                collapsed ? 'justify-center px-0 py-3' : 'px-3 py-2.5'
              } ${
                active
                  ? 'nav-active rounded-[10px]'
                  : 'text-text-secondary rounded-[10px] hover:bg-surface-low hover:text-text-primary'
              }`}
            >
              <span
                className={`material-symbols-outlined text-lg shrink-0 ${
                  active ? 'text-dark' : 'text-text-secondary group-hover:text-text-primary'
                }`}
                style={{ fontVariationSettings: active ? '"FILL" 1' : '"FILL" 0' }}
              >
                {icon}
              </span>
              {!collapsed && (
                <span className={`text-[13px] leading-none ${active ? 'font-semibold text-dark' : 'font-medium'}`}>
                  {label}
                </span>
              )}
            </Link>
          )
        })}
      </div>
    </aside>
  )
}
