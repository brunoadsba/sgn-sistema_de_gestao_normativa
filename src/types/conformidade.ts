export interface Empresa {
  id: string;
  nome: string;
  cnpj: string;
  setor: string;
  porte: 'pequeno' | 'medio' | 'grande';
  configuracoes: Record<string, unknown>;
  ativo: boolean;
  created_at: string;
}

export interface DocumentoEmpresa {
  id: string;
  empresa_id: string;
  nome_arquivo: string;
  tipo_documento: 'manual' | 'procedimento' | 'treinamento' | 'politica';
  conteudo_extraido: string;
  metadados: Record<string, unknown>;
  url_storage: string;
  versao: number;
  created_at: string;
}

export interface AnaliseConformidade {
  id: string;
  empresa_id: string;
  norma_id: number;
  documento_id: string;
  status_conformidade: 'conforme' | 'nao_conforme' | 'parcial' | 'nao_aplicavel';
  lacunas_identificadas: string[];
  acoes_recomendadas: string[];
  score_conformidade: number;
  observacoes: string;
  created_at: string;
}

// ========== ENTERPRISE ENGINE DE CONFORMIDADE ==========

export interface AnaliseJob {
  id: string;
  empresa_id: string;
  documento_id: string;
  norma_ids: string[];
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  priority: 'high' | 'medium' | 'low';
  progress: number; // 0-100
  error_message?: string;
  metadata: {
    total_normas: number;
    normas_processadas: number;
    tempo_estimado_segundos?: number;
    initiated_by: string;
  };
  created_at: string;
  started_at?: string;
  completed_at?: string;
}

// Resultado da Análise Enterprise
export interface AnaliseResult {
  job_id: string;
  empresa_id: string;
  documento_id: string;
  score_geral: number; // 0-100
  nivel_risco: 'baixo' | 'medio' | 'alto' | 'critico';
  status_geral: 'conforme' | 'nao_conforme' | 'parcial_conforme';
  
  analises_detalhadas: AnaliseDetalhada[];
  
  resumo_executivo: {
    total_normas_analisadas: number;
    normas_conformes: number;
    normas_nao_conformes: number;
    normas_parciais: number;
    gaps_criticos: number;
    gaps_importantes: number;
    gaps_menores: number;
  };
  
  plano_acao: PlanoAcao;
  
  metadata: {
    versao_engine: string;
    tempo_processamento_segundos: number;
    modelo_llm_utilizado: string;
    confidence_score: number; // 0-100
  };
  
  created_at: string;
}

// Análise detalhada por norma
export interface AnaliseDetalhada {
  norma_id: string;
  norma_codigo: string;
  norma_titulo: string;
  score_conformidade: number; // 0-100
  status: 'conforme' | 'nao_conforme' | 'parcial' | 'nao_aplicavel';
  gaps_identificados: Gap[];
  trechos_analisados: TrechoAnalise[];
  recomendacoes: Recomendacao[];
  confidence_score: number; // 0-100
}

// Gap de conformidade
export interface Gap {
  id: string;
  tipo: 'ausencia_total' | 'inadequacao_parcial' | 'desatualizacao' | 'incompleto';
  severidade: 'critica' | 'importante' | 'menor';
  descricao: string;
  requisito_norma: string;
  impacto_estimado: string;
  acao_recomendada: string;
  prazo_sugerido: 'imediato' | '30_dias' | '90_dias' | '180_dias';
  custo_estimado?: 'baixo' | 'medio' | 'alto';
}

// Trecho de análise
export interface TrechoAnalise {
  trecho_documento: string;
  posicao_inicio: number;
  posicao_fim: number;
  relevancia_score: number; // 0-100
  compliance_status: 'atende' | 'atende_parcial' | 'nao_atende';
  observacoes: string;
}

// Recomendação específica
export interface Recomendacao {
  id: string;
  categoria: 'documentacao' | 'processo' | 'treinamento' | 'infraestrutura' | 'politica';
  prioridade: 'alta' | 'media' | 'baixa';
  descricao: string;
  justificativa: string;
  passos_implementacao: string[];
  recursos_necessarios: string[];
  prazo_estimado: string;
  impacto_compliance: number; // 0-100
}

// Plano de ação gerado
export interface PlanoAcao {
  id: string;
  titulo: string;
  descricao: string;
  acoes_imediatas: AcaoPlano[];
  acoes_curto_prazo: AcaoPlano[];
  acoes_medio_prazo: AcaoPlano[];
  acoes_longo_prazo: AcaoPlano[];
  total_acoes: number;
  tempo_total_estimado: string;
  investimento_estimado: 'baixo' | 'medio' | 'alto';
  impacto_compliance_esperado: number; // 0-100
  created_at: string;
}

// Ação específica do plano
export interface AcaoPlano {
  id: string;
  titulo: string;
  descricao: string;
  categoria: 'documentacao' | 'processo' | 'treinamento' | 'infraestrutura' | 'politica';
  prioridade: 'critica' | 'alta' | 'media' | 'baixa';
  responsavel_sugerido: string;
  prazo_estimado: string;
  recursos_necessarios: string[];
  criterios_conclusao: string[];
  impacto_compliance: number; // 0-100
  dependencias: string[];
}

// ========== API RESPONSES ENTERPRISE ==========

export interface ApiResponseAnaliseJob {
  success: boolean;
  data: {
    job_id: string;
    status: string;
    message: string;
    estimated_completion: string;
  };
  error?: string;
}

export interface ApiResponseJobStatus {
  success: boolean;
  data: AnaliseJob;
  error?: string;
}

export interface ApiResponseAnaliseResult {
  success: boolean;
  data: AnaliseResult;
  error?: string;
}

export interface ApiResponseAnalisesList {
  success: boolean;
  data: AnaliseResult[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  filters?: {
    empresa_id?: string;
    status?: string;
    data_inicio?: string;
    data_fim?: string;
  };
}

// ========== CONFIGURAÇÕES ENTERPRISE ==========

export interface EngineConfig {
  llm_provider: 'openai' | 'anthropic' | 'azure' | 'custom';
  model_name: string;
  max_tokens: number;
  temperature: number;
  timeout_seconds: number;
  retry_attempts: number;
  batch_size: number;
  enable_caching: boolean;
  cache_ttl_seconds: number;
}

export interface NotificationConfig {
  email_enabled: boolean;
  webhook_enabled: boolean;
  webhook_url?: string;
  notify_on_completion: boolean;
  notify_on_failure: boolean;
  notify_on_high_risk: boolean;
}

// ========== TIPOS LEGADOS (mantidos para compatibilidade) ==========

export interface ApiResponseEmpresas {
  success: boolean;
  data: Empresa[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiResponseDocumentos {
  success: boolean;
  data: DocumentoEmpresa[];
  total: number;
}
