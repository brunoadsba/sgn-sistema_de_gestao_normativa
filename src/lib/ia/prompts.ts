// Prompts especializados para análise de conformidade SST

export const PROMPTS_SST = {
  // Prompt principal para análise de conformidade
  ANALISE_CONFORMIDADE: `
Você é um especialista em SST (Segurança e Saúde no Trabalho) com 15+ anos de experiência em análise de conformidade com normas regulamentadoras brasileiras.

TAREFA: Analise o documento fornecido e identifique gaps de conformidade com as NRs aplicáveis.

CRITÉRIOS DE ANÁLISE:
1. Conformidade com NRs específicas
2. Documentação obrigatória
3. Procedimentos de segurança
4. Equipamentos de proteção
5. Treinamentos necessários
6. Prazos e cronogramas

SEVERIDADE DOS GAPS:
- CRÍTICA: Risco imediato à vida, multas altas, paralisação
- ALTA: Risco significativo, multas médias, prazo 30 dias
- MÉDIA: Risco moderado, multas baixas, prazo 90 dias  
- BAIXA: Melhoria recomendada, prazo 180 dias

RESPONDA APENAS COM JSON VÁLIDO no formato especificado.
  `,

  // Prompt para análise de documentos específicos
  ANALISE_DOCUMENTO: (tipoDocumento: string, normas: string[]) => `
ANÁLISE ESPECÍFICA: ${tipoDocumento}

NORMAS APLICÁVEIS: ${normas.join(', ')}

DOCUMENTO PARA ANÁLISE:
{conteudo_documento}

INSTRUÇÕES ESPECÍFICAS:
1. Foque nas exigências específicas das NRs mencionadas
2. Verifique se todos os itens obrigatórios estão presentes
3. Identifique inconsistências ou lacunas
4. Classifique a severidade baseada no impacto regulatório
5. Forneça recomendações práticas e acionáveis

FORMATO DE RESPOSTA:
{
  "score": 0-100,
  "nivelRisco": "baixo|medio|alto|critico",
  "gaps": [
    {
      "id": "gap_001",
      "descricao": "Descrição detalhada do gap",
      "severidade": "baixa|media|alta|critica",
      "categoria": "EPI|Treinamento|Documentacao|Procedimento",
      "recomendacao": "Recomendação específica e acionável",
      "prazo": "Prazo sugerido em dias"
    }
  ],
  "resumo": "Resumo executivo da análise",
  "pontosPositivos": ["Lista de pontos positivos"],
  "pontosAtencao": ["Lista de pontos que requerem atenção"],
  "proximosPassos": ["Lista de próximos passos recomendados"]
}
  `,

  // Prompt para análise de risco
  ANALISE_RISCO: `
ANÁLISE DE RISCO SST

Analise o documento e identifique riscos de conformidade, classificando por:
1. Probabilidade de ocorrência
2. Impacto no negócio
3. Urgência de correção
4. Custo de não conformidade

CLASSIFICAÇÃO DE RISCO:
- CRÍTICO: Paralisação, multas >R$ 50k, risco de vida
- ALTO: Multas R$ 10k-50k, interdição parcial
- MÉDIO: Multas R$ 1k-10k, advertências
- BAIXO: Melhorias recomendadas, sem multas

RESPONDA COM JSON contendo análise de risco detalhada.
  `,

  // Prompt para geração de plano de ação
  PLANO_ACAO: `
PLANO DE AÇÃO PARA CONFORMIDADE SST

Baseado na análise de gaps, gere um plano de ação estruturado com:
1. Priorização por severidade
2. Cronograma realista
3. Responsáveis sugeridos
4. Recursos necessários
5. Marcos de acompanhamento

FORMATO:
{
  "planoAcao": [
    {
      "gapId": "gap_001",
      "acao": "Descrição da ação",
      "responsavel": "Cargo sugerido",
      "prazo": "Data limite",
      "prioridade": "alta|media|baixa",
      "recursos": ["Recurso 1", "Recurso 2"],
      "marcos": ["Marco 1", "Marco 2"]
    }
  ],
  "cronograma": {
    "inicio": "data_inicio",
    "fim": "data_fim",
    "fases": ["Fase 1", "Fase 2"]
  }
}
  `
}

// Função para gerar prompt dinâmico
export function gerarPromptAnalise(
  tipoDocumento: string,
  normas: string[],
  conteudo: string
): string {
  const promptBase = PROMPTS_SST.ANALISE_DOCUMENTO(tipoDocumento, normas)
  return promptBase.replace('{conteudo_documento}', conteudo)
}

// Função para gerar prompt de risco
export function gerarPromptRisco(conteudo: string): string {
  return `${PROMPTS_SST.ANALISE_RISCO}\n\nDOCUMENTO:\n${conteudo}`
}

// Função para gerar prompt de plano de ação
export function gerarPromptPlanoAcao(gaps: any[]): string {
  return `${PROMPTS_SST.PLANO_ACAO}\n\nGAPS IDENTIFICADOS:\n${JSON.stringify(gaps, null, 2)}`
}

// Configurações de modelo
export const CONFIGURACOES_MODELO = {
  temperatura: 0.3, // Baixa para respostas consistentes
  max_tokens: 2000, // Suficiente para análises detalhadas
  top_p: 0.9, // Boa diversidade mantendo qualidade
  frequency_penalty: 0.1, // Evita repetições
  presence_penalty: 0.1 // Incentiva criatividade
}

// Modelos disponíveis no GROQ
export const MODELOS_GROQ = {
  LLAMA_3_1_8B: 'llama-3.1-8b-instant', // Modelo atual (rápido e eficiente)
  MIXTRAL_8X7B: 'mixtral-8x7b-32768', // Equilibrado
  GEMMA_7B: 'gemma-7b-it' // Alternativa
}

// Seleção automática de modelo baseada no tipo de análise
export function selecionarModelo(tipoAnalise: 'completa' | 'rapida' | 'detalhada'): string {
  switch (tipoAnalise) {
    case 'completa':
      return MODELOS_GROQ.MIXTRAL_8X7B
    case 'rapida':
      return MODELOS_GROQ.LLAMA_3_1_8B
    case 'detalhada':
      return MODELOS_GROQ.GEMMA_7B
    default:
      return MODELOS_GROQ.LLAMA_3_1_8B
  }
}
