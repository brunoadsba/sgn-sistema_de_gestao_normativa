import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

// Helper: default para timestamps
const nowDefault = sql`(datetime('now'))`;

// ====== EMPRESAS ======
export const empresas = sqliteTable('empresas', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  nome: text('nome').notNull(),
  cnpj: text('cnpj'),
  setor: text('setor'),
  porte: text('porte'), // 'pequeno' | 'medio' | 'grande'
  configuracoes: text('configuracoes', { mode: 'json' }).$type<Record<string, unknown>>(),
  ativo: integer('ativo', { mode: 'boolean' }).notNull().default(true),
  createdAt: text('created_at').notNull().default(nowDefault),
  updatedAt: text('updated_at').notNull().default(nowDefault),
});

// ====== DOCUMENTOS EMPRESA ======
export const documentosEmpresa = sqliteTable('documentos_empresa', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  empresaId: text('empresa_id').notNull().references(() => empresas.id, { onDelete: 'cascade' }),
  nomeArquivo: text('nome_arquivo').notNull(),
  tipoDocumento: text('tipo_documento'), // 'manual' | 'procedimento' | 'treinamento' | 'politica'
  conteudoExtraido: text('conteudo_extraido'),
  metadados: text('metadados', { mode: 'json' }).$type<Record<string, unknown>>(),
  urlStorage: text('url_storage'),
  versao: integer('versao').default(1),
  createdAt: text('created_at').notNull().default(nowDefault),
});

// ====== ANALISE JOBS ======
export const analiseJobs = sqliteTable('analise_jobs', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  empresaId: text('empresa_id').notNull().references(() => empresas.id, { onDelete: 'cascade' }),
  documentoId: text('documento_id').notNull().references(() => documentosEmpresa.id, { onDelete: 'cascade' }),
  normaIds: text('norma_ids', { mode: 'json' }).$type<string[]>(),
  status: text('status').notNull().default('pending'), // 'pending' | 'running' | 'completed' | 'failed' | 'cancelled'
  tipoAnalise: text('tipo_analise').default('completa'),
  priority: integer('priority').default(5),
  progresso: integer('progresso').default(0),
  erroDetalhes: text('erro_detalhes'),
  parametros: text('parametros', { mode: 'json' }).$type<Record<string, unknown>>(),
  metadata: text('metadata', { mode: 'json' }).$type<Record<string, unknown>>(),
  createdAt: text('created_at').notNull().default(nowDefault),
  startedAt: text('started_at'),
  completedAt: text('completed_at'),
});

// ====== ANALISE RESULTADOS ======
export const analiseResultados = sqliteTable('analise_resultados', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  empresaId: text('empresa_id').notNull().references(() => empresas.id, { onDelete: 'cascade' }),
  jobId: text('job_id').notNull().references(() => analiseJobs.id, { onDelete: 'cascade' }),
  documentoId: text('documento_id').references(() => documentosEmpresa.id),
  scoreGeral: integer('score_geral'),
  nivelRisco: text('nivel_risco'), // 'baixo' | 'medio' | 'alto' | 'critico'
  statusGeral: text('status_geral'), // 'conforme' | 'nao_conforme' | 'parcial_conforme'
  metadata: text('metadata', { mode: 'json' }).$type<Record<string, unknown>>(),
  createdAt: text('created_at').notNull().default(nowDefault),
});

// ====== CONFORMIDADE GAPS ======
export const conformidadeGaps = sqliteTable('conformidade_gaps', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  analiseResultadoId: text('analise_resultado_id').notNull().references(() => analiseResultados.id, { onDelete: 'cascade' }),
  normaId: integer('norma_id'),
  severidade: text('severidade').notNull(), // 'baixa' | 'media' | 'alta' | 'critica'
  resolvido: integer('resolvido', { mode: 'boolean' }).notNull().default(false),
  categoria: text('categoria'),
  descricao: text('descricao').notNull(),
  recomendacao: text('recomendacao'),
  prazoSugerido: text('prazo_sugerido'),
  impacto: text('impacto'),
  createdAt: text('created_at').notNull().default(nowDefault),
});

// ====== ALERTAS CONFORMIDADE ======
export const alertasConformidade = sqliteTable('alertas_conformidade', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  empresaId: text('empresa_id').notNull().references(() => empresas.id, { onDelete: 'cascade' }),
  tipo: text('tipo').notNull(), // 'oportunidade' | 'risco' | 'prazo' | 'conformidade'
  severidade: text('severidade').notNull(), // 'baixa' | 'media' | 'alta' | 'critica'
  titulo: text('titulo').notNull(),
  descricao: text('descricao').notNull(),
  acaoRequerida: text('acao_requerida').notNull(),
  prazo: text('prazo'),
  status: text('status').notNull().default('ativo'), // 'ativo' | 'resolvido' | 'ignorado'
  normaId: integer('norma_id'),
  documentoId: text('documento_id'),
  analiseId: text('analise_id'),
  metadata: text('metadata', { mode: 'json' }).$type<Record<string, unknown>>(),
  createdAt: text('created_at').notNull().default(nowDefault),
  updatedAt: text('updated_at').notNull().default(nowDefault),
  resolvedAt: text('resolved_at'),
});
