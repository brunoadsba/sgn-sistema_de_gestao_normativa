import { Groq } from 'groq-sdk'

// Configuração do cliente GROQ
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || '',
  dangerouslyAllowBrowser: false // Apenas para server-side
})

// Tipos para análise de conformidade
export interface AnaliseConformidadeRequest {
  documento: string
  tipoDocumento: string
  empresaId: string
  normasAplicaveis?: string[]
}

export interface AnaliseConformidadeResponse {
  score: number
  nivelRisco: 'baixo' | 'medio' | 'alto' | 'critico'
  gaps: Array<{
    id: string
    descricao: string
    severidade: 'baixa' | 'media' | 'alta' | 'critica'
    categoria: string
    recomendacao: string
    prazo: string
  }>
  resumo: string
  pontosPositivos: string[]
  pontosAtencao: string[]
  proximosPassos: string[]
}

// Função principal de análise
export async function analisarConformidade(
  request: AnaliseConformidadeRequest
): Promise<AnaliseConformidadeResponse> {
  try {
    const prompt = gerarPromptAnalise(request)
    
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'Você é um especialista em SST (Segurança e Saúde no Trabalho) e análise de conformidade com normas regulamentadoras brasileiras. Analise documentos e forneça insights precisos sobre conformidade.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      model: 'llama-3.1-8b-instant',
      temperature: 0.3,
      max_tokens: 2000,
      top_p: 0.9
    })

    const response = completion.choices[0]?.message?.content
    if (!response) {
      throw new Error('Resposta vazia do GROQ')
    }

    return parsearRespostaAnalise(response)
  } catch (error) {
    console.error('Erro na análise de conformidade:', error)
    throw new Error(`Falha na análise: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
  }
}

// Gerar prompt especializado
function gerarPromptAnalise(request: AnaliseConformidadeRequest): string {
  return `
ANÁLISE DE CONFORMIDADE SST - DOCUMENTO: ${request.tipoDocumento}

DOCUMENTO PARA ANÁLISE:
${request.documento}

NORMAS APLICÁVEIS: ${request.normasAplicaveis?.join(', ') || 'NRs gerais'}

INSTRUÇÕES:
1. Analise o documento em relação às normas de SST brasileiras
2. Identifique gaps de conformidade
3. Classifique severidade (baixa, média, alta, crítica)
4. Forneça recomendações práticas
5. Calcule score de 0-100

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
      "prazo": "30 dias"
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
    
    // Validar estrutura
    if (!parsed.score || !parsed.nivelRisco || !parsed.gaps) {
      throw new Error('Estrutura de resposta inválida')
    }

    return parsed as AnaliseConformidadeResponse
  } catch (error) {
    console.error('Erro ao parsear resposta:', error)
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
      console.error(`Erro ao analisar documento ${documento.empresaId}:`, error)
      // Continuar com outros documentos
    }
  }
  
  return resultados
}

export default groq
