import { supabase } from "@/lib/supabase";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: empresaId } = await params;
    
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const tipoDocumento = formData.get("tipo_documento") as string;

    if (!file) {
      return Response.json({ error: "Arquivo é obrigatório" }, { status: 400 });
    }

    if (!tipoDocumento) {
      return Response.json({ error: "Tipo de documento é obrigatório" }, { status: 400 });
    }

    // Upload para Supabase Storage - caminho simplificado
    const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("documentos-empresa")
      .upload(fileName, file);

    if (uploadError) {
      console.error('Erro upload Supabase:', uploadError);
      return Response.json({ error: "Erro no upload do arquivo" }, { status: 500 });
    }

    // Salvar metadados no banco
    const { data, error } = await supabase
      .from("documentos_empresa")
      .insert([{
        empresa_id: empresaId,
        nome_arquivo: file.name,
        tipo_documento: tipoDocumento,
        url_storage: uploadData.path,
        metadados: {
          tamanho: file.size,
          tipo_mime: file.type,
          upload_timestamp: new Date().toISOString()
        }
      }])
      .select()
      .single();

    if (error) {
      console.error('Erro banco:', error);
      return Response.json({ error: "Erro ao salvar documento" }, { status: 500 });
    }

    return Response.json({
      success: true,
      data
    }, { status: 201 });

  } catch (err) {
    console.error('Erro geral:', err);
    return Response.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: empresaId } = await params;
    
    const { data: documentos, error } = await supabase
      .from("documentos_empresa")
      .select("*")
      .eq("empresa_id", empresaId)
      .order("created_at", { ascending: false });

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({
      success: true,
      data: documentos || [],
      total: documentos?.length || 0
    });

  } catch {
    return Response.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
