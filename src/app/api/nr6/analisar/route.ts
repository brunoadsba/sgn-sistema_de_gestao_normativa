import { NextRequest } from 'next/server'
import { z } from 'zod'
import { analisarNR6 } from '@/lib/ia/analisador-nr6'
import { AnaliseNR6Request } from '@/lib/ia/analisador-nr6'
import { createRequestLogger } from '@/lib/logger'
import { env } from '@/lib/env'
import { rateLimit } from '@/lib/security/rate-limit'
import { createSuccessResponse, createErrorResponse } from '@/middlewares/validation'

const NR6AnalisarSchema = z.object({
  documento: z.string().min(1).max(50_000),
  tipoDocumento: z.string().min(1),
})

// POST /api/nr6/analisar
export async function POST(request: NextRequest) {
  const rl = rateLimit(request, { windowMs: 60_000, max: 15, keyPrefix: 'rl:nr6-analisar' })
  if (rl.limitExceeded) {
    return createErrorResponse('Muitas requisicoes. Tente novamente em breve.', 429)
  }

  const logger = createRequestLogger(request, 'api.nr6')
  try {
    const body = await request.json()

    const parsed = NR6AnalisarSchema.parse(body)

    const inicioProcessamento = Date.now()

    const resultado = await analisarNR6(parsed as AnaliseNR6Request)

    const tempoProcessamento = Date.now() - inicioProcessamento

    const respostaCompleta = {
      ...resultado,
      timestamp: new Date().toISOString(),
      modeloUsado: env.GROQ_MODEL_NR6,
      tempoProcessamento,
      norma: 'NR-6',
      versao: '2024.1'
    }

    logger.info({
      score: resultado.score,
      gaps: resultado.gaps.length,
      conformidadeNR6: resultado.conformidadeNR6,
      tempoProcessamento
    }, 'Análise NR-6 concluída')

    return createSuccessResponse(respostaCompleta)

  } catch (error) {
    if (error instanceof z.ZodError) {
      const detalhes = error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join(', ')
      return createErrorResponse(`Dados de entrada inválidos: ${detalhes}`, 400)
    }

    logger.error({ error: error instanceof Error ? error.message : 'Erro desconhecido' }, 'Erro na análise NR-6')

    return createErrorResponse(
      'Erro interno do servidor na análise NR-6',
      500,
      error instanceof Error ? error.message : 'Erro desconhecido'
    )
  }
}