/**
 * Iphone — MagicUI (local copy, simplificada)
 * Mockup de iPhone 15 Pro estilo "Dynamic Island" para exibir conteúdo de app.
 */
import { cn } from '../../lib/utils'

interface IphoneProps {
  children?: React.ReactNode
  className?: string
}

export function Iphone({ children, className }: IphoneProps) {
  return (
    <div
      className={cn(
        'relative mx-auto w-full max-w-[340px] aspect-[9/19.5] bg-[#1A1A2E] rounded-[44px] shadow-2xl p-[10px]',
        className,
      )}
    >
      {/* Frame externo (botões laterais) */}
      <div className="absolute -left-[3px] top-[110px] w-[3px] h-[32px] bg-[#1A1A2E] rounded-l-sm" />
      <div className="absolute -left-[3px] top-[160px] w-[3px] h-[60px] bg-[#1A1A2E] rounded-l-sm" />
      <div className="absolute -left-[3px] top-[230px] w-[3px] h-[60px] bg-[#1A1A2E] rounded-l-sm" />
      <div className="absolute -right-[3px] top-[180px] w-[3px] h-[90px] bg-[#1A1A2E] rounded-r-sm" />

      {/* Tela */}
      <div className="relative w-full h-full bg-white rounded-[36px] overflow-hidden flex flex-col">
        {/* Dynamic Island */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 z-20 w-[100px] h-[28px] bg-black rounded-full" />

        {/* Status bar */}
        <div className="relative z-10 flex items-center justify-between px-7 pt-3 pb-1 text-[11px] font-semibold text-ink shrink-0">
          <span>9:41</span>
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[12px]">signal_cellular_alt</span>
            <span className="material-symbols-outlined text-[12px]">wifi</span>
            <span className="material-symbols-outlined text-[12px]">battery_full</span>
          </span>
        </div>

        {/* Content area */}
        <div className="flex-1 overflow-hidden">{children}</div>
      </div>
    </div>
  )
}
