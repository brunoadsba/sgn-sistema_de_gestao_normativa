// Tipos TypeScript para funcionalidades de IA

export interface AnaliseConformidadeRequest {
  documento: string
  tipoDocumento: string
  normasAplicaveis?: string[]
  estrategiaProcessamento?: 'completo' | 'incremental'
  evidenciasNormativas?: EvidenciaNormativa[]
  chunkMetadados?: ChunkDocumentoMetadata[]
  contextoBaseConhecimento?: {
    versaoBase: string
    totalChunks: number
    fonte: 'local'
    missingNormas?: string[]
  }
  prioridade?: 'baixa' | 'media' | 'alta' | 'critica'
  metadata?: Record<string, unknown>
}

export interface AnaliseConformidadeResponse {
  analiseId?: string
  score: number
  nivelRisco: 'baixo' | 'medio' | 'alto' | 'critico'
  gaps: GapConformidade[]
  resumo: string
  pontosPositivos: string[]
  pontosAtencao: string[]
  proximosPassos: string[]
  timestamp: string
  modeloUsado: string
  tempoProcessamento: number
  planoAcao?: AcaoPlano5W2H[]
  metadadosProcessamento?: MetadadosProcessamento
  reportStatus?: ReportStatus
  confidenceScore?: number
  confidenceClass?: ConfidenceClass
  confidenceSignals?: ConfidenceSignals
  alertasConfiabilidade?: string[]
  documentHash?: string
  revisaoHumana?: RevisaoHumana | null
  jobId?: string | undefined
  nomeArquivo?: string | undefined
}

export interface GapConformidade {
  id: string
  descricao: string
  severidade: 'baixa' | 'media' | 'alta' | 'critica'
  categoria: string
  recomendacao: string
  prazo: string
  probabilidade?: number
  pontuacaoGut?: number
  classificacao?: string
  prazoDias?: number
  impacto?: string
  custoEstimado?: number
  responsavelSugerido?: string
  normasRelacionadas?: string[]
  evidencias?: EvidenciaNormativa[]
  metadadosChunk?: {
    chunkIdsUsados: string[]
    ordemProcessamento: number[]
  }
  citacaoDocumento?: string | null
  paginaDocumento?: number | null
  linhaDocumento?: string | null
}

export interface AcaoPlano5W2H {
  id: string
  what: string
  who: string
  prazoDias: number
  evidenciaConclusao?: string | null
  kpi?: string | null
}

export interface EvidenciaNormativa {
  chunkId: string
  normaCodigo: string
  secao: string
  conteudo: string
  score: number
  fonte: 'local'
}

export interface ChunkDocumentoMetadata {
  chunkId: string
  indice: number
  totalChunks: number
  inicioOffset: number
  fimOffset: number
  tamanhoCaracteres: number
}

export interface MetadadosProcessamento {
  estrategia: 'completo' | 'incremental'
  totalChunksProcessados: number
  chunksPorGap: Record<string, string[]>
  ordemProcessamento: string[]
  temposPorChunkMs?: Record<string, number>
  truncamentoEvitado?: boolean
  scoreDeterministico?: unknown
  fingerprintAnalise?: unknown
}

export type ReportStatus = 'pre_laudo_pendente' | 'laudo_aprovado' | 'laudo_rejeitado'

export type ConfidenceClass = 'confianca_alta' | 'confianca_media' | 'confianca_baixa'

export interface ConfidenceSignals {
  parseOk: boolean
  nrConcordancia: number
  evidenceCoverage: number
  kbCoverage: number
  providerStability: number
}

export interface RevisaoHumana {
  decisao: 'aprovado' | 'rejeitado'
  revisor: string
  justificativa: string
  createdAt: string
}

export interface ConfiguracaoIA {
  modelo: string
  temperatura: number
  maxTokens: number
  topP: number
  timeout: number
  retryAttempts: number
}

// Enums
export enum CategoriaGap {
  EPI = 'EPI',
  TREINAMENTO = 'Treinamento',
  DOCUMENTACAO = 'Documentação',
  PROCEDIMENTO = 'Procedimento',
  EQUIPAMENTO = 'Equipamento',
  MONITORAMENTO = 'Monitoramento',
  COMUNICACAO = 'Comunicação',
  EMERGENCIA = 'Emergência'
}

export enum SeveridadeGap {
  BAIXA = 'baixa',
  MEDIA = 'media',
  ALTA = 'alta',
  CRITICA = 'critica'
}

export enum StatusProcessamento {
  PENDENTE = 'pendente',
  PROCESSANDO = 'processando',
  CONCLUIDO = 'concluido',
  ERRO = 'erro',
  CANCELADO = 'cancelado'
}
