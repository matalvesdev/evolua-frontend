import { createClient } from '@supabase/supabase-js'

export interface BlogPost {
  id: string
  slug: string
  titulo: string
  subtitulo: string
  categoria: 'Marketing' | 'Gestão' | 'Clínica' | 'Carreira' | 'Tecnologia'
  autor: string
  data: string
  tempoLeitura: number
  destaque: boolean
  imagem: string
  corpo: string
}

// ──────────────────────────────────────────────────────────────────────────────
// Supabase client (somente leitura — anon key)
// ──────────────────────────────────────────────────────────────────────────────
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL ?? ''
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY ?? ''

const supabase =
  SUPABASE_URL && SUPABASE_ANON_KEY
    ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    : null

// Mapeia colunas snake_case do banco → camelCase da interface
function mapRow(row: Record<string, unknown>): BlogPost {
  return {
    id: String(row.id),
    slug: String(row.slug),
    titulo: String(row.titulo),
    subtitulo: String(row.subtitulo ?? ''),
    categoria: row.categoria as BlogPost['categoria'],
    autor: String(row.autor ?? 'Equipe Evolua'),
    data: String(row.data),
    tempoLeitura: Number(row.tempo_leitura ?? row.tempoLeitura ?? 5),
    destaque: Boolean(row.destaque),
    imagem: String(row.imagem ?? ''),
    corpo: String(row.corpo ?? ''),
  }
}

// ──────────────────────────────────────────────────────────────────────────────
// Segurança de imagem
// ──────────────────────────────────────────────────────────────────────────────
const ALLOWED_IMAGE_HOSTS = [
  'images.unsplash.com',
  'cdn.evolua.app',
  'images.pexels.com',
]

export function isSafeImageUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    return parsed.protocol === 'https:' && ALLOWED_IMAGE_HOSTS.includes(parsed.hostname)
  } catch {
    return false
  }
}

// ──────────────────────────────────────────────────────────────────────────────
// Dados mockados — usados quando Supabase não está configurado
// ──────────────────────────────────────────────────────────────────────────────
const POSTS_MOCK: BlogPost[] = [
  {
    id: '1',
    slug: 'como-encher-agenda-em-30-dias',
    titulo: 'Como enchi minha agenda em 30 dias sem gastar com anúncios',
    subtitulo:
      'Estratégias reais que fonoaudiólogas usam para atrair pacientes organicamente pelo Instagram e Google.',
    categoria: 'Marketing',
    autor: 'Equipe Evolua',
    data: '2024-01-15',
    tempoLeitura: 8,
    destaque: true,
    imagem: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80',
    corpo: `
<p>Encher a agenda sem gastar com tráfego pago é possível — e mais comum do que você imagina. A gente conversou com mais de 80 fonoaudiólogas que passaram de agendas pela metade para listas de espera em 30 a 60 dias. Esse texto sintetiza o que <em>realmente</em> funciona e descarta o que vende curso, mas não vende sessão.</p>

<h2>1. Pare de tentar ser para todo mundo</h2>
<p>Quem fala com todo mundo, fala com ninguém. Defina <strong>uma única dor</strong> que sua clínica resolve melhor do que qualquer outra: gagueira em adultos, atraso de fala em crianças até 4 anos, voz profissional, disfagia em idosos. Quanto mais nichada a comunicação, mais alta a conversão.</p>

<h2>2. Google Meu Negócio é a sua arma mais subutilizada</h2>
<p>80% das pessoas que vão te encontrar não vão pelo Instagram — vão pelo Google. E elas pesquisam <em>"fonoaudiólogo perto de mim"</em>. Se sua ficha estiver completa (fotos, horários, serviços, descrição com palavras-chave), você aparece no mapa antes da concorrência. Tempo de implementação: 2 horas.</p>

<h2>3. Conteúdo que prova competência, não conteúdo que entretém</h2>
<p>Esquece dança, trend e meme. O paciente confia em quem mostra autoridade clínica de forma simples. Três formatos que convertem:</p>
<ul>
  <li><strong>Antes/depois ético:</strong> mostra o caminho terapêutico (sem expor o paciente) — vídeo de 30s no Reels.</li>
  <li><strong>Mitos vs. fatos:</strong> uma postagem por semana desmistificando algo da sua área.</li>
  <li><strong>Bastidor da escuta clínica:</strong> a câmera mostra o material, sua voz explica o raciocínio.</li>
</ul>

<h2>4. Indicação ativa, não passiva</h2>
<p>Não basta atender bem e esperar indicação. Crie um momento na alta (ou em pontos do tratamento) onde você pede a indicação de forma específica: <em>"Você conhece alguém com a mesma dificuldade que poderia se beneficiar?"</em>. Pacientes satisfeitos indicam — só precisam ser perguntados.</p>

<h2>5. Conexão com pediatras e otorrinos</h2>
<p>O fluxo de encaminhamento médico é o canal de aquisição de menor custo e maior retenção. Marque um café com 5 médicos da região no próximo mês. Leve um material curto (1 página) com seus protocolos e diferenciais. Esse hábito, mantido, vira agenda lotada em 90 dias.</p>

<h2>O que NÃO funciona</h2>
<p>Pôster em supermercado, distribuir cartão na rua, comprar seguidor, fazer rifa. São táticas que parecem ativas mas geram zero conversão. O tempo investido nelas é tempo não investido em SEO local, networking médico e conteúdo de autoridade.</p>

<p><strong>Resumindo:</strong> nicho claro + Google Meu Negócio + conteúdo que prova competência + indicação ativa + médicos parceiros. Aplicado por 30 dias, dificilmente sua agenda continua igual.</p>
`,
  },
  {
    id: '2',
    slug: 'reducao-de-faltas-whatsapp',
    titulo: 'Como reduzir faltas em 70% usando o WhatsApp do jeito certo',
    subtitulo:
      'O modelo de mensagem que a gente testou com centenas de clínicas — e que mudou tudo.',
    categoria: 'Gestão',
    autor: 'Equipe Evolua',
    data: '2024-01-22',
    tempoLeitura: 5,
    destaque: false,
    imagem: 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=800&q=80',
    corpo: `
<p>Faltas custam caro. Cada sessão não confirmada é uma vaga que poderia ter ido para outro paciente, um furo no faturamento e — mais importante — uma quebra no protocolo terapêutico. Mas o problema raramente é o paciente: é a forma como ele é lembrado.</p>

<h2>O erro mais comum: lembrar tarde demais</h2>
<p>Mandar mensagem 2 horas antes da sessão não dá tempo para o paciente reorganizar o dia. Lembrete tem que ser <strong>com tempo de ação</strong>: 24h antes para confirmar, 2h antes para reforçar. Esse é o único combo que funciona.</p>

<h2>O modelo que reduz falta em 70%</h2>
<p>Depois de testar dezenas de variações, chegamos neste:</p>
<blockquote>
<p><em>Oi, [nome do paciente]. Aqui é da clínica [nome]. Sua sessão com [terapeuta] está marcada para amanhã, [data], às [horário]. Tudo certo aí? Responde só com SIM ou se precisa remarcar.</em></p>
</blockquote>
<p>Por que funciona:</p>
<ul>
  <li><strong>Personalização real:</strong> nome do paciente E do terapeuta criam senso de relação.</li>
  <li><strong>Pergunta direta:</strong> "Tudo certo aí?" demanda resposta — não é declarativo.</li>
  <li><strong>Atalho:</strong> "responde com SIM" reduz a fricção de digitar uma resposta.</li>
  <li><strong>Saída honrosa:</strong> "ou se precisa remarcar" abre espaço sem culpa, evitando o no-show silencioso.</li>
</ul>

<h2>Automatização sem perder o tom humano</h2>
<p>Mandar isso manualmente para 50 pacientes é inviável. A solução é automatizar — mas com uma regra: <strong>a mensagem nunca pode parecer robô</strong>. Se você usa Evolua, a mensagem é disparada com o nome real do terapeuta da sessão e o tom da clínica. Se o paciente responde "preciso remarcar", o sistema avisa a recepção em 30 segundos.</p>

<h2>O que fazer com quem não respondeu</h2>
<p>Quem não confirma em 12h recebe um segundo toque, ainda mais curto: <em>"Oi, [nome]. Só confirmando: sessão amanhã às [horário]?"</em>. Quem ignora isso também tem 4x mais chance de faltar — e merece um terceiro contato no dia, por ligação ou áudio.</p>

<h2>O resultado, na prática</h2>
<p>Clínicas que aplicaram esse fluxo reportam queda de 40-70% nas faltas em 60 dias. O dinheiro que era perdido vira sessão de novo paciente. E o terapeuta para de chegar 8h e descobrir que tem um buraco às 9h.</p>

<p><strong>Faltar é hábito.</strong> Lembrete bem feito quebra o hábito.</p>
`,
  },
  {
    id: '3',
    slug: 'precificacao-fonoaudiologista',
    titulo: 'Quanto cobrar? O guia definitivo de precificação para fonoaudiólogas',
    subtitulo: 'Para de cobrar barato por medo. Aprenda a precificar com confiança e sem culpa.',
    categoria: 'Carreira',
    autor: 'Equipe Evolua',
    data: '2024-02-01',
    tempoLeitura: 12,
    destaque: false,
    imagem: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&q=80',
    corpo: `
<p>A maior parte das fonoaudiólogas que conhecemos cobra menos do que vale. Não por incompetência — por medo. Medo de perder paciente, medo de "ser cara demais", medo de comparar com a colega da rua de baixo. Esse texto é um manual para quebrar esse padrão com método, não com achismo.</p>

<h2>Comece pelo seu custo real, não pela média do mercado</h2>
<p>Antes de pensar quanto cobrar, descubra quanto <em>custa</em> uma sessão sua. Some:</p>
<ul>
  <li>Aluguel ou home office (rateado por sessão)</li>
  <li>Materiais e equipamentos (depreciação mensal)</li>
  <li>Impostos (15-25% para autônoma, varia regime)</li>
  <li>Pró-labore mínimo necessário (o que você precisa receber por mês para viver bem)</li>
  <li>Tempo de estudo, supervisão, deslocamento — não é gratuito</li>
</ul>
<p>Divida pelo número realista de sessões que você consegue atender no mês (geralmente 60-100, não 160). O resultado é o seu <strong>custo de operação por sessão</strong>. Cobrar abaixo disso é trabalhar de graça.</p>

<h2>Em cima do custo, aplique a margem de valor</h2>
<p>Margem é o que diferencia profissional de mão de obra. Determinada pela sua proposta:</p>
<ul>
  <li><strong>Recém-formada, sem nicho definido:</strong> custo + 30-50%</li>
  <li><strong>Experiência sólida, nicho claro:</strong> custo + 80-120%</li>
  <li><strong>Especialista reconhecida, lista de espera:</strong> custo + 150-300%</li>
</ul>

<h2>Por que cobrar mais barato afasta o bom paciente</h2>
<p>Pode parecer contraintuitivo, mas é uma realidade comportamental: pacientes que escolhem por preço também desistem por preço. Eles faltam mais, atrasam pagamento mais, questionam protocolos. Pacientes que escolhem por valor confiam mais, aderem mais, indicam mais.</p>

<h2>Como aumentar preço sem perder a base atual</h2>
<p>Aumentar preço é gestão, não trauma. O caminho:</p>
<ol>
  <li><strong>Avise com antecedência:</strong> 60-90 dias antes do reajuste, em conversa pessoal ou e-mail formal.</li>
  <li><strong>Justifique pelo valor entregue:</strong> "estamos investindo em [equipamento/curso/ambiente] para te oferecer [resultado]".</li>
  <li><strong>Mantenha o preço antigo para os atuais por 3-6 meses</strong> e cobre o novo só dos novos pacientes.</li>
  <li><strong>Suba 15-20% por vez</strong>, não 5%. Subidas pequenas precisam ser repetidas — e cada vez geram fricção.</li>
</ol>

<h2>O número mágico não existe</h2>
<p>Não pergunte "quanto cobra a colega". Pergunte: <em>"qual preço me permite viver da clínica que quero ter, atendendo a quantidade de pacientes que cabe no meu calendário, com a qualidade que me orgulha?"</em>. Esse é o número certo — e é único pra cada profissional.</p>

<p><strong>Cobrar bem é o primeiro ato de cuidado clínico.</strong> Profissional cansada e endividada não cuida bem de ninguém.</p>
`,
  },
  {
    id: '4',
    slug: 'ia-na-clinica-de-fono',
    titulo: 'IA na clínica: o que realmente funciona (e o que é só hype)',
    subtitulo:
      'Testamos as principais ferramentas de inteligência artificial para fonoaudiólogas. Aqui está o veredito.',
    categoria: 'Tecnologia',
    autor: 'Equipe Evolua',
    data: '2024-02-10',
    tempoLeitura: 10,
    destaque: true,
    imagem: 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=800&q=80',
    corpo: `
<p>"IA vai substituir fonoaudiólogo." Não vai. Mas IA <em>está</em> substituindo a parte chata do trabalho — anotação burocrática, transcrição manual, revisão de evolução, relatório padrão. E quem não usar nos próximos 24 meses vai pagar caro em produtividade.</p>

<h2>O que funciona muito bem hoje</h2>

<h3>1. Transcrição de sessão</h3>
<p>Gravar a sessão (com consentimento) e ter a transcrição automática em texto editável é o ganho mais imediato. Tira 30-45 minutos do dia da fonoaudióloga que digitava evolução manual. Modelos como Whisper já têm 95%+ de acerto em pt-BR.</p>

<h3>2. Geração de evolução SOAP a partir da transcrição</h3>
<p>Tendo a transcrição, um modelo bem-prompted produz uma evolução SOAP estruturada em 10 segundos. <strong>O profissional revisa e ajusta</strong> — ele continua sendo o autor clínico, mas a digitação some.</p>

<h3>3. Relatórios para escola, plano de saúde e outros profissionais</h3>
<p>Mesma lógica: a IA pega o histórico do prontuário e gera o rascunho do relatório no formato pedido. A fonoaudióloga revisa em 2 minutos em vez de escrever em 25.</p>

<h3>4. Sumário de sessão para o cuidador</h3>
<p>Mensagem curta e em linguagem leiga, gerada após cada atendimento, para mandar para o pai/mãe/cuidador. Aumenta engajamento e adesão. É a tarefa que a fono quase nunca faz por falta de tempo — e que faz toda diferença na evolução.</p>

<h2>O que é hype (por enquanto)</h2>
<ul>
  <li><strong>"IA que faz diagnóstico":</strong> não, não faz. E quem promete, está mentindo. IA pode assistir, sugerir, alertar — diagnóstico é ato profissional.</li>
  <li><strong>"IA que substitui sessão por chatbot":</strong> protocolos terapêuticos exigem vínculo, presença e ajuste em tempo real. Bot não tem isso.</li>
  <li><strong>"IA que prediz quem vai melhorar":</strong> dados clínicos brasileiros ainda não suportam isso com a qualidade necessária. Acompanhe a literatura — em 3-5 anos talvez.</li>
</ul>

<h2>O que olhar antes de adotar uma ferramenta</h2>
<ol>
  <li><strong>LGPD e acordo de processamento de dados:</strong> a ferramenta precisa garantir não-uso dos seus dados para treinar modelo público.</li>
  <li><strong>Soberania dos dados:</strong> idealmente armazenamento no Brasil ou em provedor com acordo internacional.</li>
  <li><strong>Reversibilidade:</strong> consigo exportar tudo se decidir sair? Em qual formato?</li>
  <li><strong>Auditoria:</strong> cada ação da IA fica registrada com quem aprovou, quando, por quê?</li>
</ol>

<h2>O Evolua e a IA</h2>
<p>A nossa abordagem é simples: a IA faz a parte chata, a fonoaudióloga faz a parte clínica. Tudo passa pela revisão profissional antes de virar registro oficial. E nada — absolutamente nada — sai do seu controle: dados ficam em ambiente isolado, sem treinamento de modelo público, com auditoria completa.</p>

<p><strong>IA é alavanca, não substituição.</strong> Quem usar bem ganha 1-2 horas livres por dia. Quem ignorar vai trabalhar mais que o concorrente — e produzir o mesmo.</p>
`,
  },
  {
    id: '5',
    slug: 'burnout-fonoaudiologista',
    titulo: 'Burnout na fonoaudiologia: sinais, causas e como sair',
    subtitulo:
      'Ninguém fala sobre isso, mas quase toda fonoaudióloga já chegou perto do limite. Vamos falar.',
    categoria: 'Carreira',
    autor: 'Equipe Evolua',
    data: '2024-02-18',
    tempoLeitura: 7,
    destaque: false,
    imagem: 'https://images.unsplash.com/photo-1609220136736-443140cfeaa6?w=800&q=80',
    corpo: `
<p>Burnout é a palavra da moda — e a realidade silenciosa da fonoaudiologia clínica. Profissão emocional, mal remunerada na média, com carga administrativa absurda e isolamento social. Esse texto não é motivacional. É um mapa para identificar onde você está e o que mudar.</p>

<h2>Os sinais que ninguém quer admitir</h2>
<ul>
  <li>Acordar com cansaço antes de começar o dia</li>
  <li>Sentir alívio quando o paciente desmarca</li>
  <li>Perder paciência por motivo bobo (com paciente, com colega, em casa)</li>
  <li>Não conseguir mais "desligar" depois do expediente</li>
  <li>Adiar férias por culpa</li>
  <li>Ter pensamento recorrente: <em>"acho que não dou conta"</em></li>
</ul>
<p>Três ou mais desses, regularmente, em 4+ semanas: já é sinal vermelho.</p>

<h2>Por que acontece tanto na fono</h2>
<p>Quatro fatores se somam:</p>
<ol>
  <li><strong>Trabalho emocional não reconhecido:</strong> sustentar vínculo, regular emoção do cuidador, reconfortar criança — gasta. Mas não aparece na conta.</li>
  <li><strong>Sobreposição de papéis:</strong> a profissional clínica é também recepcionista, financeiro, social media e RH. Sem hora pra parar.</li>
  <li><strong>Solidão da autônoma:</strong> sem colegas no dia a dia, sem supervisão, sem time. Tudo fica na sua cabeça.</li>
  <li><strong>Carga administrativa:</strong> 2-3 horas por dia escrevendo evolução, fazendo relatório, cobrando paciente. Tempo não-clínico não-remunerado.</li>
</ol>

<h2>O que <em>realmente</em> ajuda</h2>

<h3>1. Reduzir carga administrativa primeiro</h3>
<p>Não adianta meditar 10 minutos de manhã se você ainda tem 3 horas de digitação à noite. <strong>Atacar a sobrecarga operacional é o primeiro passo</strong> — automação, software clínico, modelos prontos, IA, recepção compartilhada. O que tirar 1 hora do seu dia administrativo já muda o humor da semana.</p>

<h3>2. Volta da supervisão (real, não simbólica)</h3>
<p>Reservar 1-2 horas por mês para supervisão clínica com profissional sênior é antídoto direto contra a solidão da autônoma. Não é luxo — é manutenção profissional.</p>

<h3>3. Cortar o "extra" gratuito</h3>
<p>"Manda foto desse exercício no zap?" "Pode me explicar de novo só pra eu lembrar?" — o trabalho fora da sessão precisa ter limite e, se necessário, valor. Cuidador pagar pelo material/orientação extra é normal e profissional.</p>

<h3>4. Férias não-negociáveis</h3>
<p>30 dias por ano, mínimo. Sem celular profissional. Sem "só responder rapidinho". A clínica precisa funcionar sem você por 30 dias — se não funciona, é problema de estrutura, não de tempo.</p>

<h3>5. Terapia (de novo: não é luxo)</h3>
<p>Profissional do cuidado precisa ter quem cuide dela. Não conhecemos fonoaudióloga consistente acima de 5 anos de carreira que não tenha acompanhamento psicológico próprio — e quase todas têm.</p>

<h2>Quando o sinal é vermelho de verdade</h2>
<p>Pensamentos de desistência da profissão recorrentes, ataques de pânico antes de atender, alteração de sono/peso significativa, irritabilidade incontrolável: <strong>pare e busque ajuda profissional</strong>. Burnout severo é condição clínica e demanda intervenção, não autoajuda.</p>

<p><strong>Cuidar de quem cuida é trabalho.</strong> E o primeiro passo é reconhecer que a vontade de sumir não é fraqueza — é dado.</p>
`,
  },
  {
    id: '6',
    slug: 'prontuario-eletronico-vantagens',
    titulo: 'Prontuário eletrônico: por que você ainda não adotou?',
    subtitulo:
      'Os 5 motivos que as fonoaudiólogas dão para adiar — e por que nenhum deles se sustenta.',
    categoria: 'Gestão',
    autor: 'Equipe Evolua',
    data: '2024-02-25',
    tempoLeitura: 6,
    destaque: false,
    imagem: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&q=80',
    corpo: `
<p>Em 2025, ainda existe fonoaudióloga com prontuário em pasta de papel. E a CFFa nem proíbe diretamente — mas o ambiente regulatório (LGPD, Resolução 491/2017) torna o papel cada vez mais arriscado e ineficiente. Esse texto é sobre desfazer as objeções que ainda te seguram.</p>

<h2>Objeção 1: "É caro"</h2>
<p>Sistemas modernos de prontuário eletrônico custam entre R$ 49 e R$ 200/mês. Compare com:</p>
<ul>
  <li>O custo de uma sessão perdida por agendamento confuso</li>
  <li>O tempo gasto procurando ficha de paciente em 3 pastas</li>
  <li>O risco de uma multa da ANPD por vazamento de dados em papel</li>
</ul>
<p>Em uma única sessão recuperada por mês, o sistema já pagou.</p>

<h2>Objeção 2: "Não tenho tempo de aprender"</h2>
<p>Software clínico bom é aprendido em 1-2 horas e aplicado por anos. O tempo investido na curva de aprendizado retorna multiplicado em <strong>2-3 horas economizadas por semana</strong> em digitação, busca e organização.</p>

<h2>Objeção 3: "Tenho medo de perder os dados"</h2>
<p>Esse é o argumento mais paradoxal: papel queima, molha, é roubado, é esquecido. Sistema sério tem backup automático em 3 servidores diferentes, criptografia em repouso e em trânsito, e exportação completa em PDF/CSV a qualquer momento. <strong>O risco de perder dados é maior no papel.</strong></p>

<h2>Objeção 4: "Meus pacientes preferem papel"</h2>
<p>Nunca conhecemos um paciente que reclamou de prontuário digital. Conhecemos muitos que reclamaram de receber laudo manuscrito ilegível, de a clínica não ter o histórico antigo na hora, de a recepção não achar a ficha. Paciente quer eficiência clínica, não nostalgia.</p>

<h2>Objeção 5: "Tenho LGPD a cumprir e não sei como"</h2>
<p>Justamente por isso é hora de migrar — e migrar para um sistema que <em>já cumpre LGPD por design</em>. Termo de consentimento eletrônico, log de auditoria, controle de acesso por papel, anonimização de dados em backup. Tudo que você teria que construir sozinha.</p>

<h2>Como migrar sem virar caos</h2>
<ol>
  <li><strong>Comece pelos pacientes ativos.</strong> Histórico antigo pode ser digitalizado depois, em ritmo confortável.</li>
  <li><strong>Mantenha o papel em paralelo por 30 dias.</strong> Confirma que tudo está sendo migrado corretamente.</li>
  <li><strong>Treine recepção primeiro.</strong> A pessoa que mais usa o sistema é quem precisa dominá-lo.</li>
  <li><strong>Defina padrão de evolução.</strong> Modelo SOAP, observação livre, scripts terapêuticos — escolha um e padronize.</li>
  <li><strong>Pacientes assinam o termo digital na primeira visita pós-migração.</strong> Resolve LGPD sem desconforto.</li>
</ol>

<h2>O ROI invisível</h2>
<p>Ganho que ninguém calcula: <strong>poder atender em qualquer lugar</strong>. Casa, viagem, telessessão, plantão. O prontuário em papel te prende no consultório. O digital te liberta — sem comprometer um milímetro da segurança.</p>

<p><strong>Não é "se", é "quando".</strong> E quando é antes da próxima fiscalização da ANPD ou do próximo paciente que você perde por desorganização.</p>
`,
  },
]

// ──────────────────────────────────────────────────────────────────────────────
// Funções públicas
// ──────────────────────────────────────────────────────────────────────────────
export async function fetchPosts(categoria?: string): Promise<BlogPost[]> {
  if (supabase) {
    let query = supabase
      .from('blog_posts')
      .select('*')
      .order('data', { ascending: false })

    if (categoria && categoria !== 'Todos') {
      query = query.eq('categoria', categoria)
    }

    const { data, error } = await query
    if (!error && data && data.length > 0) {
      return data.map(mapRow)
    }
  }

  // Fallback para mock
  const posts = POSTS_MOCK
  if (categoria && categoria !== 'Todos') {
    return posts.filter((p) => p.categoria === categoria)
  }
  return posts
}

export async function fetchPostBySlug(slug: string): Promise<BlogPost | undefined> {
  if (supabase) {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('slug', slug)
      .single()

    if (!error && data) return mapRow(data as Record<string, unknown>)
  }

  return POSTS_MOCK.find((p) => p.slug === slug)
}
