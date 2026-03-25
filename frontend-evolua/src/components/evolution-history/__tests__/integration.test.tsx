/**
 * @jest-environment jsdom
 *
 * Testes de integração: GoalCard e PatientGoalHeader com EvolutionHistoryPanel
 * Validates: Requirements 9.1, 9.3, 9.4
 */

import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'

// ============================================================================
// Mocks
// ============================================================================

// Mock do EvolutionHistoryPanel para focar nos pontos de integração
jest.mock('@/components/evolution-history', () => ({
  EvolutionHistoryPanel: ({
    goalId,
    patientId,
    isOpen,
    onClose,
  }: {
    goalId?: string
    patientId: string
    isOpen: boolean
    onClose: () => void
  }) => {
    if (!isOpen) return null
    return (
      <div data-testid="evolution-history-panel">
        <span data-testid="panel-patient-id">{patientId}</span>
        {goalId && <span data-testid="panel-goal-id">{goalId}</span>}
        <button onClick={onClose} aria-label="Fechar painel">
          Fechar
        </button>
      </div>
    )
  },
}))

// Mock do hook para evitar chamadas reais
jest.mock('@/hooks/use-evolution-history', () => ({
  useEvolutionHistory: jest.fn().mockReturnValue({
    snapshots: [],
    milestones: [],
    trendAnalysis: null,
    loading: false,
    error: null,
    refetch: jest.fn(),
  }),
}))

// Import dos componentes após os mocks
import { GoalCard } from '@/components/patient-goals/goal-card'
import { PatientGoalHeader } from '@/components/patient-goals/patient-goal-header'

// ============================================================================
// Fixtures
// ============================================================================

const GOAL_CARD_PROPS = {
  id: 'goal-123',
  title: 'Comunicação Verbal',
  description: 'Desenvolver habilidades de comunicação verbal',
  progress: 65,
  status: 'in-progress' as const,
  iconName: 'record_voice_over',
  colorScheme: 'purple' as const,
  patientId: 'patient-456',
}

const PATIENT_GOAL_HEADER_PROPS = {
  patientId: 'patient-456',
  patientName: 'João Silva',
  status: 'active' as const,
  age: 8,
  birthDate: '15/03/2016',
  specialty: 'Fonoaudiologia',
  schooling: 'Ensino Fundamental',
  startDate: '01/01/2024',
  overallProgress: 55,
}

// ============================================================================
// Testes: GoalCard (Req 9.1)
// ============================================================================

describe('Integração: GoalCard com EvolutionHistoryPanel (Req 9.1)', () => {
  it('renderiza o botão "Ver Histórico" no GoalCard (Req 9.1)', () => {
    render(<GoalCard {...GOAL_CARD_PROPS} />)
    expect(screen.getByTitle('Ver Histórico')).toBeInTheDocument()
  })

  it('o painel não está visível antes de clicar em "Ver Histórico"', () => {
    render(<GoalCard {...GOAL_CARD_PROPS} />)
    expect(screen.queryByTestId('evolution-history-panel')).not.toBeInTheDocument()
  })

  it('abre o EvolutionHistoryPanel ao clicar em "Ver Histórico" (Req 9.1)', () => {
    render(<GoalCard {...GOAL_CARD_PROPS} />)

    fireEvent.click(screen.getByTitle('Ver Histórico'))

    expect(screen.getByTestId('evolution-history-panel')).toBeInTheDocument()
  })

  it('passa o goalId correto ao painel ao abrir do GoalCard', () => {
    render(<GoalCard {...GOAL_CARD_PROPS} />)

    fireEvent.click(screen.getByTitle('Ver Histórico'))

    expect(screen.getByTestId('panel-goal-id')).toHaveTextContent('goal-123')
  })

  it('passa o patientId correto ao painel (contexto do paciente) (Req 9.4)', () => {
    render(<GoalCard {...GOAL_CARD_PROPS} />)

    fireEvent.click(screen.getByTitle('Ver Histórico'))

    expect(screen.getByTestId('panel-patient-id')).toHaveTextContent('patient-456')
  })

  it('fecha o painel ao clicar em "Fechar" e mantém o contexto do paciente (Req 9.4)', () => {
    render(<GoalCard {...GOAL_CARD_PROPS} />)

    // Abre o painel
    fireEvent.click(screen.getByTitle('Ver Histórico'))
    expect(screen.getByTestId('evolution-history-panel')).toBeInTheDocument()

    // Fecha o painel
    fireEvent.click(screen.getByRole('button', { name: /fechar painel/i }))
    expect(screen.queryByTestId('evolution-history-panel')).not.toBeInTheDocument()
  })

  it('pode reabrir o painel após fechar sem perder o contexto do paciente (Req 9.4)', () => {
    render(<GoalCard {...GOAL_CARD_PROPS} />)

    // Abre
    fireEvent.click(screen.getByTitle('Ver Histórico'))
    expect(screen.getByTestId('panel-patient-id')).toHaveTextContent('patient-456')

    // Fecha
    fireEvent.click(screen.getByRole('button', { name: /fechar painel/i }))

    // Reabre
    fireEvent.click(screen.getByTitle('Ver Histórico'))
    expect(screen.getByTestId('panel-patient-id')).toHaveTextContent('patient-456')
    expect(screen.getByTestId('panel-goal-id')).toHaveTextContent('goal-123')
  })
})

// ============================================================================
// Testes: PatientGoalHeader (Req 9.3)
// ============================================================================

describe('Integração: PatientGoalHeader com EvolutionHistoryPanel (Req 9.3)', () => {
  it('renderiza o botão "Histórico de Evolução" no PatientGoalHeader (Req 9.3)', () => {
    render(<PatientGoalHeader {...PATIENT_GOAL_HEADER_PROPS} />)
    expect(screen.getByRole('button', { name: /histórico de evolução/i })).toBeInTheDocument()
  })

  it('o botão "Histórico de Evolução" está ao lado do botão "Imprimir Plano" (Req 9.3)', () => {
    render(<PatientGoalHeader {...PATIENT_GOAL_HEADER_PROPS} />)

    const printButton = screen.getByRole('button', { name: /imprimir plano/i })
    const historyButton = screen.getByRole('button', { name: /histórico de evolução/i })

    expect(printButton).toBeInTheDocument()
    expect(historyButton).toBeInTheDocument()
  })

  it('o painel não está visível antes de clicar em "Histórico de Evolução"', () => {
    render(<PatientGoalHeader {...PATIENT_GOAL_HEADER_PROPS} />)
    expect(screen.queryByTestId('evolution-history-panel')).not.toBeInTheDocument()
  })

  it('abre o EvolutionHistoryPanel ao clicar em "Histórico de Evolução" (Req 9.3)', () => {
    render(<PatientGoalHeader {...PATIENT_GOAL_HEADER_PROPS} />)

    fireEvent.click(screen.getByRole('button', { name: /histórico de evolução/i }))

    expect(screen.getByTestId('evolution-history-panel')).toBeInTheDocument()
  })

  it('abre o painel sem goalId (histórico geral do paciente) (Req 9.3)', () => {
    render(<PatientGoalHeader {...PATIENT_GOAL_HEADER_PROPS} />)

    fireEvent.click(screen.getByRole('button', { name: /histórico de evolução/i }))

    expect(screen.queryByTestId('panel-goal-id')).not.toBeInTheDocument()
  })

  it('passa o patientId correto ao painel (contexto do paciente) (Req 9.4)', () => {
    render(<PatientGoalHeader {...PATIENT_GOAL_HEADER_PROPS} />)

    fireEvent.click(screen.getByRole('button', { name: /histórico de evolução/i }))

    expect(screen.getByTestId('panel-patient-id')).toHaveTextContent('patient-456')
  })

  it('fecha o painel ao clicar em "Fechar" (Req 9.4)', () => {
    render(<PatientGoalHeader {...PATIENT_GOAL_HEADER_PROPS} />)

    fireEvent.click(screen.getByRole('button', { name: /histórico de evolução/i }))
    expect(screen.getByTestId('evolution-history-panel')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /fechar painel/i }))
    expect(screen.queryByTestId('evolution-history-panel')).not.toBeInTheDocument()
  })

  it('pode reabrir o painel após fechar mantendo o contexto do paciente (Req 9.4)', () => {
    render(<PatientGoalHeader {...PATIENT_GOAL_HEADER_PROPS} />)

    // Abre
    fireEvent.click(screen.getByRole('button', { name: /histórico de evolução/i }))
    expect(screen.getByTestId('panel-patient-id')).toHaveTextContent('patient-456')

    // Fecha
    fireEvent.click(screen.getByRole('button', { name: /fechar painel/i }))

    // Reabre
    fireEvent.click(screen.getByRole('button', { name: /histórico de evolução/i }))
    expect(screen.getByTestId('panel-patient-id')).toHaveTextContent('patient-456')
    expect(screen.queryByTestId('panel-goal-id')).not.toBeInTheDocument()
  })
})
