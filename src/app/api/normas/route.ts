import { getNormas } from "@/lib/data/normas";
import { createSuccessResponse, createErrorResponse } from "@/middlewares/validation";

export const revalidate = 300;

export async function GET() {
  try {
    const normas = getNormas();

    return createSuccessResponse({
      items: normas.map(n => ({ id: n.id, codigo: n.codigo, titulo: n.titulo })),
      total: normas.length,
    });
  } catch {
    return createErrorResponse("Erro interno do servidor", 500);
  }
}
