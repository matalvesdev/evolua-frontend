import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'
import ExcelJS from 'exceljs'
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx'
import { writeFileSync, mkdirSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT = resolve(__dirname, '..', 'public', 'lead-magnets')
mkdirSync(OUT, { recursive: true })

// ── 1. Checklist PDF ──
async function createChecklistPDF() {
  const doc = await PDFDocument.create()
  const font = await doc.embedFont(StandardFonts.Helvetica)
  const bold = await doc.embedFont(StandardFonts.HelveticaBold)

  let page = doc.addPage([612, 792])
  let y = 740
  const left = 50
  const lineH = 22

  function writeLine(text, size = 11, opts = { bold: false }) {
    if (y < 50) { page = doc.addPage([612, 792]); y = 740 }
    page.drawText(text, { x: left, y, size, font: opts.bold ? bold : font, color: opts.bold ? rgb(0.1, 0.1, 0.2) : rgb(0.2, 0.2, 0.3) })
    y -= lineH
  }

  writeLine('Checklist de Gestão Clínica', 20, { bold: true })
  y -= 8
  writeLine('20 itens essenciais para organizar seu consultório de fonoaudiologia', 10)
  y -= 16

  const items = [
    'Definir horários de atendimento (fixos e flexíveis)',
    'Organizar agenda semanal com blocos de 30/45/50 min',
    'Cadastrar todos os pacientes com dados completos',
    'Criar modelo de anamnese padronizado',
    'Configurar lembrete automático de consultas',
    'Estabelecer política de cancelamento (24h de antecedência)',
    'Separar prontuários por convênio/particular',
    'Criar modelo de relatório CFoF',
    'Definir tabela de procedimentos e valores',
    'Configurar meios de pagamento (PIX, cartão, boleto)',
    'Separar finanças pessoais das da clínica',
    'Registrar todas as despesas mensais fixas',
    'Calcular ticket médio por paciente',
    'Revisar convênios credenciados trimestralmente',
    'Atualizar cadastro no Cadastro Nacional de Estabelecimentos de Saúde',
    'Verificar validade do alvará sanitário',
    'Manter prontuário organizado com SOAP',
    'Backup semanal de dados do sistema',
    'Separar 30 min por semana para planejamento',
    'Revisar metas do mês a cada 15 dias',
  ]

  for (const item of items) {
    writeLine(`[ ] ${item}`, 10)
  }

  y -= 16
  writeLine('Dica: imprima e marque conforme for concluindo cada item.', 9)

  const bytes = await doc.save()
  writeFileSync(resolve(OUT, 'checklist-gestao.pdf'), bytes)
  console.log('✓ checklist-gestao.pdf')
}

// ── 2. Planilha Excel ──
async function createPlanilha() {
  const wb = new ExcelJS.Workbook()
  wb.creator = 'Evolua'
  const ws = wb.addWorksheet('Controle Financeiro')

  ws.columns = [
    { header: 'Data', key: 'date', width: 14 },
    { header: 'Descrição', key: 'desc', width: 35 },
    { header: 'Categoria', key: 'cat', width: 18 },
    { header: 'Tipo', key: 'tipo', width: 10 },
    { header: 'Valor (R$)', key: 'valor', width: 14 },
    { header: 'Status', key: 'status', width: 12 },
  ]

  ws.addRow({ date: '01/06/2026', desc: 'Atendimento - Maria Silva', cat: 'Receita Consulta', tipo: 'Receita', valor: 180, status: 'Recebido' })
  ws.addRow({ date: '01/06/2026', desc: 'Aluguel sala comercial', cat: 'Despesa Fixa', tipo: 'Despesa', valor: 1200, status: 'Pago' })
  ws.addRow({ date: '02/06/2026', desc: 'Atendimento - João Santos', cat: 'Receita Consulta', tipo: 'Receita', valor: 180, status: 'Recebido' })
  ws.addRow({ date: '02/06/2026', desc: 'Material de escritório', cat: 'Despesa Variável', tipo: 'Despesa', valor: 89.9, status: 'Pago' })
  ws.addRow({ date: '03/06/2026', desc: 'Atendimento - Ana Costa', cat: 'Receita Consulta', tipo: 'Receita', valor: 200, status: 'Pendente' })
  ws.addRow({ date: '03/06/2026', desc: 'Internet + Telefone', cat: 'Despesa Fixa', tipo: 'Despesa', valor: 199, status: 'Pago' })

  ws.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } }
  ws.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF6C63FF' } }

  const buf = await wb.xlsx.writeBuffer()
  writeFileSync(resolve(OUT, 'planilha-financeiro.xlsx'), Buffer.from(buf))
  console.log('✓ planilha-financeiro.xlsx')
}

// ── 3. E-book PDF ──
async function createEbookPDF() {
  const doc = await PDFDocument.create()
  const font = await doc.embedFont(StandardFonts.Helvetica)
  const bold = await doc.embedFont(StandardFonts.HelveticaBold)
  const italic = await doc.embedFont(StandardFonts.HelveticaOblique)

  let page = doc.addPage([612, 792])
  let y = 720
  const left = 55
  const lineH = 20

  function write(text, size = 11, opts = {}) {
    if (y < 50) { page = doc.addPage([612, 792]); y = 740 }
    page.drawText(text, { x: left, y, size, font: opts.bold ? bold : opts.italic ? italic : font, color: opts.color ?? rgb(0.2, 0.2, 0.3) })
    y -= lineH
  }

  write('Tendências em Fonoaudiologia 2026', 22, { bold: true })
  y -= 4
  write('Guia completo com as principais tendências da área', 11, { italic: true, color: rgb(0.4, 0.4, 0.5) })
  y -= 16

  const chapters = [
    ['1. Teleconsulta como padrão', 'A teleconsulta deixou de ser exceção. Em 2026, estima-se que 40% dos atendimentos fonoaudiológicos serão híbridos. Invista em plataformas que integrem vídeo, prontuário e agendamento.'],
    ['2. Inteligência Artificial no diagnóstico', 'Ferramentas de IA já auxiliam na análise de espectrografia de voz, triagem de linguagem e sugestão de exercícios personalizados. O futuro é aumento, não substituição.'],
    ['3. Prontuário eletrônico inteligente', 'Sistemas que sugerem condutas baseadas em evidência, alertam sobre interações medicamentosas e geram relatórios automaticamente estão se tornando obrigatórios.'],
    ['4. Gamificação na reabilitação', 'Apps e plataformas que transformam exercícios fonoaudiológicos em jogos aumentam a adesão pediátrica em até 60%. Realidade virtual é o próximo passo.'],
    ['5. Atendimento baseado em dados', 'Clínicas que usam métricas (taxa de evasão, tempo médio de terapia, progresso por sessão) têm 2x mais retenção de pacientes.'],
    ['6. WhatsApp como canal oficial', 'O WhatsApp Business API está revolucionando a comunicação clínica: lembretes, envio de exercícios, telessalas e até pagamentos.'],
    ['7. Especialização em envelhecimento', 'Com o envelhecimento populacional, a demanda por fonoaudiólogos especializados em disfagia, reabilitação cognitiva e perda auditiva cresce 25% ao ano.'],
    ['8. Compliance e LGPD', 'A proteção de dados do paciente não é opcional. Sistemas que garantem conformidade com a LGPD (criptografia, consentimento, auditoria) são diferenciais competitivos.'],
  ]

  for (const [title, text] of chapters) {
    if (y < 100) { page = doc.addPage([612, 792]); y = 740 }
    write(title, 13, { bold: true })
    const words = text.split(' ')
    let line = ''
    for (const word of words) {
      const test = line ? line + ' ' + word : word
      const w = font.widthOfTextAtSize(test, 10)
      if (w > 500) {
        write(line, 10, { color: rgb(0.35, 0.35, 0.45) })
        line = word
      } else {
        line = test
      }
    }
    if (line) write(line, 10, { color: rgb(0.35, 0.35, 0.45) })
    y -= 8
  }

  const bytes = await doc.save()
  writeFileSync(resolve(OUT, 'ebook-tendencias.pdf'), bytes)
  console.log('✓ ebook-tendencias.pdf')
}

// ── 4. Template Relatório DOCX ──
async function createTemplateDocx() {
  const doc = new Document({
    sections: [{
      properties: {},
      children: [
        new Paragraph({ children: [new TextRun({ text: 'RELATÓRIO CLÍNICO FONOAUDIOLÓGICO', bold: true, size: 28 })], alignment: AlignmentType.CENTER }),
        new Paragraph({ spacing: { after: 100 } }),
        new Paragraph({ children: [new TextRun({ text: '1. IDENTIFICAÇÃO', bold: true, size: 22 })] }),
        new Paragraph({ text: 'Paciente: _______________________________________________________________' }),
        new Paragraph({ text: 'Idade: __________________  Data de Nascimento: ____/____/________' }),
        new Paragraph({ text: 'Responsável: __________________________________________________________' }),
        new Paragraph({ text: 'Diagnóstico (CID): __________________  Data: ____/____/________' }),
        new Paragraph({ spacing: { after: 100 } }),
        new Paragraph({ children: [new TextRun({ text: '2. HISTÓRICO', bold: true, size: 22 })] }),
        new Paragraph({ text: 'Queixa principal: ______________________________________________________' }),
        new Paragraph({ text: 'História da doença atual: _______________________________________________' }),
        new Paragraph({ text: 'Antecedentes relevantes: ________________________________________________' }),
        new Paragraph({ spacing: { after: 100 } }),
        new Paragraph({ children: [new TextRun({ text: '3. AVALIAÇÃO', bold: true, size: 22 })] }),
        new Paragraph({ text: 'Habilidade avaliada: ___________________________________________________' }),
        new Paragraph({ text: 'Instrumento utilizado: _________________________________________________' }),
        new Paragraph({ text: 'Resultados: ____________________________________________________________' }),
        new Paragraph({ spacing: { after: 100 } }),
        new Paragraph({ children: [new TextRun({ text: '4. CONDUTA TERAPÊUTICA', bold: true, size: 22 })] }),
        new Paragraph({ text: 'Objetivos: _____________________________________________________________' }),
        new Paragraph({ text: 'Plano terapêutico: _____________________________________________________' }),
        new Paragraph({ text: 'Frequência: ___________________  Duração prevista: ____________________' }),
        new Paragraph({ spacing: { after: 100 } }),
        new Paragraph({ children: [new TextRun({ text: '5. ENCAMINHAMENTOS', bold: true, size: 22 })] }),
        new Paragraph({ text: '________________________________________________________________________' }),
        new Paragraph({ spacing: { after: 200 } }),
        new Paragraph({ children: [new TextRun({ text: '____________________________________', size: 20 })] }),
        new Paragraph({ children: [new TextRun({ text: 'Assinatura e carimbo do fonoaudiólogo', size: 18, italics: true, color: '808080' })] }),
      ],
    }],
  })

  const buf = await Packer.toBuffer(doc)
  writeFileSync(resolve(OUT, 'template-relatorio.docx'), Buffer.from(buf))
  console.log('✓ template-relatorio.docx')
}

await createChecklistPDF()
await createPlanilha()
await createEbookPDF()
await createTemplateDocx()
console.log('\nTodos os materiais gerados em:', OUT)
