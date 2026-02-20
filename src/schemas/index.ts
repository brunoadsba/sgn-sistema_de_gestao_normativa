import { z } from 'zod';

// Schema para Normas
export const NormaSchema = z.object({
  id: z.string().optional(),
  codigo: z.string().min(1, 'Código é obrigatório'),
  titulo: z.string().min(1, 'Título é obrigatório'),
  descricao: z.string().optional(),
  status: z.enum(['ativa', 'revogada']).default('ativa'),
  categoria: z.string().optional(),
  palavrasChave: z.array(z.string()).optional(),
});

// Schema para Análise de Conformidade
export const AnaliseConformidadeSchema = z.object({
  id: z.string().uuid().optional(),
  // 2M caracteres (~1.400 páginas). Documentos maiores são truncados em groq.ts antes de chegar à IA.
  documento: z.string().min(1, 'Documento é obrigatório').max(2_000_000, 'Documento excede o limite de 2 milhões de caracteres'),
  tipoDocumento: z.enum(['PGR', 'NR-1-GRO', 'PCMSO', 'LTCAT', 'ASO', 'PPRA', 'OUTRO']),
  normasAplicaveis: z.array(z.string()).min(1, 'Pelo menos uma norma deve ser aplicável'),
  estrategiaProcessamento: z.enum(['completo', 'incremental']).default('completo'),
  score: z.number().min(0).max(100).optional(),
  nivelRisco: z.enum(['baixo', 'medio', 'alto', 'critico']).optional(),
  status: z.enum(['pendente', 'processando', 'concluida', 'erro']).default('pendente'),
});

// Schema para Gaps de Conformidade
export const GapConformidadeSchema = z.object({
  id: z.string().uuid().optional(),
  analiseId: z.string().uuid('ID da análise inválido'),
  descricao: z.string().min(1, 'Descrição do gap é obrigatória'),
  severidade: z.enum(['baixa', 'media', 'alta', 'critica']),
  categoria: z.string().optional(),
  recomendacao: z.string().min(1, 'Recomendação é obrigatória'),
  prazo: z.string().optional(),
  normaRelacionada: z.string().optional(),
  evidencias: z.array(z.object({
    chunkId: z.string(),
    normaCodigo: z.string(),
    secao: z.string(),
    conteudo: z.string(),
    score: z.number().min(0).max(1),
    fonte: z.literal('local'),
  })).optional(),
});

// Schemas para APIs
export const CreateAnaliseSchema = AnaliseConformidadeSchema.omit({
  id: true,
  score: true,
  nivelRisco: true,
  status: true,
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

// Tipos derivados
export type Norma = z.infer<typeof NormaSchema>;
export type AnaliseConformidade = z.infer<typeof AnaliseConformidadeSchema>;
export type GapConformidade = z.infer<typeof GapConformidadeSchema>;
export type CreateAnalise = z.infer<typeof CreateAnaliseSchema>;
export type QueryParams = z.infer<typeof QueryParamsSchema>;
export type ApiResponse<T = unknown> = z.infer<typeof ApiResponseSchema> & { data?: T };
