import { NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { env } from '@/lib/env'
import { AnaliseConformidadeRequest } from '@/types/ia'
import { CreateAnaliseSchema } from '@/schemas'
import { createSuccessResponse, createErrorResponse, validateRequestBody } from '@/middlewares/validation'
import { createRequestLogger } from '@/lib/logger'
import {
  listarAnalisesConformidade,
  iniciarJobAnalise,
  buscarAnalisePorId,
} from '@/lib/ia/persistencia-analise'
import {
  getIdempotentResponse,
  saveIdempotentResponse,
  IdempotencyConflictError,
} from '@/lib/idempotency'
import { randomUUID } from 'crypto'
import { rateLimit } from '@/lib/security/rate-limit'
import { executarProcessamentoSgn } from '@/lib/ia/processamento-sgn'

export const runtime = 'nodejs'
export const maxDuration = 300 // Aumentado para lidar com chunks pesados

type RequestWithWaitUntil = NextRequest & {
  waitUntil?: (promise: Promise<unknown>) => void
}
type AnaliseJobResponse = {
  jobId: string
  status: 'pending' | 'completed'
  pollUrl: string
}

/**
 * Handler POST - Padrão Indústria (Async Worker)
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now()
  const requestId = request.headers.get('x-request-id') ?? randomUUID()
  const idempotencyKey = request.headers.get('idempotency-key')
  const syncMode = request.nextUrl.searchParams.get('mode') === 'sync'
  const log = createRequestLogger(request, 'api.ia.analisar-conformidade')

  const cookieStore = await cookies()
  let sessionId = cookieStore.get('sgn_session')?.value

  if (!sessionId) {
    sessionId = randomUUID()
  }

  try {
    const rl = rateLimit(request, {
      windowMs: 60 * 1000,
      max: 20,
      keyPrefix: 'rl:analisar-conformidade',
    })

    if (rl.limitExceeded) {
      return createErrorResponse('Muitas requisições. Tente novamente em breve.', 429)
    }

    const bodyValidation = await validateRequestBody(CreateAnaliseSchema, request)
    if (!bodyValidation.success) return createErrorResponse(bodyValidation.error, 400)

    const body = bodyValidation.data as AnaliseConformidadeRequest

    // Idempotência
    if (idempotencyKey) {
      const cached = await getIdempotentResponse(idempotencyKey, body) as AnaliseJobResponse | null
      if (cached) {
        const statusCode = cached.status === 'pending' ? 202 : 200
        return createSuccessResponse(cached, 'Retornado via cache de idempotência', statusCode)
      }
    }

    // Criar Job com status 'pending' para retorno imediato
    const { documentoId, jobId } = await iniciarJobAnalise({
      nomeArquivo: body.metadata?.nomeArquivo as string || `analise-${randomUUID().slice(0, 8)}.txt`,
      tipoDocumento: body.tipoDocumento,
      normasAplicaveis: body.normasAplicaveis ?? [],
    }, 'pending', sessionId)

    // Orquestração
    const promise = executarProcessamentoSgn(jobId, documentoId, body, requestId, startTime)
    const pollUrl = `/api/ia/jobs/${jobId}`
    const acceptedResponse: AnaliseJobResponse = { jobId, status: 'pending', pollUrl }

    if (syncMode) {
      await promise
      const completedResponse: AnaliseJobResponse = { jobId, status: 'completed', pollUrl }
      if (idempotencyKey) {
        await saveIdempotentResponse(idempotencyKey, body, completedResponse)
      }
      return createSuccessResponse(completedResponse, 'Análise concluída (Sync)')
    }

    if (idempotencyKey) {
      await saveIdempotentResponse(idempotencyKey, body, acceptedResponse)
    }

    // Backgrounding
    const requestWithWaitUntil = request as RequestWithWaitUntil
    if (requestWithWaitUntil.waitUntil) {
      requestWithWaitUntil.waitUntil(promise)
    } else {
      // Fallback para ambientes sem waitUntil nativo
      Promise.resolve(promise).catch(e => log.error({ e }, 'Erro unhandled no worker'))
    }

    // Retorno Imediato conforme RFC 7231 (202 Accepted)
    const response = createSuccessResponse(
      acceptedResponse,
      'Análise iniciada com sucesso em background',
      202
    )

    // Setar cookie de sessão se não existir
    response.cookies.set('sgn_session', sessionId, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 1 semana
      path: '/',
    })

    return response

  } catch (error) {
    if (error instanceof IdempotencyConflictError) {
      return createErrorResponse('Conflito de idempotência', 409, error.message)
    }
    log.error({ error }, 'Erro fatal no endpoint de análise')
    return createErrorResponse('Falha ao iniciar análise', 500)
  }
}

// GET para listagem/histórico
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (id) {
      const analise = await buscarAnalisePorId(id)
      if (!analise) return createErrorResponse('Análise não encontrada', 404)
      return createSuccessResponse({ analises: [analise] })
    }

    const data = await listarAnalisesConformidade(
      Math.max(parseInt(searchParams.get('pagina') || '1'), 1),
      Math.min(Math.max(parseInt(searchParams.get('limite') || '10'), 1), 100),
      (searchParams.get('periodo') as 'today' | '7d' | '30d' | null) ?? '30d',
      (searchParams.get('ordenacao') as 'data_desc' | 'data_asc' | 'score_desc' | 'score_asc' | null) ?? 'data_desc',
      searchParams.get('busca') ?? ''
    )
    return createSuccessResponse(data)
  } catch {
    return createErrorResponse('Erro ao listar análises', 500)
  }
}
