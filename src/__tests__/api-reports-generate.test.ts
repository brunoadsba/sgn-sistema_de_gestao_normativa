/**
 * @jest-environment node
 */
import { POST } from '@/app/api/reports/generate/route'
import { generateReportPdf } from '@/services/reportService'

jest.mock('@/services/reportService', () => ({
  generateReportPdf: jest.fn(),
}))

describe('POST /api/reports/generate', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('retorna PDF binário quando payload é válido', async () => {
    ;(generateReportPdf as jest.Mock).mockResolvedValue({
      buffer: Buffer.from('fake-pdf'),
      filename: 'SGN_Relatorio_TESTE_20260226.pdf',
      contentType: 'application/pdf',
    })

    const request = new Request('http://localhost/api/reports/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        meta: {
          id: 'TESTE',
          analyst: 'Equipe',
          createdAt: '26/02/2026 16:00',
          version: '2.2.16',
          sessionId: 'sessao-1',
          scope: 'valid',
        },
        summary: {
          score: 80,
          riskLevel: 'Médio',
          totalGaps: 1,
          legalStatus: 'Pré-laudo pendente',
          confidenceScore: 80,
          confidenceClass: 'confianca_media',
          documentTitle: 'Documento SST',
          documentType: 'OUTRO',
          analysisScope: ['NR-1'],
          strengths: ['Ponto forte'],
          attentionPoints: ['Atenção'],
        },
        governance: {
          reportStatus: 'pre_laudo_pendente',
          confidenceScore: 80,
          confidenceClass: 'confianca_media',
          alertasConfiabilidade: [],
          revisaoHumana: null,
        },
        gaps: [
          {
            id: 'gap-1',
            severity: 'Alta',
            category: 'Treinamento',
            description: 'Gap de integração',
            recommendation: 'Atualizar procedimento',
            status: 'Aberto',
          },
        ],
        actions: [
          {
            id: 'ACT-001',
            description: 'Executar ação corretiva',
            priority: 'Alta',
          },
        ],
      }),
    })

    const response = await POST(request as never)

    expect(response.status).toBe(200)
    expect(response.headers.get('Content-Type')).toBe('application/pdf')
    expect(response.headers.get('Content-Disposition')).toContain('SGN_Relatorio_TESTE_20260226.pdf')
    expect(generateReportPdf).toHaveBeenCalledTimes(1)
  })

  it('retorna 400 para payload inválido', async () => {
    const request = new Request('http://localhost/api/reports/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ meta: { id: '' } }),
    })

    const response = await POST(request as never)
    const payload = await response.json()

    expect(response.status).toBe(400)
    expect(payload.error).toContain('Payload inválido')
    expect(generateReportPdf).not.toHaveBeenCalled()
  })
})
