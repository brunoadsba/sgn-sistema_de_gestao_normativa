import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { sql, relations } from 'drizzle-orm';

const nowDefault = sql`(datetime('now'))`;

// ====== DOCUMENTOS (uploads do usuário) ======
export const documentos = sqliteTable('documentos', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  nomeArquivo: text('nome_arquivo').notNull(),
  tipoDocumento: text('tipo_documento'),
  conteudoExtraido: text('conteudo_extraido'),
  metadados: text('metadados', { mode: 'json' }).$type<Record<string, unknown>>(),
  urlStorage: text('url_storage'),
  versao: integer('versao').default(1),
  createdAt: text('created_at').notNull().default(nowDefault),
});

export const documentosRelations = relations(documentos, ({ many }) => ({
  jobs: many(analiseJobs),
}));

// ====== ANALISE JOBS ======
export const analiseJobs = sqliteTable('analise_jobs', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  documentoId: text('documento_id').notNull().references(() => documentos.id, { onDelete: 'cascade' }),
  normaIds: text('norma_ids', { mode: 'json' }).$type<string[]>(),
  status: text('status').notNull().default('pending'),
  tipoAnalise: text('tipo_analise').default('completa'),
  priority: integer('priority').default(5),
  progresso: integer('progresso').default(0),
  erroDetalhes: text('erro_detalhes'),
  parametros: text('parametros', { mode: 'json' }).$type<Record<string, unknown>>(),
  metadata: text('metadata', { mode: 'json' }).$type<Record<string, unknown>>(),
  sessionId: text('session_id'),
  createdAt: text('created_at').notNull().default(nowDefault),
  startedAt: text('started_at'),
  completedAt: text('completed_at'),
});

export const analiseJobsRelations = relations(analiseJobs, ({ one }) => ({
  documento: one(documentos, {
    fields: [analiseJobs.documentoId],
    references: [documentos.id],
  }),
}));

// ====== ANALISE RESULTADOS ======
export const analiseResultados = sqliteTable('analise_resultados', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  jobId: text('job_id').notNull().references(() => analiseJobs.id, { onDelete: 'cascade' }),
  documentoId: text('documento_id').references(() => documentos.id),
  scoreGeral: integer('score_geral'),
  nivelRisco: text('nivel_risco'),
  statusGeral: text('status_geral'),
  metadata: text('metadata', { mode: 'json' }).$type<Record<string, unknown>>(),
  createdAt: text('created_at').notNull().default(nowDefault),
});

export const analiseResultadosRelations = relations(analiseResultados, ({ one, many }) => ({
  job: one(analiseJobs, {
    fields: [analiseResultados.jobId],
    references: [analiseJobs.id],
  }),
  documento: one(documentos, {
    fields: [analiseResultados.documentoId],
    references: [documentos.id],
  }),
  gaps: many(conformidadeGaps),
}));

// ====== CONFORMIDADE GAPS ======
export const conformidadeGaps = sqliteTable('conformidade_gaps', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  analiseResultadoId: text('analise_resultado_id').notNull().references(() => analiseResultados.id, { onDelete: 'cascade' }),
  normaId: integer('norma_id'),
  severidade: text('severidade').notNull(),
  resolvido: integer('resolvido', { mode: 'boolean' }).notNull().default(false),
  categoria: text('categoria'),
  descricao: text('descricao').notNull(),
  recomendacao: text('recomendacao'),
  prazoSugerido: text('prazo_sugerido'),
  impacto: text('impacto'),
  createdAt: text('created_at').notNull().default(nowDefault),
});

export const conformidadeGapsRelations = relations(conformidadeGaps, ({ one }) => ({
  resultado: one(analiseResultados, {
    fields: [conformidadeGaps.analiseResultadoId],
    references: [analiseResultados.id],
  }),
}));
