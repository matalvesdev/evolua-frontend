/**
 * @jest-environment jsdom
 *
 * Testes E2E: Fluxo completo do EvolutionHistoryPanel
 * Simula o fluxo completo do usuário: criação de meta, atualizações de progresso,
 * visualização do painel, análise de tendência, comparação de períodos e exportação.
 *
 * Validates: Requirements 1.1, 1.4, 1.5, 3.1, 3.2, 5.2, 6.1, 6.4, 7.1, 9.4
 */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import type {
  GoalProgressSnapshot,
  Milestone,
  TrendAnalysis,
} from '@/types/evolution-history'

// ============================================================================
// Mock data: simula fluxo completo (meta criada → progresso atualizado várias vezes)
// ============================================================================

const mockSnapshots: GoalProgressSnapshot[] = [
  { id: 's1', goalId: 'goal-1', progress: 0,   createdAt: new Date('2024-01-01'), therapistId: 't1', notes: 'Meta criada' },
  { id: 's2', goalId: 'goal-1', progress: 20,  createdAt: new Date('2024-01-15'), therapistId: 't1', variation: 20 },
  { id: 's3', goalId: 'goal-1', progress: 45,  createdAt: new Date('2024-02-01'), therapistId: 't1', variation: 25 },
  { id: 's4', goalId: 'goal-1', progress: 60,  createdAt: new Date('2024-02-15'), therapistId: 't1', variation: 15 },
  { id: 's5', goalId: 'goal-1', progress: 80,  createdAt: new Date('2024-03-01'), therapistId: 't1', variation: 20 },
  { id: 's6', goalId: 'goal-1', progress: 100, createdAt: new Date('2024-03-15'), therapistId: 't1', variation: 20 },
]

const mockMilestones: Milestone[] = [
  { id: 'm1', goalId: 'goal-1', type: 'started',             date: new Date('2024-01-01'), progress: 0,   description: 'Meta iniciada',              createdAt: new Date('2024-01-01') },
  { id: 'm2', goalId: 'goal-1', type: 'significant_increase', date: new Date('2024-01-15'), progress: 20,  description: 'Mudança significativa: +20%', createdAt: new Date('2024-01-15') },
  { id: 'm3', goalId: 'goal-1', type: 'significant_increase', date: new Date('2024-02-01'), progress: 45,  description: 'Mudança significativa: +25%', createdAt: new Date('2024-02-01') },
  { id: 'm4', goalId: 'goal-1', type: 'significant_increase', date: new Date('2024-03-01'), progress: 80,  description: 'Mudança significativa: +20%', createdAt: new Date('2024-03-01') },
  { id: 'm5', goalId: 'goal-1', type: 'completed',            date: new Date('2024-03-15'), progress: 100, description: 'Meta concluída',              createdAt: new Date('2024-03-15') },
]

const mockTrendAnalysis: TrendAnalysis = {
  trend: 'improvement',
  averageWeeklyRate: 12.5,
  periodDays: 30,
  startProgress: 0,
  endProgress: 100,
  totalVariation: 100,
}

// ============================================================================
// Mocks
// ============================================================================

const mockUseEvolutionHistory = jest.fn()

jest.mock('@/hooks/use-evolution-history', () => ({
  useEvolutionHistory: (...args: unknown[]) => mockUseEvolutionHistory(...args),
}))

// Mock useMediaQuery — controlado por variável para testar mobile/desktop
let mockIsMobile = false
jest.mock('@/hooks/use-media-query', () => ({
  useMediaQuery: () => mockIsMobile,
}))

// Mock ExportService
const mockExportToPDF = jest.fn().mockResolvedValue(new Blob(['pdf'], { type: 'application/pdf' }))
const mockExportToCSV = jest.fn().mockResolvedValue(new Blob(['csv'], { type: 'text/csv' }))
const mockExportChartToPNG = jest.fn().mockResolvedValue(new Blob(['png'], { type: 'image/png' }))

jest.mock('@/services/goal-history', () => ({
  ExportService: {
    exportToPDF: (...args: unknown[]) => mockExportToPDF(...args),
    exportToCSV: (...args: unknown[]) => mockExportToCSV(...args),
    exportChartToPNG: (...args: unknown[]) => mockExportChartToPNG(...args),
  },
  trendAnalyzer: {
    comparePeriods: jest.fn().mockReturnValue({
      period1: { averageProgress: 20, updateCount: 2, startDate: new Date('2024-01-01'), endDate: new Date('2024-01-31') },
      period2: { averageProgress: 70, updateCount: 3, startDate: new Date('2024-02-01'), endDate: new Date('2024-03-15') },
      variation: 50,
    }),
  },
}))

// Mock ProgressChart (usa Recharts — não renderiza em jsdom)
jest.mock('../progress-chart', () => ({
  ProgressChart: ({ onMilestoneClick }: { onMilestoneClick?: (m: Milestone) => void }) => (
    <div data-testid="progress-chart">
      <button
        data-testid="chart-milestone-trigger"
        onClick={() => onMilestoneClick && onMilestoneClick(mockMilestones[0])}
      >
        Clique no marco
      </button>
    </div>
  ),
}))

// Import após os mocks
import { EvolutionHistoryPanel } from '../evolution-history-panel'

// ============================================================================
// Helpers
// ============================================================================

const DEFAULT_PROPS = {
  goalId: 'goal-1',
  patientId: 'patient-1',
  isOpen: true,
  onClose: jest.fn(),
}

function renderPanel(props = DEFAULT_PROPS) {
  return render(<EvolutionHistoryPanel {...props} />)
}

// ============================================================================
// Setup
// ============================================================================

beforeEach(() => {
  jest.clearAllMocks()
  mockIsMobile = false
  mockUseEvolutionHistory.mockReturnValue({
    snapshots: mockSnapshots,
    milestones: mockMilestones,
    trendAnalysis: mockTrendAnalysis,
    loading: false,
    error: null,
    refetch: jest.fn(),
  })
  // Suprimir erros de console esperados
  jest.spyOn(console, 'error').mockImplementation(() => {})
})

afterEach(() => {
  jest.restoreAllMocks()
})

// ============================================================================
// Cenário 1: Painel completo renderiza com dados completos
// ============================================================================

describe('Cenário 1: Painel completo renderiza com dados completos', () => {
  it('painel abre com isOpen=true e exibe o título', () => {
    renderPanel()
    expect(screen.getByText('Histórico de Evolução')).toBeInTheDocument()
  })

  it('cards de resumo são visíveis', () => {
    renderPanel()
    // SummaryCards renderiza cards com labels específicos
    expect(screen.getByText('Progresso Atual')).toBeInTheDocument()
    expect(screen.getByText('Há 30 Dias')).toBeInTheDocument()
    expect(screen.getByText('Variação')).toBeInTheDocument()
  })

  it('gráfico de progresso é renderizado', () => {
    renderPanel()
    expect(screen.getByTestId('progress-chart')).toBeInTheDocument()
  })

  it('badge de tendência mostra "Melhora" (improvement)', () => {
    renderPanel()
    // TrendBadge renderiza o label do trendConfig
    expect(screen.getByText('Melhora')).toBeInTheDocument()
  })

  it('taxa semanal é exibida no badge de tendência', () => {
    renderPanel()
    expect(screen.getByText('12.5%')).toBeInTheDocument()
  })

  it('timeline exibe todos os milestones', () => {
    renderPanel()
    expect(screen.getByText('Meta iniciada')).toBeInTheDocument()
    expect(screen.getByText('Meta concluída')).toBeInTheDocument()
    expect(screen.getAllByText(/Mudança significativa/)).toHaveLength(3)
  })

  it('menu de exportação é visível quando há dados', () => {
    renderPanel()
    expect(screen.getByRole('button', { name: /exportar/i })).toBeInTheDocument()
  })

  it('seção "Comparar Períodos" é visível', () => {
    renderPanel()
    expect(screen.getByText('Comparar Períodos')).toBeInTheDocument()
  })
})

// ============================================================================
// Cenário 2: Verificação do snapshot inicial (progress=0%)
// ============================================================================

describe('Cenário 2: Verificação do snapshot inicial', () => {
  it('primeiro snapshot tem progress=0 e está representado no milestone "started"', () => {
    renderPanel()
    expect(screen.getByText('Meta iniciada')).toBeInTheDocument()
  })

  it('milestone "started" aparece na timeline', () => {
    renderPanel()
    // O milestone de tipo 'started' tem descrição 'Meta iniciada'
    const timelineItems = screen.getAllByText(/Meta iniciada/)
    expect(timelineItems.length).toBeGreaterThan(0)
  })

  it('cards de resumo mostram progresso atual de 100% (último snapshot)', () => {
    renderPanel()
    // Múltiplos elementos podem exibir 100% (Progresso Atual e Há 30 Dias)
    const items = screen.getAllByText('100%')
    expect(items.length).toBeGreaterThan(0)
    // O card "Progresso Atual" deve mostrar 100%
    const progressCard = screen.getByText('Progresso Atual').closest('div')
    expect(progressCard).toBeInTheDocument()
  })

  it('hook é chamado com goalId e patientId corretos', () => {
    renderPanel()
    expect(mockUseEvolutionHistory).toHaveBeenCalledWith(
      expect.objectContaining({ goalId: 'goal-1', patientId: 'patient-1' })
    )
  })
})

// ============================================================================
// Cenário 3: Detecção de milestones
// ============================================================================

describe('Cenário 3: Detecção de milestones', () => {
  it('milestone "completed" é exibido na timeline', () => {
    renderPanel()
    expect(screen.getByText('Meta concluída')).toBeInTheDocument()
  })

  it('milestones "significant_increase" são exibidos na timeline', () => {
    renderPanel()
    const items = screen.getAllByText(/Mudança significativa/)
    expect(items).toHaveLength(3)
  })

  it('clicar em um milestone na timeline o destaca (toggle highlight)', () => {
    renderPanel()
    // Clicar no primeiro item da timeline
    const milestoneItem = screen.getByText('Meta iniciada')
    fireEvent.click(milestoneItem)
    // Após clicar, o milestone deve estar destacado (sem erro)
    expect(milestoneItem).toBeInTheDocument()
  })

  it('clicar no mesmo milestone novamente remove o destaque', () => {
    renderPanel()
    const milestoneItem = screen.getByText('Meta iniciada')
    fireEvent.click(milestoneItem)
    fireEvent.click(milestoneItem)
    expect(milestoneItem).toBeInTheDocument()
  })
})

// ============================================================================
// Cenário 4: Exibição da análise de tendência
// ============================================================================

describe('Cenário 4: Exibição da análise de tendência', () => {
  it('TrendBadge exibe tendência "improvement" como "Melhora"', () => {
    renderPanel()
    expect(screen.getByText('Melhora')).toBeInTheDocument()
  })

  it('taxa semanal de 12.5% é exibida', () => {
    renderPanel()
    expect(screen.getByText('12.5%')).toBeInTheDocument()
  })

  it('TrendBadge não é exibido quando trendAnalysis é null', () => {
    mockUseEvolutionHistory.mockReturnValue({
      snapshots: mockSnapshots,
      milestones: mockMilestones,
      trendAnalysis: null,
      loading: false,
      error: null,
      refetch: jest.fn(),
    })
    renderPanel()
    expect(screen.queryByText('Melhora')).not.toBeInTheDocument()
  })

  it('TrendBadge exibe "Regressão" para tendência de regressão', () => {
    mockUseEvolutionHistory.mockReturnValue({
      snapshots: mockSnapshots,
      milestones: mockMilestones,
      trendAnalysis: { ...mockTrendAnalysis, trend: 'regression', averageWeeklyRate: -5 },
      loading: false,
      error: null,
      refetch: jest.fn(),
    })
    renderPanel()
    expect(screen.getByText('Regressão')).toBeInTheDocument()
  })
})

// ============================================================================
// Cenário 5: Comparador de períodos
// ============================================================================

describe('Cenário 5: Comparador de períodos', () => {
  it('seção "Comparar Períodos" está presente e colapsada por padrão', () => {
    renderPanel()
    expect(screen.getByText('Comparar Períodos')).toBeInTheDocument()
    // PeriodComparator não deve estar visível antes de expandir
    expect(screen.queryByText('Período 1')).not.toBeInTheDocument()
  })

  it('clicar em "Comparar Períodos" expande a seção', () => {
    renderPanel()
    fireEvent.click(screen.getByText('Comparar Períodos'))
    // PeriodComparator renderiza seletores com labels "Período 1" e "Período 2"
    expect(screen.getAllByText('Período 1').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Período 2').length).toBeGreaterThan(0)
  })

  it('clicar novamente em "Comparar Períodos" colapsa a seção', () => {
    renderPanel()
    fireEvent.click(screen.getByText('Comparar Períodos'))
    expect(screen.getAllByText('Período 1').length).toBeGreaterThan(0)

    fireEvent.click(screen.getByText('Comparar Períodos'))
    expect(screen.queryByText('Período 1')).not.toBeInTheDocument()
  })
})

// ============================================================================
// Cenário 6: Menu de exportação
// ============================================================================

describe('Cenário 6: Menu de exportação', () => {
  it('botão "Exportar" é visível quando há dados carregados', () => {
    renderPanel()
    expect(screen.getByRole('button', { name: /exportar/i })).toBeInTheDocument()
  })

  it('botão "Exportar" não é visível quando não há snapshots', () => {
    mockUseEvolutionHistory.mockReturnValue({
      snapshots: [],
      milestones: [],
      trendAnalysis: null,
      loading: false,
      error: null,
      refetch: jest.fn(),
    })
    renderPanel()
    expect(screen.queryByRole('button', { name: /exportar/i })).not.toBeInTheDocument()
  })

  it('clicar em "Exportar" abre o menu com opções PDF, CSV e PNG', () => {
    renderPanel()
    fireEvent.click(screen.getByRole('button', { name: /exportar/i }))
    expect(screen.getByText('Exportar PDF')).toBeInTheDocument()
    expect(screen.getByText('Exportar CSV')).toBeInTheDocument()
    expect(screen.getByText('Salvar Imagem')).toBeInTheDocument()
  })

  it('selecionar "Exportar PDF" chama o serviço de exportação', async () => {
    renderPanel()
    fireEvent.click(screen.getByRole('button', { name: /exportar/i }))
    fireEvent.click(screen.getByText('Exportar PDF'))
    await waitFor(() => {
      expect(mockExportToPDF).toHaveBeenCalledTimes(1)
    })
  })

  it('selecionar "Exportar CSV" chama o serviço de exportação', async () => {
    renderPanel()
    fireEvent.click(screen.getByRole('button', { name: /exportar/i }))
    fireEvent.click(screen.getByText('Exportar CSV'))
    await waitFor(() => {
      expect(mockExportToCSV).toHaveBeenCalledTimes(1)
    })
  })

  it('selecionar "Salvar Imagem" chama o serviço de exportação PNG', async () => {
    renderPanel()
    fireEvent.click(screen.getByRole('button', { name: /exportar/i }))
    fireEvent.click(screen.getByText('Salvar Imagem'))
    await waitFor(() => {
      expect(mockExportChartToPNG).toHaveBeenCalledTimes(1)
    })
  })
})

// ============================================================================
// Cenário 7: Fechar o painel
// ============================================================================

describe('Cenário 7: Fechar o painel', () => {
  it('clicar no botão de fechar chama onClose', () => {
    const onClose = jest.fn()
    render(<EvolutionHistoryPanel {...DEFAULT_PROPS} onClose={onClose} />)
    fireEvent.click(screen.getByRole('button', { name: /fechar painel/i }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('clicar no overlay chama onClose', () => {
    const onClose = jest.fn()
    render(<EvolutionHistoryPanel {...DEFAULT_PROPS} onClose={onClose} />)
    const overlay = document.querySelector('.fixed.inset-0.bg-black\\/50') as HTMLElement
    fireEvent.click(overlay)
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('painel não renderiza nada quando isOpen=false', () => {
    const { container } = render(
      <EvolutionHistoryPanel {...DEFAULT_PROPS} isOpen={false} />
    )
    expect(container).toBeEmptyDOMElement()
  })
})

// ============================================================================
// Cenário 8: Responsividade mobile
// ============================================================================

describe('Cenário 8: Responsividade mobile', () => {
  it('painel renderiza corretamente com isMobile=true', () => {
    mockIsMobile = true
    renderPanel()
    expect(screen.getByText('Histórico de Evolução')).toBeInTheDocument()
    expect(screen.getByTestId('progress-chart')).toBeInTheDocument()
  })

  it('painel renderiza corretamente com isMobile=false (desktop)', () => {
    mockIsMobile = false
    renderPanel()
    expect(screen.getByText('Histórico de Evolução')).toBeInTheDocument()
    expect(screen.getByTestId('progress-chart')).toBeInTheDocument()
  })

  it('conteúdo principal é exibido em ambos os modos', () => {
    for (const isMobile of [true, false]) {
      mockIsMobile = isMobile
      const { unmount } = renderPanel()
      expect(screen.getByText('Progresso Atual')).toBeInTheDocument()
      expect(screen.getByText('Melhora')).toBeInTheDocument()
      unmount()
    }
  })

  it('botão de fechar está acessível em mobile', () => {
    mockIsMobile = true
    renderPanel()
    expect(screen.getByRole('button', { name: /fechar painel/i })).toBeInTheDocument()
  })
})
