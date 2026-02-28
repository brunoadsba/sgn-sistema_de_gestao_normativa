import { NextRequest } from "next/server";
import { getNormas } from "@/lib/data/normas";
import { createSuccessResponse, createErrorResponse } from "@/middlewares/validation";
import { createRequestLogger } from "@/lib/logger";

export const revalidate = 300;

export async function GET(request: NextRequest) {
  const log = createRequestLogger(request, 'api.normas');
  try {
    const normas = getNormas();

    return createSuccessResponse({
      items: normas.map(n => ({ id: n.id, codigo: n.codigo, titulo: n.titulo })),
      total: normas.length,
    });
  } catch (error) {
    log.error({ error }, 'Erro ao listar normas');
    return createErrorResponse("Erro interno do servidor", 500);
  }
}
