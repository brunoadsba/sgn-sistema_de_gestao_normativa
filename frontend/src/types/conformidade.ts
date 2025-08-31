export interface Empresa {
  id: string;
  nome: string;
  cnpj: string;
  setor: string;
  porte: 'pequeno' | 'medio' | 'grande';
  configuracoes: Record<string, any>;
  ativo: boolean;
  created_at: string;
}

export interface DocumentoEmpresa {
  id: string;
  empresa_id: string;
  nome_arquivo: string;
  tipo_documento: 'manual' | 'procedimento' | 'treinamento' | 'politica';
  conteudo_extraido: string;
  metadados: Record<string, any>;
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

// Tipos para respostas da API (seguindo padrão existente)
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
