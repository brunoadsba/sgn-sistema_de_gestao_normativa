import { NextRequest } from "next/server";
import { z } from "zod";
import { searchNormas } from "@/lib/data/normas";
import { rateLimit } from "@/lib/security/rate-limit";
import { createSuccessResponse, createErrorResponse } from "@/middlewares/validation";

const SearchQuerySchema = z.object({
  q: z.string().min(1).max(200),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

export async function GET(request: NextRequest) {
  try {
    const rl = rateLimit(request, { windowMs: 60_000, max: 60, keyPrefix: 'rl:search' });
    if (rl.limitExceeded) {
      return createErrorResponse("Limite de requisições excedido", 429);
    }

    const raw = Object.fromEntries(new URL(request.url).searchParams.entries());
    const parsed = SearchQuerySchema.safeParse(raw);

    if (!parsed.success) {
      const msgs = parsed.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join(', ');
      return createErrorResponse(`Dados inválidos: ${msgs}`, 400);
    }

    const { q, limit } = parsed.data;
    const normas = searchNormas(q).slice(0, limit);

    const results = normas.map(norma => {
      let score = 0;
      const query = q.toLowerCase();
      const codigo = norma.codigo.toLowerCase();
      const titulo = norma.titulo.toLowerCase();

      if (codigo.includes(query)) score += 10;
      if (titulo.includes(query)) score += 5;
      if (codigo.startsWith(query)) score += 15;
      if (titulo.startsWith(query)) score += 8;
      if (!titulo.includes("revogada")) score += 2;

      return { ...norma, relevance_score: score };
    }).sort((a, b) => b.relevance_score - a.relevance_score);

    return createSuccessResponse({
      query: q,
      results,
      total_found: results.length,
    });

  } catch {
    return createErrorResponse("Erro interno do servidor", 500);
  }
}
