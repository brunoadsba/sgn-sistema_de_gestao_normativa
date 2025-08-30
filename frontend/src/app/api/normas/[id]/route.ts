import { supabase } from "@/lib/supabase";

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { data: norma, error } = await supabase
      .from("normas")
      .select("*")
      .eq("id", params.id)
      .single();

    if (error) {
      return Response.json({ error: "Norma não encontrada" }, { status: 404 });
    }

    return Response.json({ success: true, data: norma });
  } catch (error) {
    return Response.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
