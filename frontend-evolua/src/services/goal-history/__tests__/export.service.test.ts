/**
 * Tests for ExportService
 */
import { ExportService } from '../export.service';
import type { GoalProgressSnapshot, Milestone, ExportOptions } from '@/types/evolution-history';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import Papa from 'papaparse';

// ============================================================================
// Mocks
// ============================================================================

// Mock jsPDF
jest.mock('jspdf', () => {
  return jest.fn().mockImplementation(() => ({
    addImage: jest.fn(),
    addPage: jest.fn(),
    text: jest.fn(),
    setFontSize: jest.fn(),
    output: jest.fn().mockReturnValue(new Blob(['pdf'], { type: 'application/pdf' })),
  }));
});

// Mock html2canvas
jest.mock('html2canvas', () =>
  jest.fn().mockResolvedValue({
    toDataURL: jest.fn().mockReturnValue('data:image/png;base64,abc123'),
    toBlob: jest.fn(),
  })
);

// Mock papaparse
jest.mock('papaparse', () => ({
  unparse: jest.fn().mockReturnValue('Data,Nome da Meta,Progresso,Variação,Observações\n'),
}));

// ============================================================================
// Helpers
// ============================================================================

function makeSnapshot(
  id: string,
  goalId: string,
  progress: number,
  date: Date,
  notes?: string,
  variation?: number
): GoalProgressSnapshot {
  return { id, goalId, progress, createdAt: date, therapistId: 'therapist-1', notes, variation };
}

function makeMilestone(id: string, goalId: string, progress: number, date: Date): Milestone {
  return {
    id,
    goalId,
    type: 'started',
    date,
    progress,
    description: 'Meta iniciada',
    createdAt: date,
  };
}

// ============================================================================
// Tests
// ============================================================================

describe('ExportService', () => {
  let service: ExportService;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let jsPDFInstance: any;

  beforeEach(() => {
    jest.clearAllMocks();

    // Re-setup jsPDF mock instance
    jsPDFInstance = {
      addImage: jest.fn(),
      addPage: jest.fn(),
      text: jest.fn(),
      setFontSize: jest.fn(),
      output: jest.fn().mockReturnValue(new Blob(['pdf content'], { type: 'application/pdf' })),
    };
    jest.mocked(jsPDF).mockImplementation(() => jsPDFInstance);

    // html2canvas mock
    jest.mocked(html2canvas).mockResolvedValue({
      toDataURL: jest.fn().mockReturnValue('data:image/png;base64,abc123'),
      toBlob: jest.fn(),
    });

    // Papa mock
    jest.mocked(Papa).unparse.mockReturnValue('Data,Nome da Meta,Progresso,Variação,Observações\n');

    service = new ExportService();
  });

  // ==========================================================================
  // exportToPDF
  // ==========================================================================
  describe('exportToPDF', () => {
    const baseOptions: ExportOptions = {
      format: 'pdf',
      includeCharts: false,
      includeTimeline: false,
      includeTrendAnalysis: false,
    };

    it('retorna um Blob quando chamado com opções mínimas (Req 7.2)', async () => {
      const result = await service.exportToPDF({
        ...baseOptions,
        patientName: 'João Silva',
        snapshots: [],
        milestones: [],
      });

      expect(result).toBeInstanceOf(Blob);
    });

    it('inclui nome do paciente no documento (Req 7.2)', async () => {
      await service.exportToPDF({
        ...baseOptions,
        patientName: 'Maria Souza',
        snapshots: [],
        milestones: [],
      });

      const textCalls = jsPDFInstance.text.mock.calls.map((c: unknown[]) => c[0]);
      expect(
        textCalls.some((t: unknown) => typeof t === 'string' && t.includes('Maria Souza'))
      ).toBe(true);
    });

    it('inclui nome da meta quando goalName é fornecido (Req 7.2)', async () => {
      await service.exportToPDF({
        ...baseOptions,
        patientName: 'João',
        goalName: 'Comunicação verbal',
        snapshots: [],
        milestones: [],
      });

      const textCalls = jsPDFInstance.text.mock.calls.map((c: unknown[]) => c[0]);
      expect(
        textCalls.some((t: unknown) => typeof t === 'string' && t.includes('Comunicação verbal'))
      ).toBe(true);
    });

    it('inclui período no documento quando dateRange é fornecido (Req 7.2)', async () => {
      const start = new Date(2024, 0, 1); // 1 Jan 2024 local time
      const end = new Date(2024, 5, 30); // 30 Jun 2024 local time

      await service.exportToPDF({
        ...baseOptions,
        patientName: 'João',
        snapshots: [],
        milestones: [],
        dateRange: { start, end },
      });

      const textCalls = jsPDFInstance.text.mock.calls.map((c: unknown[]) => c[0]);
      // The period string should appear somewhere in the text calls
      const allText = textCalls.filter((t: unknown) => typeof t === 'string').join(' ');
      expect(allText).toContain('2024');
    });

    it('captura gráfico quando includeCharts=true e chartElement é fornecido (Req 7.2)', async () => {
      const chartElement = {} as HTMLElement;

      await service.exportToPDF({
        ...baseOptions,
        includeCharts: true,
        patientName: 'João',
        snapshots: [],
        milestones: [],
        chartElement,
      });

      expect(html2canvas).toHaveBeenCalledWith(chartElement);
      expect(jsPDFInstance.addImage).toHaveBeenCalled();
    });

    it('não captura gráfico quando includeCharts=false (Req 7.2)', async () => {
      const chartElement = {} as HTMLElement;

      await service.exportToPDF({
        ...baseOptions,
        includeCharts: false,
        patientName: 'João',
        snapshots: [],
        milestones: [],
        chartElement,
      });

      expect(html2canvas).not.toHaveBeenCalled();
      expect(jsPDFInstance.addImage).not.toHaveBeenCalled();
    });

    it('inclui timeline de marcos quando includeTimeline=true (Req 7.2)', async () => {
      const date = new Date('2024-03-15');
      const milestones = [makeMilestone('m1', 'goal-1', 0, date)];

      await service.exportToPDF({
        ...baseOptions,
        includeTimeline: true,
        patientName: 'João',
        snapshots: [],
        milestones,
      });

      const textCalls = jsPDFInstance.text.mock.calls.map((c: unknown[]) => c[0]);
      expect(
        textCalls.some((t: unknown) => typeof t === 'string' && t.includes('Marcos Importantes'))
      ).toBe(true);
    });

    it('não inclui timeline quando includeTimeline=false (Req 7.2)', async () => {
      const date = new Date('2024-03-15');
      const milestones = [makeMilestone('m1', 'goal-1', 0, date)];

      await service.exportToPDF({
        ...baseOptions,
        includeTimeline: false,
        patientName: 'João',
        snapshots: [],
        milestones,
      });

      const textCalls = jsPDFInstance.text.mock.calls.map((c: unknown[]) => c[0]);
      expect(
        textCalls.every((t: unknown) => typeof t !== 'string' || !t.includes('Marcos Importantes'))
      ).toBe(true);
    });

    it('inclui tabela de snapshots quando há dados (Req 7.2)', async () => {
      const snapshots = [makeSnapshot('s1', 'goal-1', 50, new Date('2024-03-01'), undefined, 10)];

      await service.exportToPDF({
        ...baseOptions,
        patientName: 'João',
        snapshots,
        milestones: [],
      });

      const textCalls = jsPDFInstance.text.mock.calls.map((c: unknown[]) => c[0]);
      expect(
        textCalls.some(
          (t: unknown) => typeof t === 'string' && t.includes('Histórico de Progresso')
        )
      ).toBe(true);
    });

    it('lança erro quando jsPDF falha', async () => {
      jest.mocked(jsPDF).mockImplementationOnce(() => {
        throw new Error('jsPDF error');
      });
      await expect(
        service.exportToPDF({
          ...baseOptions,
          patientName: 'João',
          snapshots: [],
          milestones: [],
        })
      ).rejects.toThrow('Não foi possível gerar o PDF');
    });
  });

  // ==========================================================================
  // exportToCSV
  // ==========================================================================
  describe('exportToCSV', () => {
    it('retorna um Blob com tipo text/csv (Req 7.3)', async () => {
      const snapshots = [makeSnapshot('s1', 'goal-1', 50, new Date('2024-03-01'))];

      const result = await service.exportToCSV(snapshots);

      expect(result).toBeInstanceOf(Blob);
      expect(result.type).toContain('text/csv');
    });

    it('chama Papa.unparse com as colunas obrigatórias (Req 7.3)', async () => {
      const snapshots = [
        makeSnapshot('s1', 'goal-1', 75, new Date('2024-03-15'), 'Boa evolução', 5),
      ];

      await service.exportToCSV(snapshots);

      expect(Papa.unparse).toHaveBeenCalledTimes(1);
      const [data] = Papa.unparse.mock.calls[0];
      expect(data).toHaveLength(1);

      const row = data[0];
      expect(row).toHaveProperty('Data');
      expect(row).toHaveProperty('Nome da Meta');
      expect(row).toHaveProperty('Progresso');
      expect(row).toHaveProperty('Variação');
      expect(row).toHaveProperty('Observações');
    });

    it('mapeia progresso corretamente (Req 7.3)', async () => {
      const snapshots = [makeSnapshot('s1', 'goal-1', 80, new Date('2024-03-01'))];

      await service.exportToCSV(snapshots);

      const [data] = Papa.unparse.mock.calls[0];
      expect(data[0]['Progresso']).toBe(80);
    });

    it('mapeia variação como 0 quando não definida (Req 7.3)', async () => {
      const snapshots = [
        makeSnapshot('s1', 'goal-1', 50, new Date('2024-03-01'), undefined, undefined),
      ];

      await service.exportToCSV(snapshots);

      const [data] = Papa.unparse.mock.calls[0];
      expect(data[0]['Variação']).toBe(0);
    });

    it('mapeia observações como string vazia quando não definidas (Req 7.3)', async () => {
      const snapshots = [makeSnapshot('s1', 'goal-1', 50, new Date('2024-03-01'), undefined)];

      await service.exportToCSV(snapshots);

      const [data] = Papa.unparse.mock.calls[0];
      expect(data[0]['Observações']).toBe('');
    });

    it('mapeia observações quando definidas (Req 7.3)', async () => {
      const snapshots = [
        makeSnapshot('s1', 'goal-1', 50, new Date('2024-03-01'), 'Progresso excelente'),
      ];

      await service.exportToCSV(snapshots);

      const [data] = Papa.unparse.mock.calls[0];
      expect(data[0]['Observações']).toBe('Progresso excelente');
    });

    it('processa múltiplos snapshots (Req 7.3)', async () => {
      const snapshots = [
        makeSnapshot('s1', 'goal-1', 20, new Date('2024-01-01')),
        makeSnapshot('s2', 'goal-1', 40, new Date('2024-02-01')),
        makeSnapshot('s3', 'goal-1', 60, new Date('2024-03-01')),
      ];

      await service.exportToCSV(snapshots);

      const [data] = Papa.unparse.mock.calls[0];
      expect(data).toHaveLength(3);
    });

    it('retorna Blob vazio para array de snapshots vazio (Req 7.3)', async () => {
      const result = await service.exportToCSV([]);

      expect(result).toBeInstanceOf(Blob);
      expect(Papa.unparse).toHaveBeenCalledWith([], expect.any(Object));
    });

    it('lança erro quando Papa.unparse falha', async () => {
      Papa.unparse.mockImplementationOnce(() => {
        throw new Error('Papa error');
      });

      await expect(
        service.exportToCSV([makeSnapshot('s1', 'goal-1', 50, new Date())])
      ).rejects.toThrow('Não foi possível gerar o CSV');
    });
  });

  // ==========================================================================
  // exportChartToPNG
  // ==========================================================================
  describe('exportChartToPNG', () => {
    it('retorna um Blob quando html2canvas resolve (Req 7.4)', async () => {
      const fakeBlob = new Blob(['png'], { type: 'image/png' });
      html2canvas.mockResolvedValue({
        toDataURL: jest.fn().mockReturnValue('data:image/png;base64,abc123'),
        toBlob: jest.fn().mockImplementation((cb: (b: Blob) => void) => cb(fakeBlob)),
      });

      const chartElement = {} as HTMLElement;
      const result = await service.exportChartToPNG(chartElement);

      expect(result).toBeInstanceOf(Blob);
    });

    it('chama html2canvas com scale=2 para alta resolução (Req 7.4)', async () => {
      const fakeBlob = new Blob(['png'], { type: 'image/png' });
      html2canvas.mockResolvedValue({
        toDataURL: jest.fn(),
        toBlob: jest.fn().mockImplementation((cb: (b: Blob) => void) => cb(fakeBlob)),
      });

      const chartElement = {} as HTMLElement;
      await service.exportChartToPNG(chartElement);

      expect(html2canvas).toHaveBeenCalledWith(chartElement, expect.objectContaining({ scale: 2 }));
    });

    it('lança erro quando html2canvas falha', async () => {
      html2canvas.mockRejectedValueOnce(new Error('canvas error'));

      const chartElement = {} as HTMLElement;
      await expect(service.exportChartToPNG(chartElement)).rejects.toThrow(
        'Não foi possível capturar o gráfico'
      );
    });

    it('lança erro quando toBlob retorna null', async () => {
      html2canvas.mockResolvedValue({
        toDataURL: jest.fn(),
        toBlob: jest.fn().mockImplementation((cb: (b: Blob | null) => void) => cb(null)),
      });

      const chartElement = {} as HTMLElement;
      await expect(service.exportChartToPNG(chartElement)).rejects.toThrow();
    });
  });

  // ==========================================================================
  // generateFilename
  // ==========================================================================
  describe('generateFilename', () => {
    it('inclui nome do paciente no filename (Req 7.5)', () => {
      const filename = service.generateFilename('João Silva', 'pdf');
      expect(filename).toContain('jo_o_silva');
    });

    it('inclui extensão correta para PDF (Req 7.5)', () => {
      const filename = service.generateFilename('Paciente', 'pdf');
      expect(filename).toMatch(/\.pdf$/);
    });

    it('inclui extensão correta para CSV (Req 7.5)', () => {
      const filename = service.generateFilename('Paciente', 'csv');
      expect(filename).toMatch(/\.csv$/);
    });

    it('inclui extensão correta para PNG (Req 7.5)', () => {
      const filename = service.generateFilename('Paciente', 'png');
      expect(filename).toMatch(/\.png$/);
    });

    it('inclui período no filename quando dateRange é fornecido (Req 7.5)', () => {
      const start = new Date(2024, 0, 15); // 15 Jan 2024 local time
      const end = new Date(2024, 5, 30); // 30 Jun 2024 local time

      const filename = service.generateFilename('Paciente', 'pdf', { start, end });

      expect(filename).toContain('20240115');
      expect(filename).toContain('20240630');
    });

    it('não inclui período quando dateRange não é fornecido (Req 7.5)', () => {
      const filename = service.generateFilename('Paciente', 'pdf');
      // Sem dateRange, não deve ter padrão de data YYYYMMDD-YYYYMMDD
      expect(filename).not.toMatch(/\d{8}-\d{8}/);
    });

    it('sanitiza caracteres especiais do nome do paciente (Req 7.5)', () => {
      const filename = service.generateFilename('Ana Lívia Ção', 'csv');
      // Deve conter apenas letras, números e underscores
      const namePart = filename
        .replace(/^historico_/, '')
        .replace(/(_\d+)?\.csv$/, '')
        .replace(/_\d{8}-\d{8}/, '');
      expect(namePart).toMatch(/^[a-z0-9_]+$/);
    });

    it('começa com prefixo "historico_" (Req 7.5)', () => {
      const filename = service.generateFilename('Paciente', 'pdf');
      expect(filename).toMatch(/^historico_/);
    });

    it('inclui timestamp para formatos não-PNG (Req 7.5)', () => {
      const before = Date.now();
      const filename = service.generateFilename('Paciente', 'pdf');
      const after = Date.now();

      // Extrai o timestamp do filename
      const match = filename.match(/_(\d+)\.pdf$/);
      expect(match).not.toBeNull();
      const ts = parseInt(match![1], 10);
      expect(ts).toBeGreaterThanOrEqual(before);
      expect(ts).toBeLessThanOrEqual(after);
    });
  });

  // ==========================================================================
  // downloadBlob
  // ==========================================================================
  describe('downloadBlob', () => {
    it('cria um link, define href/download e dispara o click', () => {
      const mockLink = {
        href: '',
        download: '',
        click: jest.fn(),
      };
      const mockCreateObjectURL = jest.fn().mockReturnValue('blob:http://localhost/fake');
      const mockRevokeObjectURL = jest.fn();
      const mockAppendChild = jest.fn();
      const mockRemoveChild = jest.fn();

      // Mock global document and URL
      const originalDocument = global.document;
      const originalURL = global.URL;

      Object.defineProperty(global, 'document', {
        value: {
          createElement: jest.fn().mockReturnValue(mockLink),
          body: { appendChild: mockAppendChild, removeChild: mockRemoveChild },
        },
        writable: true,
        configurable: true,
      });
      Object.defineProperty(global, 'URL', {
        value: { createObjectURL: mockCreateObjectURL, revokeObjectURL: mockRevokeObjectURL },
        writable: true,
        configurable: true,
      });

      const blob = new Blob(['test'], { type: 'text/plain' });
      service.downloadBlob(blob, 'test.txt');

      expect(mockCreateObjectURL).toHaveBeenCalledWith(blob);
      expect(mockLink.download).toBe('test.txt');
      expect(mockLink.click).toHaveBeenCalled();
      expect(mockRevokeObjectURL).toHaveBeenCalled();

      // Restore
      Object.defineProperty(global, 'document', {
        value: originalDocument,
        writable: true,
        configurable: true,
      });
      Object.defineProperty(global, 'URL', {
        value: originalURL,
        writable: true,
        configurable: true,
      });
    });
  });
});
