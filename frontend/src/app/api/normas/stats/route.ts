import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    // Total de normas
    const { count: total } = await supabase
      .from("normas")
      .select("*", { count: "exact", head: true });

    // Normas revogadas
    const { count: revogadas } = await supabase
      .from("normas")
      .select("*", { count: "exact", head: true })
      .ilike("titulo", "%REVOGADA%");

    // Cálculo correto: ativas = total - revogadas
    const ativas = (total || 0) - (revogadas || 0);

    return Response.json({
      success: true,
      data: {
        total: total || 0,
        ativas: ativas,
        revogadas: revogadas || 0,
        recentes: 0, // Temporariamente 0
        ultima_atualizacao: new Date().toISOString()
      }
    });
  } catch {
    return Response.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
