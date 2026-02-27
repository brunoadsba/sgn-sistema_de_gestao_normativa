import { env } from '@/lib/env'
import { iaLogger } from '@/lib/logger'
import { AnaliseConformidadeRequest, AnaliseConformidadeResponse } from '@/types/ia'
import { AnaliseConformidadeResponseSchema, gerarPromptAnalise } from './groq'
import { classifyProviderError, shouldRetryProviderError } from './provider-errors'
import { getZaiThinkingOptions } from './zai-options'
import { montarSystemPromptEspecialista, selecionarPerfilPorRequest } from './specialist-agent'

const ZAI_TIMEOUT_MS = env.ZAI_TIMEOUT_MS
const ZAI_RETRY_ATTEMPTS = env.ZAI_RETRY_ATTEMPTS
const ZAI_RETRY_BASE_MS = env.ZAI_RETRY_BASE_MS
const ZAI_RETRY_MAX_MS = env.ZAI_RETRY_MAX_MS

function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
}

function toErrorMessage(error: unknown): string {
    return error instanceof Error ? error.message : 'Erro desconhecido'
}

function calculateBackoffDelay(attempt: number): number {
    const rawDelay = Math.min(ZAI_RETRY_BASE_MS * (2 ** attempt), ZAI_RETRY_MAX_MS)
    const jitter = Math.floor(Math.random() * 250)
    return rawDelay + jitter
}

/**
 * Provedor Z.AI (GLM-4.7) - OpenAI Compatible
 * Utilizado como fallback para Groq em casos de Rate Limit (TPM)
 */
export async function analisarConformidadeZai(
    request: AnaliseConformidadeRequest
): Promise<AnaliseConformidadeResponse> {
    const apiKey = env.ZAI_API_KEY || process.env.OPENAI_API_KEY
    const modelosPorTentativa = [env.ZAI_MODEL || 'glm-4.7', 'glm-4.5']

    if (!apiKey) {
        throw new Error('ZAI_API_KEY ou OPENAI_API_KEY não encontrada para processamento via GLM')
    }

    const prompt = gerarPromptAnalise(request)
    const profile = selecionarPerfilPorRequest(request)
    const systemPrompt = montarSystemPromptEspecialista('analise_conformidade', profile)

    for (let attempt = 0; attempt < ZAI_RETRY_ATTEMPTS; attempt++) {
        const attemptStart = Date.now()
        const model = modelosPorTentativa[Math.min(attempt, modelosPorTentativa.length - 1)]
        try {
            const response = await fetch(`${env.ZAI_BASE_URL}/chat/completions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model,
                    messages: [
                        {
                            role: 'system',
                            content: systemPrompt
                        },
                        {
                            role: 'user',
                            content: prompt
                        }
                    ],
                    temperature: 0,
                    max_tokens: 4096,
                    top_p: 1,
                    ...getZaiThinkingOptions(),
                }),
                signal: AbortSignal.timeout(ZAI_TIMEOUT_MS)
            })

            if (!response.ok) {
                const errorText = await response.text()
                throw new Error(`Erro na API Z.AI (${response.status}): ${errorText.slice(0, 400)}`)
            }

            const data = await response.json()
            const content = data.choices?.[0]?.message?.content

            if (!content) {
                throw new Error('Resposta vazia da Z.AI')
            }

            // Limpar resposta e extrair JSON (mesmo fallback do groq)
            const jsonMatch = content.match(/\{[\s\S]*\}/)
            const rawJson = jsonMatch ? jsonMatch[0] : content
            const parsed = JSON.parse(rawJson)

            iaLogger.debug(
                {
                    provider: 'zai',
                    specialist_profile: profile.id,
                    model,
                    attempt: attempt + 1,
                    duration_ms: Date.now() - attemptStart,
                    finish_reason: data.choices?.[0]?.finish_reason,
                    reasoning_tokens: data.usage?.completion_tokens_details?.reasoning_tokens,
                },
                'Chamada Z.AI concluída com sucesso'
            )

            return AnaliseConformidadeResponseSchema.parse(parsed) as AnaliseConformidadeResponse

        } catch (error) {
            const errorClass = classifyProviderError(error)
            const canRetry = shouldRetryProviderError(errorClass) && attempt < ZAI_RETRY_ATTEMPTS - 1

            iaLogger.warn(
                {
                    provider: 'zai',
                    specialist_profile: profile.id,
                    attempt: attempt + 1,
                    model,
                    duration_ms: Date.now() - attemptStart,
                    error_class: errorClass,
                    canRetry,
                    error: toErrorMessage(error),
                },
                'Falha na chamada Z.AI'
            )

            if (!canRetry) throw error

            const delay = calculateBackoffDelay(attempt)
            await sleep(delay)
        }
    }

    throw new Error('Falha exaustiva no provedor Z.AI')
}
