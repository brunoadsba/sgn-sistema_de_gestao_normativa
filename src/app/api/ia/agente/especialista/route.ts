import { NextRequest } from 'next/server'
import { z } from 'zod'
import { rateLimit } from '@/lib/security/rate-limit'
import { createErrorResponse, createSuccessResponse } from '@/middlewares/validation'
import { inferirNormasHeuristicas } from '@/lib/ia/nr-heuristics'
import { selecionarPerfilEspecialista } from '@/lib/ia/specialist-agent'

const BodySchema = z.object({
  texto: z.string().min(1, 'Campo texto é obrigatório'),
  tipoDocumento: z.string().optional().default('OUTRO'),
})

export async function POST(request: NextRequest) {
  try {
    const rl = rateLimit(request, {
      windowMs: 60_000,
      max: 20,
      keyPrefix: 'rl:especialista',
    })

    if (rl.limitExceeded) {
      return createErrorResponse('Muitas requisições. Tente novamente em breve.', 429)
    }

    const rawBody = await request.json().catch(() => null)
    const parsed = BodySchema.safeParse(rawBody)
    if (!parsed.success) {
      return createErrorResponse(
        parsed.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join(', '),
        400
      )
    }

    const profile = selecionarPerfilEspecialista({
      documento: parsed.data.texto,
      tipoDocumento: parsed.data.tipoDocumento,
    })
    const normasHeuristicas = inferirNormasHeuristicas(parsed.data.texto, parsed.data.tipoDocumento)

    return createSuccessResponse({
      profile,
      normasHeuristicas,
    })
  } catch (error) {
    return createErrorResponse(
      'Erro ao selecionar agente especialista',
      500,
      error instanceof Error ? error.message : 'Erro desconhecido'
    )
  }
}
