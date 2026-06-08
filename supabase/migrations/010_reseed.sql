-- ============================================================
-- Executar NO SQL Editor do Supabase (uma vez, na ordem abaixo)
-- ============================================================

-- 1) Changelog: tabela + RLS + seeds v2.5.0 e v2.6.0
CREATE TABLE IF NOT EXISTS public.changelog_entries (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  versao        TEXT NOT NULL,
  data          DATE NOT NULL DEFAULT CURRENT_DATE,
  tipo          TEXT NOT NULL CHECK (tipo IN ('Feature','Melhoria','Correção','Major Release','Seguranca')),
  titulo        TEXT NOT NULL,
  descricao     TEXT NOT NULL DEFAULT '',
  itens         TEXT[] NOT NULL DEFAULT '{}',
  publicado     BOOLEAN NOT NULL DEFAULT true,
  ordem         INT NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT changelog_entries_versao_unica UNIQUE (versao)
);
CREATE INDEX IF NOT EXISTS changelog_entries_data_idx ON public.changelog_entries (data DESC, ordem DESC);
CREATE INDEX IF NOT EXISTS changelog_entries_publicado_idx ON public.changelog_entries (publicado) WHERE publicado = TRUE;
ALTER TABLE public.changelog_entries ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS changelog_entries_select_public ON public.changelog_entries;
CREATE POLICY changelog_entries_select_public ON public.changelog_entries FOR SELECT TO anon, authenticated USING (publicado = TRUE);

-- Trigger updated_at
CREATE OR REPLACE FUNCTION public.changelog_entries_set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$ BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $$;
DROP TRIGGER IF EXISTS changelog_entries_updated_at ON public.changelog_entries;
CREATE TRIGGER changelog_entries_updated_at BEFORE UPDATE ON public.changelog_entries FOR EACH ROW EXECUTE FUNCTION public.changelog_entries_set_updated_at();

-- Seeds changelog
INSERT INTO public.changelog_entries (versao, data, tipo, titulo, descricao, itens, ordem) VALUES
('v2.5.0', CURRENT_DATE, 'Feature', 'Rodapé expandido + base do changelog público', 'Lançamos a base de páginas públicas que documentam o produto e dão canais de contato para usuárias.', ARRAY['Página de Changelog conectada ao banco (sem dados mockados)','Página de Contato com formulário salvo direto no Supabase','Central de Ajuda (FAQ) gerenciada por categoria','Página de Segurança & LGPD com práticas e contato do DPO','Política de Cookies dedicada','Blog 100% baseado em dados reais'], 1)
ON CONFLICT (versao) DO UPDATE SET data=EXCLUDED.data, tipo=EXCLUDED.tipo, titulo=EXCLUDED.titulo, descricao=EXCLUDED.descricao, itens=EXCLUDED.itens, ordem=EXCLUDED.ordem, publicado=TRUE;

INSERT INTO public.changelog_entries (versao, data, tipo, titulo, descricao, itens, ordem) VALUES
('v2.6.0', CURRENT_DATE, 'Major Release', 'Lançamento oficial do Evolua CRM', 'Primeira versão pública do Evolua — o CRM inteligente para fonoaudiólogas. WhatsApp nativo, IA, blog e muito mais.', ARRAY['WhatsApp nativo via Evolution API — mensagens, lembretes e campanhas sem sair do sistema','IA integrada para relatórios, exercícios e análise de evolução','Blog com conteúdo sobre fonoaudiologia e gestão de clínicas','Newsletter semanal "Fono em Foco" com as novidades do blog','LGPD completo — banner de cookies, política de privacidade e DPO','Analytics com GA4 e consent mode','SMTP fallback para emails transacionais','Rate limiting, CSP headers, error boundaries — segurança e estabilidade','Sitemap + robots.txt para SEO','Backup automático do banco (semanal + manual)'], 2)
ON CONFLICT (versao) DO UPDATE SET data=EXCLUDED.data, tipo=EXCLUDED.tipo, titulo=EXCLUDED.titulo, descricao=EXCLUDED.descricao, itens=EXCLUDED.itens, ordem=EXCLUDED.ordem, publicado=TRUE;


-- 2) RLS: anon pode ler blog_posts publicados
DROP POLICY IF EXISTS blog_posts_select_public ON blog_posts;
CREATE POLICY blog_posts_select_public ON blog_posts FOR SELECT USING (status = 'published');


-- 3) Seed: 12 posts (6 originais + 6 novos de docs/content-assets/02-blog-posts)
-- Cada INSERT é idempotente via ON CONFLICT (slug).

-- =================================================================
-- Posts originais (HTML, convertidos de português para inglês)
-- =================================================================

INSERT INTO blog_posts (title, slug, excerpt, content, cover_image, author, category, read_time, featured, status, published_at)
SELECT
  'Como enchi minha agenda em 30 dias sem gastar com anúncios',
  'como-encher-agenda-em-30-dias',
  'Estratégias reais que fonoaudiólogas usam para atrair pacientes organicamente pelo Instagram e Google.',
  $body$
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
$body$,
  'https://images.pexels.com/photos/7654128/pexels-photo-7654128.jpeg?w=800&q=80',
  'Equipe Evolua',
  'Marketing',
  8,
  TRUE,
  'published',
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM blog_posts WHERE slug = 'como-encher-agenda-em-30-dias');

INSERT INTO blog_posts (title, slug, excerpt, content, cover_image, author, category, read_time, featured, status, published_at)
SELECT
  'Como reduzir faltas em 70% usando o WhatsApp do jeito certo',
  'reducao-de-faltas-whatsapp',
  'O modelo de mensagem que a gente testou com centenas de clínicas — e que mudou tudo.',
  $body$
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
$body$,
  'https://images.pexels.com/photos/4386366/pexels-photo-4386366.jpeg?w=800&q=80',
  'Equipe Evolua',
  'Gestão',
  5,
  FALSE,
  'published',
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM blog_posts WHERE slug = 'reducao-de-faltas-whatsapp');

INSERT INTO blog_posts (title, slug, excerpt, content, cover_image, author, category, read_time, featured, status, published_at)
SELECT
  'Quanto cobrar? O guia definitivo de precificação para fonoaudiólogas',
  'precificacao-fonoaudiologista',
  'Para de cobrar barato por medo. Aprenda a precificar com confiança e sem culpa.',
  $body$
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
$body$,
  'https://images.pexels.com/photos/3760067/pexels-photo-3760067.jpeg?w=800&q=80',
  'Equipe Evolua',
  'Carreira',
  12,
  FALSE,
  'published',
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM blog_posts WHERE slug = 'precificacao-fonoaudiologista');

INSERT INTO blog_posts (title, slug, excerpt, content, cover_image, author, category, read_time, featured, status, published_at)
SELECT
  'IA na clínica: o que realmente funciona (e o que é só hype)',
  'ia-na-clinica-de-fono',
  'Testamos as principais ferramentas de inteligência artificial para fonoaudiólogas. Aqui está o veredito.',
  $body$
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
$body$,
  'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?w=800&q=80',
  'Equipe Evolua',
  'Tecnologia',
  10,
  TRUE,
  'published',
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM blog_posts WHERE slug = 'ia-na-clinica-de-fono');

INSERT INTO blog_posts (title, slug, excerpt, content, cover_image, author, category, read_time, featured, status, published_at)
SELECT
  'Burnout na fonoaudiologia: sinais, causas e como sair',
  'burnout-fonoaudiologista',
  'Ninguém fala sobre isso, mas quase toda fonoaudióloga já chegou perto do limite. Vamos falar.',
  $body$
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
$body$,
  'https://images.pexels.com/photos/3760067/pexels-photo-3760067.jpeg?w=800&q=80',
  'Equipe Evolua',
  'Carreira',
  7,
  FALSE,
  'published',
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM blog_posts WHERE slug = 'burnout-fonoaudiologista');

INSERT INTO blog_posts (title, slug, excerpt, content, cover_image, author, category, read_time, featured, status, published_at)
SELECT
  'Prontuário eletrônico: por que você ainda não adotou?',
  'prontuario-eletronico-vantagens',
  'Os 5 motivos que as fonoaudiólogas dão para adiar — e por que nenhum deles se sustenta.',
  $body$
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
$body$,
  'https://images.pexels.com/photos/4386366/pexels-photo-4386366.jpeg?w=800&q=80',
  'Equipe Evolua',
  'Gestão',
  6,
  FALSE,
  'published',
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM blog_posts WHERE slug = 'prontuario-eletronico-vantagens');

-- =================================================================
-- Novos posts (markdown, de docs/content-assets/02-blog-posts/)
-- =================================================================

INSERT INTO blog_posts (title, slug, excerpt, content, cover_image, author, category, read_time, featured, status, published_at)
SELECT
  'Prontuário Eletrônico para Fonoaudiólogos com MBGR, DOSS e GRBAS Nativos',
  'prontuario-eletronico-fonoaudiologia-mbgr-doss-grbas',
  'Chega de recriar protocolos toda semana. Descubra como um prontuário eletrônico com MBGR, DOSS e GRBAS nativos pode transformar sua clínica de fonoaudiologia.',
  $markdown$
Toda fonoaudióloga clínica conhece o ritual de sexta-feira: abrir o Word, procurar aquele modelo de MBGR que você salvou não sabe onde, ajustar os cabeçalhos, copiar e colar dados do paciente, imprimir, preencher à mão — e no fim do dia perceber que esqueceu de incluir a escala GRBAS.

Esse cenário se repete em milhares de consultórios no Brasil. Estima-se que uma fonoaudióloga gaste de 30 a 50 minutos **por paciente** apenas com a burocracia dos protocolos. Quando multiplicamos por 15 atendimentos por semana, são até 12 horas perdidas — quase dois dias úteis jogados fora com papel e Ctrl+C/Ctrl+V.

A boa notícia é que existe um caminho melhor. Um prontuário eletrônico verdadeiramente especializado em fonoaudiologia elimina esse retrabalho e coloca os protocolos mais importantes a dois cliques de distância.

---

## O que é MBGR e por que ele é essencial no seu prontuário

O MBGR é o protocolo mais completo para avaliação miofuncional orofacial já desenvolvido no Brasil. Criado por Irene Marchesan e colaboradoras, ele analisa:

- **Aparência e postura dos órgãos fonoarticulatórios** (lábios, língua, bochechas, palato)
- **Mobilidade e força** de cada estrutura
- **Funções de mastigação, deglutição, respiração e fala**
- **Condições da oclusão dentária** relevante para a prática fonoaudiológica

Sem um prontuário eletrônico com MBGR nativo, você precisa:

1. Manter arquivos .doc ou .pdf avulsos para cada paciente
2. Preencher manualmente os campos genéricos (nome, idade, data) toda vez
3. Arquivar fisicamente ou em pastas digitais sem padrão
4. Arriscar perder dados quando o computador ou o HD externo falha

Com o MBGR nativo no prontuário, o sistema já carrega os campos do protocolo, preenche automaticamente os dados demográficos do paciente, e armazena cada avaliação com data e histórico — permitindo comparar evoluções ao longo do tempo.

> **Dado relevante:** O CFE (Conselho Federal de Fonoaudiologia) exige que todo prontuário contenha registros completos e atualizados. O MBGR atende aos requisitos de avaliação funcional previstos na Resolução CFFa nº 500/2020.

---

## DOSS e GRBAS: protocolos nativos que economizam tempo

Se o MBGR cuida da parte miofuncional, o **DOSS** (Dysphagia Outcome and Severity Scale) e o **GRBAS** (Grade, Roughness, Breathiness, Asthenia, Strain) cobrem duas áreas igualmente críticas:

| Protocolo | Área | Aplicação |
|-----------|------|-----------|
| MBGR | Motricidade Orofacial | Avaliação completa de estruturas e funções |
| DOSS | Disfagia | Classificação da gravidade e conduta alimentar |
| GRBAS | Voz | Avaliação perceptivo-auditiva dos parâmetros vocais |

### DOSS
A Dysphagia Outcome and Severity Scale é um protocolo de 7 níveis que classifica a gravidade da disfagia e orienta a conduta clínica. Ter o DOSS nativo significa:

- Preenchimento em segundos com escala visual
- Sugestão automática de conduta baseada no nível selecionado
- Histórico de todas as avaliações para comparar evolução

### GRBAS
A escala GRBAS é o padrão-ouro para avaliação perceptivo-auditiva da voz. Cada parâmetro — Grade (G), Roughness (R), Breathiness (B), Asthenia (A), Strain (S) — é pontuado de 0 a 3. No papel, é fácil pular um parâmetro ou errar a soma. No prontuário eletrônico nativo, o sistema guia o preenchimento e gera automaticamente o perfil vocal do paciente.

---

## O custo de não ter protocolos nativos

Vamos fazer as contas. Uma fonoaudióloga que atende 20 pacientes por semana e gasta 15 minutos extras por paciente com burocracia de protocolos:

- **15 min × 20 pacientes = 5 horas por semana**
- **5 horas × 4 semanas = 20 horas por mês**
- **20 horas × R$ 120 (valor médio da hora clínica) = R$ 2.400 por mês perdidos**

Isso sem contar o custo emocional da frustração, o risco de perder documentos, e a dificuldade de comprovar evolução do paciente quando os registros estão espalhados.

Além disso, a fonoaudióloga que não usa prontuário eletrônico está vulnerável a:
- **Fiscalização do CFFa:** o conselho pode solicitar prontuários a qualquer momento
- **Processos éticos:** registros incompletos ou perdidos não servem como defesa
- **Perda de eficiência:** impossibilidade de gerar relatórios consolidados

---

## Como o Evolua resolve com prontuário inteligente

O Evolua foi construído por fonoaudiólogas para fonoaudiólogas. Não é um sistema genérico adaptado — é o **primeiro CRM verticalizado** para a fonoaudiologia brasileira com protocolos nativos embutidos.

No Evolua você encontra:

- **MBGR completo** com campos pré-preenchidos e histórico de evolução
- **DOSS integrado** com escala visual e sugestão de conduta
- **GRBAS automático** com cálculo do perfil vocal
- **Prontuário eletrônico** que atende às exigências do CFFa
- **Relatórios escolares** gerados em segundos com base nos protocolos preenchidos
- **WhatsApp nativo** para envio de relatórios e lembretes diretamente do sistema

Tudo sincronizado, na nuvem, acessível de qualquer lugar. Sem Word, sem papel, sem estresse.

---

## CTA: Teste grátis

Chega de perder tempo recriando protocolos toda semana. O Evolua já vem pronto com MBGR, DOSS e GRBAS nativos — você só preenche, o sistema faz o resto.

**👉 [Faça seu teste grátis agora](https://app.useevolua.com.br/register) — 7 dias sem compromisso.**

Sem cartão de crédito. Sem instalação. Em 5 minutos você já está usando o prontuário eletrônico mais completo para fonoaudiologia do Brasil.

---

*Este artigo foi escrito pela equipe da Evolua — o CRM inteligente para fonoaudiólogas. Transforme sua gestão clínica com protocolos nativos, WhatsApp integrado e relatórios automáticos. [Saiba mais em useevolua.com.br](https://useevolua.com.br)*
  $markdown$,
  'https://images.pexels.com/photos/7654128/pexels-photo-7654128.jpeg?w=800&q=80',
  'Equipe Evolua',
  'Clínica',
  8,
  TRUE,
  'published',
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM blog_posts WHERE slug = 'prontuario-eletronico-fonoaudiologia-mbgr-doss-grbas');

INSERT INTO blog_posts (title, slug, excerpt, content, cover_image, author, category, read_time, featured, status, published_at)
SELECT
  'Relatório de Evolução Fonoaudiológica: Exemplo Prático + Template Grátis',
  'relatorio-evolucao-fonoaudiologica-exemplo',
  'Precisa de um relatório de evolução fonoaudiológica exemplo? Veja modelo pronto, aprenda a fazer em 30 segundos com o Evolua e nunca mais perca horas com relatórios escolares.',
  $markdown$
Era uma segunda-feira à noite. Você fechou o último atendimento, já são 20h, e a mãe do Joãozinho pediu — pela terceira vez — o relatório de evolução para entregar na escola. Você abre o Word, boia de sono, e tenta lembrar o que trabalhou na última sessão. Meia hora depois, o relatório está pronto, mas você sabe que poderia ter sido mais completo. E mais rápido.

Se essa cena é familiar, você não está sozinha. O relatório escolar ou de evolução é uma das tarefas mais odiadas pelas fonoaudiólogas brasileiras — justamente porque consome tempo, exige precisão e, na maioria das vezes, é refeito do zero toda vez.

Mas não precisa ser assim.

---

## O que um bom relatório de evolução precisa ter

Um relatório de evolução fonoaudiológica é mais do que um documento burocrático. Ele é a ponte entre o consultório e a escola (ou outros profissionais). Um bom relatório precisa conter:

### Informações essenciais

- **Dados de identificação:** nome do paciente, idade, escola, série, responsáveis
- **Período avaliado:** data da última avaliação até a data do relatório
- **Queixa principal e diagnóstico:** em linguagem clara, sem jargões excessivos
- **Objetivos terapêuticos:** o que está sendo trabalhado e por quê
- **Evolução do paciente:** progressos observados no período
- **Dificuldades persistentes:** o que ainda precisa de atenção
- **Orientações para a escola:** estratégias práticas que os professores podem aplicar em sala
- **Próximos passos:** previsão de alta, necessidade de continuidade, reavaliação

### Tom e linguagem

O relatório escolar não é para outro fonoaudiólogo — é para professores, pedagogos e pais. Use linguagem acessível. Em vez de "alterações miofuncionais que comprometem a produção do fonema /r/", prefira "dificuldade para movimentar a língua corretamente ao falar sons como 'rato' e 'carro'".

---

## Exemplo prático de relatório de evolução

Aqui está um modelo real que você pode adaptar:

---

**RELATÓRIO DE EVOLUÇÃO FONOAUDIOLÓGICA**

**Paciente:** João Silva Santos
**Idade:** 7 anos
**Escola:** EMEF Professor Antônio Carlos
**Série/Ano:** 2º ano do Ensino Fundamental
**Período avaliado:** Janeiro a Maio de 2026
**Fonoaudióloga responsável:** Dra. Ana Oliveira (CRFa 2-12345)

**Contexto:** João iniciou acompanhamento fonoaudiológico em janeiro de 2026 com diagnóstico de Desvio Fonológico (CID-10 F80.0). Compareceu a 18 sessões no período.

**Objetivos terapêuticos:**
- Estabelecer o contraste entre fonemas oclusivos e fricativos (/p/ vs /f/, /t/ vs /s/)
- Desenvolver consciência fonológica para sons alveolares
- Generalizar os fonemas trabalhados para a fala espontânea

**Evolução observada:**
- O paciente apresentou melhora significativa na produção do fonema /s/ em posição inicial de palavra (antes: 40% de acertos → agora: 85%)
- Ainda apresenta dificuldade com o fonema /r/ em encontros consonantais (ex.: "prato", "braço")
- A consciência fonológica evoluiu de nível silábico para nível fonêmico
- A fala espontânea ainda requer lembretes ocasionais

**Orientações para a escola:**
- Ao ler em sala, reforçar a articulação de palavras com /r/ em encontros consonantais
- Não corrigir a fala do João de forma punitiva; repetir o modelo correto naturalmente
- Incentivar a participação em leituras compartilhadas

**Próximos passos:** Continuidade do acompanhamento com foco na generalização dos fonemas trabalhados. Reavaliação completa prevista para julho/2026.

**Assinatura:** Dra. Ana Oliveira — CRFa 2-12345

---

## Template pronto para usar

Copie este template básico — ou melhor, use o Evolua e nunca mais escreva um relatório manualmente.

```markdown
**RELATÓRIO DE EVOLUÇÃO FONOAUDIOLÓGICA**

**Paciente:** [NOME]
**Idade:** [IDADE]
**Escola:** [ESCOLA]
**Período:** [DATA INÍCIO] a [DATA FIM]
**Fonoaudióloga:** [NOME] — CRFa [NÚMERO]

**Contexto:**
[Descrição breve do quadro e início do tratamento]

**Objetivos terapêuticos:**
- [Objetivo 1]
- [Objetivo 2]
- [Objetivo 3]

**Evolução observada:**
- [Progresso 1]
- [Progresso 2]
- [Desafio 1]

**Orientações:**
[Orientações para escola/família]

**Próximos passos:**
[Previsão e conduta]
```

---

## Como gerar automaticamente com o Evolua

Agora a parte que realmente importa: **e se você pudesse gerar esse relatório completo em 30 segundos?**

No Evolua, o relatório de evolução é gerado automaticamente com base nos protocolos preenchidos durante as sessões. Funciona assim:

1. Você registra cada sessão normalmente no prontuário eletrônico
2. O sistema consolida os dados do período selecionado
3. Em um clique, gera o relatório completo com linguagem adequada para escola
4. Você revisa, ajusta se quiser, e envia

Sem copiar e colar. Sem digitar o nome do paciente toda vez. Sem esquecer de incluir os objetivos terapêuticos.

O Evolua também permite:

- **Envio direto por WhatsApp** para a mãe ou para a escola
- **Assinatura digital** com certificado do CFFa
- **Histórico completo** de todos os relatórios gerados
- **Personalização** do template com seu cabeçalho e logotipo

---

## CTA: Mande EVOLUA no direct

Quer gerar relatórios impecáveis em 30 segundos? O Evolua faz isso e muito mais.

**📲 Mande "EVOLUA" no nosso direct do Instagram [@useevolua](https://instagram.com/useevolua) e ganhe 7 dias de teste grátis.**

Ou se preferir, **[cadastre-se diretamente aqui](https://app.useevolua.com.br/register)** — sem cartão de crédito, sem burocracia.

---

*Este artigo foi escrito pela equipe da Evolua — o CRM inteligente que gera relatórios escolares automaticamente para fonoaudiólogas. Menos tempo com papel, mais tempo com seus pacientes. [useevolua.com.br](https://useevolua.com.br)*
  $markdown$,
  'https://images.pexels.com/photos/4386366/pexels-photo-4386366.jpeg?w=800&q=80',
  'Equipe Evolua',
  'Gestão',
  6,
  FALSE,
  'published',
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM blog_posts WHERE slug = 'relatorio-evolucao-fonoaudiologica-exemplo');

INSERT INTO blog_posts (title, slug, excerpt, content, cover_image, author, category, read_time, featured, status, published_at)
SELECT
  'CRM para Fonoaudióloga: O que é, Funcionalidades e Por Que Você Precisa',
  'crm-para-fonoaudiologa-o-que-e',
  'Prontuário é só o começo. Descubra por que um CRM para fonoaudióloga vai muito além — e como ele pode transformar sua gestão de pacientes, agenda e faturamento.',
  $markdown$
Se você abre o Excel toda manhã para ver quais pacientes tem hoje, anota pagamentos num caderninho, e usa o WhatsApp pessoal para lembrar o paciente da consulta de amanhã — você está no lugar certo.

Muitas fonoaudiólogas confundem prontuário eletrônico com sistema de gestão completo. Acham que ter um prontuário digital resolve todos os problemas da clínica. Mas a realidade é outra: o prontuário guarda dados clínicos; um CRM gerencia o relacionamento com o paciente e o negócio como um todo.

Vamos entender essa diferença — e por que sua clínica precisa de ambos.

---

## Diferença entre prontuário e CRM

A confusão é compreensível. No mercado, muitos sistemas vendem "prontuário eletrônico" mas entregam apenas um repositório digital de fichas. Outros chamam de "gestão de clínica" o que não passa de um calendário com anotações.

Vamos aos fatos:

| Funcionalidade | Prontuário Eletrônico | CRM Completo |
|----------------|:---------------------:|:------------:|
| Registro de sessões e evolução clínica | ✅ | ✅ |
| Protocolos especializados (MBGR, DOSS) | ✅ | ✅ |
| Agendamento inteligente | ❌ | ✅ |
| Disparo automático de lembretes | ❌ | ✅ |
| Gestão financeira (contas a receber) | ❌ | ✅ |
| Integração com WhatsApp | ❌ | ✅ |
| Relatórios gerenciais | ❌ | ✅ |
| Fila de espera e lista de ausentes | ❌ | ✅ |
| Emissão de notas e recibos | ❌ | ✅ |

O prontuário é uma peça importante, mas é só uma peça. O CRM é o motor que faz tudo funcionar junto.

---

## Por que a fonoaudióloga precisa de um CRM

A fonoaudióloga clínica brasileira, em sua maioria, trabalha sozinha ou com uma pequena equipe. O tempo gasto com tarefas administrativas rouba horas preciosas de atendimento. Um CRM resolve isso.

### Os 3 maiores problemas que um CRM elimina

**1. Paciente que não aparece (absenteísmo)**

O índice de faltas em clínicas de fonoaudiologia gira em torno de 20% a 30%. Um CRM com lembretes automáticos via WhatsApp reduz esse número para menos de 10%. Cada paciente que aparece é receita que não se perde.

**2. Inadimplência**

Sem controle financeiro integrado, é fácil perder de vista quem pagou e quem não pagou. O CRM avisa quando a mensalidade vence, envia cobrança automática e mantém o histórico de pagamentos de cada paciente.

**3. Retrabalho**

Digitar o mesmo paciente no prontuário, na agenda, no WhatsApp e no Excel é ineficiente e propenso a erros. O CRM centraliza tudo: cadastro único que alimenta todos os módulos.

---

## Funcionalidades essenciais de um CRM para fonoaudiologia

Nem todo CRM serve para fonoaudiologia. Sistemas genéricos (AgendaFacil, ZenKlub, etc.) não entendem as especificidades da profissão. Aqui está o que um CRM realmente especializado deve oferecer:

### 1. Prontuário com protocolos nativos
- MBGR, DOSS, GRBAS já embutidos
- Histórico de evolução por protocolo
- Relatórios automáticos para escola

### 2. WhatsApp Business integrado
- Envio de lembretes de consulta
- Compartilhamento de relatórios
- Cobrança e recibos
- Tudo sem sair do sistema

### 3. Gestão financeira
- Contas a receber por paciente
- Emissão de notas fiscais (integração com NFS-e)
- Relatórios de faturamento mensal
- Controle de inadimplência

### 4. Agenda inteligente
- Visualização diária, semanal e mensal
- Bloqueio de horários recorrentes
- Fila de espera automática
- Conflito de horários detectado

### 5. Relatórios gerenciais
- Quantos pacientes você atendeu no mês?
- Qual o ticket médio?
- Quantos pacientes novos vieram por indicação?
- Qual procedimento gera mais receita?

Sem CRM, responder essas perguntas exige horas debruçada sobre planilhas. Com CRM, é um clique.

---

## Comparação com planilhas: o custo oculto do Excel

Muitas fonoaudiólogas começam com planilhas. É gratuito, familiar, e parece funcionar — até o momento em que não funciona mais.

| Aspecto | Planilhas (Excel/Google Sheets) | CRM Especializado |
|---------|:-------------------------------:|:-----------------:|
| Curva de aprendizado | Baixa | Média (setup único) |
| Risco de perda de dados | Alto (arquivo corrompido) | Zero (nuvem com backup) |
| Compartilhamento em equipe | Complexo (versões conflitantes) | Imediato |
| Automação | Manual (fórmulas) | Automática |
| Lembretes | Não faz | Automático via WhatsApp |
| Integração com WhatsApp | Não | Nativa |
| Relatórios gerenciais | Montagem manual | Automáticos |
| Escalabilidade | Ruim (travamentos com +500 linhas) | Ilimitada |

A planilha que funcionava com 20 pacientes vira um pesadelo quando você chega a 50. O CRM escala conforme sua clínica cresce.

---

## Evolua: o primeiro CRM verticalizado para fonoaudiologia

O Evolua nasceu dentro de um consultório de fonoaudiologia. Não é um sistema genérico que foi "adaptado" — foi construído do zero para resolver os problemas reais da fonoaudióloga brasileira.

- **Prontuário com protocolos nativos** (MBGR, DOSS, GRBAS)
- **WhatsApp integrado** sem precisar de API paga
- **Relatórios escolares automáticos**
- **Gestão financeira completa**
- **Agenda inteligente com lembretes**
- **Suporte humanizado** de quem entende da profissão

E tudo isso por um preço que cabe no bolso da fonoaudióloga autônoma — não o preço de sistemas hospitalares ou plataformas internacionais.

---

## CTA: Teste grátis

Prontuário sem CRM é como ter um carro sem volante: até anda, mas você não controla para onde vai.

Experimente o Evolua — o primeiro CRM completo para fonoaudiólogas brasileiras — gratuitamente por 7 dias.

**👉 [Comece seu teste grátis agora](https://app.useevolua.com.br/register)**

Sem cartão de crédito. Cadastro em 2 minutos. Suporte humano do dia 1.

---

*Este artigo foi escrito pela equipe da Evolua — o CRM inteligente que transforma a gestão da sua clínica de fonoaudiologia. Agende, atenda, fatura e acompanhe tudo em um só lugar. [useevolua.com.br](https://useevolua.com.br)*
  $markdown$,
  'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?w=800&q=80',
  'Equipe Evolua',
  'Tecnologia',
  7,
  TRUE,
  'published',
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM blog_posts WHERE slug = 'crm-para-fonoaudiologa-o-que-e');

INSERT INTO blog_posts (title, slug, excerpt, content, cover_image, author, category, read_time, featured, status, published_at)
SELECT
  'CFFa Documentação Obrigatória 2026 — Guia Completo para Fonoaudiólogos',
  'cffa-documentacao-obrigatoria-fonoaudiologia-2026',
  'Guia completo com todos os documentos obrigatórios exigidos pelo CFFa em 2026. Inclui prazos, checklist para download e como o Evolua organiza tudo automaticamente.',
  $markdown$
Você sabia que mais de 3.000 fonoaudiólogos brasileiros tiveram seus registros profissionais suspensos em 2025 por irregularidades documentais? Não por erro clínico — mas por burocracia. Documentação atrasada, prontuários incompletos, falta de comprovante de atualização.

O Conselho Federal de Fonoaudiologia (CFFa) e os Conselhos Regionais (CRFas) são rigorosos quanto à documentação obrigatória. E a cada ano, novas resoluções entram em vigor.

Se você quer evitar dores de cabeça com o conselho, este guia é para você. Vamos listar tudo que você precisa ter em dia em 2026 — e mostrar como a tecnologia pode evitar que você seja pega de surpresa.

> **Aviso legal:** Este artigo tem caráter informativo e não substitui a consulta ao site oficial do CFFa ou ao seu CRFa. As normas podem variar por região.

---

## Documentos obrigatórios para 2026

### 1. Registro profissional no CRFa
Todo fonoaudiólogo precisa ter registro ativo no Conselho Regional da sua jurisdição. Sem ele, o exercício profissional é ilegal — configura exercício ilegal da profissão (art. 47 da Lei de Contravenções Penais).

**O que você precisa:**
- Diploma de graduação em Fonoaudiologia registrado no MEC
- Histórico escolar completo
- Documentos pessoais (RG, CPF, comprovante de residência)
- Certidão de nascimento ou casamento
- Foto 3×4 recente

### 2. Anuidade anual
A anuidade do CRFa é paga todo ano, geralmente com vencimento em março. O valor varia por regional, mas gira em torno de R$ 500 a R$ 700 para pessoa física.

**Atenção:** O atraso no pagamento gera:
- Multa de 2% ao mês
- Juros de mora (Selic)
- Inscrição em dívida ativa
- Suspensão do registro profissional

### 3. Certidão de Regularidade
Documento que comprova que você está em dia com o conselho. Exigida para:
- Assumir cargos públicos ou concursos
- Participar de licitações
- Credenciamento em planos de saúde
- Contratos com escolas e instituições

Validade: geralmente 60 a 90 dias.

### 4. Prontuário do paciente (obrigatório por lei)
Sim, o prontuário é um documento obrigatório. A Resolução CFFa nº 500/2020 estabelece que todo paciente atendido deve ter prontuário individual contendo:

- Identificação completa do paciente
- Anamnese e avaliação inicial
- Hipótese diagnóstica e diagnóstico final
- Plano terapêutico com objetivos e metas
- Evolução de cada sessão
- Alta ou encaminhamento

**Prazo de guarda:** O prontuário deve ser mantido por **20 anos** após a última sessão. Após esse prazo, pode ser digitalizado e descartado (mediante autorização do paciente).

---

## Prazos de renovação e atualização

### Renovação anual
- **Vencimento da anuidade:** Março de cada ano (consulte seu CRFa para data exata)
- **Atualização cadastral:** Sempre que houver mudança de endereço, telefone ou local de trabalho
- **Comunicação de vínculo:** Sempre que iniciar ou encerrar vínculo empregatício

### Atualização bienal (Educação Continuada)
Desde 2023, o CFFa exige comprovação de educação continuada para renovação do registro. Você precisa acumular:

- **40 horas** de atividades de aperfeiçoamento a cada 2 anos
- Cursos, congressos, publicações e grupos de estudo contam
- Parte pode ser online (até 50%)

### Prazos críticos que mais geram suspensão

| Documento | Prazo | Consequência do atraso |
|-----------|-------|------------------------|
| Anuidade | 31/03 (varia por regional) | Suspensão + multa |
| Certidão de Regularidade | A cada 60-90 dias | Impedimento de contratos |
| Prontuário | A cada sessão | Processo ético-profissional |
| Educação Continuada | A cada 2 anos | Não renovação do registro |

---

## Consequências da documentação irregular

Muita fonoaudióloga descobre que está irregular só quando precisa da certidão para um concurso ou credenciamento. As consequências vão além da multa:

1. **Suspensão do exercício profissional:** Você não pode atender enquanto estiver irregular
2. **Multas:** Podem chegar a R$ 5.000 por infração
3. **Processo ético:** Prontuários incompletos ou ausentes podem gerar desde advertência até cassação do registro
4. **Impossibilidade de contratar:** Planos de saúde, escolas e prefeituras exigem regularidade
5. **Dívida ativa:** A anuidade não paga vira dívida com a União

> **Caso real:** Em 2024, uma fonoaudióloga de São Paulo foi multada em R$ 3.200 porque não conseguiu apresentar os prontuários de 12 pacientes atendidos há 3 anos. Ela tinha os registros, mas estavam em papéis avulsos que se perderam numa mudança de consultório.

---

## Checklist completo para download

Imprima este checklist e mantenha na parede do seu consultório:

### 📋 Checklist de Documentação CFFa 2026

**Regularidade do Profissional**
- [ ] Registro ativo no CRFa (consulte no site do conselho)
- [ ] Anuidade 2026 paga
- [ ] Certidão de Regularidade emitida (validade 60-90 dias)
- [ ] Atualização cadastral em dia
- [ ] Educação Continuada: ___ horas cumpridas (meta: 40h/2 anos)

**Prontuários**
- [ ] Todos os pacientes ativos têm prontuário
- [ ] Cada sessão tem evolução registrada
- [ ] Prontuários arquivados com segurança (backup)
- [ ] Prazo de guarda de 20 anos sendo respeitado
- [ ] Termo de consentimento assinado por cada paciente

**Documentos do Consultório**
- [ ] Alvará de funcionamento
- [ ] Licença da Vigilância Sanitária (se aplicável)
- [ ] Contrato social (se pessoa jurídica)
- [ ] Inscrição municipal
- [ ] Certificado digital (para NFS-e, se aplicável)

---

## Como o Evolua organiza automaticamente

Manter toda essa documentação em ordem manualmente é uma tarefa hercúlea. É aí que entra o Evolua.

### Prontuário eletrônico conforme Resolução CFFa 500/2020
O Evolua foi construído para atender integralmente à resolução do conselho:
- **Campos obrigatórios** não podem ser pulados
- **Registro de data/hora** em cada evolução (auditoria)
- **Assinatura digital** com certificação
- **Backup automático** em nuvem com redundância
- **Exportação** para formato oficial quando necessário

### Controle de prazos e vencimentos
O sistema emite alertas automáticos para:
- Vencimento da anuidade do CRFa
- Renovação da Certidão de Regularidade
- Necessidade de relatórios periódicos
- Prazos de guarda documental

### Relatórios para o conselho
Precisa apresentar documentação ao CRFa? O Evolua gera relatórios consolidados com:
- Lista de pacientes atendidos no período
- Histórico de sessões
- Evoluções clínicas completas
- Comprovantes de alta e encaminhamento

---

## CTA: Salve o checklist

Manter a documentação em dia não precisa ser um pesadelo. Com o Evolua, você tem prontuário eletrônico dentro das normas do CFFa, alertas automáticos de vencimento e relatórios prontos para o conselho.

**📥 Baixe agora o checklist completo de documentação CFFa 2026 e ganhe 7 dias de teste grátis do Evolua.**

**👉 [Quero meu checklist e teste grátis](https://useevolua.com.br/cffa-checklist)**

Ou se preferir, **[inicie o teste direto](https://app.useevolua.com.br/register)** — sem cartão, sem compromisso.

---

*Este artigo foi escrito pela equipe da Evolua — o CRM inteligente que mantém sua documentação em dia com o CFFa. Menos burocracia, mais clínica. [useevolua.com.br](https://useevolua.com.br)*
  $markdown$,
  'https://images.pexels.com/photos/7578828/pexels-photo-7578828.jpeg?w=800&q=80',
  'Equipe Evolua',
  'Clínica',
  9,
  FALSE,
  'published',
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM blog_posts WHERE slug = 'cffa-documentacao-obrigatoria-fonoaudiologia-2026');

INSERT INTO blog_posts (title, slug, excerpt, content, cover_image, author, category, read_time, featured, status, published_at)
SELECT
  'Evolua vs iClinic para Fonoaudiologia: Qual o Melhor em 2026?',
  'evolua-vs-iclinic-sistema-fonoaudiologia-2026',
  'Comparativo completo entre Evolua e iClinic para fonoaudiólogas. Veja diferenças de protocolos nativos, preço, WhatsApp integrado e qual sistema realmente entende da sua profissão.',
  $markdown$
Se você é fonoaudióloga e começa a pesquisar sistemas de gestão, dois nomes aparecem rápido: iClinic e Evolua.

O iClinic é um dos players mais antigos do mercado de saúde digital no Brasil. Já o Evolua é mais novo, mas nasceu dentro da fonoaudiologia — e essa diferença de origem faz toda a diferença.

Neste comparativo, vamos analisar ponto a ponto: protocolos nativos, preço, WhatsApp integrado, suporte e especialização. No final, você terá clareza para decidir qual sistema realmente atende às necessidades da sua clínica.

> **Nota:** Este comparativo foi feito em maio de 2026 com base nas informações públicas de cada plataforma. Preços e funcionalidades podem sofrer alterações.

---

## Introdução contextual: a origem de cada sistema

### iClinic
Fundado em 2011, o iClinic nasceu como um sistema genérico de gestão para clínicas de todas as especialidades. Hoje atende desde psicologia até dermatologia, passando por nutrição e fisioterapia. São mais de 30 mil clínicas cadastradas.

**Prós:** Base instalada grande, muitos tutoriais, reconhecimento de marca.
**Contras:** Genérico — não foi feito especificamente para fonoaudiologia.

### Evolua
Lançado em 2024, o Evolua nasceu dentro de um consultório de fonoaudiologia. Literalmente: a founder é fonoaudióloga e criou o sistema porque não encontrava nada no mercado que resolvesse os problemas específicos da profissão.

**Prós:** 100% verticalizado para fonoaudiologia, protocolos nativos, WhatsApp integrado.
**Contras:** Mais novo no mercado (mas crescendo rápido), base de usuários menor.

---

## Protocolos nativos: quem tem?

Este é o ponto mais crítico da comparação.

| Protocolo | iClinic | Evolua |
|-----------|:-------:|:------:|
| MBGR | ❌ (genérico) | ✅ Nativo |
| DOSS | ❌ | ✅ Nativo |
| GRBAS | ❌ | ✅ Nativo |
| Relatório escolar automático | ❌ | ✅ |
| Campos específicos de fono | ❌ (formulário livre) | ✅ Estruturados |
| Histórico por protocolo | ❌ | ✅ |

No iClinic, você pode criar **formulários personalizados** para tentar reproduzir o MBGR. Mas isso significa que você mesma precisa:
1. Criar o formulário do zero (ou pedir ao suporte)
2. Mapear todos os campos manualmente
3. Manter o formulário atualizado
4. Recriar para cada paciente

No Evolua, o MBGR, o DOSS e o GRBAS já estão prontos e integrados ao prontuário. Você abre o paciente, clica no protocolo, preenche e pronto. O histórico de evolução é automático.

**Veredito:** Se você usa MBGR, DOSS ou GRBAS com frequência, o Evolua ganha de lavada.

---

## Preço: por profissional vs por clínica

O modelo de precificação é outro divisor de águas.

### iClinic
O iClinic cobra **por profissional**. Isso significa que cada fonoaudióloga da clínica paga uma mensalidade separada. Para uma clínica com:
- 1 profissional: ~R$ 89/mês (plano mais básico)
- 3 profissionais: ~R$ 267/mês
- 5 profissionais: ~R$ 445/mês

Planos com funcionalidades completas (prontuário, agenda, financeiro) podem chegar a R$ 149 por profissional.

### Evolua
O Evolua cobra **por clínica**, não por profissional. Uma clínica com 1 ou 5 fonoaudiólogas paga o mesmo valor.

**Preço atual:** Consulte o site para valores atualizados, mas a diferença é especialmente vantajosa para clínicas com equipe.

**Veredito:** Para clínicas com 2 ou mais profissionais, o Evolua é significativamente mais barato. Para profissional autônomo, a diferença é menor — mas ainda assim o Evolua entrega mais funcionalidades específicas.

---

## WhatsApp integrado

Este é um dos maiores diferenciais do Evolua.

### iClinic
O iClinic oferece integração com WhatsApp, mas **via terceiros**. Você precisa contratar um serviço separado de API do WhatsApp Business (como a Zenvia) e configurar a integração. Custo adicional: de R$ 50 a R$ 200/mês dependendo do volume de mensagens.

Funcionalidades disponíveis: lembretes agendados, mensagens em massa.

### Evolua
O Evolua tem **WhatsApp nativo** — ou seja, a integração já vem inclusa no sistema, sem custo adicional. Você consegue:

- Enviar lembretes de consulta automáticos
- Compartilhar relatórios e documentos
- Enviar cobranças e recibos
- Conversar diretamente com o paciente pelo sistema
- Tudo sem sair do Evolua e sem pagar API extra

**Veredito:** O Evolua ganha por ter WhatsApp nativo sem custo adicional. A integração do iClinic funciona, mas envolve mais gastos e complexidade.

---

## Suporte e especialização

### iClinic
O suporte do iClinic é padronizado para todas as especialidades. Você fala com um atendente que entende de software, mas não necessariamente de fonoaudiologia. Se você precisar de ajuda com um fluxo específico de fono — como emitir relatório escolar — o suporte pode demorar para entender sua necessidade.

### Evolua
O suporte do Evolua é **especializado em fonoaudiologia**. A equipe conhece MBGR, DOSS, GRBAS, relatórios escolares, as resoluções do CFFa. Quando você liga pedindo ajuda, não precisa explicar o que é um "encontro consonantal" ou "avaliação miofuncional".

**Veredito:** Evolua vence em especialização do suporte.

---

## Tabela comparativa final

| Critério | iClinic | Evolua |
|----------|:-------:|:------:|
| Protocolos nativos (MBGR, DOSS, GRBAS) | ❌ Precisa criar | ✅ Prontos |
| Preço | Por profissional | Por clínica |
| WhatsApp integrado | Via terceiros (custo extra) | Nativo (sem custo) |
| Relatório escolar | Manual | Automático |
| Suporte especializado em fono | ❌ | ✅ |
| Tempo de mercado | ~15 anos | ~2 anos |
| Interface | Genérica | Feita para fono |
| Gestão financeira | ✅ | ✅ |
| Agenda inteligente | ✅ | ✅ |

---

## Veredito

A escolha entre iClinic e Evolua depende do que você valoriza.

### Escolha iClinic se:
- Você já usa o iClinic há anos e não quer migrar
- Sua clínica é multiprofissional (não só fonoaudiologia)
- Você precisa de uma base grande de tutoriais e comunidade

### Escolha Evolua se:
- Você é fonoaudióloga e quer um sistema que fale sua língua
- Usa MBGR, DOSS ou GRBAS
- Quer WhatsApp integrado sem custo extra
- Tem clínica com equipe (preço por clínica compensa mais)
- Valoriza suporte que entende de fonoaudiologia

O Evolua foi construído **por** fonoaudiólogas **para** fonoaudiólogas. O iClinic é um bom sistema genérico — mas genérico não resolve problemas específicos.

---

## CTA: Teste grátis

Quer experimentar o sistema que realmente entende de fonoaudiologia?

**👉 [Faça 7 dias de teste grátis do Evolua](https://app.useevolua.com.br/register)**

Sem cartão de crédito. Sem compromisso. Em 5 minutos você já está usando protocolos nativos, WhatsApp integrado e relatórios automáticos.

Compare você mesma — e veja qual sistema faz mais sentido para a sua clínica.

---

*Este artigo foi escrito pela equipe da Evolua. Comparativo baseado em informações públicas consultadas em maio de 2026. Preços sujeitos a alteração. [useevolua.com.br](https://useevolua.com.br)*
  $markdown$,
  'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?w=800&q=80',
  'Equipe Evolua',
  'Tecnologia',
  8,
  FALSE,
  'published',
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM blog_posts WHERE slug = 'evolua-vs-iclinic-sistema-fonoaudiologia-2026');

INSERT INTO blog_posts (title, slug, excerpt, content, cover_image, author, category, read_time, featured, status, published_at)
SELECT
  '10 Perguntas Essenciais Antes de Escolher um Sistema de Gestão para Fonoaudiologia',
  '10-perguntas-sistema-gestao-fonoaudiologia',
  'Escolher o sistema errado custa caro. Veja as 10 perguntas que toda fonoaudióloga deve fazer antes de contratar um software de gestão clínica.',
  $markdown$
Escolher um sistema de gestão para sua clínica de fonoaudiologia é como escolher um parceiro de consultório: a decisão errada vai te custar tempo, dinheiro e paciência.

O mercado brasileiro tem dezenas de opções — desde planilhas caseiras até sistemas hospitalares complexos. Mas a maioria não foi feita para fonoaudiologia. Resultado: você paga caro por funcionalidades que não usa e luta com a falta das que realmente precisa.

Para evitar essa dor de cabeça, preparamos um roteiro de **10 perguntas essenciais** que você deve fazer antes de assinar qualquer contrato. Use como checklist de avaliação.

> **Dica:** Ao final do artigo, você encontra uma tabela de avaliação para pontuar cada sistema.

---

## Pergunta 1: O sistema é específico para fonoaudiologia?

Essa é a pergunta mais importante e a mais negligenciada.

Sistemas genéricos (iClinic, GestãoClick, Clínica Sim) foram desenhados para atender qualquer especialidade — de psicologia a dermatologia. Eles tratam sua clínica como mais uma na lista.

**O que um sistema genérico NÃO entende:**
- A diferença entre avaliação miofuncional e avaliação de voz
- Que MBGR, DOSS e GRBAS não são "formulários genéricos"
- Que relatório escolar tem formato e linguagem específicos
- Que o CFFa tem exigências documentais diferentes do CRP ou do CRM

**O que um sistema verticalizado ENTENDE:**
- Protocolos nativos prontos para uso
- Relatórios automáticos no formato que a escola espera
- Campos específicos para cada tipo de avaliação fonoaudiológica
- Conformidade com as resoluções do CFFa

**Pergunte ao vendedor:** "Quantos dos seus clientes são fonoaudiólogos? Que funcionalidades específicas para fonoaudiologia vocês desenvolveram?"

---

## Pergunta 2: Tem protocolos nativos (MBGR, DOSS, GRBAS)?

Protocolos são a espinha dorsal do prontuário fonoaudiológico. Se o sistema não tem MBGR, DOSS e GRBAS nativos, você vai precisar:

1. Criar formulários personalizados (perde tempo)
2. Manter formulários avulsos fora do sistema (perde organização)
3. Preencher manualmente dados do paciente toda vez (perde eficiência)

**O que verificar:**
- O sistema já vem com MBGR completo ou é um formulário vazio?
- O DOSS tem escala visual ou é só texto?
- O GRBAS calcula o perfil vocal automaticamente?
- Os protocolos geram histórico de evolução comparável?

---

## Pergunta 3: Integra WhatsApp de forma nativa?

WhatsApp é o principal canal de comunicação entre fonoaudióloga e paciente no Brasil. Um sistema que não integra WhatsApp direito está jogando contra a maré.

**Cuidado com falsas integrações:**
- "Integração com WhatsApp" via link (só abre o app, não envia automaticamente)
- Integração que exige contratar API terceirizada (Zenvia, Twilio) com custo extra
- Integração que só envia texto, sem anexos (relatórios, recibos)

**O que é integração de verdade:**
- Lembrete automático de consulta via WhatsApp
- Envio de relatórios e documentos anexados
- Cobrança e comprovante de pagamento
- Tudo dentro do sistema, sem taxa extra

---

## Pergunta 4: Como funciona o relatório escolar?

Se você atende crianças e adolescentes, relatório escolar é uma demanda constante. Pergunte:

- O sistema gera relatórios automaticamente com base nos dados do prontuário?
- O formato é adequado para escola (linguagem acessível)?
- Dá para personalizar o template?
- Envia diretamente por WhatsApp?
- Mantém histórico de todos os relatórios gerados?

Um sistema que exige que você digite o relatório do zero não está te ajudando — está só sendo um Word mais caro.

---

## Pergunta 5: Qual o modelo de precificação?

Aqui mora uma das maiores ciladas. Muitos sistemas cobram **por profissional**, o que encarece rapidamente para clínicas com equipe.

**Modelos comuns:**
- **Por profissional:** R$ 50-150/mês por cada fono da clínica
- **Por clínica:** Valor único independente do número de profissionais
- **Por funcionalidades:** Plano básico (só agenda) vs premium (tudo)

**Pergunte:**
- Se eu contratar hoje para 2 profissionais e depois adicionar mais 2, quanto vou pagar?
- Tem limite de pacientes cadastrados?
- O que está incluso em cada plano?

---

## Pergunta 6: Tem gestão financeira integrada?

Agenda e prontuário são importantes, mas sua clínica só se sustenta se o financeiro estiver saudável. O sistema precisa:

- Controlar contas a receber por paciente
- Emitir notas fiscais (NFS-e integrada)
- Gerar relatórios de faturamento mensal
- Controlar inadimplência
- Enviar cobrança automática

---

## Pergunta 7: O sistema está conforme o CFFa?

A Resolução CFFa nº 500/2020 estabelece regras claras para prontuários. O sistema precisa:

- Garantir registro de data e hora em cada evolução
- Impedir alterações sem registro de auditoria
- Manter backup seguro por 20 anos
- Permitir exportação dos dados em formato legível
- Ter termos de consentimento integrados

**Pergunte:** "O sistema atende à Resolução CFFa 500/2020? Como funciona a auditoria de alterações?"

---

## Pergunta 8: Como é o suporte?

Sistema bom é sistema que funciona. Mas quando algo dá errado, o suporte faz toda a diferença.

**O que avaliar:**
- Suporte por WhatsApp, chat, telefone ou só e-mail?
- Tempo médio de resposta
- Horário de funcionamento (24h? Dias úteis?)
- O suporte entende de fonoaudiologia ou é genérico?
- Tem tutoriais e base de conhecimento?

---

## Pergunta 9: É fácil migrar meus dados?

Se você já tem pacientes cadastrados em outro sistema ou em planilhas, a migração é um ponto crítico. Pergunte:

- O sistema importa dados de outras plataformas?
- Aceita importação de planilhas (CSV/Excel)?
- A equipe ajuda na migração ou é por conta própria?
- Dá para exportar meus dados se eu quiser sair?

**Importante:** Desconfie de sistemas que dificultam a exportação. Seus dados são seus.

---

## Pergunta 10: E o futuro? O sistema está evoluindo?

Tecnologia médica muda rápido. Um sistema que não evolui vira legado em 2 anos.

- O sistema recebe atualizações frequentes?
- Tem roadmap público?
- Já tem (ou planeja ter) recursos de IA?
- A empresa é financeiramente sólida?

---

## Tabela de avaliação

Use esta tabela para comparar até 3 sistemas lado a lado. Pontue de 0 a 5 cada critério.

| Critério | Peso | Sistema A | Sistema B | Sistema C |
|----------|:----:|:---------:|:---------:|:---------:|
| 1. Específico para fono | 5 | | | |
| 2. Protocolos nativos | 5 | | | |
| 3. WhatsApp nativo | 4 | | | |
| 4. Relatório escolar | 4 | | | |
| 5. Precificação justa | 3 | | | |
| 6. Gestão financeira | 3 | | | |
| 7. Conformidade CFFa | 4 | | | |
| 8. Suporte | 3 | | | |
| 9. Migração de dados | 2 | | | |
| 10. Inovação futura | 2 | | | |
| **Total** | **35** | | | |

**Como usar:** Multiplique a nota de cada critério pelo peso. Some os resultados. O sistema com maior pontuação é o mais adequado para sua clínica.

---

## CTA: Teste grátis

Depois de ler as 10 perguntas, você já sabe o que procurar. Que tal testar o sistema que nasceu dentro da fonoaudiologia e responde "sim" a todas elas?

**👉 [Faça 7 dias de teste grátis do Evolua](https://app.useevolua.com.br/register)**

Protocolos nativos (MBGR, DOSS, GRBAS), WhatsApp integrado, relatórios automáticos, gestão financeira e conformidade com o CFFa — tudo em um só lugar, por um preço justo.

Sem cartão de crédito. Sem surpresas. Teste e decida.

---

*Este artigo foi escrito pela equipe da Evolua — o CRM inteligente para fonoaudiólogas. Use nosso checklist para avaliar qualquer sistema e descubra por que centenas de fonoaudiólogas já escolheram o Evolua. [useevolua.com.br](https://useevolua.com.br)*
  $markdown$,
  'https://images.pexels.com/photos/4386366/pexels-photo-4386366.jpeg?w=800&q=80',
  'Equipe Evolua',
  'Gestão',
  8,
  FALSE,
  'published',
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM blog_posts WHERE slug = '10-perguntas-sistema-gestao-fonoaudiologia');
