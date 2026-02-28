import { desc, eq } from 'drizzle-orm';
import { db, schema } from '@/lib/db';
import { ReportStatus, RevisaoHumana } from '@/types/ia';
import { getMetadata, toReportStatus } from './jobs';

export async function registrarRevisaoAnalise(params: {
  analiseId: string
  decisao: 'aprovado' | 'rejeitado'
  revisor: string
  justificativa: string
}): Promise<{ reportStatus: ReportStatus; revisao: RevisaoHumana }> {
  const analise = await db
    .select({
      id: schema.analiseResultados.id,
      metadata: schema.analiseResultados.metadata,
    })
    .from(schema.analiseResultados)
    .where(eq(schema.analiseResultados.id, params.analiseId))
    .get()

  if (!analise) {
    throw new Error('Análise não encontrada')
  }

  const reportStatus: ReportStatus =
    params.decisao === 'aprovado' ? 'laudo_aprovado' : 'laudo_rejeitado'

  const revisao: RevisaoHumana = {
    decisao: params.decisao,
    revisor: params.revisor.trim(),
    justificativa: params.justificativa.trim(),
    createdAt: new Date().toISOString(),
  }

  const metadataAtual = getMetadata(analise.metadata)
  const statusAtual = toReportStatus(metadataAtual.reportStatus)
  if (statusAtual !== 'pre_laudo_pendente') {
    throw new Error(`Transição inválida de status. Estado atual: ${statusAtual}`)
  }

  const metadataNovo = {
    ...metadataAtual,
    reportStatus,
    revisaoHumana: revisao,
  }

  await db.transaction(async (tx) => {
    await tx.insert(schema.analiseRevisoes).values({
      analiseResultadoId: params.analiseId,
      decisao: params.decisao,
      revisor: revisao.revisor,
      justificativa: revisao.justificativa,
      createdAt: revisao.createdAt,
    })

    await tx
      .update(schema.analiseResultados)
      .set({
        metadata: metadataNovo,
      })
      .where(eq(schema.analiseResultados.id, params.analiseId))
  })

  return { reportStatus, revisao }
}

export async function listarRevisoesAnalise(analiseId: string): Promise<RevisaoHumana[]> {
  const revisoes = await db
    .select()
    .from(schema.analiseRevisoes)
    .where(eq(schema.analiseRevisoes.analiseResultadoId, analiseId))
    .orderBy(desc(schema.analiseRevisoes.createdAt))

  return revisoes.map((item) => ({
    decisao: item.decisao === 'aprovado' ? 'aprovado' : 'rejeitado',
    revisor: item.revisor,
    justificativa: item.justificativa,
    createdAt: item.createdAt,
  }))
}
