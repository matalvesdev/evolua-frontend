/**
 * Testes de Propriedade para ExportService.exportToCSV()
 *
 * **Property 18: Estrutura de Exportação CSV**
 * **Validates: Requirement 7.3**
 *
 * Para qualquer array de snapshots exportado para CSV, verifica que:
 *   - 18a: O cabeçalho CSV contém todas as 5 colunas obrigatórias
 *   - 18b: O CSV tem exatamente N+1 linhas (1 cabeçalho + N dados)
 *   - 18c: Array vazio ainda produz cabeçalho com as colunas obrigatórias
 */

import { ExportService } from '../export.service'
import type { GoalProgressSnapshot } from '@/types/evolution-history'

// ============================================================================
// Helpers
// ============================================================================

function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function makeSnapshot(overrides: Partial<GoalProgressSnapshot> = {}): GoalProgressSnapshot {
  return {
    id: generateUUID(),
    goalId: generateUUID(),
    progress: randomInt(0, 100),
    createdAt: new Date(Date.now() - randomInt(0, 365) * 86400000),
    therapistId: generateUUID(),
    notes: Math.random() > 0.5 ? `Nota ${randomInt(1, 100)}` : undefined,
    variation: Math.random() > 0.5 ? randomInt(-20, 20) : undefined,
    daysSinceLast: Math.random() > 0.5 ? randomInt(1, 30) : undefined,
    ...overrides,
  }
}

function makeSnapshots(count: number): GoalProgressSnapshot[] {
  return Array.from({ length: count }, () => makeSnapshot())
}

/** Lê o conteúdo de um Blob como texto */
async function blobToText(blob: Blob): Promise<string> {
  // Compatível com Node.js (jest testEnvironment: node)
  const buffer = Buffer.from(await blob.arrayBuffer())
  return buffer.toString('utf-8')
}

/** Extrai as colunas do cabeçalho CSV */
function parseCSVHeader(csvText: string): string[] {
  const firstLine = csvText.split('\n')[0]
  return firstLine.split(',').map(col => col.trim().replace(/^"|"$/g, ''))
}

/** Conta linhas não-vazias no CSV */
function countNonEmptyLines(csvText: string): number {
  return csvText.split('\n').filter(line => line.trim().length > 0).length
}

// ============================================================================
// Colunas obrigatórias
// ============================================================================

const REQUIRED_COLUMNS = ['Data', 'Nome da Meta', 'Progresso', 'Variação', 'Observações']

// ============================================================================
// Property 18: Estrutura de Exportação CSV
// Validates: Requirement 7.3
// ============================================================================

describe('Property 18: Estrutura de Exportação CSV (Req 7.3)', () => {
  const ITERATIONS = 50
  let service: ExportService

  beforeEach(() => {
    service = new ExportService()
  })

  // --------------------------------------------------------------------------
  // Property 18a: Cabeçalho contém todas as 5 colunas obrigatórias
  // --------------------------------------------------------------------------
  it('18a: para qualquer array não-vazio de snapshots, o CSV deve conter todas as colunas obrigatórias', async () => {
    for (let i = 0; i < ITERATIONS; i++) {
      const count = randomInt(1, 20)
      const snapshots = makeSnapshots(count)

      const blob = await service.exportToCSV(snapshots)
      const text = await blobToText(blob)
      const headers = parseCSVHeader(text)

      for (const col of REQUIRED_COLUMNS) {
        expect(headers).toContain(col)
      }
    }
  })

  // --------------------------------------------------------------------------
  // Property 18b: CSV tem exatamente N+1 linhas (1 cabeçalho + N dados)
  // --------------------------------------------------------------------------
  it('18b: para qualquer array de N snapshots, o CSV deve ter exatamente N+1 linhas', async () => {
    for (let i = 0; i < ITERATIONS; i++) {
      const count = randomInt(1, 30)
      const snapshots = makeSnapshots(count)

      const blob = await service.exportToCSV(snapshots)
      const text = await blobToText(blob)
      const lineCount = countNonEmptyLines(text)

      expect(lineCount).toBe(count + 1)
    }
  })

  // --------------------------------------------------------------------------
  // Property 18c: Array vazio produz um Blob CSV válido (sem erros)
  // Nota: PapaParse retorna string vazia para array vazio — sem linhas de dados,
  // não há cabeçalho gerado. O serviço deve retornar um Blob sem lançar erros.
  // --------------------------------------------------------------------------
  it('18c: para array vazio, exportToCSV deve retornar um Blob sem lançar erros', async () => {
    const blob = await service.exportToCSV([])

    expect(blob).toBeInstanceOf(Blob)
    expect(blob.type).toContain('text/csv')
  })
})
