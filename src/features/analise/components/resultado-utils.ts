import { AnaliseConformidadeResponse, GapConformidade } from '@/types/ia'
import { normalizarCodigoNr } from '@/lib/normas/ordem'
import { CONFIG_RISCO } from '@/lib/constants/risco'
import { formatarDataHora } from '@/lib/formatters'

export { CONFIG_RISCO }

export const CONFIG_SEVERIDADE_BADGE: Record<GapConformidade['severidade'], { label: string; classes: string }> = {
  baixa: { label: 'Baixa', classes: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  media: { label: 'Média', classes: 'bg-amber-50 text-amber-700 border-amber-200' },
  alta: { label: 'Alta', classes: 'bg-red-50 text-red-700 border-red-200' },
  critica: { label: 'Crítica', classes: 'bg-red-100 text-red-800 border-red-300' },
}

export const ORDEM_SEVERIDADE: Record<string, number> = {
  critica: 0,
  alta: 1,
  media: 2,
  baixa: 3,
}

export { formatarDataHora }

export function gerarTituloRelatorioParaImpressao(): string {
  const agora = new Date()
  const dataBr = new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(agora)
  const horaBr = new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(agora)
  const dataSegura = dataBr.replace(/\//g, '-')
  const horaSegura = horaBr.replace(':', '-')
  return `Relatório_SGN_${dataSegura}_${horaSegura}`
}

export function formatarNivelRisco(nivel: AnaliseConformidadeResponse['nivelRisco']): string {
  const mapa = { baixo: 'Baixo', medio: 'Médio', alto: 'Alto', critico: 'Crítico' } as const
  return mapa[nivel] ?? 'Médio'
}

export function formatarStatusLaudo(status?: AnaliseConformidadeResponse['reportStatus']): string {
  if (status === 'laudo_aprovado') return 'Laudo Aprovado'
  if (status === 'laudo_rejeitado') return 'Laudo Rejeitado'
  return 'Pré-laudo pendente'
}

export function formatarSeveridadeRelatorio(severidade: GapConformidade['severidade']): string {
  const mapa = { critica: 'CRITICA', alta: 'ALTA', media: 'MEDIA', baixa: 'BAIXA' } as const
  return mapa[severidade] ?? String(severidade).toUpperCase()
}

export function obterNormaPrincipalGap(gap: GapConformidade): string {
  const normaRelacionada = gap.normasRelacionadas?.find((item) => item.trim().length > 0)
  if (normaRelacionada) return normalizarCodigoNr(normaRelacionada)
  const normaEvidencia = gap.evidencias?.find((item) => item.normaCodigo.trim().length > 0)?.normaCodigo
  if (normaEvidencia) return normalizarCodigoNr(normaEvidencia)
  return '-'
}

export function normalizarCategoriaGap(categoria: string | undefined): string {
  if (!categoria || categoria.trim().length === 0) return 'Geral'
  const limpa = categoria.trim()
  if (/gest[aã]o/i.test(limpa) && /(sst|seguran|sa[uú]de)/i.test(limpa)) return 'Gestão SST'
  if (/vi[aá]ria/i.test(limpa)) return 'Segurança Viária'
  if (/acesso/i.test(limpa)) return 'Seguranca no Acesso'
  return limpa
}

export function statusGap(reportStatus?: AnaliseConformidadeResponse['reportStatus']): 'Aberto' | 'Em andamento' | 'Resolvido' {
  if (reportStatus === 'laudo_aprovado') return 'Em andamento'
  if (reportStatus === 'laudo_rejeitado') return 'Aberto'
  return 'Aberto'
}

export function statusGapClasses(status: 'Aberto' | 'Em andamento' | 'Resolvido'): string {
  if (status === 'Resolvido') return 'bg-emerald-50 text-emerald-700 border-emerald-200'
  if (status === 'Em andamento') return 'bg-blue-50 text-blue-700 border-blue-200'
  return 'bg-red-50 text-red-700 border-red-200'
}

export function limparResumoRelatorio(texto: string): string {
  if (!texto) return ''
  const linhasLimpas = texto
    .replace(/\r\n/g, '\n')
    .replace(/An[aá]lise consolidada de \d+ blocos do documento\.?/gi, '')
    .replace(/\bPontos-?Chave\b:?/gi, '')
    .split('\n')
    .map((linha) => linha.trim())
    .join('\n')
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
  return linhasLimpas
}
