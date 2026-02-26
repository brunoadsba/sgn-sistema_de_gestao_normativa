import { NextRequest } from 'next/server'
import { createErrorResponse, createSuccessResponse } from '@/middlewares/validation'
import { buscarAnalisePorId, listarRevisoesAnalise } from '@/lib/ia/persistencia-analise'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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
    return createErrorResponse(
      'Erro ao buscar histórico de revisão',
      500,
      error instanceof Error ? error.message : 'Erro desconhecido'
    )
  }
}
