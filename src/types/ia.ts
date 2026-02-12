// Tipos TypeScript para funcionalidades de IA

// Tipos base para análise de conformidade
export interface AnaliseConformidadeRequest {
  documento: string
  tipoDocumento: string
  empresaId?: string
  normasAplicaveis?: string[]
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
}

// Tipos para gaps de conformidade
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
}

// Tipos para plano de ação
export interface PlanoAcao {
  id: string
  gapId: string
  acao: string
  responsavel: string
  prazo: string
  prioridade: 'baixa' | 'media' | 'alta' | 'critica'
  recursos: string[]
  marcos: string[]
  status: 'pendente' | 'em_andamento' | 'concluido' | 'cancelado'
  progresso: number
  observacoes?: string
}

// Tipos para análise de risco
export interface AnaliseRisco {
  id: string
  tipo: 'conformidade' | 'operacional' | 'financeiro' | 'reputacional'
  descricao: string
  probabilidade: 'baixa' | 'media' | 'alta' | 'critica'
  impacto: 'baixo' | 'medio' | 'alto' | 'critico'
  nivelRisco: 'baixo' | 'medio' | 'alto' | 'critico'
  mitigacao: string[]
  monitoramento: string[]
  responsavel: string
  prazoRevisao: string
}

// Tipos para scoring de conformidade
export interface ScoringConformidade {
  scoreGeral: number
  scorePorCategoria: {
    documentacao: number
    procedimentos: number
    equipamentos: number
    treinamentos: number
    monitoramento: number
  }
  tendencia: 'melhorando' | 'estavel' | 'piorando'
  comparacaoSetor: number
  meta: number
  gaps: number
  conformidade: number
}

// Tipos para histórico de análises
export interface HistoricoAnalise {
  id: string
  empresaId: string
  documentoId: string
  tipoDocumento: string
  score: number
  nivelRisco: string
  gaps: number
  timestamp: string
  modeloUsado: string
  status: 'sucesso' | 'erro' | 'processando'
  erro?: string
}

// Tipos para configurações de IA
export interface ConfiguracaoIA {
  modelo: string
  temperatura: number
  maxTokens: number
  topP: number
  frequenciaPenalty: number
  presencaPenalty: number
  timeout: number
  retryAttempts: number
}

// Tipos para métricas de IA
export interface MetricasIA {
  totalAnalises: number
  analisesSucesso: number
  analisesErro: number
  tempoMedioProcessamento: number
  scoreMedio: number
  gapsIdentificados: number
  modeloMaisUsado: string
  ultimaAnalise: string
}

// Tipos para cache de análises
export interface CacheAnalise {
  chave: string
  resultado: AnaliseConformidadeResponse
  timestamp: string
  expiracao: string
  hits: number
}

// Tipos para fila de processamento
export interface FilaProcessamento {
  id: string
  empresaId: string
  documentoId: string
  prioridade: number
  status: 'pendente' | 'processando' | 'concluido' | 'erro'
  tentativas: number
  maxTentativas: number
  timestamp: string
  erro?: string
}

// Tipos para auditoria de IA
export interface AuditoriaIA {
  id: string
  acao: string
  usuarioId?: string
  empresaId: string
  dados: Record<string, unknown>
  timestamp: string
  ip?: string
  userAgent?: string
}

// Enums para categorias de gaps
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

// Enums para severidade
export enum SeveridadeGap {
  BAIXA = 'baixa',
  MEDIA = 'media',
  ALTA = 'alta',
  CRITICA = 'critica'
}

// Enums para status de processamento
export enum StatusProcessamento {
  PENDENTE = 'pendente',
  PROCESSANDO = 'processando',
  CONCLUIDO = 'concluido',
  ERRO = 'erro',
  CANCELADO = 'cancelado'
}

// Tipos para validação de entrada
export interface ValidacaoEntrada {
  documento: boolean
  tipoDocumento: boolean
  empresaId: boolean
  normasAplicaveis: boolean
  erros: string[]
}

// Tipos para resposta de API
export interface RespostaAPI<T> {
  success: boolean
  data?: T
  error?: string
  timestamp: string
  requestId: string
}

// Tipos para paginação
export interface Paginacao {
  pagina: number
  limite: number
  total: number
  totalPaginas: number
  temProxima: boolean
  temAnterior: boolean
}

// Tipos para filtros
export interface FiltrosAnalise {
  empresaId?: string
  tipoDocumento?: string
  scoreMin?: number
  scoreMax?: number
  nivelRisco?: string
  severidadeGap?: string
  categoriaGap?: string
  dataInicio?: string
  dataFim?: string
  status?: string
}

// Tipos para ordenação
export interface Ordenacao {
  campo: string
  direcao: 'asc' | 'desc'
}

// Tipos para agregações
export interface AgregacaoAnalise {
  totalAnalises: number
  scoreMedio: number
  gapsTotal: number
  gapsPorSeveridade: Record<string, number>
  gapsPorCategoria: Record<string, number>
  tendenciaScore: Array<{
    data: string
    score: number
  }>
}

// Tipos para exportação
export interface ExportacaoAnalise {
  formato: 'pdf' | 'excel' | 'csv' | 'json'
  dados: AnaliseConformidadeResponse[]
  filtros: FiltrosAnalise
  timestamp: string
  usuarioId: string
}

// Tipos para backup e restore
export interface BackupIA {
  id: string
  timestamp: string
  tamanho: number
  tipo: 'completo' | 'incremental'
  status: 'criando' | 'concluido' | 'erro'
  localizacao: string
  expiracao: string
}
