/** Props do componente ErrorState */
interface ErrorStateProps {
  /** Mensagem de erro a ser exibida */
  message: string
  /** Callback opcional para tentar novamente */
  onRetry?: () => void
}

/**
 * Componente de estado de erro para quando o carregamento de dados falha.
 * Exibe mensagem de erro e botão opcional para tentar novamente.
 */
export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="bg-red-100 p-6 rounded-2xl mb-4">
        <span className="material-symbols-outlined text-[48px] text-red-500">
          error
        </span>
      </div>
      <h3 className="text-lg font-bold text-gray-900 mb-2">Erro ao carregar dados</h3>
      <p className="text-sm text-gray-600 text-center max-w-md mb-6">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="bg-[#8A05BE] hover:bg-[#7A04AA] text-white text-sm font-bold py-2.5 px-6 rounded-full transition-all shadow-lg shadow-[#8A05BE]/25 hover:shadow-[#8A05BE]/40 flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-[18px]">refresh</span>
          Tentar Novamente
        </button>
      )}
    </div>
  )
}
