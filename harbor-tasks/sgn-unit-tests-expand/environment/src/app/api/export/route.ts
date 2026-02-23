import { getNormas } from "@/lib/data/normas";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const format = searchParams.get("format") || "json";
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const categoria = searchParams.get("categoria") || "";
    const limit = Math.min(parseInt(searchParams.get("limit") || "1000"), 1000);

    let normas = getNormas();

    // Aplicar filtros
    if (search) {
      const q = search.toLowerCase();
      normas = normas.filter(n =>
        n.codigo.toLowerCase().includes(q) ||
        n.titulo.toLowerCase().includes(q)
      );
    }
    if (status === "ativa") {
      normas = normas.filter(n => !n.titulo.toUpperCase().includes("REVOGADA"));
    } else if (status === "revogada") {
      normas = normas.filter(n => n.titulo.toUpperCase().includes("REVOGADA"));
    }
    if (categoria === "seguranca") {
      normas = normas.filter(n => n.titulo.toUpperCase().includes("SEGURANÇA"));
    } else if (categoria === "saude") {
      normas = normas.filter(n => n.titulo.toUpperCase().includes("SAÚDE"));
    }

    normas = normas.slice(0, limit);

    if (format === "csv") {
      const headers = ["ID", "Código", "Título", "Categoria", "Status"];
      const csvContent = [
        headers.join(","),
        ...normas.map(norma => [
          norma.id,
          `"${norma.codigo}"`,
          `"${norma.titulo.replace(/"/g, '""')}"`,
          `"${norma.categoria}"`,
          norma.status,
        ].join(","))
      ].join("\n");

      return new Response(csvContent, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="normas_${new Date().toISOString().split("T")[0]}.csv"`,
        },
      });
    }

    return Response.json({
      success: true,
      format,
      exported_at: new Date().toISOString(),
      total_records: normas.length,
      data: normas,
    });

  } catch {
    return Response.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
