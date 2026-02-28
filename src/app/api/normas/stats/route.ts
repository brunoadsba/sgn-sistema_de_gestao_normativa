import { NextRequest } from "next/server";
import { getNormasStats } from "@/lib/data/normas";
import { createSuccessResponse, createErrorResponse } from "@/middlewares/validation";
import { createRequestLogger } from "@/lib/logger";

export async function GET(request: NextRequest) {
  const log = createRequestLogger(request, 'api.normas.stats');
  try {
    const stats = getNormasStats();

    return createSuccessResponse(stats);
  } catch (error) {
    log.error({ error }, 'Erro ao buscar estatísticas');
    return createErrorResponse("Erro interno do servidor", 500);
  }
}
