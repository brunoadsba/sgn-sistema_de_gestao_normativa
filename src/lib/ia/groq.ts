import { Groq } from 'groq-sdk'
import { env } from '@/lib/env'
import { iaLogger } from '@/lib/logger'
import { AnaliseConformidadeRequest, AnaliseConformidadeResponse } from '@/types/ia'
import { classifyProviderError, shouldRetryProviderError } from './provider-errors'
import {
  montarSystemPromptEspecialista,
  selecionarPerfilPorRequest,
  type SpecialistProfileId,
} from './specialist-agent'
import {
  gerarPromptAnalise,
  parsearRespostaAnalise,
  toErrorMessage,
  calculateBackoffDelay,
  sleep,
  runWithTimeout,
} from './groq-utils'

export const groq = new Groq({
  apiKey: env.GROQ_API_KEY,
  dangerouslyAllowBrowser: false,
})

export { AnaliseConformidadeResponseSchema, gerarPromptAnalise, sanitizeInput } from './groq-utils'

const GROQ_TIMEOUT_MS = env.GROQ_TIMEOUT_MS
const GROQ_RETRY_ATTEMPTS = env.GROQ_RETRY_ATTEMPTS

async function executarComRetry(
  prompt: string,
  systemPrompt: string,
  specialistProfile: SpecialistProfileId
): Promise<string> {
  let lastError: unknown

  for (let attempt = 0; attempt < GROQ_RETRY_ATTEMPTS; attempt++) {
    const attemptStart = Date.now()
    try {
      const completion = await runWithTimeout(
        groq.chat.completions.create({
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt },
          ],
          model: env.GROQ_MODEL,
          temperature: 0,
          max_tokens: 4000,
          top_p: 1,
          seed: 42,
        }),
        GROQ_TIMEOUT_MS
      )

      const response = completion.choices[0]?.message?.content
      if (!response) {
        throw new Error('Resposta vazia do GROQ')
      }
      return response
    } catch (error) {
      lastError = error
      const errorClass = classifyProviderError(error)
      const canRetry = shouldRetryProviderError(errorClass) && attempt < GROQ_RETRY_ATTEMPTS - 1

      iaLogger.warn(
        {
          provider: 'groq',
          specialist_profile: specialistProfile,
          model: env.GROQ_MODEL,
          attempt: attempt + 1,
          maxAttempts: GROQ_RETRY_ATTEMPTS,
          duration_ms: Date.now() - attemptStart,
          error_class: errorClass,
          canRetry,
          error: toErrorMessage(error),
        },
        'Falha ao chamar GROQ'
      )

      if (!canRetry) break

      const delay = calculateBackoffDelay(attempt)
      await sleep(delay)
    }
  }

  throw new Error(
    `Falha na chamada GROQ após ${GROQ_RETRY_ATTEMPTS} tentativas: ${toErrorMessage(lastError)}`
  )
}

export async function analisarConformidade(
  request: AnaliseConformidadeRequest
): Promise<AnaliseConformidadeResponse> {
  try {
    const prompt = gerarPromptAnalise(request)
    const profile = selecionarPerfilPorRequest(request)
    const systemPrompt = montarSystemPromptEspecialista('analise_conformidade', profile)
    const response = await executarComRetry(prompt, systemPrompt, profile.id)
    return parsearRespostaAnalise(response)
  } catch (error) {
    iaLogger.error(
      { error: error instanceof Error ? error.message : 'Erro desconhecido' },
      'Erro na análise de conformidade'
    )
    throw new Error(`Falha na análise: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
  }
}

export async function analisarConformidadeLote(
  documentos: AnaliseConformidadeRequest[]
): Promise<AnaliseConformidadeResponse[]> {
  const resultados: AnaliseConformidadeResponse[] = []

  for (const documento of documentos) {
    try {
      const resultado = await analisarConformidade(documento)
      resultados.push(resultado)
      await new Promise((resolve) => setTimeout(resolve, 100))
    } catch (error) {
      iaLogger.error(
        { error: error instanceof Error ? error.message : 'Erro desconhecido' },
        'Erro ao analisar documento no lote'
      )
    }
  }

  return resultados
}

export default groq
