/** Props do componente EmptyState */
interface EmptyStateProps {
  /** Ícone Material Symbols a exibir (padrão: 'history') */
  icon?: string
  /** Título do estado vazio */
  title: string
  /** Descrição explicativa do estado vazio */
  description: string
}

/**
 * Componente de estado vazio para quando não há dados disponíveis.
 * Exibe ícone, título e descrição centralizados.
 */
export function EmptyState({ 
  icon = 'history', 
  title, 
  description 
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="bg-gray-100 p-6 rounded-2xl mb-4">
        <span className="material-symbols-outlined text-[48px] text-gray-400">
          {icon}
        </span>
      </div>
      <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-600 text-center max-w-md">{description}</p>
    </div>
  )
}
