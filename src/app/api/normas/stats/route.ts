import { getNormasStats } from "@/lib/data/normas";
import { createSuccessResponse, createErrorResponse } from "@/middlewares/validation";

export async function GET() {
  try {
    const stats = getNormasStats();

    return createSuccessResponse(stats);
  } catch {
    return createErrorResponse("Erro interno do servidor", 500);
  }
}
