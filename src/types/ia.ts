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
  }
  prioridade?: 'baixa' | 'media' | 'alta' | 'critica'
}

export interface AnaliseConformidadeResponse {
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
  metadadosProcessamento?: MetadadosProcessamento
}

export interface GapConformidade {
  id: string
  descricao: string
  severidade: 'baixa' | 'media' | 'alta' | 'critica'
  categoria: string
  recomendacao: string
  prazo: string
  impacto?: string
  custoEstimado?: number
  responsavelSugerido?: string
  normasRelacionadas?: string[]
  evidencias?: EvidenciaNormativa[]
  metadadosChunk?: {
    chunkIdsUsados: string[]
    ordemProcessamento: number[]
  }
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
