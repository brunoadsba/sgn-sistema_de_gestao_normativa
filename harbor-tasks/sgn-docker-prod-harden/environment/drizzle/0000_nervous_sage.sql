CREATE TABLE `alertas_conformidade` (
	`id` text PRIMARY KEY NOT NULL,
	`empresa_id` text NOT NULL,
	`tipo` text NOT NULL,
	`severidade` text NOT NULL,
	`titulo` text NOT NULL,
	`descricao` text NOT NULL,
	`acao_requerida` text NOT NULL,
	`prazo` text,
	`status` text DEFAULT 'ativo' NOT NULL,
	`norma_id` integer,
	`documento_id` text,
	`analise_id` text,
	`metadata` text,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL,
	`resolved_at` text,
	FOREIGN KEY (`empresa_id`) REFERENCES `empresas`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `analise_jobs` (
	`id` text PRIMARY KEY NOT NULL,
	`empresa_id` text NOT NULL,
	`documento_id` text NOT NULL,
	`norma_ids` text,
	`status` text DEFAULT 'pending' NOT NULL,
	`tipo_analise` text DEFAULT 'completa',
	`priority` integer DEFAULT 5,
	`progresso` integer DEFAULT 0,
	`erro_detalhes` text,
	`parametros` text,
	`metadata` text,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`started_at` text,
	`completed_at` text,
	FOREIGN KEY (`empresa_id`) REFERENCES `empresas`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`documento_id`) REFERENCES `documentos_empresa`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `analise_resultados` (
	`id` text PRIMARY KEY NOT NULL,
	`empresa_id` text NOT NULL,
	`job_id` text NOT NULL,
	`documento_id` text,
	`score_geral` integer,
	`nivel_risco` text,
	`status_geral` text,
	`metadata` text,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`empresa_id`) REFERENCES `empresas`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`job_id`) REFERENCES `analise_jobs`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`documento_id`) REFERENCES `documentos_empresa`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `conformidade_gaps` (
	`id` text PRIMARY KEY NOT NULL,
	`analise_resultado_id` text NOT NULL,
	`norma_id` integer,
	`severidade` text NOT NULL,
	`resolvido` integer DEFAULT false NOT NULL,
	`categoria` text,
	`descricao` text NOT NULL,
	`recomendacao` text,
	`prazo_sugerido` text,
	`impacto` text,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`analise_resultado_id`) REFERENCES `analise_resultados`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `documentos_empresa` (
	`id` text PRIMARY KEY NOT NULL,
	`empresa_id` text NOT NULL,
	`nome_arquivo` text NOT NULL,
	`tipo_documento` text,
	`conteudo_extraido` text,
	`metadados` text,
	`url_storage` text,
	`versao` integer DEFAULT 1,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`empresa_id`) REFERENCES `empresas`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `empresas` (
	`id` text PRIMARY KEY NOT NULL,
	`nome` text NOT NULL,
	`cnpj` text,
	`setor` text,
	`porte` text,
	`configuracoes` text,
	`ativo` integer DEFAULT true NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL
);
