import jsPDF from 'jspdf'
import Papa from 'papaparse'
import html2canvas from 'html2canvas'
import { format as formatDate } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type {
  ExportOptions,
  ExportFormat,
  GoalProgressSnapshot,
  Milestone
} from '@/types/evolution-history'

/**
 * Serviço de exportação de dados históricos
 */
export class ExportService {
  /**
   * Exporta dados para PDF
   * @param options - Opções de exportação
   * @returns Blob do PDF gerado
   */
  async exportToPDF(options: ExportOptions & {
    patientName: string
    goalName?: string
    snapshots: GoalProgressSnapshot[]
    milestones: Milestone[]
    chartElement?: HTMLElement
  }): Promise<Blob> {
    try {
      const pdf = new jsPDF()
      let yPosition = 20

      // Título
      pdf.setFontSize(18)
      pdf.text('Histórico de Evolução', 20, yPosition)
      yPosition += 10

      // Informações do paciente
      pdf.setFontSize(12)
      pdf.text(`Paciente: ${options.patientName}`, 20, yPosition)
      yPosition += 7

      if (options.goalName) {
        pdf.text(`Meta: ${options.goalName}`, 20, yPosition)
        yPosition += 7
      }

      // Período
      if (options.dateRange) {
        const startStr = formatDate(options.dateRange.start, 'dd/MM/yyyy', { locale: ptBR })
        const endStr = formatDate(options.dateRange.end, 'dd/MM/yyyy', { locale: ptBR })
        pdf.text(`Período: ${startStr} - ${endStr}`, 20, yPosition)
        yPosition += 10
      }

      // Capturar gráfico se incluído
      if (options.includeCharts && options.chartElement) {
        try {
          const canvas = await html2canvas(options.chartElement)
          const imgData = canvas.toDataURL('image/png')
          pdf.addImage(imgData, 'PNG', 20, yPosition, 170, 80)
          yPosition += 90
        } catch (error) {
          console.error('Erro ao capturar gráfico:', error)
        }
      }

      // Timeline de marcos
      if (options.includeTimeline && options.milestones.length > 0) {
        if (yPosition > 250) {
          pdf.addPage()
          yPosition = 20
        }

        pdf.setFontSize(14)
        pdf.text('Marcos Importantes', 20, yPosition)
        yPosition += 10

        pdf.setFontSize(10)
        for (const milestone of options.milestones.slice(0, 10)) {
          if (yPosition > 270) {
            pdf.addPage()
            yPosition = 20
          }

          const dateStr = formatDate(milestone.date, 'dd/MM/yyyy', { locale: ptBR })
          pdf.text(`${dateStr} - ${milestone.description} (${milestone.progress}%)`, 20, yPosition)
          yPosition += 7
        }
      }

      // Dados tabulares
      if (options.snapshots.length > 0) {
        pdf.addPage()
        yPosition = 20

        pdf.setFontSize(14)
        pdf.text('Histórico de Progresso', 20, yPosition)
        yPosition += 10

        pdf.setFontSize(9)
        pdf.text('Data', 20, yPosition)
        pdf.text('Progresso', 70, yPosition)
        pdf.text('Variação', 120, yPosition)
        yPosition += 7

        for (const snapshot of options.snapshots.slice(0, 30)) {
          if (yPosition > 270) {
            pdf.addPage()
            yPosition = 20
          }

          const dateStr = formatDate(snapshot.createdAt, 'dd/MM/yyyy HH:mm', { locale: ptBR })
          pdf.text(dateStr, 20, yPosition)
          pdf.text(`${snapshot.progress}%`, 70, yPosition)
          pdf.text(snapshot.variation ? `${snapshot.variation > 0 ? '+' : ''}${snapshot.variation}%` : '-', 120, yPosition)
          yPosition += 6
        }
      }

      return pdf.output('blob')
    } catch (error) {
      console.error('Erro ao gerar PDF:', error)
      throw new Error('Não foi possível gerar o PDF')
    }
  }

  /**
   * Exporta dados para CSV
   * @param snapshots - Array de snapshots
   * @returns Blob do CSV gerado
   */
  async exportToCSV(snapshots: GoalProgressSnapshot[]): Promise<Blob> {
    try {
      const data = snapshots.map(snapshot => ({
        Data: formatDate(snapshot.createdAt, 'dd/MM/yyyy HH:mm', { locale: ptBR }),
        'Nome da Meta': snapshot.goalId,
        Progresso: snapshot.progress,
        'Variação': snapshot.variation || 0,
        'Observações': snapshot.notes || ''
      }))

      const csv = Papa.unparse(data, {
        delimiter: ',',
        header: true
      })

      return new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    } catch (error) {
      console.error('Erro ao gerar CSV:', error)
      throw new Error('Não foi possível gerar o CSV')
    }
  }

  /**
   * Exporta gráfico como imagem PNG
   * @param chartElement - Elemento HTML do gráfico
   * @returns Blob da imagem PNG
   */
  async exportChartToPNG(chartElement: HTMLElement): Promise<Blob> {
    try {
      const canvas = await html2canvas(chartElement, {
        scale: 2, // Alta resolução
        backgroundColor: '#ffffff'
      })

      return new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob)
          } else {
            reject(new Error('Falha ao gerar imagem'))
          }
        }, 'image/png')
      })
    } catch (error) {
      console.error('Erro ao capturar gráfico:', error)
      throw new Error('Não foi possível capturar o gráfico')
    }
  }

  /**
   * Gera nome de arquivo para exportação
   * @param patientName - Nome do paciente
   * @param format - Formato do arquivo
   * @param dateRange - Período opcional
   * @returns Nome do arquivo
   */
  generateFilename(
    patientName: string,
    exportFormat: ExportFormat,
    dateRange?: { start: Date; end: Date }
  ): string {
    const sanitizedName = patientName.replace(/[^a-z0-9]/gi, '_').toLowerCase()
    const timestamp = exportFormat === 'png' ? '' : `_${Date.now()}`
    
    let periodStr = ''
    if (dateRange) {
      const startStr = formatDate(dateRange.start, 'yyyyMMdd')
      const endStr = formatDate(dateRange.end, 'yyyyMMdd')
      periodStr = `_${startStr}-${endStr}`
    }

    return `historico_${sanitizedName}${periodStr}${timestamp}.${exportFormat}`
  }

  /**
   * Faz download de blob como arquivo
   * @param blob - Blob a ser baixado
   * @param filename - Nome do arquivo
   */
  downloadBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }
}

// Exportar instância singleton
export const exportService = new ExportService()
