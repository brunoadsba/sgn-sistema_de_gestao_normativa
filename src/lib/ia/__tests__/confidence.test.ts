import { calcularConfiancaAnalise } from '@/lib/ia/confidence'
import { inferirNormasHeuristicas, jaccardNormas } from '@/lib/ia/nr-heuristics'

describe('confidence score composto', () => {
  it('deve classificar como alta com sinais consistentes', () => {
    const resultado = calcularConfiancaAnalise({
      parseOk: true,
      nrConcordancia: 0.8,
      totalGaps: 3,
      gapsComEvidencia: 3,
      totalNormas: 3,
      kbMissingNormas: [],
      fallbackTriggered: false,
    })

    expect(resultado.confidenceClass).toBe('confianca_alta')
    expect(resultado.confidenceScore).toBeGreaterThanOrEqual(80)
    expect(resultado.alertasConfiabilidade).toHaveLength(0)
  })

  it('deve classificar como baixa com múltiplos sinais de risco', () => {
    const resultado = calcularConfiancaAnalise({
      parseOk: false,
      nrConcordancia: 0.2,
      totalGaps: 5,
      gapsComEvidencia: 2,
      totalNormas: 4,
      kbMissingNormas: ['NR-12', 'NR-35'],
      fallbackTriggered: true,
    })

    expect(resultado.confidenceClass).toBe('confianca_baixa')
    expect(resultado.confidenceScore).toBeLessThan(60)
    expect(resultado.alertasConfiabilidade.length).toBeGreaterThan(0)
  })
})

describe('heurística de NRs', () => {
  it('deve inferir NR-35 e NR-6 quando houver sinais claros no texto', () => {
    const texto = 'Trabalho em altura com uso de cinto de segurança, capacete e luva para equipe de manutenção.'
    const normas = inferirNormasHeuristicas(texto, 'OUTRO')

    expect(normas).toEqual(expect.arrayContaining(['nr-1', 'nr-6', 'nr-35']))
  })

  it('deve calcular jaccard corretamente', () => {
    const jaccard = jaccardNormas(['nr-1', 'nr-6'], ['nr-1', 'nr-35'])
    expect(jaccard).toBeCloseTo(1 / 3, 4)
  })
})
