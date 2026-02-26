import type { AnaliseConformidadeRequest } from '@/types/ia'

export type SpecialistTask = 'analise_conformidade' | 'sugerir_nrs' | 'chat_documento'
export type SpecialistProfileId = 'sst-generalista' | 'sst-portuario'

export type SpecialistProfile = {
  id: SpecialistProfileId
  nome: string
  foco: string
  regras: string[]
}

type SpecialistContext = {
  tipoDocumento?: string
  documento?: string
  normasAplicaveis?: string[]
}

const PERFIS: Record<SpecialistProfileId, SpecialistProfile> = {
  'sst-generalista': {
    id: 'sst-generalista',
    nome: 'Engenheiro Sênior SST Generalista',
    foco: 'Conformidade normativa geral em Segurança e Saúde do Trabalho.',
    regras: [
      'Adote rigor técnico e rastreabilidade em todas as conclusões.',
      'Não invente requisitos não presentes nas evidências e no documento.',
      'Quando houver incerteza, explicite lacunas e marque o ponto para revisão humana.',
    ],
  },
  'sst-portuario': {
    id: 'sst-portuario',
    nome: 'Engenheiro Sênior SST Portuário',
    foco: 'Operações portuárias e aquaviárias com ênfase em prevenção de acidentes graves.',
    regras: [
      'Priorize análise de aplicabilidade de NR-29 e correlatas operacionais (NR-11, NR-20, NR-33, NR-35).',
      'Considere NR-30 quando houver indícios de atividade aquaviária embarcada.',
      'Não sugira NR-22 sem indícios explícitos de atividade de mineração no escopo documental.',
    ],
  },
}

const KEYWORDS_PORTUARIO = [
  'porto',
  'portuario',
  'portuário',
  'terminal',
  'cais',
  'estiva',
  'retroarea',
  'retroárea',
  'navio',
  'aquaviario',
  'aquaviário',
  'embarque',
  'desembarque',
]

function normalize(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
}

function hasPortuarioSignals(context: SpecialistContext): boolean {
  const texto = normalize(`${context.tipoDocumento ?? ''}\n${(context.documento ?? '').slice(0, 12000)}`)
  const normas = new Set((context.normasAplicaveis ?? []).map((item) => normalize(item)))

  if (normas.has('nr-29') || normas.has('nr29') || normas.has('nr-30') || normas.has('nr30')) {
    return true
  }

  return KEYWORDS_PORTUARIO.some((keyword) => texto.includes(normalize(keyword)))
}

export function selecionarPerfilEspecialista(context: SpecialistContext): SpecialistProfile {
  if (hasPortuarioSignals(context)) {
    return PERFIS['sst-portuario']
  }
  return PERFIS['sst-generalista']
}

export function selecionarPerfilPorRequest(request: AnaliseConformidadeRequest): SpecialistProfile {
  return selecionarPerfilEspecialista({
    tipoDocumento: request.tipoDocumento,
    documento: request.documento,
    ...(request.normasAplicaveis ? { normasAplicaveis: request.normasAplicaveis } : {}),
  })
}

export function montarSystemPromptEspecialista(task: SpecialistTask, profile: SpecialistProfile): string {
  const regras = profile.regras.map((regra, index) => `${index + 1}. ${regra}`).join('\n')

  if (task === 'analise_conformidade') {
    return (
      `Você é ${profile.nome}. ` +
      `Foco: ${profile.foco}\n` +
      'Sua missão é gerar RELATÓRIO TÉCNICO DE CONFORMIDADE objetivo e auditável.\n' +
      'Regras obrigatórias:\n' +
      `${regras}\n` +
      'Responda estritamente via JSON.'
    )
  }

  if (task === 'sugerir_nrs') {
    return (
      `Você é ${profile.nome}. ` +
      `Foco: ${profile.foco}\n` +
      'Sua tarefa é inferir NRs aplicáveis com máxima precisão regulatória.\n' +
      'Regras obrigatórias:\n' +
      `${regras}\n` +
      'Retorne APENAS JSON com array na chave "nrs".'
    )
  }

  return (
    `Você é ${profile.nome}, assistente NEX do SGN. ` +
    `Foco: ${profile.foco}\n` +
    'Regras obrigatórias:\n' +
    `${regras}\n` +
    'Responda em português brasileiro de forma objetiva e ancorada no contexto recebido.'
  )
}
