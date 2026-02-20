import { Groq } from 'groq-sdk'
import { env } from '@/lib/env'
import { z } from 'zod'
import { iaLogger } from '@/lib/logger'
import { AnaliseConformidadeRequest, AnaliseConformidadeResponse } from '@/types/ia'

// Configuração do cliente GROQ
const groq = new Groq({
  apiKey: env.GROQ_API_KEY,
  dangerouslyAllowBrowser: false // Apenas para server-side
})

// Limite máximo de caracteres para documentos enviados à IA
// Limite máximo de caracteres para documentos enviados à IA
// Llama 4 Scout tem 10M tokens de contexto, então 500k caracteres é seguro (~150 páginas)
const MAX_DOCUMENT_LENGTH = 500000
const GROQ_TIMEOUT_MS = env.GROQ_TIMEOUT_MS
const GROQ_RETRY_ATTEMPTS = env.GROQ_RETRY_ATTEMPTS
const GROQ_RETRY_BASE_MS = env.GROQ_RETRY_BASE_MS
const GROQ_RETRY_MAX_MS = env.GROQ_RETRY_MAX_MS

const EvidenciaNormativaSchema = z.object({
  chunkId: z.string().min(1),
  normaCodigo: z.string().min(1),
  secao: z.string().min(1),
  conteudo: z.string().min(1),
  score: z.number().min(0).max(1),
  fonte: z.literal('local'),
})

const AnaliseConformidadeResponseSchema = z.object({
  score: z.number().min(0).max(100),
  nivelRisco: z.enum(['baixo', 'medio', 'alto', 'critico']),
  gaps: z.array(
    z.object({
      id: z.string().min(1),
      descricao: z.string().min(1),
      severidade: z.enum(['baixa', 'media', 'alta', 'critica']),
      categoria: z.string().min(1),
      recomendacao: z.string().min(1),
      prazo: z.string().min(1),
      impacto: z.string().optional(),
      normasRelacionadas: z.array(z.string()).optional(),
      evidencias: z.array(EvidenciaNormativaSchema).default([]),
    })
  ),
  resumo: z.string().min(1),
  pontosPositivos: z.array(z.string()),
  pontosAtencao: z.array(z.string()),
  proximosPassos: z.array(z.string()),
})

/**
 * Sanitiza input do usuário antes de enviar à IA.
 * Remove tentativas de prompt injection e limita tamanho.
 */
function sanitizeInput(input: string): string {
  return input
    .slice(0, MAX_DOCUMENT_LENGTH)
    .replace(/```/g, '')
    .replace(/\bsystem\b:/gi, '')
    .replace(/\brole\b:\s*["']?(system|assistant)["']?/gi, '')
    .replace(/\bignore\b.*\binstructions?\b/gi, '[removido]')
    .replace(/\bforget\b.*\bprevious\b/gi, '[removido]')
    .trim()
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function isRetryableError(error: unknown): boolean {
  if (!(error instanceof Error)) return false
  const message = error.message.toLowerCase()
  return (
    message.includes('timeout') ||
    message.includes('timed out') ||
    message.includes('429') ||
    message.includes('rate limit') ||
    message.includes('500') ||
    message.includes('502') ||
    message.includes('503') ||
    message.includes('504') ||
    message.includes('network')
  )
}

function calculateBackoffDelay(attempt: number): number {
  const rawDelay = Math.min(GROQ_RETRY_BASE_MS * (2 ** attempt), GROQ_RETRY_MAX_MS)
  const jitter = Math.floor(Math.random() * 250)
  return rawDelay + jitter
}

async function runWithTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  let timeoutHandle: NodeJS.Timeout | null = null
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutHandle = setTimeout(() => {
      reject(new Error(`Timeout excedido (${timeoutMs}ms)`))
    }, timeoutMs)
  })

  try {
    return await Promise.race([promise, timeoutPromise])
  } finally {
    if (timeoutHandle) clearTimeout(timeoutHandle)
  }
}

async function executarComRetry(prompt: string): Promise<string> {
  let lastError: unknown

  for (let attempt = 0; attempt < GROQ_RETRY_ATTEMPTS; attempt++) {
    try {
      const completion = await runWithTimeout(
        groq.chat.completions.create({
          messages: [
            {
              role: 'system',
              content:
                'Você é um especialista em SST (Segurança e Saúde no Trabalho) e análise de conformidade com normas regulamentadoras brasileiras. Analise documentos com precisão técnica e não invente requisitos sem evidência.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          model: 'meta-llama/llama-4-scout-17b-16e-instruct',
          temperature: 0.2,
          max_tokens: 4000,
          top_p: 0.9,
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
      const retryable = isRetryableError(error)
      const canRetry = retryable && attempt < GROQ_RETRY_ATTEMPTS - 1

      iaLogger.warn(
        {
          attempt: attempt + 1,
          maxAttempts: GROQ_RETRY_ATTEMPTS,
          retryable,
          error: error instanceof Error ? error.message : 'Erro desconhecido',
        },
        'Falha ao chamar GROQ'
      )

      if (!canRetry) break

      const delay = calculateBackoffDelay(attempt)
      await sleep(delay)
    }
  }

  throw new Error(
    `Falha na chamada GROQ após ${GROQ_RETRY_ATTEMPTS} tentativas: ${
      lastError instanceof Error ? lastError.message : 'Erro desconhecido'
    }`
  )
}

// Função principal de análise
export async function analisarConformidade(
  request: AnaliseConformidadeRequest
): Promise<AnaliseConformidadeResponse> {
  try {
    const prompt = gerarPromptAnalise(request)
    const response = await executarComRetry(prompt)
    return parsearRespostaAnalise(response)
  } catch (error) {
    iaLogger.error(
      { error: error instanceof Error ? error.message : 'Erro desconhecido' },
      'Erro na análise de conformidade'
    )
    throw new Error(`Falha na análise: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
  }
}

// Gerar prompt especializado
function gerarPromptAnalise(request: AnaliseConformidadeRequest): string {
  const documentoSanitizado = sanitizeInput(request.documento)
  const tipoSanitizado = sanitizeInput(request.tipoDocumento)
  const evidenciasSanitizadas = (request.evidenciasNormativas ?? []).map((e) => ({
    chunkId: e.chunkId,
    normaCodigo: e.normaCodigo,
    secao: e.secao,
    conteudo: sanitizeInput(e.conteudo).slice(0, 1200),
    score: e.score,
    fonte: e.fonte,
  }))

  return `
ANÁLISE DE CONFORMIDADE SST - DOCUMENTO: ${tipoSanitizado}

DOCUMENTO PARA ANÁLISE:
${documentoSanitizado}

NORMAS APLICÁVEIS: ${request.normasAplicaveis?.join(', ') || 'NRs gerais'}
VERSÃO BASE DE CONHECIMENTO: ${request.contextoBaseConhecimento?.versaoBase || 'nao_informada'}

EVIDÊNCIAS NORMATIVAS LOCAIS (USE SOMENTE ESSAS COMO FONTE):
${JSON.stringify(evidenciasSanitizadas)}

INSTRUÇÕES:
1. Analise o documento APENAS com base nas evidências normativas locais fornecidas.
2. NÃO invente requisitos. Se faltar evidência, use "dadosInsuficientes" no resumo.
3. Identifique gaps de conformidade.
4. Classifique severidade (baixa, média, alta, crítica).
5. Forneça recomendações práticas.
6. Calcule score de 0-100.
7. Para cada gap, preencha "evidencias" com os chunkIds usados.

FORMATO DE RESPOSTA (JSON):
{
  "score": 85,
  "nivelRisco": "medio",
  "gaps": [
    {
      "id": "gap_001",
      "descricao": "Descrição do gap",
      "severidade": "alta",
      "categoria": "EPI",
      "recomendacao": "Recomendação específica",
      "prazo": "30 dias",
      "evidencias": [
        {
          "chunkId": "nr-06:chunk-012",
          "normaCodigo": "NR-6",
          "secao": "6.5.1",
          "conteudo": "Trecho de evidência",
          "score": 0.92,
          "fonte": "local"
        }
      ]
    }
  ],
  "resumo": "Resumo executivo da análise",
  "pontosPositivos": ["Ponto positivo 1", "Ponto positivo 2"],
  "pontosAtencao": ["Ponto de atenção 1", "Ponto de atenção 2"],
  "proximosPassos": ["Próximo passo 1", "Próximo passo 2"]
}

IMPORTANTE: Responda APENAS com o JSON válido, sem texto adicional.
  `
}

// Parsear resposta do GROQ
function parsearRespostaAnalise(response: string): AnaliseConformidadeResponse {
  try {
    // Limpar resposta e extrair JSON
    const jsonMatch = response.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('JSON não encontrado na resposta')
    }

    const parsed = JSON.parse(jsonMatch[0])
    const validado = AnaliseConformidadeResponseSchema.parse(parsed)
    return validado as AnaliseConformidadeResponse
  } catch (error) {
    iaLogger.error(
      { error: error instanceof Error ? error.message : 'Erro desconhecido' },
      'Erro ao parsear resposta da IA'
    )
    throw new Error('Falha ao processar resposta da IA')
  }
}

// Função para análise em lote
export async function analisarConformidadeLote(
  documentos: AnaliseConformidadeRequest[]
): Promise<AnaliseConformidadeResponse[]> {
  const resultados: AnaliseConformidadeResponse[] = []

  for (const documento of documentos) {
    try {
      const resultado = await analisarConformidade(documento)
      resultados.push(resultado)

      // Delay para respeitar rate limits
      await new Promise(resolve => setTimeout(resolve, 100))
    } catch (error) {
      iaLogger.error(
        { error: error instanceof Error ? error.message : 'Erro desconhecido' },
        'Erro ao analisar documento no lote'
      )
      // Continuar com outros documentos
    }
  }

  return resultados
}

export default groq
