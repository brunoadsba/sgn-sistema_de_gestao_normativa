import { getNormas } from "@/lib/data/normas";
import { NextResponse } from "next/server";

export const revalidate = 300;

export async function GET() {
  try {
    const normas = getNormas();

    return NextResponse.json({
      success: true,
      data: normas.map(n => ({ id: n.id, codigo: n.codigo, titulo: n.titulo })),
      total: normas.length,
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
