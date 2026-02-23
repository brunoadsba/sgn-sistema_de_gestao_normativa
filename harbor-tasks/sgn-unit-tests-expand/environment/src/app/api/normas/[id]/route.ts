import { NextRequest } from "next/server";
import { getNormaById } from "@/lib/data/normas";

export async function GET(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;

  try {
    const norma = getNormaById(id);

    if (!norma) {
      return Response.json({ error: "Norma não encontrada" }, { status: 404 });
    }

    return Response.json({ success: true, data: norma });
  } catch {
    return Response.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
