import { z } from 'zod';

export const getNormaByIdSchema = z.object({
  id: z.string().regex(/^\d+$/, "ID da norma deve ser um número."),
});

export const searchNormasSchema = z.object({
  search: z.string().optional(),
  status: z.enum(['ativa', 'revogada', 'todas']).optional().default('todas'),
  page: z.string().regex(/^\d+$/).optional().default('1'),
  limit: z.string().regex(/^\d+$/).optional().default('10'),
});

export const createNormaSchema = z.object({
  codigo: z.string()
    .min(1, "Código da norma é obrigatório.")
    .max(100, "Código da norma não pode exceder 100 caracteres."),
  titulo: z.string()
    .min(1, "Título da norma é obrigatório.")
    .max(500, "Título da norma não pode exceder 500 caracteres."),
  orgao_publicador: z.string()
    .min(1, "Órgão publicador é obrigatório.")
    .max(200, "Órgão publicador não pode exceder 200 caracteres."),
  nr_num: z.number()
    .int("Número da NR deve ser um inteiro.")
    .positive("Número da NR deve ser positivo."),
  data_criacao: z.string().datetime("Data de criação deve ser uma data válida.").optional(),
  data_atualizacao: z.string().datetime("Data de atualização deve ser uma data válida.").optional(),
});
