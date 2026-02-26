export type RiskLevel = 'Baixo' | 'Médio' | 'Alto' | 'Crítico';
export type GapSeverity = 'Baixa' | 'Média' | 'Alta' | 'Crítica';
export type GapStatus = 'Aberto' | 'Em andamento' | 'Resolvido';

export interface ReportMeta {
  id: string;
  analyst: string;
  createdAt: string;
  version: string;
  sessionId: string;
  scope: 'valid' | 'out_of_scope';
}

export interface ExecutiveSummaryData {
  score: number;
  riskLevel: RiskLevel;
  totalGaps: number;
  documentTitle: string;
  documentType: string;
  analysisScope: string[];
  strengths: string[];
  attentionPoints: string[];
  scopeWarning?: string;
}

export interface Gap {
  id: string;
  severity: GapSeverity;
  category: string;
  description: string;
  recommendation: string;
  status: GapStatus;
  norm?: string;
}

export interface ActionItem {
  id: string;
  description: string;
  responsible?: string;
  deadline?: string;
  priority: 'Alta' | 'Média' | 'Baixa';
}

export interface ReportData {
  meta: ReportMeta;
  summary: ExecutiveSummaryData;
  gaps: Gap[];
  actions: ActionItem[];
}
