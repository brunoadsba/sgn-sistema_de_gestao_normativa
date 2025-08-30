import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;

  try {
    const { data: norma, error } = await supabase
      .from("normas")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      return Response.json({ error: "Norma não encontrada" }, { status: 404 });
    }

    return Response.json({ success: true, data: norma });
  } catch {
    return Response.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
