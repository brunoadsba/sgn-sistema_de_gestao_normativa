import { inferirNormasHeuristicas } from '@/lib/ia/nr-heuristics'
import {
  montarSystemPromptEspecialista,
  selecionarPerfilEspecialista,
  selecionarPerfilPorRequest,
} from '@/lib/ia/specialist-agent'

describe('specialist agent profiles', () => {
  it('deve selecionar perfil portuário por contexto textual', () => {
    const profile = selecionarPerfilEspecialista({
      documento: 'Operação no terminal portuário com descarga de navio no cais',
      tipoDocumento: 'OUTRO',
    })

    expect(profile.id).toBe('sst-portuario')
  })

  it('deve selecionar perfil portuário por NR explícita no request', () => {
    const profile = selecionarPerfilPorRequest({
      documento: 'Documento técnico',
      tipoDocumento: 'OUTRO',
      normasAplicaveis: ['NR-29', 'NR-1'],
    })

    expect(profile.id).toBe('sst-portuario')
  })

  it('deve incluir diretriz de NR-29 no prompt de sugestão', () => {
    const profile = selecionarPerfilEspecialista({ documento: 'porto', tipoDocumento: 'OUTRO' })
    const prompt = montarSystemPromptEspecialista('sugerir_nrs', profile)
    expect(prompt.toLowerCase()).toContain('nr-29')
  })
})

describe('heurística normativa portuária', () => {
  it('deve inferir NR-29 para texto com sinais de porto', () => {
    const normas = inferirNormasHeuristicas(
      'Plano de operação do complexo portuário com movimentação de cargas no cais.',
      'OUTRO'
    )
    expect(normas).toContain('nr-29')
  })
})
