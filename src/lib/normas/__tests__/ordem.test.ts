import { normalizarCodigoNr, ordenarCodigosNr } from '@/lib/normas/ordem'

describe('ordenação de NRs', () => {
  it('normaliza códigos para formato NR-{numero}', () => {
    expect(normalizarCodigoNr('nr 07')).toBe('NR-7')
    expect(normalizarCodigoNr('NR-10')).toBe('NR-10')
  })

  it('ordena sempre em ordem crescente numérica', () => {
    const ordenadas = ordenarCodigosNr(['NR-1', 'NR-29', 'NR-7', 'NR-10', 'NR-15', 'NR-30'])
    expect(ordenadas).toEqual(['NR-1', 'NR-7', 'NR-10', 'NR-15', 'NR-29', 'NR-30'])
  })

  it('remove duplicadas mesmo com formatos diferentes', () => {
    const ordenadas = ordenarCodigosNr(['nr-6', 'NR 6', 'NR-1'])
    expect(ordenadas).toEqual(['NR-1', 'NR-6'])
  })
})
