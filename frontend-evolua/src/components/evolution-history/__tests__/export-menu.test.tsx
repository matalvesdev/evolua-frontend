/**
 * @jest-environment jsdom
 *
 * Testes unitários para ExportMenu
 * Validates: Requirements 7.1
 */

import React from 'react'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import '@testing-library/jest-dom'
import type { GoalProgressSnapshot, Milestone } from '@/types/evolution-history'

// ============================================================================
// Mocks
// ============================================================================

const mockExportToPDF = jest.fn()
const mockExportToCSV = jest.fn()
const mockExportChartToPNG = jest.fn()

jest.mock('@/services/goal-history', () => ({
  ExportService: {
    exportToPDF: (...args: unknown[]) => mockExportToPDF(...args),
    exportToCSV: (...args: unknown[]) => mockExportToCSV(...args),
    exportChartToPNG: (...args: unknown[]) => mockExportChartToPNG(...args),
  },
}))

// Import after mocks
import { ExportMenu } from '../export-menu'

// ============================================================================
// Fixtures
// ============================================================================

const makeSnapshot = (overrides: Partial<GoalProgressSnapshot> = {}): GoalProgressSnapshot => ({
  id: 'snap-1',
  goalId: 'goal-1',
  progress: 50,
  createdAt: new Date('2024-01-15T10:00:00.000Z'),
  therapistId: 'therapist-1',
  ...overrides,
})

const makeMilestone = (overrides: Partial<Milestone> = {}): Milestone => ({
  id: 'milestone-1',
  goalId: 'goal-1',
  type: 'started',
  date: new Date('2024-01-01T10:00:00.000Z'),
  progress: 0,
  description: 'Meta iniciada',
  createdAt: new Date('2024-01-01T10:00:00.000Z'),
  ...overrides,
})

const SNAPSHOTS: GoalProgressSnapshot[] = [
  makeSnapshot({ id: 'snap-1', progress: 30 }),
  makeSnapshot({ id: 'snap-2', progress: 60 }),
]

const MILESTONES: Milestone[] = [makeMilestone()]

function makeChartRef(element?: HTMLDivElement | null) {
  return { current: element ?? document.createElement('div') } as React.RefObject<HTMLDivElement>
}

const DEFAULT_PROPS = {
  patientId: 'patient-1',
  patientName: 'João Silva',
  snapshots: SNAPSHOTS,
  milestones: MILESTONES,
  chartRef: makeChartRef(),
}

// ============================================================================
// Tests
// ============================================================================

describe('ExportMenu', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockExportToPDF.mockResolvedValue(new Blob())
    mockExportToCSV.mockResolvedValue(new Blob())
    mockExportChartToPNG.mockResolvedValue(new Blob())
  })

  // --------------------------------------------------------------------------
  // 1. Renderização do botão de exportação
  // --------------------------------------------------------------------------

  describe('renderização do botão de exportação', () => {
    it('renderiza o botão "Exportar"', () => {
      render(<ExportMenu {...DEFAULT_PROPS} />)

      expect(screen.getByRole('button', { name: /exportar/i })).toBeInTheDocument()
    })

    it('não exibe as opções de formato por padrão', () => {
      render(<ExportMenu {...DEFAULT_PROPS} />)

      expect(screen.queryByText('Exportar PDF')).not.toBeInTheDocument()
      expect(screen.queryByText('Exportar CSV')).not.toBeInTheDocument()
      expect(screen.queryByText('Salvar Imagem')).not.toBeInTheDocument()
    })
  })

  // --------------------------------------------------------------------------
  // 2. Exibição das opções de formato (Req 7.1)
  // --------------------------------------------------------------------------

  describe('exibição das opções de formato (Req 7.1)', () => {
    it('exibe as opções PDF, CSV e PNG ao clicar no botão Exportar', () => {
      render(<ExportMenu {...DEFAULT_PROPS} />)

      fireEvent.click(screen.getByRole('button', { name: /exportar/i }))

      expect(screen.getByText('Exportar PDF')).toBeInTheDocument()
      expect(screen.getByText('Exportar CSV')).toBeInTheDocument()
      expect(screen.getByText('Salvar Imagem')).toBeInTheDocument()
    })

    it('fecha o menu ao clicar no backdrop', () => {
      render(<ExportMenu {...DEFAULT_PROPS} />)

      fireEvent.click(screen.getByRole('button', { name: /exportar/i }))
      expect(screen.getByText('Exportar PDF')).toBeInTheDocument()

      // Clicar no backdrop (div fixed inset-0)
      const backdrop = document.querySelector('.fixed.inset-0.z-40') as HTMLElement
      fireEvent.click(backdrop)

      expect(screen.queryByText('Exportar PDF')).not.toBeInTheDocument()
    })
  })

  // --------------------------------------------------------------------------
  // 3. Handler de exportação PDF
  // --------------------------------------------------------------------------

  describe('exportação PDF', () => {
    it('chama ExportService.exportToPDF ao selecionar PDF', async () => {
      render(<ExportMenu {...DEFAULT_PROPS} />)

      fireEvent.click(screen.getByRole('button', { name: /exportar/i }))
      fireEvent.click(screen.getByText('Exportar PDF'))

      await waitFor(() => {
        expect(mockExportToPDF).toHaveBeenCalledTimes(1)
      })
    })

    it('chama exportToPDF com as opções corretas', async () => {
      render(<ExportMenu {...DEFAULT_PROPS} />)

      fireEvent.click(screen.getByRole('button', { name: /exportar/i }))
      fireEvent.click(screen.getByText('Exportar PDF'))

      await waitFor(() => {
        expect(mockExportToPDF).toHaveBeenCalledWith(
          expect.objectContaining({
            format: 'pdf',
            includeCharts: true,
            includeTimeline: true,
            includeTrendAnalysis: true,
          })
        )
      })
    })
  })

  // --------------------------------------------------------------------------
  // 4. Handler de exportação CSV
  // --------------------------------------------------------------------------

  describe('exportação CSV', () => {
    it('chama ExportService.exportToCSV ao selecionar CSV', async () => {
      render(<ExportMenu {...DEFAULT_PROPS} />)

      fireEvent.click(screen.getByRole('button', { name: /exportar/i }))
      fireEvent.click(screen.getByText('Exportar CSV'))

      await waitFor(() => {
        expect(mockExportToCSV).toHaveBeenCalledTimes(1)
      })
    })

    it('chama exportToCSV com os snapshots corretos', async () => {
      render(<ExportMenu {...DEFAULT_PROPS} />)

      fireEvent.click(screen.getByRole('button', { name: /exportar/i }))
      fireEvent.click(screen.getByText('Exportar CSV'))

      await waitFor(() => {
        expect(mockExportToCSV).toHaveBeenCalledWith(SNAPSHOTS)
      })
    })
  })

  // --------------------------------------------------------------------------
  // 5. Handler de exportação PNG
  // --------------------------------------------------------------------------

  describe('exportação PNG', () => {
    it('chama ExportService.exportChartToPNG ao selecionar PNG', async () => {
      render(<ExportMenu {...DEFAULT_PROPS} />)

      fireEvent.click(screen.getByRole('button', { name: /exportar/i }))
      fireEvent.click(screen.getByText('Salvar Imagem'))

      await waitFor(() => {
        expect(mockExportChartToPNG).toHaveBeenCalledTimes(1)
      })
    })

    it('chama exportChartToPNG com o elemento do chartRef', async () => {
      const chartElement = document.createElement('div')
      const chartRef = makeChartRef(chartElement)

      render(<ExportMenu {...DEFAULT_PROPS} chartRef={chartRef} />)

      fireEvent.click(screen.getByRole('button', { name: /exportar/i }))
      fireEvent.click(screen.getByText('Salvar Imagem'))

      await waitFor(() => {
        expect(mockExportChartToPNG).toHaveBeenCalledWith(chartElement)
      })
    })

    it('não chama exportChartToPNG quando chartRef.current é null', async () => {
      const chartRef = { current: null } as React.RefObject<HTMLDivElement>

      render(<ExportMenu {...DEFAULT_PROPS} chartRef={chartRef} />)

      fireEvent.click(screen.getByRole('button', { name: /exportar/i }))
      fireEvent.click(screen.getByText('Salvar Imagem'))

      await waitFor(() => {
        expect(mockExportChartToPNG).not.toHaveBeenCalled()
      })
    })
  })

  // --------------------------------------------------------------------------
  // 6. Loading state durante exportação
  // --------------------------------------------------------------------------

  describe('loading state', () => {
    it('desabilita o botão Exportar durante a exportação', async () => {
      let resolveExport!: () => void
      mockExportToPDF.mockReturnValue(
        new Promise<Blob>((resolve) => {
          resolveExport = () => resolve(new Blob())
        })
      )

      render(<ExportMenu {...DEFAULT_PROPS} />)

      fireEvent.click(screen.getByRole('button', { name: /exportar/i }))
      fireEvent.click(screen.getByText('Exportar PDF'))

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /exportar/i })).toBeDisabled()
      })

      await act(async () => {
        resolveExport()
      })
    })

    it('exibe ícone de loading (animate-spin) durante a exportação', async () => {
      let resolveExport!: () => void
      mockExportToPDF.mockReturnValue(
        new Promise<Blob>((resolve) => {
          resolveExport = () => resolve(new Blob())
        })
      )

      render(<ExportMenu {...DEFAULT_PROPS} />)

      fireEvent.click(screen.getByRole('button', { name: /exportar/i }))
      fireEvent.click(screen.getByText('Exportar PDF'))

      await waitFor(() => {
        expect(document.querySelector('.animate-spin')).toBeInTheDocument()
      })

      await act(async () => {
        resolveExport()
      })
    })
  })

  // --------------------------------------------------------------------------
  // 7. Remoção do loading state após exportação
  // --------------------------------------------------------------------------

  describe('remoção do loading state após exportação', () => {
    it('reabilita o botão Exportar após a exportação concluir', async () => {
      render(<ExportMenu {...DEFAULT_PROPS} />)

      fireEvent.click(screen.getByRole('button', { name: /exportar/i }))
      fireEvent.click(screen.getByText('Exportar PDF'))

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /exportar/i })).not.toBeDisabled()
      })
    })

    it('remove o ícone de loading após a exportação concluir', async () => {
      render(<ExportMenu {...DEFAULT_PROPS} />)

      fireEvent.click(screen.getByRole('button', { name: /exportar/i }))
      fireEvent.click(screen.getByText('Exportar PDF'))

      await waitFor(() => {
        expect(document.querySelector('.animate-spin')).not.toBeInTheDocument()
      })
    })

    it('reabilita o botão mesmo quando a exportação falha', async () => {
      mockExportToPDF.mockRejectedValue(new Error('Erro de exportação'))

      render(<ExportMenu {...DEFAULT_PROPS} />)

      fireEvent.click(screen.getByRole('button', { name: /exportar/i }))
      fireEvent.click(screen.getByText('Exportar PDF'))

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /exportar/i })).not.toBeDisabled()
      })
    })
  })
})
