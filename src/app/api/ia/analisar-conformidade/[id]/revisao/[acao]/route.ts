import { NextRequest } from 'next/server'
import { z } from 'zod'
import { rateLimit } from '@/lib/security/rate-limit'
import { createErrorResponse, createSuccessResponse } from '@/middlewares/validation'
import { buscarAnalisePorId, registrarRevisaoAnalise } from '@/lib/ia/persistencia-analise'

const RevisaoSchema = z.object({
  revisor: z.string().trim().min(2, 'Campo revisor deve ter pelo menos 2 caracteres'),
  justificativa: z.string().trim().min(10, 'Justificativa deve ter pelo menos 10 caracteres'),
})

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; acao: string }> }
) {
  try {
    const rl = rateLimit(request, {
      windowMs: 60_000,
      max: 30,
      keyPrefix: 'rl:revisao',
    })

    if (rl.limitExceeded) {
      return createErrorResponse('Muitas requisições. Tente novamente em breve.', 429)
    }

    const { id, acao } = await params
    const acaoNormalizada = acao.toLowerCase()
    if (acaoNormalizada !== 'aprovar' && acaoNormalizada !== 'rejeitar') {
      return createErrorResponse('Ação inválida. Use aprovar ou rejeitar.', 400)
    }

    const analise = await buscarAnalisePorId(id)
    if (!analise) {
      return createErrorResponse('Análise não encontrada', 404)
    }

    const rawBody = await request.json().catch(() => null)
    const parsed = RevisaoSchema.safeParse(rawBody)
    if (!parsed.success) {
      return createErrorResponse(
        parsed.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join(', '),
        400
      )
    }

    const resultado = await registrarRevisaoAnalise({
      analiseId: id,
      decisao: acaoNormalizada === 'aprovar' ? 'aprovado' : 'rejeitado',
      revisor: parsed.data.revisor,
      justificativa: parsed.data.justificativa,
    })

    return createSuccessResponse({
      analiseId: id,
      reportStatus: resultado.reportStatus,
      revisao: resultado.revisao,
    })
  } catch (error) {
    return createErrorResponse(
      'Erro ao registrar revisão humana',
      500,
      error instanceof Error ? error.message : 'Erro desconhecido'
    )
  }
}
