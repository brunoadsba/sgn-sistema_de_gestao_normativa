import { getNormasStats } from "@/lib/data/normas";

export async function GET() {
  try {
    const stats = getNormasStats();

    return Response.json({
      success: true,
      data: stats,
    });
  } catch {
    return Response.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
