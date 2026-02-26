import type { ConfidenceClass, ConfidenceSignals } from '@/types/ia'

type ConfidenceInput = {
  parseOk: boolean
  nrConcordancia: number
  totalGaps: number
  gapsComEvidencia: number
  totalNormas: number
  kbMissingNormas: string[]
  fallbackTriggered: boolean
}

type ConfidenceOutput = {
  confidenceScore: number
  confidenceClass: ConfidenceClass
  confidenceSignals: ConfidenceSignals
  alertasConfiabilidade: string[]
}

function scoreNrConcordancia(jaccard: number): number {
  if (jaccard >= 0.7) return 20
  if (jaccard >= 0.4) return 10
  return 0
}

function scoreEvidenceCoverage(totalGaps: number, gapsComEvidencia: number): number {
  if (totalGaps === 0) return 35
  const coverage = gapsComEvidencia / Math.max(totalGaps, 1)
  if (coverage >= 1) return 35
  if (coverage >= 0.8) return 20
  return 0
}

function scoreKbCoverage(totalNormas: number, missingNormas: string[]): number {
  if (totalNormas <= 0) return 0
  if (missingNormas.length === 0) return 15
  if (missingNormas.length < totalNormas) return 5
  return 0
}

function scoreProviderStability(fallbackTriggered: boolean): number {
  return fallbackTriggered ? 8 : 15
}

function classificarConfianca(score: number): ConfidenceClass {
  if (score >= 80) return 'confianca_alta'
  if (score >= 60) return 'confianca_media'
  return 'confianca_baixa'
}

function montarAlertas(
  parseOk: boolean,
  nrConcordancia: number,
  gapsComEvidencia: number,
  totalGaps: number,
  kbMissingNormas: string[],
  fallbackTriggered: boolean
): string[] {
  const alertas: string[] = []
  if (!parseOk) {
    alertas.push('Falha de parse detectada em uma etapa da análise automatizada.')
  }
  if (nrConcordancia < 0.4) {
    alertas.push('Baixa concordância entre inferência de normas por IA e heurística.')
  }
  if (totalGaps > 0 && gapsComEvidencia < totalGaps) {
    alertas.push('Nem todos os gaps mantiveram evidência normativa válida.')
  }
  if (kbMissingNormas.length > 0) {
    alertas.push(`Base normativa local incompleta para: ${kbMissingNormas.join(', ')}.`)
  }
  if (fallbackTriggered) {
    alertas.push('Análise executada com fallback de provider IA; revisar consistência do resultado.')
  }
  return alertas
}

export function calcularConfiancaAnalise(input: ConfidenceInput): ConfidenceOutput {
  const parseScore = input.parseOk ? 15 : 0
  const nrScore = scoreNrConcordancia(input.nrConcordancia)
  const evidenceScore = scoreEvidenceCoverage(input.totalGaps, input.gapsComEvidencia)
  const kbScore = scoreKbCoverage(input.totalNormas, input.kbMissingNormas)
  const providerScore = scoreProviderStability(input.fallbackTriggered)

  const confidenceScore = parseScore + nrScore + evidenceScore + kbScore + providerScore
  const confidenceClass = classificarConfianca(confidenceScore)

  return {
    confidenceScore,
    confidenceClass,
    confidenceSignals: {
      parseOk: input.parseOk,
      nrConcordancia: input.nrConcordancia,
      evidenceCoverage: input.totalGaps > 0 ? Number((input.gapsComEvidencia / input.totalGaps).toFixed(4)) : 1,
      kbCoverage:
        input.totalNormas > 0
          ? Number(((input.totalNormas - input.kbMissingNormas.length) / input.totalNormas).toFixed(4))
          : 0,
      providerStability: providerScore,
    },
    alertasConfiabilidade: montarAlertas(
      input.parseOk,
      input.nrConcordancia,
      input.gapsComEvidencia,
      input.totalGaps,
      input.kbMissingNormas,
      input.fallbackTriggered
    ),
  }
}
