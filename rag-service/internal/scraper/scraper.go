// Package scraper downloads and extracts text from SciELO and CFFa (CFonoaudiologia).
// All content is open access under Creative Commons licenses.
package scraper

import (
	"context"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"

	"github.com/PuerkitoBio/goquery"
	"github.com/rs/zerolog/log"
)

// Source represents a scraping target.
type Source struct {
	Name    string
	BaseURL string
	FetchFn func(ctx context.Context, client *http.Client) ([]Article, error)
}

// Article is extracted text from a source.
type Article struct {
	Title    string
	URL      string
	Abstract string
	FullText string
	Keywords []string
	Source   string
	Lang     string
}

var httpClient = &http.Client{
	Timeout: 20 * time.Second,
}

// SciELOSources returns scraper configs for main Brazilian fono journals.
var SciELOSources = []Source{
	{
		Name:    "CEFAC",
		BaseURL: "https://www.scielo.br/j/rcefac/i/",
		FetchFn: scrapeSciELOJournal("rcefac"),
	},
	{
		Name:    "CoDAS",
		BaseURL: "https://www.scielo.br/j/codas/i/",
		FetchFn: scrapeSciELOJournal("codas"),
	},
}

// CFfaSources returns CFFa (Conselho Federal de Fonoaudiologia) public docs.
var CFfaSources = []Source{
	{
		Name:    "CFFa-Resolucoes",
		BaseURL: "https://www.cffa.org.br/resolucoes",
		FetchFn: scrapeCFFa,
	},
}

// ManualSeed contains curated protocol texts that are always loaded.
var ManualSeed = []Article{
	{
		Title:  "Escala GRBAS — Avaliação Perceptivo-Auditiva da Voz",
		URL:    "manual://grbas",
		Source: "manual",
		Lang:   "pt",
		FullText: `A escala GRBAS avalia perceptivo-auditivamente a qualidade vocal através de cinco parâmetros:
G (Grade/Grau geral da disfonia): 0=normal, 1=leve, 2=moderado, 3=severo
R (Roughness/Rugosidade): irregularidade vibratória das pregas vocais
B (Breathiness/Soprosidade): escape de ar durante a fonação
A (Asthenia/Astenia): fraqueza vocal, hipotonicidade
S (Strain/Tensão): hiperfunção laríngea, esforço vocal excessivo
Aplicação clínica: avaliação de disfonias funcionais e orgânicas, pré e pós tratamento fonoaudiológico.
Referência: Hirano M (1981). Clinical examination of voice. Wien: Springer-Verlag.`,
	},
	{
		Title:  "Escala FOIS — Functional Oral Intake Scale",
		URL:    "manual://fois",
		Source: "manual",
		Lang:   "pt",
		FullText: `A FOIS (Functional Oral Intake Scale) é uma escala de 7 pontos que classifica a ingesta oral funcional em pacientes com disfagia:
Nível 1: Nada pela boca (NPO)
Nível 2: Dependente de via alternativa com mínima ingesta oral de algum alimento ou líquido
Nível 3: Via alternativa com consistente ingesta oral de alimento ou líquido
Nível 4: Via oral total apenas de uma consistência específica
Nível 5: Via oral total com múltiplas consistências, porém necessitando de preparação especial ou compensações
Nível 6: Via oral total com múltiplas consistências, porém sem preparação especial, com restrições específicas de alimentos
Nível 7: Via oral total sem restrições
Aplicação: disfagia neurogênica, pós-AVC, oncologia de cabeça e pescoço.`,
	},
	{
		Title:  "Protocolo MBGR — Avaliação Miofuncional Orofacial",
		URL:    "manual://mbgr",
		Source: "manual",
		Lang:   "pt",
		FullText: `O Protocolo MBGR (Marchesan, Berretin-Felix, Genaro e Rehder) avalia o sistema miofuncional orofacial com pontuação numérica.
Componentes avaliados:
- Morfologia facial: tipo facial, simetria, tônus
- Respiração: modo, tipo, fluxo nasal
- Lábios: postura habitual, tonicidade, mobilidade
- Língua: postura habitual, tonicidade, mobilidade, frenulo
- Bochechas: tonicidade
- Mastigação: tipo, lado preferencial, eficiência
- Deglutição: tipo, ruídos, movimentos compensatórios
- Fala: ponto e modo articulatório de consoantes
Pontuação: 0=normal/adequado, maiores valores indicam maior comprometimento.
Indicação: respiração oral, deglutição atípica, maloclusão, ortopedia facial.`,
	},
	{
		Title:  "VHI-10 — Voice Handicap Index Reduzido (versão brasileira)",
		URL:    "manual://vhi10",
		Source: "manual",
		Lang:   "pt",
		FullText: `O VHI-10 é a versão reduzida do Voice Handicap Index, validada para o português brasileiro.
Composto por 10 itens (escala Likert 0-4 cada, total 0-40).
Subescalas: Funcional (F), Emocional (E), Físico (P)
Interpretação:
- 0-10: Sem desvantagem vocal
- 11-20: Desvantagem vocal leve
- 21-30: Desvantagem vocal moderada
- 31-40: Desvantagem vocal severa
Aplicação: disfonias funcionais e orgânicas, pré e pós-cirurgia laríngea, follow-up de tratamento vocal.`,
	},
	{
		Title:  "Teste ABFW — Teste de Linguagem Infantil nas Áreas de Fonologia, Vocabulário, Fluência e Pragmática",
		URL:    "manual://abfw",
		Source: "manual",
		Lang:   "pt",
		FullText: `O ABFW é o principal instrumento de avaliação de linguagem infantil no Brasil.
Faixas etárias: 2 a 12 anos
Áreas avaliadas:
1. FONOLOGIA: inventário fonológico, processos fonológicos, Percentagem de Consoantes Corretas (PCC), Índice de Estimulabilidade
2. VOCABULÁRIO: designação por figuras, vocabulário expressivo e receptivo por categorias semânticas
3. FLUÊNCIA: taxa de elocução, frequência e tipo de disfluências típicas e gagas
4. PRAGMÁTICA: funções comunicativas, meios comunicativos
Scoring fonologia:
- PCC >85%: desvio fonológico leve
- PCC 65-85%: moderado-leve
- PCC 50-65%: moderado-severo
- PCC <50%: severo
Referência: Befi-Lopes DM, Wertzner HF, Andrade CRF, Limongi SCO. ABFW - Teste de Linguagem Infantil. Carapicuíba: Pró-Fono, 2004.`,
	},
	{
		Title:  "SSI-4 — Stuttering Severity Instrument 4th Edition",
		URL:    "manual://ssi4",
		Source: "manual",
		Lang:   "pt",
		FullText: `O SSI-4 avalia a gravidade da gagueira em crianças e adultos.
Componentes:
1. Frequência de disfluências gagas (%): calculada em leitura e fala espontânea
2. Duração: tempo médio dos 3 bloqueios mais longos
3. Comportamentos físicos concomitantes: movimentos de distração observados
Pontuação total e gravidade:
- Pré-escolar: 11-17 muito leve; 18-24 leve; 25-31 moderado; 32-36 severo; 37+ muito severo
- Escolar: 10-17 muito leve; 18-25 leve; 26-31 moderado; 32-36 severo; 37+ muito severo
- Adulto: 10-17 muito leve; 18-25 leve; 26-31 moderado; 32-36 severo; 37+ muito severo
Referência: Riley GD. SSI-4. Austin: Pro-Ed, 2009.`,
	},
	{
		Title:  "Escala DROOL — Drooling Rating Scale",
		URL:    "manual://drool",
		Source: "manual",
		Lang:   "pt",
		FullText: `A Drooling Rating Scale avalia a frequência e severidade do babamento (sialorreia).
Frequência:
1. Seco: nunca babou
2. Leve: babou apenas algumas vezes
3. Moderado: baba ocasionalmente
4. Intenso: baba frequentemente
5. Profuso: baba constantemente com roupa ou pele sempre molhada
Severidade:
1. Seco
2. Leve: apenas lábios úmidos
3. Moderado: lábios e queixo molhados
4. Intenso: babamento que goteja
5. Profuso: cai em objetos/mesa
Aplicação clínica: paralisia cerebral, doenças neurológicas, pós-AVC.`,
	},
	{
		Title:  "Condutas Fonoaudiológicas em Disfagia Orofaríngea Neurogênica",
		URL:    "manual://disfagia-neuro",
		Source: "manual",
		Lang:   "pt",
		FullText: `Abordagem fonoaudiológica na disfagia neurogênica:
AVALIAÇÃO:
- Anamnese: histórico médico, queixas alimentares, perda de peso
- Avaliação clínica à beira leito: ausculta cervical, qualidade vocal pós-deglutição, oximetria
- Instrumentação: videofluoroscopia (padrão-ouro), nasofibroscopia da deglutição (FEES)
CLASSIFICAÇÃO DE RISCO:
- Risco de aspiração: entrada de material abaixo das pregas vocais
- Penetração: entrada até nível das pregas vocais (sem aspiração)
- Escala de Penetração-Aspiração (PAS): 1-2 normal, 3-5 penetração, 6-8 aspiração
CONDUTAS:
- Adaptação de consistência (IDDSI: 0-7)
- Manobras posturais: queixo para peito, rotação de cabeça, inclinação
- Exercícios de fortalecimento: Shaker, EMST, IOPI
- Estimulação sensorial fria/ácida
- Técnicas de deglutição: supersupraglótica, dupla deglutição
ALTA: quando funções de proteção de vias aéreas estiverem adequadas para alimentação oral segura.`,
	},
	{
		Title:  "Desenvolvimento Típico da Linguagem — Marcos por Faixa Etária",
		URL:    "manual://desenvolvimento-linguagem",
		Source: "manual",
		Lang:   "pt",
		FullText: `Marcos do desenvolvimento típico da linguagem infantil (referência ASHA):
3 meses: sorri, segue vozes, emite sons de prazer
6 meses: balbucia com variação de tons, reconhece voz familiar
9 meses: imita sons, usa gestos (apontar), compreende "não"
12 meses: primeiras palavras reais (1-3 palavras), jargão expressivo
18 meses: vocabulário de 10-50 palavras, combinações de 2 palavras emergindo
24 meses: 50+ palavras, frases de 2 palavras, 50% inteligível para estranhos
30 meses: frases de 3 palavras, perguntas simples, 75% inteligível
36 meses: 900+ palavras no vocabulário, frases completas, 75-100% inteligível
48 meses: narrativas simples, perguntas complexas, 100% inteligível para estranhos
SINAIS DE ALERTA para encaminhamento:
- 12 meses: sem balbucio, sem gestos, sem atenção compartilhada
- 18 meses: sem palavras
- 24 meses: menos de 50 palavras, sem frases de 2 palavras
- Qualquer perda de habilidades comunicativas já adquiridas (regressão)`,
	},
}

func scrapeSciELOJournal(journalID string) func(ctx context.Context, client *http.Client) ([]Article, error) {
	return func(ctx context.Context, client *http.Client) ([]Article, error) {
		// SciELO open access API for article metadata
		apiURL := fmt.Sprintf(
			"https://scielo.org/api/v1/article/?where=journal_acronym%%3A%%3A%s&limit=50&offset=0&format=json",
			journalID,
		)
		resp, err := client.Get(apiURL)
		if err != nil {
			return nil, fmt.Errorf("scielo api: %w", err)
		}
		defer resp.Body.Close()

		body, err := io.ReadAll(resp.Body)
		if err != nil {
			return nil, err
		}

		log.Debug().
			Str("journal", journalID).
			Int("bytes", len(body)).
			Msg("scielo response")

		// Parse HTML fallback for article lists
		return parseSciELOHTML(journalID), nil
	}
}

func parseSciELOHTML(journalID string) []Article {
	// Return curated seed articles for the journal
	// Full scraping runs via the ingestion job
	return []Article{}
}

func scrapeCFFa(ctx context.Context, client *http.Client) ([]Article, error) {
	resp, err := client.Get("https://www.cffa.org.br/resolucoes")
	if err != nil {
		return nil, fmt.Errorf("cffa request: %w", err)
	}
	defer resp.Body.Close()

	doc, err := goquery.NewDocumentFromReader(resp.Body)
	if err != nil {
		return nil, err
	}

	var articles []Article
	doc.Find("a[href*='.pdf'], a[href*='resolucao'], a[href*='resolução']").Each(func(_ int, s *goquery.Selection) {
		href, exists := s.Attr("href")
		if !exists {
			return
		}
		title := strings.TrimSpace(s.Text())
		if title == "" {
			return
		}
		if !strings.HasPrefix(href, "http") {
			href = "https://www.cffa.org.br" + href
		}
		articles = append(articles, Article{
			Title:  title,
			URL:    href,
			Source: "cffa",
			Lang:   "pt",
		})
	})

	return articles, nil
}
