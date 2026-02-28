import { NextRequest } from "next/server";
import { z } from "zod";
import { getNormas } from "@/lib/data/normas";
import { rateLimit } from "@/lib/security/rate-limit";
import { createSuccessResponse, createErrorResponse } from "@/middlewares/validation";

const ExportQuerySchema = z.object({
  format: z.enum(['json', 'csv']).default('json'),
  search: z.string().max(200).default(''),
  status: z.string().max(50).default(''),
  categoria: z.string().max(50).default(''),
  limit: z.coerce.number().int().min(1).max(1000).default(1000),
});

export async function GET(request: NextRequest) {
  try {
    const rl = rateLimit(request, { windowMs: 60_000, max: 10, keyPrefix: 'rl:export' });
    if (rl.limitExceeded) {
      return createErrorResponse("Limite de requisições excedido", 429);
    }

    const raw = Object.fromEntries(new URL(request.url).searchParams.entries());
    const parsed = ExportQuerySchema.safeParse(raw);

    if (!parsed.success) {
      const msgs = parsed.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join(', ');
      return createErrorResponse(`Dados inválidos: ${msgs}`, 400);
    }

    const { format, search, status, categoria, limit } = parsed.data;

    let normas = getNormas();

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

    return createSuccessResponse({
      format,
      exported_at: new Date().toISOString(),
      total_records: normas.length,
      records: normas,
    });

  } catch {
    return createErrorResponse("Erro interno do servidor", 500);
  }
}
