import type {
  AnaliseConformidadeResponse,
  GapConformidade,
  ReportStatus,
} from '@/types/ia'
import type {
  ActionItem,
  GapSeverity,
  ReportData,
  ReportGap,
  RiskLevel,
} from '@/types/report'

type MapReportOptions = {
  analyst?: string
  version?: string
  sessionId?: string
  documentTitle?: string
  documentType?: string
  analysisScope?: string[]
}

function mapRiskLevel(nivel: AnaliseConformidadeResponse['nivelRisco']): RiskLevel {
  if (nivel === 'baixo') return 'Baixo'
  if (nivel === 'medio') return 'Médio'
  if (nivel === 'alto') return 'Alto'
  return 'Crítico'
}

function mapGapSeverity(severidade: GapConformidade['severidade']): GapSeverity {
  if (severidade === 'baixa') return 'Baixa'
  if (severidade === 'media') return 'Média'
  if (severidade === 'alta') return 'Alta'
  return 'Crítica'
}

function mapGapStatus(reportStatus: ReportStatus): 'Aberto' | 'Em andamento' | 'Resolvido' {
  if (reportStatus === 'laudo_aprovado') return 'Em andamento'
  if (reportStatus === 'laudo_rejeitado') return 'Aberto'
  return 'Aberto'
}

function mapLegalStatus(reportStatus: ReportStatus): string {
  if (reportStatus === 'laudo_aprovado') return 'Laudo Aprovado'
  if (reportStatus === 'laudo_rejeitado') return 'Laudo Rejeitado'
  return 'Pré-laudo pendente'
}

function extractNormFromGap(gap: GapConformidade): string | undefined {
  const fromRelacionadas = gap.normasRelacionadas?.find((item) => item.trim().length > 0)
  if (fromRelacionadas) return fromRelacionadas
  const fromEvidencia = gap.evidencias?.find((item) => item.normaCodigo.trim().length > 0)?.normaCodigo
  return fromEvidencia
}

function extractAnalysisScope(
  resultado: AnaliseConformidadeResponse,
  explicitScope?: string[]
): string[] {
  if (explicitScope && explicitScope.length > 0) {
    return Array.from(new Set(explicitScope.map((item) => item.toUpperCase())))
  }

  const scopeFromGaps = resultado.gaps
    .flatMap((gap) => {
      const fromRelacionadas = gap.normasRelacionadas ?? []
      const fromEvidencias = gap.evidencias?.map((ev) => ev.normaCodigo) ?? []
      return [...fromRelacionadas, ...fromEvidencias]
    })
    .filter((item) => item.trim().length > 0)
    .map((item) => item.toUpperCase())

  return Array.from(new Set(scopeFromGaps.length > 0 ? scopeFromGaps : ['NR-1']))
}

function toActionItems(resultado: AnaliseConformidadeResponse): ActionItem[] {
  if (resultado.planoAcao && resultado.planoAcao.length > 0) {
    return resultado.planoAcao.map((item) => ({
      id: item.id,
      description: item.what,
      responsible: item.who,
      deadline: `${item.prazoDias} dias`,
      priority: item.prazoDias <= 7 ? 'Alta' : item.prazoDias <= 30 ? 'Média' : 'Baixa',
    }))
  }

  if (resultado.gaps.length > 0) {
    return resultado.gaps.slice(0, 12).map((gap, index) => {
      const action: ActionItem = {
        id: gap.id || `ACT-${String(index + 1).padStart(3, '0')}`,
        description: gap.recomendacao || gap.descricao,
        priority:
          gap.severidade === 'critica' || gap.severidade === 'alta'
            ? 'Alta'
            : gap.severidade === 'media'
              ? 'Média'
              : 'Baixa',
      }
      if (gap.responsavelSugerido) action.responsible = gap.responsavelSugerido
      if (gap.prazoDias != null) action.deadline = `${gap.prazoDias} dias`
      return action
    })
  }

  return (resultado.proximosPassos ?? []).map((passo, index) => ({
    id: `ACT-${String(index + 1).padStart(3, '0')}`,
    description: passo,
    priority: index === 0 ? 'Alta' : index < 3 ? 'Média' : 'Baixa',
  }))
}

function inferOutOfScope(resultado: AnaliseConformidadeResponse): boolean {
  const resumo = (resultado.resumo ?? '').toLowerCase()
  if (resumo.includes('fora de escopo') || resumo.includes('inconclusivo')) return true
  return resultado.gaps.length === 0 && (resultado.alertasConfiabilidade?.length ?? 0) > 0
}

function buildScopeWarning(resultado: AnaliseConformidadeResponse): string | undefined {
  if (!inferOutOfScope(resultado)) return undefined
  return (
    'Documento potencialmente fora do escopo de SST. ' +
    'Score e gaps podem refletir ausência de dados auditáveis, não conformidade real.'
  )
}

function mapGaps(resultado: AnaliseConformidadeResponse): ReportGap[] {
  const reportStatus = resultado.reportStatus ?? 'pre_laudo_pendente'

  return resultado.gaps.map((gap, index) => {
    const mapped: ReportGap = {
      id: gap.id || `GAP-${String(index + 1).padStart(3, '0')}`,
      severity: mapGapSeverity(gap.severidade),
      category: gap.categoria || 'Geral',
      description: gap.descricao,
      recommendation: gap.recomendacao,
      status: mapGapStatus(reportStatus),
    }
    const norm = extractNormFromGap(gap)
    if (norm) mapped.norm = norm
    return mapped
  })
}

export function toReportData(
  resultado: AnaliseConformidadeResponse,
  options: MapReportOptions = {}
): ReportData {
  const reportStatus = resultado.reportStatus ?? 'pre_laudo_pendente'
  const confidenceClass = resultado.confidenceClass ?? 'confianca_baixa'
  const createdAt = new Date(resultado.timestamp || Date.now()).toLocaleString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
  })
  const analysisScope = extractAnalysisScope(resultado, options.analysisScope)
  const scopeWarning = buildScopeWarning(resultado)
  const summary: ReportData['summary'] = {
    score: resultado.score,
    riskLevel: mapRiskLevel(resultado.nivelRisco),
    totalGaps: resultado.gaps.length,
    legalStatus: mapLegalStatus(reportStatus),
    confidenceScore: resultado.confidenceScore ?? 0,
    confidenceClass,
    documentTitle: options.documentTitle ?? resultado.nomeArquivo ?? 'Relatório Técnico SST',
    documentType: options.documentType ?? 'OUTRO',
    analysisScope,
    strengths: resultado.pontosPositivos ?? [],
    attentionPoints: resultado.pontosAtencao ?? [],
  }
  if (scopeWarning) summary.scopeWarning = scopeWarning

  return {
    meta: {
      id: resultado.analiseId ?? `SGN-${Date.now()}`,
      analyst: options.analyst ?? 'Sistema SGN',
      createdAt,
      version: options.version ?? '2.2.16',
      sessionId: options.sessionId ?? resultado.jobId ?? 'sessao-local',
      scope: inferOutOfScope(resultado) ? 'out_of_scope' : 'valid',
    },
    summary,
    governance: {
      reportStatus,
      confidenceScore: resultado.confidenceScore ?? 0,
      confidenceClass,
      alertasConfiabilidade: resultado.alertasConfiabilidade ?? [],
      revisaoHumana: resultado.revisaoHumana ?? null,
    },
    gaps: mapGaps(resultado),
    actions: toActionItems(resultado),
  }
}
