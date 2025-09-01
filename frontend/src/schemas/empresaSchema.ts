import { z } from 'zod';

export const createEmpresaSchema = z.object({
  nome: z.string()
    .min(3, "O nome da empresa deve ter no mínimo 3 caracteres.")
    .max(255, "O nome da empresa não pode exceder 255 caracteres."),
  cnpj: z.string()
    .regex(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/, "CNPJ inválido. Formato esperado: XX.XXX.XXX/XXXX-XX."),
  endereco: z.string().optional(),
  telefone: z.string().optional(),
  email: z.string().email("Formato de e-mail inválido.").optional(),
});

// Exemplo de schema para atualização (parcial)
export const updateEmpresaSchema = createEmpresaSchema.partial();

// Exemplo de schema para parâmetros de rota
export const getEmpresaByIdSchema = z.object({
  id: z.string().uuid("ID da empresa inválido."),
});

// Schema para upload de documentos
export const uploadDocumentoSchema = z.object({
  empresaId: z.string().uuid("ID da empresa inválido."),
  tipo: z.enum(['contrato', 'certificado', 'relatorio', 'outro'], {
    message: "Tipo de documento deve ser: contrato, certificado, relatorio ou outro"
  }),
  descricao: z.string().optional(),
});
