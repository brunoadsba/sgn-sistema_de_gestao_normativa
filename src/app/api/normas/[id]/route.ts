import { NextRequest } from "next/server";
import { getNormaById } from "@/lib/data/normas";
import { createSuccessResponse, createErrorResponse } from "@/middlewares/validation";

export async function GET(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;

  try {
    const norma = getNormaById(id);

    if (!norma) {
      return createErrorResponse("Norma não encontrada", 404);
    }

    return createSuccessResponse(norma);
  } catch {
    return createErrorResponse("Erro interno do servidor", 500);
  }
}
