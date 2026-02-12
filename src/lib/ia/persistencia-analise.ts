import { and, desc, eq, sql } from 'drizzle-orm';
import { db, schema } from '@/lib/db';
import { AnaliseConformidadeRequest, AnaliseConformidadeResponse } from '@/types/ia';
import { log } from '@/lib/logger';
import { extrairNormaId, normalizarGap, toStringArray, toStringValue } from '@/lib/ia/analise-mappers';

export type AnaliseListagem = {
  analises: AnaliseConformidadeResponse[];
  paginacao: {
    pagina: number;
    limite: number;
    total: number;
    totalPaginas: number;
    temProxima: boolean;
    temAnterior: boolean;
  };
};

export async function persistirAnaliseConformidade(
  entrada: AnaliseConformidadeRequest,
  resultado: AnaliseConformidadeResponse
): Promise<void> {
  if (!entrada.empresaId) {
    log.warn('Análise concluída sem empresaId; persistência ignorada');
    return;
  }

  const empresa = await db
    .select({ id: schema.empresas.id })
    .from(schema.empresas)
    .where(and(eq(schema.empresas.id, entrada.empresaId), eq(schema.empresas.ativo, true)))
    .limit(1);

  if (empresa.length === 0) {
    log.warn({ empresaId: entrada.empresaId }, 'Empresa não encontrada; persistência ignorada');
    return;
  }

  const documentoInserido = await db
    .insert(schema.documentosEmpresa)
    .values({
      empresaId: entrada.empresaId,
      nomeArquivo: `analise-ia-${Date.now()}.txt`,
      tipoDocumento: entrada.tipoDocumento,
      conteudoExtraido: entrada.documento,
      metadados: {
        origem: 'api-ia-analisar-conformidade',
      },
    })
    .returning({ id: schema.documentosEmpresa.id });

  const documentoId = documentoInserido[0]?.id;
  if (!documentoId) {
    throw new Error('Falha ao criar documento para persistência da análise');
  }

  const jobInserido = await db
    .insert(schema.analiseJobs)
    .values({
      empresaId: entrada.empresaId,
      documentoId,
      normaIds: entrada.normasAplicaveis ?? [],
      status: 'completed',
      tipoAnalise: 'completa',
      priority: 5,
      progresso: 100,
      parametros: {
        tipoDocumento: entrada.tipoDocumento,
      },
      metadata: {
        modeloUsado: resultado.modeloUsado,
      },
      startedAt: new Date(Date.now() - resultado.tempoProcessamento).toISOString(),
      completedAt: new Date().toISOString(),
    })
    .returning({ id: schema.analiseJobs.id });

  const jobId = jobInserido[0]?.id;
  if (!jobId) {
    throw new Error('Falha ao criar job para persistência da análise');
  }

  const resultadoInserido = await db
    .insert(schema.analiseResultados)
    .values({
      empresaId: entrada.empresaId,
      jobId,
      documentoId,
      scoreGeral: Math.round(resultado.score),
      nivelRisco: resultado.nivelRisco,
      statusGeral: resultado.score >= 80 ? 'conforme' : resultado.score >= 60 ? 'parcial_conforme' : 'nao_conforme',
      metadata: {
        resumo: resultado.resumo,
        pontosPositivos: resultado.pontosPositivos,
        pontosAtencao: resultado.pontosAtencao,
        proximosPassos: resultado.proximosPassos,
        modeloUsado: resultado.modeloUsado,
        tempoProcessamento: resultado.tempoProcessamento,
        timestamp: resultado.timestamp,
      },
    })
    .returning({ id: schema.analiseResultados.id });

  const analiseResultadoId = resultadoInserido[0]?.id;
  if (!analiseResultadoId) {
    throw new Error('Falha ao criar resultado para persistência da análise');
  }

  if (resultado.gaps.length > 0) {
    await db.insert(schema.conformidadeGaps).values(
      resultado.gaps.map((gap) => ({
        analiseResultadoId,
        normaId: extrairNormaId(gap.normasRelacionadas),
        severidade: gap.severidade,
        categoria: gap.categoria,
        descricao: gap.descricao,
        recomendacao: gap.recomendacao,
        prazoSugerido: gap.prazo,
        impacto: gap.impacto,
      }))
    );
  }
}

export async function listarAnalisesConformidade(
  pagina: number,
  limite: number,
  empresaId?: string
): Promise<AnaliseListagem> {
  const offset = (pagina - 1) * limite;
  const whereClause = empresaId ? eq(schema.analiseResultados.empresaId, empresaId) : undefined;

  const [countResult, resultados] = await Promise.all([
    db
      .select({ count: sql<number>`count(*)` })
      .from(schema.analiseResultados)
      .where(whereClause),
    db
      .select({
        id: schema.analiseResultados.id,
        scoreGeral: schema.analiseResultados.scoreGeral,
        nivelRisco: schema.analiseResultados.nivelRisco,
        metadata: schema.analiseResultados.metadata,
        createdAt: schema.analiseResultados.createdAt,
      })
      .from(schema.analiseResultados)
      .where(whereClause)
      .orderBy(desc(schema.analiseResultados.createdAt))
      .limit(limite)
      .offset(offset),
  ]);

  const total = countResult[0]?.count ?? 0;

  const analises = await Promise.all(
    resultados.map(async (item) => {
      const gapsRaw = await db
        .select()
        .from(schema.conformidadeGaps)
        .where(eq(schema.conformidadeGaps.analiseResultadoId, item.id));

      const metadata = (item.metadata ?? {}) as Record<string, unknown>;

      return {
        score: item.scoreGeral ?? 0,
        nivelRisco: (item.nivelRisco as AnaliseConformidadeResponse['nivelRisco']) ?? 'medio',
        gaps: gapsRaw.map(normalizarGap),
        resumo: toStringValue(metadata.resumo),
        pontosPositivos: toStringArray(metadata.pontosPositivos),
        pontosAtencao: toStringArray(metadata.pontosAtencao),
        proximosPassos: toStringArray(metadata.proximosPassos),
        timestamp: toStringValue(metadata.timestamp, item.createdAt),
        modeloUsado: toStringValue(metadata.modeloUsado, 'desconhecido'),
        tempoProcessamento:
          typeof metadata.tempoProcessamento === 'number' ? metadata.tempoProcessamento : 0,
      } satisfies AnaliseConformidadeResponse;
    })
  );

  return {
    analises,
    paginacao: {
      pagina,
      limite,
      total,
      totalPaginas: total === 0 ? 0 : Math.ceil(total / limite),
      temProxima: pagina * limite < total,
      temAnterior: pagina > 1,
    },
  };
}
