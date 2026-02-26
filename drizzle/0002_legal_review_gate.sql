CREATE TABLE `analise_revisoes` (
	`id` text PRIMARY KEY NOT NULL,
	`analise_resultado_id` text NOT NULL,
	`decisao` text NOT NULL,
	`revisor` text NOT NULL,
	`justificativa` text NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`analise_resultado_id`) REFERENCES `analise_resultados`(`id`) ON UPDATE no action ON DELETE cascade
);
