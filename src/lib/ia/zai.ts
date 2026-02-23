import { env } from '@/lib/env'
import { iaLogger } from '@/lib/logger'
import { AnaliseConformidadeRequest, AnaliseConformidadeResponse } from '@/types/ia'
import { AnaliseConformidadeResponseSchema, gerarPromptAnalise } from './groq'

const ZAI_TIMEOUT_MS = 90000 // 90s para lidar com documentos grandes
const ZAI_RETRY_ATTEMPTS = 2

/**
 * Provedor Z.AI (GLM-4.7) - OpenAI Compatible
 * Utilizado como fallback para Groq em casos de Rate Limit (TPM)
 */
export async function analisarConformidadeZai(
    request: AnaliseConformidadeRequest
): Promise<AnaliseConformidadeResponse> {
    const apiKey = env.ZAI_API_KEY || process.env.OPENAI_API_KEY

    if (!apiKey) {
        throw new Error('ZAI_API_KEY ou OPENAI_API_KEY não encontrada para processamento via GLM')
    }

    const prompt = gerarPromptAnalise(request)

    for (let attempt = 0; attempt < ZAI_RETRY_ATTEMPTS; attempt++) {
        try {
            const response = await fetch(`${env.ZAI_BASE_URL}/chat/completions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: attempt === 0 ? (env.ZAI_MODEL || 'glm-4.7') : 'glm-4-flash',
                    messages: [
                        {
                            role: 'system',
                            content: 'Você é um Assistente especializado em SST. Responda estritamente em formato JSON válido, conforme o schema solicitado.'
                        },
                        {
                            role: 'user',
                            content: prompt
                        }
                    ],
                    temperature: 0.1,
                    max_tokens: 4096,
                    top_p: 0.8,
                }),
                signal: AbortSignal.timeout(ZAI_TIMEOUT_MS)
            })

            if (!response.ok) {
                const errorText = await response.text()
                throw new Error(`Erro na API Z.AI (${response.status}): ${errorText}`)
            }

            const data = await response.json()

            // Log para debug de resposta vazia
            if (!data.choices?.[0]?.message?.content) {
                console.error('[ZAI-DEBUG] Resposta sem conteúdo:', JSON.stringify(data, null, 2))
            }

            const content = data.choices?.[0]?.message?.content

            if (!content) {
                throw new Error('Resposta vazia da Z.AI (verificar logs de debug)')
            }

            // Limpar resposta e extrair JSON (mesmo fallback do groq)
            const jsonMatch = content.match(/\{[\s\S]*\}/)
            const rawJson = jsonMatch ? jsonMatch[0] : content
            const parsed = JSON.parse(rawJson)

            return AnaliseConformidadeResponseSchema.parse(parsed) as AnaliseConformidadeResponse

        } catch (error) {
            iaLogger.warn(
                {
                    attempt: attempt + 1,
                    error: error instanceof Error ? error.message : 'Erro desconhecido'
                },
                'Falha na chamada Z.AI'
            )

            if (attempt === ZAI_RETRY_ATTEMPTS - 1) throw error
            // Exponential backoff básico
            await new Promise(r => setTimeout(r, 2000 * (attempt + 1)))
        }
    }

    throw new Error('Falha exaustiva no provedor Z.AI')
}
