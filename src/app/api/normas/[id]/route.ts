import { NextRequest } from "next/server";
import { getNormaById } from "@/lib/data/normas";
import { createSuccessResponse, createErrorResponse } from "@/middlewares/validation";
import { NormaIdParamSchema } from "@/schemas";
import { createRequestLogger } from "@/lib/logger";

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const log = createRequestLogger(request, 'api.normas');
  try {
    const rawParams = await context.params;
    const parsed = NormaIdParamSchema.safeParse(rawParams);
    if (!parsed.success) {
      return createErrorResponse('ID da norma invalido', 400);
    }
    const { id } = parsed.data;
    const norma = getNormaById(id);

    if (!norma) {
      return createErrorResponse("Norma não encontrada", 404);
    }

    return createSuccessResponse(norma);
  } catch (error) {
    log.error({ error }, 'Erro ao buscar norma');
    return createErrorResponse("Erro interno do servidor", 500);
  }
}
