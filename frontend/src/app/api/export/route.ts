import { supabase } from "@/lib/supabase";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const format = searchParams.get("format") || "json"; // json ou csv
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const categoria = searchParams.get("categoria") || "";
    const limit = Math.min(parseInt(searchParams.get("limit") || "1000"), 1000);

    let query = supabase
      .from("normas")
      .select("id,codigo,titulo,orgao_publicador,created_at");

    // Aplicar filtros
    if (search) {
      query = query.or(`codigo.ilike.%${search}%,titulo.ilike.%${search}%`);
    }
    if (status === "ativa") {
      query = query.not("titulo", "ilike", "%REVOGADA%");
    } else if (status === "revogada") {
      query = query.ilike("titulo", "%REVOGADA%");
    }
    if (categoria === "seguranca") {
      query = query.ilike("titulo", "%SEGURANÇA%");
    } else if (categoria === "saude") {
      query = query.ilike("titulo", "%SAÚDE%");
    }

    const { data: normas, error } = await query
      .order("codigo")
      .limit(limit);

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    if (format === "csv") {
      // Gerar CSV
      const headers = ["ID", "Código", "Título", "Órgão", "Data Criação"];
      const csvContent = [
        headers.join(","),
        ...(normas || []).map(norma => [
          norma.id,
          `"${norma.codigo}"`,
          `"${norma.titulo.replace(/"/g, "\"\"")}"`,
          `"${norma.orgao_publicador}"`,
          norma.created_at
        ].join(","))
      ].join("\n");

      return new Response(csvContent, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="normas_${new Date().toISOString().split("T")[0]}.csv"`
        }
      });
    }

    // Formato JSON (padrão)
    return Response.json({
      success: true,
      format,
      exported_at: new Date().toISOString(),
      total_records: normas?.length || 0,
      data: normas
    });

  } catch (error) {
    return Response.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
