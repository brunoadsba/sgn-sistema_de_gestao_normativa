import { supabase } from "@/lib/supabase";

export const revalidate = 0; // Jobs podem mudar status rapidamente

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: jobId } = await params;

    if (!jobId) {
      return Response.json({ 
        success: false, 
        error: "ID do job é obrigatório" 
      }, { status: 400 });
    }

    // Buscar job com relacionamentos
    const { data: job, error: jobError } = await supabase
      .from("analise_jobs")
      .select(`
        *,
        empresas(id, nome, cnpj, setor, porte),
        documentos_empresa(
          id, 
          nome_arquivo, 
          tipo_documento, 
          metadados,
          created_at
        )
      `)
      .eq("id", jobId)
      .single();

    if (jobError || !job) {
      return Response.json({ 
        success: false, 
        error: "Job não encontrado" 
      }, { status: 404 });
    }

    // Buscar resultado se o job estiver completo
    let analiseResultado = null;
    let gaps = [];
    
    if (job.status === 'completed') {
      // Buscar resultado da análise
      const { data: resultado, error: resultadoError } = await supabase
        .from("analise_resultados")
        .select("*")
        .eq("job_id", jobId)
        .single();
      
      if (!resultadoError && resultado) {
        analiseResultado = resultado;

        // Buscar gaps identificados
        const { data: gapsData, error: gapsError } = await supabase
          .from("conformidade_gaps")
          .select(`
            *,
            normas(id, codigo, titulo)
          `)
          .eq("analise_resultado_id", resultado.id)
          .order("severidade", { ascending: false })
          .order("created_at", { ascending: false });

        if (!gapsError && gapsData) {
          gaps = gapsData;
        }
      }
    }

    // Calcular métricas do job
    const tempoDecorrido = job.started_at 
      ? Math.floor((new Date().getTime() - new Date(job.started_at).getTime()) / 1000)
      : null;

    const tempoTotal = job.completed_at && job.started_at
      ? Math.floor((new Date(job.completed_at).getTime() - new Date(job.started_at).getTime()) / 1000)
      : null;

    // Extrair informações das normas dos parâmetros
    const normasInfo = job.parametros?.normas_codigos || [];
    const totalNormas = job.parametros?.total_normas || 0;

    const response = {
      success: true,
      data: {
        // Informações do job
        job: {
          id: job.id,
          status: job.status,
          priority: job.priority,
          tipo_analise: job.tipo_analise,
          progresso: job.progresso,
          erro_detalhes: job.erro_detalhes,
          created_at: job.created_at,
          started_at: job.started_at,
          completed_at: job.completed_at,
          
          // Métricas calculadas
          tempo_decorrido_segundos: tempoDecorrido,
          tempo_total_segundos: tempoTotal,
          tempo_decorrido_formatado: tempoDecorrido ? formatarTempo(tempoDecorrido) : null,
          tempo_total_formatado: tempoTotal ? formatarTempo(tempoTotal) : null,
          
          // Parâmetros da análise
          total_normas: totalNormas,
          normas_codigos: normasInfo
        },

        // Informações da empresa
        empresa: job.empresas,

        // Informações do documento
        documento: job.documentos_empresa,

        // Resultado da análise (se disponível)
        resultado: analiseResultado,

        // Gaps identificados (se disponível)
        gaps: gaps,

        // Estatísticas dos gaps
        estatisticas_gaps: gaps.length > 0 ? {
          total: gaps.length,
          critica: gaps.filter(g => g.severidade === 'critica').length,
          alta: gaps.filter(g => g.severidade === 'alta').length,
          media: gaps.filter(g => g.severidade === 'media').length,
          baixa: gaps.filter(g => g.severidade === 'baixa').length,
          resolvidos: gaps.filter(g => g.resolvido === true).length,
          pendentes: gaps.filter(g => g.resolvido === false).length
        } : null
      }
    };

    return Response.json(response);

  } catch (error) {
    console.error('Erro ao consultar job:', error);
    return Response.json({ 
      success: false, 
      error: "Erro interno do servidor" 
    }, { status: 500 });
  }
}

// PUT para atualizar status/progresso do job (para workers)
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: jobId } = await params;
    const body = await request.json();
    const { status, progresso, erro_detalhes, resultado } = body;

    if (!jobId) {
      return Response.json({ 
        success: false, 
        error: "ID do job é obrigatório" 
      }, { status: 400 });
    }

    // Validar status permitidos
    const statusPermitidos = ['pending', 'running', 'completed', 'failed', 'cancelled'];
    if (status && !statusPermitidos.includes(status)) {
      return Response.json({ 
        success: false, 
        error: "Status inválido" 
      }, { status: 400 });
    }

    // Validar progresso
    if (progresso !== undefined && (progresso < 0 || progresso > 100)) {
      return Response.json({ 
        success: false, 
        error: "Progresso deve estar entre 0 e 100" 
      }, { status: 400 });
    }

    // Preparar dados para atualização
    const updateData: any = {};
    
    if (status) updateData.status = status;
    if (progresso !== undefined) updateData.progresso = progresso;
    if (erro_detalhes) updateData.erro_detalhes = erro_detalhes;
    
    // Timestamps automáticos
    if (status === 'running' && !updateData.started_at) {
      updateData.started_at = new Date().toISOString();
    }
    if (status === 'completed' || status === 'failed') {
      updateData.completed_at = new Date().toISOString();
      updateData.progresso = status === 'completed' ? 100 : updateData.progresso;
    }

    // Atualizar job
    const { data: jobAtualizado, error: updateError } = await supabase
      .from("analise_jobs")
      .update(updateData)
      .eq("id", jobId)
      .select()
      .single();

    if (updateError) {
      return Response.json({ 
        success: false, 
        error: "Erro ao atualizar job" 
      }, { status: 500 });
    }

    // Se há resultado para salvar (job completo)
    if (status === 'completed' && resultado) {
      const { error: resultadoError } = await supabase
        .from("analise_resultados")
        .insert([{
          job_id: jobId,
          empresa_id: jobAtualizado.empresa_id,
          documento_id: jobAtualizado.documento_id,
          ...resultado
        }]);

      if (resultadoError) {
        console.error('Erro ao salvar resultado:', resultadoError);
        // Não falhar a requisição, apenas logar
      }
    }

    return Response.json({
      success: true,
      data: jobAtualizado,
      message: "Job atualizado com sucesso"
    });

  } catch (error) {
    console.error('Erro ao atualizar job:', error);
    return Response.json({ 
      success: false, 
      error: "Erro interno do servidor" 
    }, { status: 500 });
  }
}

// DELETE para cancelar job
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: jobId } = await params;

    if (!jobId) {
      return Response.json({ 
        success: false, 
        error: "ID do job é obrigatório" 
      }, { status: 400 });
    }

    // Verificar se job pode ser cancelado
    const { data: job, error: jobError } = await supabase
      .from("analise_jobs")
      .select("id, status")
      .eq("id", jobId)
      .single();

    if (jobError || !job) {
      return Response.json({ 
        success: false, 
        error: "Job não encontrado" 
      }, { status: 404 });
    }

    if (job.status === 'completed') {
      return Response.json({ 
        success: false, 
        error: "Não é possível cancelar job já concluído" 
      }, { status: 400 });
    }

    // Cancelar job
    const { data: jobCancelado, error: cancelError } = await supabase
      .from("analise_jobs")
      .update({
        status: 'cancelled',
        completed_at: new Date().toISOString(),
        erro_detalhes: 'Cancelado pelo usuário'
      })
      .eq("id", jobId)
      .select()
      .single();

    if (cancelError) {
      return Response.json({ 
        success: false, 
        error: "Erro ao cancelar job" 
      }, { status: 500 });
    }

    return Response.json({
      success: true,
      data: jobCancelado,
      message: "Job cancelado com sucesso"
    });

  } catch (error) {
    console.error('Erro ao cancelar job:', error);
    return Response.json({ 
      success: false, 
      error: "Erro interno do servidor" 
    }, { status: 500 });
  }
}

// Função utilitária para formatar tempo
function formatarTempo(segundos: number): string {
  const horas = Math.floor(segundos / 3600);
  const minutos = Math.floor((segundos % 3600) / 60);
  const segs = segundos % 60;

  if (horas > 0) {
    return `${horas}h ${minutos}m ${segs}s`;
  } else if (minutos > 0) {
    return `${minutos}m ${segs}s`;
  } else {
    return `${segs}s`;
  }
}
