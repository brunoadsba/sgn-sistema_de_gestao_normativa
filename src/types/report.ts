import type {
  ConfidenceClass,
  ReportStatus,
  RevisaoHumana,
} from '@/types/ia'

export type RiskLevel = 'Baixo' | 'Médio' | 'Alto' | 'Crítico'
export type GapSeverity = 'Baixa' | 'Média' | 'Alta' | 'Crítica'
export type GapStatus = 'Aberto' | 'Em andamento' | 'Resolvido'
export type ReportScope = 'valid' | 'out_of_scope'

export interface ReportMeta {
  id: string
  analyst: string
  createdAt: string
  version: string
  sessionId: string
  scope: ReportScope
}

export interface ExecutiveSummaryData {
  score: number
  riskLevel: RiskLevel
  totalGaps: number
  legalStatus: string
  confidenceScore: number
  confidenceClass: ConfidenceClass
  documentTitle: string
  documentType: string
  analysisScope: string[]
  strengths: string[]
  attentionPoints: string[]
  scopeWarning?: string
}

export interface ReportGovernance {
  reportStatus: ReportStatus
  confidenceScore: number
  confidenceClass: ConfidenceClass
  alertasConfiabilidade: string[]
  revisaoHumana?: RevisaoHumana | null
}

export interface ReportGap {
  id: string
  severity: GapSeverity
  category: string
  description: string
  recommendation: string
  status: GapStatus
  norm?: string
}

export interface ActionItem {
  id: string
  description: string
  responsible?: string
  deadline?: string
  priority: 'Alta' | 'Média' | 'Baixa'
}

export interface ReportData {
  meta: ReportMeta
  summary: ExecutiveSummaryData
  governance: ReportGovernance
  gaps: ReportGap[]
  actions: ActionItem[]
}
