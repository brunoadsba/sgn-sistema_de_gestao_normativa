import { supabase } from "@/lib/supabase";

export const revalidate = 0; // Sempre executar fresh para análises

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { empresa_id, documento_id, norma_ids, priority = 5, tipo_analise = 'completa' } = body;

    if (!empresa_id || !documento_id || !Array.isArray(norma_ids) || norma_ids.length === 0) {
      return Response.json(
        { success: false, error: "empresa_id, documento_id e norma_ids são obrigatórios" },
        { status: 400, headers: { "Cache-Control": "no-store" } }
      );
    }

    const { data: empresa, error: empresaError } = await supabase
      .from("empresas")
      .select("id, nome, ativo")
      .eq("id", empresa_id)
      .eq("ativo", true)
      .single();

    if (empresaError || !empresa) {
      return Response.json(
        { success: false, error: "Empresa não encontrada ou inativa" },
        { status: 404, headers: { "Cache-Control": "no-store" } }
      );
    }

    const { data: documento, error: documentoError } = await supabase
      .from("documentos_empresa")
      .select("id, nome_arquivo, tipo_documento, metadados")
      .eq("id", documento_id)
      .eq("empresa_id", empresa_id)
      .single();

    if (documentoError || !documento) {
      return Response.json(
        { success: false, error: "Documento não encontrado ou não pertence à empresa" },
        { status: 404, headers: { "Cache-Control": "no-store" } }
      );
    }

    const { data: normas, error: normasError } = await supabase
      .from("normas")
      .select("id, codigo, titulo")
      .in("id", norma_ids);

    if (normasError || !normas || normas.length !== norma_ids.length) {
      return Response.json(
        { success: false, error: "Uma ou mais normas não foram encontradas" },
        { status: 404, headers: { "Cache-Control": "no-store" } }
      );
    }

    const { data: job, error: jobError } = await supabase
      .from("analise_jobs")
      .insert([{
        empresa_id,
        documento_id,
        status: 'pending',
        priority: Math.max(1, Math.min(10, priority)),
        tipo_analise,
        parametros: {
          norma_ids,
          total_normas: normas.length,
          documento_nome: documento.nome_arquivo,
          normas_codigos: normas.map(n => n.codigo),
          empresa_nome: empresa.nome,
          timestamp_criacao: new Date().toISOString()
        },
        progresso: 0
      }])
      .select()
      .single();

    if (jobError) {
      return Response.json(
        { success: false, error: "Erro ao criar job de análise" },
        { status: 500, headers: { "Cache-Control": "no-store" } }
      );
    }

    return Response.json(
      {
        success: true,
        data: {
          job_id: job.id,
          status: job.status,
          message: `Análise de conformidade iniciada para ${normas.length} normas`,
          empresa: empresa.nome,
          documento: documento.nome_arquivo,
          normas_analisadas: normas.length,
          estimated_completion: "5-15 minutos",
          created_at: job.created_at
        }
      },
      { status: 201, headers: { "Cache-Control": "no-store" } }
    );

  } catch (error) {
    console.error('Erro interno na API de análise:', error);
    return Response.json(
      { success: false, error: "Erro interno do servidor" },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}

// GET para listar jobs da empresa (cacheável)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const empresa_id = searchParams.get("empresa_id");
    const status = searchParams.get("status");
    const limit = Math.min(parseInt(searchParams.get("limit") || "10"), 50);

    if (!empresa_id) {
      return Response.json(
        { success: false, error: "empresa_id é obrigatório" },
        { status: 400, headers: { "Cache-Control": "no-store" } }
      );
    }

    let query = supabase
      .from("analise_jobs")
      .select(`
        *,
        documentos_empresa(nome_arquivo, tipo_documento),
        empresas(nome)
      `)
      .eq("empresa_id", empresa_id)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (status) {
      query = query.eq("status", status);
    }

    const { data: jobs, error } = await query;

    if (error) {
      return Response.json(
        { success: false, error: "Erro ao buscar jobs" },
        { status: 500, headers: { "Cache-Control": "no-store" } }
      );
    }

    return Response.json(
      { success: true, data: jobs || [], total: jobs?.length || 0 },
      { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } }
    );

  } catch (error) {
    console.error('Erro ao listar jobs:', error);
    return Response.json(
      { success: false, error: "Erro interno do servidor" },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}
