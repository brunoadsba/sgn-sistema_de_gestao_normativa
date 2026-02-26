import { toReportData } from '@/lib/ia/report-mapper'
import type { AnaliseConformidadeResponse } from '@/types/ia'

function criarResultadoBase(): AnaliseConformidadeResponse {
  return {
    analiseId: 'analise-123',
    score: 74,
    nivelRisco: 'medio',
    gaps: [
      {
        id: 'gap-1',
        descricao: 'Treinamento admissional incompleto',
        severidade: 'alta',
        categoria: 'Treinamento',
        recomendacao: 'Atualizar trilha de integração',
        prazo: '15 dias',
        prazoDias: 15,
        normasRelacionadas: ['NR-1'],
      },
    ],
    resumo: 'Documento em escopo com evidências suficientes.',
    pontosPositivos: ['Controle de EPI estruturado'],
    pontosAtencao: ['Reforçar rotina de DDS'],
    proximosPassos: ['Atualizar documentação de integração'],
    timestamp: '2026-02-26T19:10:00.000Z',
    modeloUsado: 'glm-4.7',
    tempoProcessamento: 2400,
    reportStatus: 'pre_laudo_pendente',
    confidenceScore: 78,
    confidenceClass: 'confianca_media',
    alertasConfiabilidade: [],
    nomeArquivo: 'Plano_Portuario.pdf',
  }
}

describe('toReportData', () => {
  it('mapeia estrutura principal para relatório', () => {
    const resultado = criarResultadoBase()
    const report = toReportData(resultado, {
      analyst: 'Equipe SST',
      documentType: 'PDF',
    })

    expect(report.meta.id).toBe('analise-123')
    expect(report.meta.scope).toBe('valid')
    expect(report.summary.riskLevel).toBe('Médio')
    expect(report.summary.legalStatus).toBe('Pré-laudo pendente')
    expect(report.summary.confidenceScore).toBe(78)
    expect(report.summary.confidenceClass).toBe('confianca_media')
    expect(report.governance.reportStatus).toBe('pre_laudo_pendente')
    expect(report.gaps[0]?.severity).toBe('Alta')
    expect(report.actions[0]?.deadline).toBe('15 dias')
    expect(report.actions.length).toBeGreaterThan(0)
    expect(report.summary.documentType).toBe('PDF')
  })

  it('marca out_of_scope quando o resumo indicar fora de escopo', () => {
    const resultado = criarResultadoBase()
    resultado.resumo = 'Análise inconclusiva por documento fora de escopo de SST.'
    resultado.gaps = []
    resultado.alertasConfiabilidade = ['Documento possivelmente fora de escopo']

    const report = toReportData(resultado)

    expect(report.meta.scope).toBe('out_of_scope')
    expect(report.summary.scopeWarning).toBeDefined()
  })

  it('preenche plano de ação a partir dos gaps quando planoAcao não existe', () => {
    const resultado = criarResultadoBase()
    resultado.proximosPassos = []
    resultado.gaps = [
      {
        id: 'gap-x',
        descricao: 'Ausência de controle formal',
        severidade: 'critica',
        categoria: 'Documentação',
        recomendacao: 'Formalizar procedimento e evidências',
        prazo: '7 dias',
        prazoDias: 7,
        responsavelSugerido: 'SESMT',
      },
    ]

    const report = toReportData(resultado)
    expect(report.actions).toHaveLength(1)
    expect(report.actions[0]?.priority).toBe('Alta')
    expect(report.actions[0]?.responsible).toBe('SESMT')
    expect(report.actions[0]?.deadline).toBe('7 dias')
  })
})
