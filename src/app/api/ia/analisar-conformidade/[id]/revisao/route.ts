import { NextRequest } from 'next/server'
import { createErrorResponse, createSuccessResponse } from '@/middlewares/validation'
import { buscarAnalisePorId, listarRevisoesAnalise } from '@/lib/ia/persistencia-analise'
import { IdParamSchema } from '@/schemas'
import { createRequestLogger } from '@/lib/logger'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const log = createRequestLogger(request, 'api.ia.revisao')
  try {
    const rawParams = await params
    const parsed = IdParamSchema.safeParse(rawParams)
    if (!parsed.success) {
      return createErrorResponse('ID invalido', 400)
    }
    const { id } = parsed.data
    const analise = await buscarAnalisePorId(id)
    if (!analise) {
      return createErrorResponse('Análise não encontrada', 404)
    }

    const revisoes = await listarRevisoesAnalise(id)
    return createSuccessResponse({
      analiseId: id,
      reportStatus: analise.reportStatus ?? 'pre_laudo_pendente',
      revisoes,
    })
  } catch (error) {
    log.error({ error }, 'Erro ao buscar histórico de revisão')
    return createErrorResponse(
      'Erro ao buscar histórico de revisão',
      500,
      error instanceof Error ? error.message : 'Erro desconhecido'
    )
  }
}
