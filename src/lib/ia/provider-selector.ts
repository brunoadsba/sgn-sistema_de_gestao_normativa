import { analisarConformidade } from '@/lib/ia/groq'
import { analisarConformidadeOllama } from '@/lib/ia/ollama'
import { analisarConformidadeZai } from '@/lib/ia/zai'
import { env } from '@/lib/env'
import { AnaliseConformidadeRequest, AnaliseConformidadeResponse } from '@/types/ia'
import { createLogger } from '@/lib/logger'
import { classifyProviderError, shouldFallbackToZaiFromGroq } from '@/lib/ia/provider-errors'

export type ProviderExecMeta = {
  providerUsed: 'groq' | 'zai' | 'ollama'
  fallbackTriggered: boolean
  fallbackFrom?: 'groq'
}

const providerLogger = createLogger('ia.provider')

export async function analisarConformidadeProvider(request: AnaliseConformidadeRequest): Promise<{
  resultado: AnaliseConformidadeResponse
  providerMeta: ProviderExecMeta
}> {
  if (env.AI_PROVIDER === 'ollama') {
    const resultado = await analisarConformidadeOllama(request)
    return {
      resultado,
      providerMeta: { providerUsed: 'ollama', fallbackTriggered: false },
    }
  }

  if (env.AI_PROVIDER === 'zai') {
    const resultado = await analisarConformidadeZai(request)
    return {
      resultado,
      providerMeta: { providerUsed: 'zai', fallbackTriggered: false },
    }
  }

  try {
    const resultado = await analisarConformidade(request)
    return {
      resultado,
      providerMeta: { providerUsed: 'groq', fallbackTriggered: false },
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
    const errorClass = classifyProviderError(error)
    const shouldFallback = shouldFallbackToZaiFromGroq(error)
    const hasZaiKey = Boolean(env.ZAI_API_KEY || env.OPENAI_API_KEY)

    providerLogger.warn(
      {
        provider: 'groq',
        fallbackProvider: 'zai',
        error_class: errorClass,
        error: errorMessage,
        shouldFallback,
        hasZaiKey,
      },
      'Falha no provider primario (Groq)'
    )

    if (shouldFallback && hasZaiKey) {
      providerLogger.info(
        { provider: 'groq', fallbackProvider: 'zai', error_class: errorClass },
        'Executando fallback Groq -> Z.AI'
      )
      const resultado = await analisarConformidadeZai(request)
      return {
        resultado,
        providerMeta: {
          providerUsed: 'zai',
          fallbackTriggered: true,
          fallbackFrom: 'groq',
        },
      }
    }

    if (shouldFallback && !hasZaiKey) {
      providerLogger.error(
        { provider: 'groq', error_class: errorClass },
        'Fallback para Z.AI solicitado, mas nenhuma chave (ZAI_API_KEY/OPENAI_API_KEY) esta configurada'
      )
    }

    throw error
  }
}
