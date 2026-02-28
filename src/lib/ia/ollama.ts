import { env } from '@/lib/env'
import { iaLogger } from '@/lib/logger'
import { AnaliseConformidadeRequest, AnaliseConformidadeResponse } from '@/types/ia'
import { z } from 'zod'
import { montarSystemPromptEspecialista, selecionarPerfilPorRequest } from './specialist-agent'
import { sanitizeInput } from './sanitize'

const OLLAMA_RETRY_ATTEMPTS = 2
const OLLAMA_RETRY_DELAY_MS = 1000

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
        })
    ).default([]),
    resumo: z.string().default('Análise concluída sem resumo detalhado.'),
    pontosPositivos: z.array(z.string()).default([]),
    pontosAtencao: z.array(z.string()).default([]),
    proximosPassos: z.array(z.string()).default([]),
})

export async function analisarConformidadeOllama(
    request: AnaliseConformidadeRequest
): Promise<AnaliseConformidadeResponse> {
    try {
        const prompt = gerarPromptAnalise(request)
        const profile = selecionarPerfilPorRequest(request)
        const systemPrompt = montarSystemPromptEspecialista('analise_conformidade', profile)
        const response = await executarOllamaComRetry(prompt, systemPrompt)
        return parsearRespostaAnalise(response)
    } catch (error) {
        iaLogger.error(
            { error: error instanceof Error ? error.message : 'Erro desconhecido' },
            'Erro na análise de conformidade via Ollama'
        )
        throw new Error(`Falha na análise Ollama: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
    }
}

async function executarOllama(prompt: string, systemPrompt: string): Promise<string> {
    const url = `${env.OLLAMA_BASE_URL}/api/chat`

    const payload = {
        model: env.OLLAMA_MODEL,
        messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt },
        ],
        stream: false,
        options: {
            temperature: 0,
            top_p: 1,
            seed: 42,
            num_ctx: 16384,
        },
    }

    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    })

    if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Ollama Error (${response.status}): ${errorText}`)
    }

    const data = await response.json()
    return data.message.content
}

async function executarOllamaComRetry(prompt: string, systemPrompt: string): Promise<string> {
    let lastError: unknown
    for (let attempt = 0; attempt < OLLAMA_RETRY_ATTEMPTS; attempt++) {
        try {
            return await executarOllama(prompt, systemPrompt)
        } catch (error) {
            lastError = error
            if (attempt < OLLAMA_RETRY_ATTEMPTS - 1) {
                iaLogger.warn(
                    { attempt: attempt + 1, maxAttempts: OLLAMA_RETRY_ATTEMPTS, error: error instanceof Error ? error.message : 'Erro desconhecido' },
                    'Falha Ollama, tentando novamente'
                )
                await new Promise((r) => setTimeout(r, OLLAMA_RETRY_DELAY_MS * (attempt + 1)))
            }
        }
    }
    throw lastError
}

function gerarPromptAnalise(request: AnaliseConformidadeRequest): string {
    const documentoSanitizado = sanitizeInput(request.documento)
    const tipoSanitizado = sanitizeInput(request.tipoDocumento)
    const evidenciasSanitizadas = (request.evidenciasNormativas ?? []).map((e) => ({
        chunkId: e.chunkId,
        normaCodigo: e.normaCodigo,
        secao: e.secao,
        conteudo: sanitizeInput(e.conteudo).slice(0, 1000),
        score: e.score,
        fonte: e.fonte,
    }))

    return `
ANÁLISE DE CONFORMIDADE SST - DOCUMENTO: ${tipoSanitizado}

DOCUMENTO PARA ANÁLISE:
${documentoSanitizado}

NORMAS APLICÁVEIS: ${request.normasAplicaveis?.join(', ') || 'NRs gerais'}

EVIDÊNCIAS NORMATIVAS LOCAIS (USE SOMENTE ESSAS COMO FONTE):
${JSON.stringify(evidenciasSanitizadas)}

INSTRUÇÕES CRÍTICAS (TRATA-SE DE LEGISLAÇÃO — SIGA ESTRITAMENTE):
1. ADERÊNCIA ESTRITA À BASE DE CONHECIMENTO: Sua ÚNICA fonte de verdade são as evidências normativas locais no JSON acima. NÃO invente, infira ou suponha requisitos que não estejam presentes nas evidências.
2. Um gap só pode ser listado se: (a) o documento demonstra descumprimento de um requisito E (b) esse requisito está EXPLICITAMENTE presente nas evidências fornecidas com um chunkId válido.
3. Se o array de evidências estiver vazio, retorne gaps vazio e score 100.
4. MANDATÓRIO: Para cada gap, copie EXATAMENTE o chunkId da evidência. Gaps sem evidência ou com chunkId inventado serão REJEITADOS.
5. CÁLCULO DO SCORE (REGRA DETERMINÍSTICA): Parta de 100. Deduza por gap: crítica = -20, alta = -15, média = -10, baixa = -5. Mínimo = 0.
6. Responda APENAS com um objeto JSON válido, sem texto explicativo.

FORMATO:
{
  "score": 0 a 100,
  "nivelRisco": "baixo" | "medio" | "alto" | "critico",
  "gaps": [
    {
      "id": "gap_N",
      "descricao": "...",
      "severidade": "baixa" | "media" | "alta" | "critica",
      "categoria": "...",
      "recomendacao": "...",
      "prazo": "...",
      "evidencias": [ ... COPIE DO JSON DE EVIDENCIAS ... ]
    }
  ],
  "resumo": "...",
  "pontosPositivos": [],
  "pontosAtencao": [],
  "proximosPassos": []
}
`
}

function parsearRespostaAnalise(response: string): AnaliseConformidadeResponse {
    try {
        iaLogger.debug({ provider: 'ollama', preview: response.substring(0, 500) }, 'Preview de resposta IA')
        const jsonMatch = response.match(/\{[\s\S]*\}/)
        if (!jsonMatch) throw new Error('JSON não encontrado')

        const parsed = JSON.parse(jsonMatch[0])
        return AnaliseConformidadeResponseSchema.parse(parsed) as AnaliseConformidadeResponse
    } catch (error) {
        if (error instanceof z.ZodError) {
            iaLogger.debug({ provider: 'ollama', error_class: 'schema_validation', issues: error.issues }, 'Falha de validação na resposta Ollama')
        }
        throw error
    }
}
