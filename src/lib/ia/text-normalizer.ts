import { AnaliseConformidadeResponse, GapConformidade, AcaoPlano5W2H } from '@/types/ia'

/**
 * Normaliza texto gerado pela IA para corrigir erros recorrentes e limpar espaços.
 * Mantém o conteúdo original sempre que possível para evitar perda de informação.
 */
function normalizarTextoSeguro(texto: string | undefined | null): string {
  if (!texto) return ''

  const replacements: Array<{ pattern: RegExp; replace: string }> = [
    // Correção específica observada em relatórios (erro de digitação do modelo)
    { pattern: /\bouuições\b/gi, replace: 'atribuições' },
    // Espaços duplicados próximos de conectivos comuns
    { pattern: /\s{2,}/g, replace: ' ' },
  ]

  let resultado = texto
  for (const { pattern, replace } of replacements) {
    resultado = resultado.replace(pattern, replace)
  }

  // Normaliza quebras sem remover estrutura
  resultado = resultado.replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim()

  return resultado
}

function normalizarGapTexto(gap: GapConformidade): GapConformidade {
  return {
    ...gap,
    descricao: normalizarTextoSeguro(gap.descricao),
    categoria: normalizarTextoSeguro(gap.categoria),
    recomendacao: normalizarTextoSeguro(gap.recomendacao),
    prazo: normalizarTextoSeguro(gap.prazo),
    ...(gap.impacto !== undefined ? { impacto: normalizarTextoSeguro(gap.impacto) } : {}),
    ...(gap.citacaoDocumento !== undefined
      ? { citacaoDocumento: gap.citacaoDocumento ? normalizarTextoSeguro(gap.citacaoDocumento) : gap.citacaoDocumento }
      : {}),
    ...(gap.linhaDocumento !== undefined
      ? { linhaDocumento: gap.linhaDocumento ? normalizarTextoSeguro(gap.linhaDocumento) : gap.linhaDocumento }
      : {}),
  }
}

function normalizarPlanoAcao(acao: AcaoPlano5W2H): AcaoPlano5W2H {
  return {
    ...acao,
    what: normalizarTextoSeguro(acao.what),
    who: normalizarTextoSeguro(acao.who),
    ...(acao.evidenciaConclusao !== undefined
      ? {
        evidenciaConclusao: acao.evidenciaConclusao
          ? normalizarTextoSeguro(acao.evidenciaConclusao)
          : acao.evidenciaConclusao,
      }
      : {}),
    ...(acao.kpi !== undefined
      ? {
        kpi: acao.kpi ? normalizarTextoSeguro(acao.kpi) : acao.kpi,
      }
      : {}),
  }
}

/**
 * Aplica normalização segura em todo o payload de análise antes de persistir/exibir.
 */
export function normalizarAnaliseResposta(
  resposta: AnaliseConformidadeResponse
): AnaliseConformidadeResponse {
  const normalizarLista = (lista?: string[]) =>
    (lista ?? []).map(normalizarTextoSeguro).filter((item) => item.length > 0)

  const gapsNormalizados = (resposta.gaps ?? []).map(normalizarGapTexto)

  return {
    ...resposta,
    resumo: normalizarTextoSeguro(resposta.resumo),
    pontosPositivos: normalizarLista(resposta.pontosPositivos),
    pontosAtencao: normalizarLista(resposta.pontosAtencao),
    proximosPassos: normalizarLista(resposta.proximosPassos),
    gaps: gapsNormalizados,
    ...(resposta.planoAcao !== undefined
      ? { planoAcao: resposta.planoAcao.map(normalizarPlanoAcao) }
      : {}),
  }
}

export { normalizarTextoSeguro }
