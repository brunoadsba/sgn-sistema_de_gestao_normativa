import { z } from 'zod';

// Schema para Normas
export const NormaSchema = z.object({
  id: z.string().uuid().optional(),
  codigo: z.string().min(1, 'Código é obrigatório'),
  titulo: z.string().min(1, 'Título é obrigatório'),
  descricao: z.string().optional(),
  status: z.enum(['ativa', 'revogada', 'suspensa']).default('ativa'),
  data_criacao: z.string().datetime().optional(),
  data_atualizacao: z.string().datetime().optional(),
  versao: z.string().optional(),
  categoria: z.string().optional(),
  palavras_chave: z.array(z.string()).optional(),
  conteudo: z.string().optional(),
  url_oficial: z.string().url().optional(),
});

// Schema para Empresas
export const EmpresaSchema = z.object({
  id: z.string().uuid().optional(),
  nome: z.string().min(1, 'Nome da empresa é obrigatório'),
  cnpj: z.string().regex(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/, 'CNPJ inválido').optional(),
  email: z.string().email('Email inválido').optional(),
  telefone: z.string().optional(),
  endereco: z.string().optional(),
  cidade: z.string().optional(),
  estado: z.string().length(2, 'Estado deve ter 2 caracteres').optional(),
  cep: z.string().regex(/^\d{5}-\d{3}$/, 'CEP inválido').optional(),
  setor: z.string().optional(),
  tamanho: z.enum(['micro', 'pequena', 'media', 'grande']).optional(),
  data_criacao: z.string().datetime().optional(),
  data_atualizacao: z.string().datetime().optional(),
});

// Schema para Análise de Conformidade (camelCase alinhado com interfaces TS)
export const AnaliseConformidadeSchema = z.object({
  id: z.string().uuid().optional(),
  empresaId: z.string().uuid('ID da empresa inválido').optional(),
  documento: z.string().min(1, 'Documento é obrigatório').max(50000, 'Documento muito grande'),
  tipoDocumento: z.enum(['PGR', 'NR-1-GRO', 'PCMSO', 'LTCAT', 'ASO', 'PPRA', 'OUTRO']),
  normasAplicaveis: z.array(z.string()).min(1, 'Pelo menos uma norma deve ser aplicável'),
  score: z.number().min(0).max(100).optional(),
  nivelRisco: z.enum(['baixo', 'medio', 'alto', 'critico']).optional(),
  status: z.enum(['pendente', 'processando', 'concluida', 'erro']).default('pendente'),
});

// Schema para Gaps de Conformidade
export const GapConformidadeSchema = z.object({
  id: z.string().uuid().optional(),
  analise_id: z.string().uuid('ID da análise inválido'),
  descricao: z.string().min(1, 'Descrição do gap é obrigatória'),
  severidade: z.enum(['baixa', 'media', 'alta', 'critica']),
  categoria: z.string().optional(),
  recomendacao: z.string().min(1, 'Recomendação é obrigatória'),
  prazo: z.string().optional(),
  norma_relacionada: z.string().optional(),
  data_criacao: z.string().datetime().optional(),
});

// Schema para Alertas
export const AlertaSchema = z.object({
  id: z.string().uuid().optional(),
  empresa_id: z.string().uuid('ID da empresa inválido'),
  tipo: z.enum(['conformidade', 'prazo', 'documento', 'treinamento']),
  titulo: z.string().min(1, 'Título do alerta é obrigatório'),
  descricao: z.string().min(1, 'Descrição do alerta é obrigatória'),
  severidade: z.enum(['baixa', 'media', 'alta', 'critica']),
  status: z.enum(['ativo', 'resolvido', 'arquivado']).default('ativo'),
  data_criacao: z.string().datetime().optional(),
  data_resolucao: z.string().datetime().optional(),
  prazo_resolucao: z.string().datetime().optional(),
});

// Schemas para APIs
export const CreateNormaSchema = NormaSchema.omit({ id: true, data_criacao: true, data_atualizacao: true });
export const UpdateNormaSchema = NormaSchema.partial().omit({ id: true, data_criacao: true });

export const CreateEmpresaSchema = EmpresaSchema.omit({ id: true, data_criacao: true, data_atualizacao: true });
export const UpdateEmpresaSchema = EmpresaSchema.partial().omit({ id: true, data_criacao: true });

export const CreateAnaliseSchema = AnaliseConformidadeSchema.omit({ 
  id: true, 
  score: true, 
  nivelRisco: true, 
  status: true, 
});

export const CreateAlertaSchema = AlertaSchema.omit({ 
  id: true, 
  status: true, 
  data_criacao: true, 
  data_resolucao: true 
});

// Schema para parâmetros de query
export const QueryParamsSchema = z.object({
  page: z.string().default('1').transform(Number).pipe(z.number().min(1)),
  limit: z.string().default('10').transform(Number).pipe(z.number().min(1).max(100)),
  search: z.string().optional(),
  status: z.string().optional(),
  categoria: z.string().optional(),
});

// Schema para resposta de API
export const ApiResponseSchema = z.object({
  success: z.boolean(),
  data: z.unknown().optional(),
  error: z.string().optional(),
  message: z.string().optional(),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    pages: z.number(),
  }).optional(),
});

// Tipos TypeScript derivados dos schemas
export type Norma = z.infer<typeof NormaSchema>;
export type Empresa = z.infer<typeof EmpresaSchema>;
export type AnaliseConformidade = z.infer<typeof AnaliseConformidadeSchema>;
export type GapConformidade = z.infer<typeof GapConformidadeSchema>;
export type Alerta = z.infer<typeof AlertaSchema>;

export type CreateNorma = z.infer<typeof CreateNormaSchema>;
export type UpdateNorma = z.infer<typeof UpdateNormaSchema>;
export type CreateEmpresa = z.infer<typeof CreateEmpresaSchema>;
export type UpdateEmpresa = z.infer<typeof UpdateEmpresaSchema>;
export type CreateAnalise = z.infer<typeof CreateAnaliseSchema>;
export type CreateAlerta = z.infer<typeof CreateAlertaSchema>;

export type QueryParams = z.infer<typeof QueryParamsSchema>;
export type ApiResponse<T = unknown> = z.infer<typeof ApiResponseSchema> & { data?: T };
