import type { ReportData } from '../types/report';

export const mockReportData: ReportData = {
  meta: {
    id: 'SGN-2026-0226-001',
    analyst: 'Sistema SGN',
    createdAt: '26/02/2026 às 16:57',
    version: '1.0.0',
    sessionId: 'sess_abc123',
    scope: 'out_of_scope',
  },
  summary: {
    score: 100,
    riskLevel: 'Baixo',
    totalGaps: 0,
    documentTitle: 'Sumário Executivo do Plano Mestre do Complexo Portuário de Ilhéus',
    documentType: 'Plano Mestre de Logística',
    analysisScope: ['NR-29', 'NR-7', 'NR-10', 'NR-15', 'NR-30'],
    strengths: [
      'Apresentação detalhada do cenário atual e futuro da infraestrutura portuária.',
      'Identificação clara de gargalos operacionais e logísticos (acesso terrestre e armazenagem).',
    ],
    attentionPoints: [
      'O documento é um plano mestre de logística e não um relatório de SST — não deve ser usado como evidência de conformidade normativa.',
      'A ausência de informações sobre segurança do trabalho não implica conformidade, apenas ausência de dados no escopo do texto.',
    ],
    scopeWarning:
      'Documento fora do escopo de SST. Score e gaps refletem ausência de dados analisáveis, não conformidade real. Solicite os documentos SST específicos para análise aprofundada.',
  },
  gaps: [],
  actions: [
    {
      id: 'ACT-001',
      description:
        'Solicitar os documentos específicos de SST do Complexo Portuário (PGR, PCMSO, PCMAT, etc.) para realizar a análise de conformidade.',
      priority: 'Alta',
    },
    {
      id: 'ACT-002',
      description:
        'Verificar junto à Autoridade Portuária a existência dos Planos de Emergência (PAE, PAM) para análise da NR-29.',
      priority: 'Alta',
    },
  ],
};
