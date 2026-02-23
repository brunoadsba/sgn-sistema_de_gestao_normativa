import { Groq } from 'groq-sdk'
import { env } from '@/lib/env'
import { z } from 'zod'
import { iaLogger } from '@/lib/logger'
import { AnaliseConformidadeRequest, AnaliseConformidadeResponse } from '@/types/ia'

// Configuração do cliente GROQ
export const groq = new Groq({
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
  chunkId: z.string(),
  normaCodigo: z.string(),
  secao: z.string(),
  conteudo: z.string(),
  score: z.number().min(0),
  fonte: z.literal('local'),
})

const AnaliseConformidadeResponseSchema = z.object({
  score: z.number().min(0).max(100),
  nivelRisco: z.string().transform((v) => {
    const lower = (v || 'baixo').toLowerCase().replace(/[áàâãä]/g, 'a').replace(/[éèêë]/g, 'e').replace(/[íìîï]/g, 'i').replace(/[óòôõö]/g, 'o').replace(/[úùûü]/g, 'u').replace(/ç/g, 'c');
    if (lower === 'critico' || lower === 'critica' || lower === 'alto' || lower === 'alta' || lower === 'medio' || lower === 'media' || lower === 'baixo' || lower === 'baixa') {
      if (lower === 'critico' || lower === 'critica') return 'critico';
      if (lower === 'alto' || lower === 'alta') return 'alto';
      if (lower === 'medio' || lower === 'media') return 'medio';
      return 'baixo';
    }
    return 'baixo'; // fallback para 'inexistente' ou outros termos
  }),
  gaps: z.array(
    z.object({
      id: z.string().default('gap_indefinido'),
      descricao: z.string().default('Sem descrição detalhada'),
      severidade: z.string().transform((v) => {
        const lower = (v || 'media').toLowerCase().replace(/[áàâãä]/g, 'a').replace(/[éèêë]/g, 'e').replace(/[íìîï]/g, 'i').replace(/[óòôõö]/g, 'o').replace(/[úùûü]/g, 'u').replace(/ç/g, 'c');
        if (lower === 'critica' || lower === 'critico') return 'critica';
        if (lower === 'media') return 'media';
        if (lower === 'alta') return 'alta';
        if (lower === 'baixa') return 'baixa';
        return 'media'; // fallback
      }),
      categoria: z.string().default('Geral'),
      recomendacao: z.string().default('Nenhuma recomendação fornecida'),
      prazo: z.string().optional().default('Não informado'),
      impacto: z.string().optional(),
      normasRelacionadas: z.array(z.string()).optional(),
      evidencias: z.array(EvidenciaNormativaSchema).default([]),
      citacaoDocumento: z.string().optional(),
      paginaDocumento: z.number().optional(),
      linhaDocumento: z.string().optional(),
    })
  ).default([]),
  resumo: z.string().default('Análise concluída sem resumo detalhado.'),
  pontosPositivos: z.array(z.string()).default([]),
  pontosAtencao: z.array(z.string()).default([]),
  proximosPassos: z.array(z.string()).default([]),
})

export { AnaliseConformidadeResponseSchema }

/**
* Sanitiza input do usuário antes de enviar à IA.
* Remove tentativas de prompt injection e limita tamanho.
*/
export function sanitizeInput(input: string): string {
  return input
    .slice(0, MAX_DOCUMENT_LENGTH)
    .replace(/```/g, '')
    .replace(/\bsystem\b:/gi, '')
    .replace(/\brole\b:\s*["']?(system|assistant)["']?/gi, '')
    .replace(/\bignore\b.*\binstructions?\b/gi, '[removido]')
    .replace(/\bforget\b.*\bprevious\b/gi, '[removido]')
    .trim()
}

/**
 * Injeta marcadores de linha para rastreabilidade [L1], [L2]...
 */
function injetarNumerosLinha(texto: string): string {
  return texto
    .split('\n')
    .map((linha, i) => `[L${i + 1}] ${linha}`)
    .join('\n')
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
          model: 'llama-3.3-70b-versatile',
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
    `Falha na chamada GROQ após ${GROQ_RETRY_ATTEMPTS} tentativas: ${lastError instanceof Error ? lastError.message : 'Erro desconhecido'
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
export function gerarPromptAnalise(request: AnaliseConformidadeRequest): string {
  const documentoSanitizado = sanitizeInput(request.documento)
  const documentoComLinhas = injetarNumerosLinha(documentoSanitizado)
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

DOCUMENTO PARA ANÁLISE (COM MARCADORES DE LINHA [LX]):
${documentoComLinhas}

NORMAS APLICÁVEIS: ${request.normasAplicaveis?.join(', ') || 'NRs gerais'}
VERSÃO BASE DE CONHECIMENTO: ${request.contextoBaseConhecimento?.versaoBase || 'nao_informada'}

EVIDÊNCIAS NORMATIVAS LOCAIS (USE SOMENTE ESSAS COMO FONTE):
${JSON.stringify(evidenciasSanitizadas)}

INSTRUÇÕES CRÍTICAS (DEVE SEGUIR ESTRITAMENTE):
1. Analise o documento APENAS com base nas evidências normativas locais fornecidas.
2. NÃO invente requisitos ou gaps de SST que não figurem no documento. Se o documento for sobre receita de bolo, ou um assunto aleatório que não trata de SST, não liste gaps. Ao invés disso, deixe o array "gaps" VAZIO e avise no "resumo" que o texto é inconclusivo ou fora de escopo.
3. Se o array de EVIDÊNCIAS NORMATIVAS LOCAIS estiver vazio, VOCÊ DEVE retornar o array "gaps" VAZIO, pois você não tem licença para opinar sem lastro.
4. Identifique gaps de conformidade (quando houver).
5. Classifique severidade (baixa, média, alta, crítica).
6. Forneça recomendações práticas e objetivas.
7. Calcule score de 0-100 refletindo a aderência geral (Zero gaps = 100).
8. MANDATÓRIO: Para CADA gap listado, você DEVE OBRIGATORIAMENTE preencher o array "evidencias" referenciando QUAL "chunkId" embasou aquela crítica. Copie os dados (chunkId, normaCodigo, secao, conteudo, score, fonte) EXATAMENTE como estão no JSON de Evidencias enviado a você. Não deixe campos vazios. Se você não encontrar um chunkId compatível, não liste o gap. Um gap SEM EVIDÊNCIA ou com chunkId vazio será rejeitado pelo sistema.
9. RASTREABILIDADE (PADRÃO INDÚSTRIA): Para cada gap identificado, preencha também:
   - "citacaoDocumento": O trecho exato do documento do usuário que motivou o gap.
   - "paginaDocumento": O número da página (tente inferir de cabeçalhos/rodapés ou assuma 1 como base).
   - "linhaDocumento": O marcador de linha [LX] onde o trecho se inicia (ex: "L45").

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
      "citacaoDocumento": "Trecho literal do documento do usuário",
      "paginaDocumento": 1,
      "linhaDocumento": "L12",
      "evidencias": [
        {
          "chunkId": "COPIE EXATAMENTE O ID AQUI",
          "normaCodigo": "NR-6",
          "secao": "6.5.1",
          "conteudo": "Trecho de evidência",
          "score": 0.92,
          "fonte": "local"
        }
      ]
    }
  ],
  "resumo": "Resumo executivo contendo o veredito geral da analise. Informe se o texto fugiu do escopo se aplicável",
  "pontosPositivos": ["Ponto positivo 1", "Ponto positivo 2"],
  "pontosAtencao": ["Ponto de atenção 1", "Ponto de atenção 2"],
  "proximosPassos": ["Próximo passo 1", "Próximo passo 2"]
}

IMPORTANTE: Responda APENAS com o JSON válido, sem markdown, fences ou texto adicional. Se tiver gaps, as evidencias tem que ter \`chunkId\` da lista.
  `
}

// Parsear resposta do GROQ
function parsearRespostaAnalise(response: string): AnaliseConformidadeResponse {
  try {
    // Limpar resposta e extrair JSON
    // Limpar resposta e extrair JSON
    console.log(`[DEBUG] Resposta Bruta da IA: ${response.substring(0, 500)}...`)
    const jsonMatch = response.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      console.log(`[DEBUG] Falha no match de JSON. Resposta completa: ${response}`)
      throw new Error('JSON não encontrado na resposta')
    }

    const rawJson = jsonMatch[0]
    const parsed = JSON.parse(rawJson)
    const validado = AnaliseConformidadeResponseSchema.parse(parsed)
    return validado as AnaliseConformidadeResponse
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error(`[DEBUG] Erro de Validação Zod:`, JSON.stringify(error.issues, null, 2))
    }
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
