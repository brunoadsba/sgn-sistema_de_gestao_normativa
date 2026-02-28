import { eq } from 'drizzle-orm';
import { db, schema } from '@/lib/db';
import {
  AnaliseConformidadeRequest,
  AnaliseConformidadeResponse,
  ReportStatus,
} from '@/types/ia';
import { log } from '@/lib/logger';
import { extrairNormaId } from '@/lib/ia/analise-mappers';

export function getMetadata(item: Record<string, unknown> | null | undefined): Record<string, unknown> {
  return (item ?? {}) as Record<string, unknown>;
}

export function toNumberValue(value: unknown, fallback = 0): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

export function toReportStatus(value: unknown): ReportStatus {
  if (value === 'laudo_aprovado' || value === 'laudo_rejeitado' || value === 'pre_laudo_pendente') {
    return value;
  }
  return 'pre_laudo_pendente';
}

export async function iniciarJobAnalise(
  entrada: { nomeArquivo: string; tipoDocumento: string; normasAplicaveis: string[] },
  initialStatus: string = 'extracting',
  sessionId?: string
): Promise<{ documentoId: string; jobId: string }> {
  const { id: documentoId } = await db
    .insert(schema.documentos)
    .values({
      nomeArquivo: entrada.nomeArquivo,
      tipoDocumento: entrada.tipoDocumento,
      metadados: { origem: 'api-ia-analisar-conformidade' },
    })
    .returning({ id: schema.documentos.id })
    .get();

  const { id: jobId } = await db
    .insert(schema.analiseJobs)
    .values({
      documentoId,
      normaIds: entrada.normasAplicaveis,
      status: initialStatus,
      progresso: 0,
      tipoAnalise: 'completa',
      sessionId: sessionId || null,
      startedAt: new Date().toISOString(),
    })
    .returning({ id: schema.analiseJobs.id })
    .get();

  return { documentoId, jobId };
}

export async function atualizarProgressoJob(
  jobId: string,
  status: string,
  progresso: number,
  erroDetalhes?: string
): Promise<void> {
  await db
    .update(schema.analiseJobs)
    .set({
      status,
      progresso,
      erroDetalhes: erroDetalhes || null,
    })
    .where(eq(schema.analiseJobs.id, jobId));
}

export async function finalizarJobAnalise(
  jobId: string,
  documentoId: string,
  entrada: AnaliseConformidadeRequest,
  resultado: AnaliseConformidadeResponse
): Promise<void> {
  await db.transaction(async (tx) => {
    if (entrada.documento) {
      await tx
        .update(schema.documentos)
        .set({ conteudoExtraido: entrada.documento })
        .where(eq(schema.documentos.id, documentoId));
    }

    const resultadoInserido = await tx
      .insert(schema.analiseResultados)
      .values({
        jobId,
        documentoId,
        scoreGeral: Math.round(resultado.score),
        nivelRisco: resultado.nivelRisco,
        statusGeral: resultado.score >= 80 ? 'conforme' : resultado.score >= 60 ? 'parcial_conforme' : 'nao_conforme',
        metadata: {
          resumo: resultado.resumo,
          nomeArquivo: entrada.tipoDocumento,
          tipoDocumento: entrada.tipoDocumento,
          estrategiaProcessamento: entrada.estrategiaProcessamento ?? 'completo',
          chunkMetadados: entrada.chunkMetadados ?? [],
          pontosPositivos: resultado.pontosPositivos,
          pontosAtencao: resultado.pontosAtencao,
          proximosPassos: resultado.proximosPassos,
          modeloUsado: resultado.modeloUsado,
          tempoProcessamento: resultado.tempoProcessamento,
          timestamp: resultado.timestamp,
          metadadosProcessamento: resultado.metadadosProcessamento ?? null,
          evidenciasUtilizadas: resultado.gaps.flatMap((gap) => gap.evidencias ?? []),
          contextoBaseConhecimento: entrada.contextoBaseConhecimento ?? null,
          reportStatus: resultado.reportStatus ?? 'pre_laudo_pendente',
          confidenceScore: resultado.confidenceScore ?? 0,
          confidenceClass: resultado.confidenceClass ?? 'confianca_baixa',
          confidenceSignals: resultado.confidenceSignals ?? null,
          alertasConfiabilidade: resultado.alertasConfiabilidade ?? [],
          documentHash: resultado.documentHash ?? null,
          revisaoHumana: resultado.revisaoHumana ?? null,
        },
      })
      .returning({ id: schema.analiseResultados.id })
      .get();

    const analiseResultadoId = resultadoInserido.id;

    if (resultado.gaps.length > 0) {
      await tx.insert(schema.conformidadeGaps).values(
        resultado.gaps.map((gap) => ({
          analiseResultadoId,
          normaId: extrairNormaId(gap.normasRelacionadas),
          severidade: gap.severidade,
          categoria: gap.categoria,
          descricao: gap.descricao,
          recomendacao: gap.recomendacao,
          prazoSugerido: gap.prazo,
          impacto: gap.impacto,
          citacaoDocumento: gap.citacaoDocumento,
          paginaDocumento: gap.paginaDocumento,
          linhaDocumento: gap.linhaDocumento,
          probabilidade: gap.probabilidade,
          pontuacaoGut: gap.pontuacaoGut,
          classificacao: gap.classificacao,
          prazoDias: gap.prazoDias,
        }))
      );
    }

    await tx
      .update(schema.analiseJobs)
      .set({
        status: 'completed',
        progresso: 100,
        completedAt: new Date().toISOString(),
      })
      .where(eq(schema.analiseJobs.id, jobId));
  });

  log.info({ jobId, documentoId }, 'Job de análise finalizado com sucesso');
}
