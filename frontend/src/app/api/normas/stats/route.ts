import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    // Total de normas
    const { count: total } = await supabase
      .from("normas")
      .select("*", { count: "exact", head: true });

    // Normas ativas vs revogadas
    const { count: revogadas } = await supabase
      .from("normas")
      .select("*", { count: "exact", head: true })
      .ilike("titulo", "%REVOGADA%");

    // Normas por categoria
    const { count: seguranca } = await supabase
      .from("normas")
      .select("*", { count: "exact", head: true })
      .ilike("titulo", "%SEGURANÇA%");

    const { count: saude } = await supabase
      .from("normas")
      .select("*", { count: "exact", head: true })
      .ilike("titulo", "%SAÚDE%");

    // Normas criadas nos últimos 30 dias
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const { count: recentes } = await supabase
      .from("normas")
      .select("*", { count: "exact", head: true })
      .gte("created_at", thirtyDaysAgo.toISOString());

    return Response.json({
      success: true,
      data: {
        total: total || 0,
        ativas: (total || 0) - (revogadas || 0),
        revogadas: revogadas || 0,
        categorias: {
          seguranca: seguranca || 0,
          saude: saude || 0,
          outras: (total || 0) - (seguranca || 0) - (saude || 0)
        },
        recentes: recentes || 0,
        ultima_atualizacao: new Date().toISOString()
      }
    });
  } catch {
    return Response.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
