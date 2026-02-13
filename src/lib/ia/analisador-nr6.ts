import { Groq } from 'groq-sdk'
import { env } from '@/lib/env'

// Configuração do cliente GROQ
const groq = new Groq({
  apiKey: env.GROQ_API_KEY,
  dangerouslyAllowBrowser: false
})

const MAX_DOCUMENT_LENGTH = 50000

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

// Tipos específicos para NR-6
export interface AnaliseNR6Request {
  documento: string
  tipoDocumento: 'ficha_entrega_epi' | 'treinamento_epi' | 'inspecao_epi' | 'pgr' | 'nr1_gro' | 'ppra' | 'outro'
  funcionario?: string
  setor?: string
}

export interface AnaliseNR6Response {
  score: number
  nivelRisco: 'baixo' | 'medio' | 'alto' | 'critico'
  gaps: Array<{
    id: string
    descricao: string
    severidade: 'baixa' | 'media' | 'alta' | 'critica'
    categoria: 'CA' | 'Treinamento' | 'Documentacao' | 'EPI' | 'Inspecao'
    recomendacao: string
    prazo: string
    nr6_artigo: string
  }>
  resumo: string
  pontosPositivos: string[]
  pontosAtencao: string[]
  proximosPassos: string[]
  conformidadeNR6: {
    ca_valido: boolean
    treinamento_realizado: boolean
    epi_adequado: boolean
    documentacao_completa: boolean
  }
}

// Função principal para análise da NR-6
export async function analisarNR6(request: AnaliseNR6Request): Promise<AnaliseNR6Response> {
  try {
    const prompt = gerarPromptNR6(request)

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'Você é um especialista em NR-6 (Equipamento de Proteção Individual) com 15+ anos de experiência. Analise documentos especificamente para conformidade com EPIs.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      model: 'meta-llama/llama-4-scout-17b-16e-instruct',
      temperature: 0.2,
      max_tokens: 3000,
      top_p: 0.8
    })

    const response = completion.choices[0]?.message?.content
    if (!response) {
      throw new Error('Resposta vazia do GROQ')
    }

    return parsearRespostaNR6(response)
  } catch (error) {
    console.error('Erro na análise NR-6:', error)
    throw new Error(`Falha na análise NR-6: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
  }
}

// Gerar prompt específico para NR-6
function gerarPromptNR6(request: AnaliseNR6Request): string {
  return `
ANÁLISE ESPECÍFICA DE CONFORMIDADE COM NR-6 (EPI)

TIPO DE DOCUMENTO: ${request.tipoDocumento}

DOCUMENTO PARA ANÁLISE:
${sanitizeInput(request.documento)}

CRITÉRIOS ESPECÍFICOS DA NR-6:

1. OBRIGAÇÕES DO EMPREGADOR (NR-6.6.1):
   ✓ Fornecer EPI adequado ao risco (CA válido)
   ✓ Treinar trabalhador sobre uso correto
   ✓ Substituir EPI danificado/vencido
   ✓ Registrar entrega de EPIs
   ✓ Fiscalizar uso correto

2. OBRIGAÇÕES DO TRABALHADOR (NR-6.7.1):
   ✓ Usar EPI apenas para finalidade adequada
   ✓ Responsabilizar-se pela guarda/conservação
   ✓ Comunicar alterações que o torne impróprio
   ✓ Cumprir determinações do empregador

3. DOCUMENTAÇÃO OBRIGATÓRIA:
   ✓ CA (Certificado de Aprovação) válido
   ✓ Ficha de entrega assinada
   ✓ Registro de treinamento
   ✓ Controle de validade/substituição

SEVERIDADE DOS GAPS:
- CRÍTICA: CA vencido, EPI inadequado para risco, risco de vida
- ALTA: Falta treinamento, documentação incompleta, EPI danificado
- MÉDIA: EPI inadequado para ambiente, controle deficiente
- BAIXA: Melhorias na documentação, otimizações

FORMATO DE RESPOSTA (JSON VÁLIDO):
{
  "score": 0-100,
  "nivelRisco": "baixo|medio|alto|critico",
  "gaps": [
    {
      "id": "epi_001",
      "descricao": "Descrição específica do gap de EPI",
      "severidade": "baixa|media|alta|critica",
      "categoria": "CA|Treinamento|Documentacao|EPI|Inspecao",
      "recomendacao": "Recomendação específica para EPI",
      "prazo": "30 dias",
      "nr6_artigo": "6.6.1.a"
    }
  ],
  "resumo": "Resumo executivo focado em EPIs",
  "pontosPositivos": ["Pontos positivos relacionados a EPIs"],
  "pontosAtencao": ["Pontos de atenção específicos de EPIs"],
  "proximosPassos": ["Próximos passos para conformidade NR-6"],
  "conformidadeNR6": {
    "ca_valido": true/false,
    "treinamento_realizado": true/false,
    "epi_adequado": true/false,
    "documentacao_completa": true/false
  }
}

IMPORTANTE: Responda APENAS com o JSON válido, sem texto adicional.
  `
}

// Parsear resposta específica da NR-6
function parsearRespostaNR6(response: string): AnaliseNR6Response {
  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('JSON não encontrado na resposta')
    }

    const parsed = JSON.parse(jsonMatch[0])

    // Validar estrutura específica da NR-6
    if (!parsed.score || !parsed.conformidadeNR6) {
      throw new Error('Estrutura de resposta NR-6 inválida')
    }

    return parsed as AnaliseNR6Response
  } catch (error) {
    console.error('Erro ao parsear resposta NR-6:', error)
    throw new Error('Falha ao processar resposta da IA para NR-6')
  }
}

export default groq