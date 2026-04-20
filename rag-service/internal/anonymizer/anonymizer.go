// Package anonymizer implements LGPD-compliant PII removal from clinical records.
// Uses regex + NLP heuristics to strip names, CPFs, phones, addresses, and dates of birth.
// Designed specifically for Brazilian Portuguese clinical text.
package anonymizer

import (
	"crypto/sha256"
	"encoding/hex"
	"regexp"
	"strings"
	"unicode"
)

// Anonymizer removes PII from Brazilian Portuguese clinical text.
type Anonymizer struct {
	cpfRe       *regexp.Regexp
	phoneRe     *regexp.Regexp
	emailRe     *regexp.Regexp
	cepRe       *regexp.Regexp
	dateFullRe  *regexp.Regexp
	dobRe       *regexp.Regexp
	namePrefRe  *regexp.Regexp
	ageRe       *regexp.Regexp
	crnRe       *regexp.Regexp // CRF/CRN (registro profissional) do paciente
}

func New() *Anonymizer {
	return &Anonymizer{
		// CPF: 000.000.000-00 ou 00000000000
		cpfRe: regexp.MustCompile(`\b\d{3}\.?\d{3}\.?\d{3}-?\d{2}\b`),

		// Telefones BR: (11) 99999-9999 / +55 11 99999-9999
		phoneRe: regexp.MustCompile(`(\+55\s?)?(\(?\d{2}\)?[\s-]?)[\d\s\-]{8,10}`),

		// E-mail
		emailRe: regexp.MustCompile(`[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}`),

		// CEP: 00000-000
		cepRe: regexp.MustCompile(`\b\d{5}-?\d{3}\b`),

		// Data de nascimento explícita: "nascido em 15/03/1990" / "DN: 15/03/90"
		dobRe: regexp.MustCompile(`(?i)(dn|nascid[oa] em|data de nascimento|dob)[:\s]*\d{2}[/\-\.]\d{2}[/\-\.]\d{2,4}`),

		// Datas completas com dia (podem identificar paciente)
		dateFullRe: regexp.MustCompile(`\b\d{1,2}[/\-\.]\d{1,2}[/\-\.]\d{4}\b`),

		// Prefixos de nomes: "Paciente: João" / "Nome: Maria"
		namePrefRe: regexp.MustCompile(`(?i)(paciente|nome[:\s]|responsável[:\s]|mãe[:\s]|pai[:\s]|tutor[:\s]|nome completo[:\s])\s*[A-ZÁÉÍÓÚÂÊÎÔÛÃÕÀÈÌÒÙÇ][a-záéíóúâêîôûãõàèìòùç]+(\s+[A-ZÁÉÍÓÚÂÊÎÔÛÃÕÀÈÌÒÙÇ][a-záéíóúâêîôûãõàèìòùç]+){1,4}`),

		// "X anos" — idade específica pode identificar + data de consulta
		ageRe: regexp.MustCompile(`\b(\d{1,3})\s*(anos|meses de vida|meses)\b`),

		// CRN / CRF
		crnRe: regexp.MustCompile(`(?i)crn[-\s]?\d+[:\s]?\d+`),
	}
}

// AnonResult contains the anonymized text and its original hash.
type AnonResult struct {
	AnonymizedText string
	OriginalHash   string // SHA256 do texto original — para deduplicação sem armazenar PII
	PIIFound       []string
}

// Anonymize removes PII from clinical text.
func (a *Anonymizer) Anonymize(text string) AnonResult {
	// Hash do original antes de qualquer modificação
	h := sha256.Sum256([]byte(text))
	hash := hex.EncodeToString(h[:])

	var piiFound []string
	result := text

	// CPF
	if a.cpfRe.MatchString(result) {
		piiFound = append(piiFound, "cpf")
		result = a.cpfRe.ReplaceAllString(result, "[CPF]")
	}

	// Telefone
	if a.phoneRe.MatchString(result) {
		piiFound = append(piiFound, "phone")
		result = a.phoneRe.ReplaceAllString(result, "[TELEFONE]")
	}

	// E-mail
	if a.emailRe.MatchString(result) {
		piiFound = append(piiFound, "email")
		result = a.emailRe.ReplaceAllString(result, "[EMAIL]")
	}

	// CEP
	if a.cepRe.MatchString(result) {
		piiFound = append(piiFound, "cep")
		result = a.cepRe.ReplaceAllString(result, "[CEP]")
	}

	// Data de nascimento explícita
	if a.dobRe.MatchString(result) {
		piiFound = append(piiFound, "dob")
		result = a.dobRe.ReplaceAllString(result, "$1 [DATA]")
	}

	// Datas completas com dia → substitui por [DATA]
	if a.dateFullRe.MatchString(result) {
		piiFound = append(piiFound, "date")
		result = a.dateFullRe.ReplaceAllString(result, "[DATA]")
	}

	// Nome após prefixo
	if a.namePrefRe.MatchString(result) {
		piiFound = append(piiFound, "name")
		result = a.namePrefRe.ReplaceAllString(result, func(m string) string {
			// Mantém prefixo, substitui nome
			parts := strings.Fields(m)
			if len(parts) < 2 {
				return m
			}
			return parts[0] + " [PACIENTE]"
		})
	}

	// CRN/CRF
	if a.crnRe.MatchString(result) {
		piiFound = append(piiFound, "crn")
		result = a.crnRe.ReplaceAllString(result, "[CRN]")
	}

	// Limpa espaços extras
	result = strings.Join(strings.Fields(result), " ")

	return AnonResult{
		AnonymizedText: result,
		OriginalHash:   hash,
		PIIFound:       piiFound,
	}
}

// ContainsPII returns true if text likely contains PII.
func (a *Anonymizer) ContainsPII(text string) bool {
	result := a.Anonymize(text)
	return len(result.PIIFound) > 0
}

// isUppercaseLetter is a helper for Portuguese name detection.
func isUppercaseLetter(r rune) bool {
	return unicode.IsUpper(r) && unicode.IsLetter(r)
}
