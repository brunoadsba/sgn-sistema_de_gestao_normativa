import { db } from "@/lib/db";
import { schema } from "@/lib/db";
import { eq, like, or, sql, desc, and } from "drizzle-orm";
import { NextResponse } from "next/server";
import { CreateEmpresaSchema } from "@/schemas/index";

export const revalidate = 60;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = Math.min(parseInt(searchParams.get("limit") || "10"), 100);
    const search = searchParams.get("search") || "";
    const offset = (page - 1) * limit;

    const conditions = [eq(schema.empresas.ativo, true)];

    if (search) {
      conditions.push(
        or(
          like(schema.empresas.nome, `%${search}%`),
          like(schema.empresas.cnpj, `%${search}%`),
          like(schema.empresas.setor, `%${search}%`)
        )!
      );
    }

    const whereClause = and(...conditions);

    const [empresas, countResult] = await Promise.all([
      db
        .select()
        .from(schema.empresas)
        .where(whereClause)
        .orderBy(desc(schema.empresas.createdAt))
        .limit(limit)
        .offset(offset),
      db
        .select({ count: sql<number>`count(*)` })
        .from(schema.empresas)
        .where(whereClause),
    ]);

    const count = countResult[0]?.count ?? 0;

    return NextResponse.json(
      {
        success: true,
        data: empresas,
        pagination: {
          page,
          limit,
          total: count,
          totalPages: Math.ceil(count / limit),
        },
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        },
      }
    );
  } catch {
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const parsed = CreateEmpresaSchema.safeParse(body);
    if (!parsed.success) {
      const errors = parsed.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join(', ');
      return NextResponse.json(
        { error: `Validação falhou: ${errors}` },
        { status: 400, headers: { "Cache-Control": "no-store" } }
      );
    }

    const { nome, cnpj, setor } = parsed.data;

    const inserted = await db
      .insert(schema.empresas)
      .values({ nome, cnpj, setor })
      .returning();

    return NextResponse.json(
      { success: true, data: inserted[0] },
      { status: 201, headers: { "Cache-Control": "no-store" } }
    );
  } catch {
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}
