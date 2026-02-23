// Tipos de conformidade para análise de documentos SST

export interface Documento {
  id: string;
  nome_arquivo: string;
  tipo_documento: string;
  conteudo_extraido: string;
  metadados: Record<string, unknown>;
  versao: number;
  created_at: string;
}

export interface AnaliseJob {
  id: string;
  documento_id: string;
  norma_ids: string[];
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  priority: number;
  progress: number;
  error_message?: string;
  created_at: string;
  started_at?: string;
  completed_at?: string;
}

export interface AnaliseResult {
  job_id: string;
  documento_id: string;
  score_geral: number;
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
  created_at: string;
}

export interface AnaliseDetalhada {
  norma_id: string;
  norma_codigo: string;
  norma_titulo: string;
  score_conformidade: number;
  status: 'conforme' | 'nao_conforme' | 'parcial' | 'nao_aplicavel';
  gaps_identificados: Gap[];
  recomendacoes: Recomendacao[];
}

export interface Gap {
  id: string;
  tipo: 'ausencia_total' | 'inadequacao_parcial' | 'desatualizacao' | 'incompleto';
  severidade: 'critica' | 'importante' | 'menor';
  descricao: string;
  requisito_norma: string;
  impacto_estimado: string;
  acao_recomendada: string;
  prazo_sugerido: 'imediato' | '30_dias' | '90_dias' | '180_dias';
}

export interface Recomendacao {
  id: string;
  categoria: 'documentacao' | 'processo' | 'treinamento' | 'infraestrutura' | 'politica';
  prioridade: 'alta' | 'media' | 'baixa';
  descricao: string;
  justificativa: string;
  passos_implementacao: string[];
  prazo_estimado: string;
}

// API responses
export interface ApiResponseAnaliseJob {
  success: boolean;
  data: {
    job_id: string;
    status: string;
    message: string;
  };
  error?: string;
}

export interface ApiResponseAnaliseResult {
  success: boolean;
  data: AnaliseResult;
  error?: string;
}
