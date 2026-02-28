import { NextRequest } from 'next/server'
import { z } from 'zod'
import { groq } from '@/lib/ia/groq'
import { env } from '@/lib/env'
import { iaLogger as logger } from '@/lib/logger'
import {
  classifyProviderError,
  shouldFallbackToZaiFromGroq,
  shouldRetryProviderError,
} from '@/lib/ia/provider-errors'
import { getZaiThinkingOptions } from '@/lib/ia/zai-options'
import { inferirNormasHeuristicas, jaccardNormas } from '@/lib/ia/nr-heuristics'
import { montarSystemPromptEspecialista, selecionarPerfilEspecialista } from '@/lib/ia/specialist-agent'
import { ordenarCodigosNr } from '@/lib/normas/ordem'
import { rateLimit } from '@/lib/security/rate-limit'
import { createSuccessResponse, createErrorResponse } from '@/middlewares/validation'

const SugerirNrsSchema = z.object({
  textoExtraido: z.string().min(1).max(500_000),
  tipoDocumento: z.string().optional(),
})

const DEFAULT_NRS = ['nr-1']
const DEFAULT_RESPONSE = '{"nrs":["nr-1"]}'

function toErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Erro desconhecido'
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function calculateBackoffDelay(attempt: number): number {
  const rawDelay = Math.min(env.ZAI_RETRY_BASE_MS * (2 ** attempt), env.ZAI_RETRY_MAX_MS)
  const jitter = Math.floor(Math.random() * 250)
  return rawDelay + jitter
}

function normalizarNrs(candidatas: unknown[]): string[] {
  const unicas = new Set(
    candidatas
      .filter((item): item is string => typeof item === 'string')
      .map((item) => item.trim().toLowerCase())
      .filter((item) => /^nr-\d+$/.test(item))
  )
  return unicas.size > 0 ? Array.from(unicas) : DEFAULT_NRS
}

function normalizarPayloadJson(raw: string): string {
  const semFences = raw
    .replace(/^\s*```(?:json)?/i, '')
    .replace(/```\s*$/i, '')
    .trim()

  const matchObjeto = semFences.match(/\{[\s\S]*\}/)
  if (matchObjeto) return matchObjeto[0]

  const matchArray = semFences.match(/\[[\s\S]*\]/)
  if (matchArray) return matchArray[0]

  return semFences
}

function extrairSugestoesNrs(respostaRaw: string): { nrs: string[]; parseOk: boolean } {
  try {
    const parsed = JSON.parse(normalizarPayloadJson(respostaRaw))
    if (Array.isArray(parsed)) {
      return { nrs: normalizarNrs(parsed), parseOk: true }
    }

    if (parsed && typeof parsed === 'object') {
      const asRecord = parsed as Record<string, unknown>
      if (Array.isArray(asRecord.nrs)) {
        return { nrs: normalizarNrs(asRecord.nrs), parseOk: true }
      }

      const primeiraChaveArray = Object.values(asRecord).find((value) => Array.isArray(value))
      if (Array.isArray(primeiraChaveArray)) {
        return { nrs: normalizarNrs(primeiraChaveArray), parseOk: true }
      }
    }
  } catch (parseError) {
    logger.error(
      { error_class: classifyProviderError(parseError), error: toErrorMessage(parseError) },
      '[SUGERIR-NRS] Falha ao fazer parse das NRs sugeridas'
    )
  }

  return { nrs: DEFAULT_NRS, parseOk: false }
}

function consolidarNormasSugestao(normasIa: string[], normasHeuristica: string[]): string[] {
  return ordenarCodigosNr([...normasIa, ...normasHeuristica]).slice(0, 10)
}

function calcularConfiancaSugestao(parseOk: boolean, normasIa: string[], normasHeuristica: string[]) {
  const concordancia = jaccardNormas(normasIa, normasHeuristica)
  const parseScore = parseOk ? 40 : 10
  const concordanciaScore = concordancia >= 0.7 ? 40 : concordancia >= 0.4 ? 25 : 10
  const sourceScore = parseOk ? 20 : 10
  const confiancaSugestao = parseScore + concordanciaScore + sourceScore

  const setIa = new Set(normasIa)
  const setHeuristica = new Set(normasHeuristica)
  const divergencias = Array.from(
    new Set(
      [...normasIa.filter((item) => !setHeuristica.has(item)), ...normasHeuristica.filter((item) => !setIa.has(item))]
    )
  )

  const alertas: string[] = []
  if (!parseOk) {
    alertas.push('Resposta da IA veio em formato inesperado e exigiu fallback para parsing seguro.')
  }
  if (concordancia < 0.4) {
    alertas.push('Baixa concordância entre inferência por IA e heurística normativa.')
  }

  return {
    confiancaSugestao,
    concordancia,
    divergencias,
    alertas,
  }
}

async function chamarGroqSugestao(systemPrompt: string, texto: string): Promise<string> {
  const model = env.AI_PROVIDER === 'ollama' ? env.OLLAMA_MODEL : env.GROQ_MODEL
  const chatCompletion = await groq.chat.completions.create({
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: texto },
    ],
    model,
    temperature: 0,
    top_p: 1,
    seed: 42,
    max_completion_tokens: 150,
    response_format: { type: 'json_object' },
  })

  return chatCompletion.choices[0]?.message?.content || DEFAULT_RESPONSE
}

async function chamarZaiSugestao(systemPrompt: string, texto: string): Promise<string> {
  const apiKey = env.ZAI_API_KEY || process.env.OPENAI_API_KEY
  if (!apiKey) {
    throw new Error('ZAI_API_KEY ou OPENAI_API_KEY não encontrada para fallback Z.AI')
  }

  for (let attempt = 0; attempt < env.ZAI_RETRY_ATTEMPTS; attempt++) {
    const attemptStart = Date.now()
    const model = env.ZAI_MODEL || 'glm-4.7'

    try {
      const zaiRes = await fetch(`${env.ZAI_BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: texto },
          ],
          temperature: 0,
          top_p: 1,
          max_tokens: 150,
          ...getZaiThinkingOptions(),
        }),
        signal: AbortSignal.timeout(env.ZAI_TIMEOUT_MS),
      })

      if (!zaiRes.ok) {
        const errorText = await zaiRes.text()
        throw new Error(`Erro na API Z.AI (${zaiRes.status}): ${errorText.slice(0, 400)}`)
      }

      const zaiData = await zaiRes.json()
      logger.debug(
        {
          provider: 'zai',
          model,
          attempt: attempt + 1,
          finish_reason: zaiData?.choices?.[0]?.finish_reason,
          reasoning_tokens: zaiData?.usage?.completion_tokens_details?.reasoning_tokens,
        },
        '[SUGERIR-NRS] Chamada Z.AI concluída'
      )
      return zaiData.choices?.[0]?.message?.content || DEFAULT_RESPONSE
    } catch (error) {
      const errorClass = classifyProviderError(error)
      const canRetry = shouldRetryProviderError(errorClass) && attempt < env.ZAI_RETRY_ATTEMPTS - 1

      logger.warn(
        {
          provider: 'zai',
          model,
          attempt: attempt + 1,
          maxAttempts: env.ZAI_RETRY_ATTEMPTS,
          duration_ms: Date.now() - attemptStart,
          error_class: errorClass,
          canRetry,
          error: toErrorMessage(error),
        },
        '[SUGERIR-NRS] Falha na chamada Z.AI'
      )

      if (!canRetry) throw error
      await sleep(calculateBackoffDelay(attempt))
    }
  }

  return DEFAULT_RESPONSE
}

export async function POST(request: NextRequest) {
  const rl = rateLimit(request, { windowMs: 60_000, max: 20, keyPrefix: 'rl:sugerir-nrs' })
  if (rl.limitExceeded) {
    return createErrorResponse('Muitas requisicoes. Tente novamente em breve.', 429)
  }

  try {
    const body = await request.json()
    const parsed = SugerirNrsSchema.safeParse(body)

    if (!parsed.success) {
      const msg = parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join(', ')
      return createErrorResponse(`Dados invalidos: ${msg}`, 400)
    }

    const { textoExtraido, tipoDocumento } = parsed.data

    const trechoInicial = textoExtraido.substring(0, 5000)
    const trechoSanitizado = trechoInicial.replace(/[\u0000-\u001F\u007F-\u009F]/g, ' ')
    const profile = selecionarPerfilEspecialista({
      tipoDocumento: typeof tipoDocumento === 'string' ? tipoDocumento : 'OUTRO',
      documento: trechoSanitizado,
    })
    const systemPrompt = `${montarSystemPromptEspecialista('sugerir_nrs', profile)}
Sua tarefa é ler o trecho inicial de um documento e inferir quais Normas Regulamentadoras (NRs) se aplicam a ele.
Priorize sempre compliance normativo e proteção.
Responda APENAS com um objeto JSON contendo o array na chave "nrs".
Exemplo: {"nrs": ["nr-1", "nr-6", "nr-35"]}
APENAS o JSON puro. Se não souber, retorne {"nrs": ["nr-1"]}.`

    let resposta = DEFAULT_RESPONSE

    if (env.AI_PROVIDER === 'zai') {
      logger.info(
        { provider: 'zai', specialist_profile: profile.id },
        '[SUGERIR-NRS] Usando Z.AI como provider primário'
      )
      resposta = await chamarZaiSugestao(systemPrompt, trechoSanitizado)
    } else {
      try {
        resposta = await chamarGroqSugestao(systemPrompt, trechoSanitizado)
      } catch (error) {
        const errorClass = classifyProviderError(error)
        const shouldFallback = shouldFallbackToZaiFromGroq(error)
        const hasZaiKey = Boolean(env.ZAI_API_KEY || process.env.OPENAI_API_KEY)

        logger.warn(
          {
            provider: 'groq',
            fallbackProvider: 'zai',
            error_class: errorClass,
            shouldFallback,
            hasZaiKey,
            error: toErrorMessage(error),
          },
          '[SUGERIR-NRS] Falha no provider primário'
        )

        if (shouldFallback && hasZaiKey) {
          logger.info(
            { provider: 'groq', fallbackProvider: 'zai', error_class: errorClass },
            '[SUGERIR-NRS] Executando fallback Groq -> Z.AI'
          )
          resposta = await chamarZaiSugestao(systemPrompt, trechoSanitizado)
        } else {
          throw error
        }
      }
    }

    const { nrs: normasIa, parseOk } = extrairSugestoesNrs(resposta)
    const normasHeuristica = inferirNormasHeuristicas(
      textoExtraido,
      typeof tipoDocumento === 'string' ? tipoDocumento : 'OUTRO'
    )
    const sugeridas = consolidarNormasSugestao(normasIa, normasHeuristica)
    const confianca = calcularConfiancaSugestao(parseOk, normasIa, normasHeuristica)

    return createSuccessResponse({
      sugeridas,
      confiancaSugestao: confianca.confiancaSugestao,
      concordanciaNormativa: confianca.concordancia,
      fontesSugestao: ['ia', 'heuristica'],
      divergencias: confianca.divergencias,
      alertas: confianca.alertas,
      detalhes: {
        normasIa,
        normasHeuristica,
        parseOk,
        specialistProfile: profile.id,
      },
    })
  } catch (error) {
    logger.error({ error: toErrorMessage(error) }, 'Erro interno em /api/ia/sugerir-nrs')
    return createErrorResponse('Falha interna ao sugerir NRs', 500)
  }
}
