const STOPWORDS = new Set([
  'de',
  'do',
  'da',
  'dos',
  'das',
  'e',
  'ou',
  'com',
  'para',
  'por',
  'que',
  'em',
  'no',
  'na',
  'nos',
  'nas',
])

type RegraHeuristica = {
  norma: string
  termos: string[]
}

const REGRAS: RegraHeuristica[] = [
  { norma: 'nr-6', termos: ['epi', 'capacete', 'luva', 'oculos de protecao', 'protetor auricular', 'calçado'] },
  { norma: 'nr-7', termos: ['pcmso', 'exame admissional', 'exame periodico', 'aso', 'medico do trabalho'] },
  { norma: 'nr-9', termos: ['agente fisico', 'agente quimico', 'agente biologico', 'exposicao ocupacional'] },
  { norma: 'nr-10', termos: ['eletricidade', 'painel eletrico', 'choque eletrico', 'sep', 'sistema eletrico'] },
  { norma: 'nr-12', termos: ['maquina', 'equipamento industrial', 'proteção de maquina', 'prensa'] },
  { norma: 'nr-13', termos: ['caldeira', 'vaso de pressao', 'inspecao de caldeira'] },
  { norma: 'nr-15', termos: ['insalubridade', 'ruido', 'calor excessivo', 'agente nocivo'] },
  { norma: 'nr-17', termos: ['ergonomia', 'posto de trabalho', 'lombalgia', 'esforco repetitivo'] },
  { norma: 'nr-18', termos: ['canteiro de obras', 'construcao civil', 'andaime', 'escoramento'] },
  { norma: 'nr-20', termos: ['inflamavel', 'combustivel', 'liquido inflamavel', 'tanque'] },
  { norma: 'nr-23', termos: ['incendio', 'brigada', 'extintor', 'rota de fuga'] },
  { norma: 'nr-29', termos: ['porto', 'portuario', 'cais', 'estiva', 'movimentacao portuaria', 'operacao portuaria'] },
  { norma: 'nr-30', termos: ['aquaviario', 'embarcacao', 'navio', 'tripulacao'] },
  { norma: 'nr-33', termos: ['espaco confinado', 'atmosfera perigosa', 'entrada confinada'] },
  { norma: 'nr-35', termos: ['trabalho em altura', 'linha de vida', 'talabarte', 'cinto de seguranca'] },
]

function normalize(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^\w\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function tokenize(texto: string): string[] {
  return normalize(texto)
    .split(/\s+/)
    .filter((token) => token.length > 2 && !STOPWORDS.has(token))
}

function scoreRegra(regra: RegraHeuristica, textoNormalizado: string): number {
  let score = 0
  for (const termo of regra.termos) {
    if (textoNormalizado.includes(normalize(termo))) {
      score += 1
    }
  }
  return score
}

function inferirPorTipoDocumento(tipoDocumento: string): string[] {
  const tipo = normalize(tipoDocumento)
  if (tipo === 'pcmso') return ['nr-1', 'nr-7']
  if (tipo === 'ltcat') return ['nr-1', 'nr-15']
  if (tipo === 'pgr' || tipo === 'nr-1-gro') return ['nr-1']
  return ['nr-1']
}

export function inferirNormasHeuristicas(texto: string, tipoDocumento = 'OUTRO', limite = 8): string[] {
  const baseTipo = inferirPorTipoDocumento(tipoDocumento)
  const textoNormalizado = normalize(texto.slice(0, 20000))
  const tokens = tokenize(textoNormalizado)
  if (tokens.length === 0) return baseTipo

  const scored = REGRAS
    .map((regra) => ({ norma: regra.norma, score: scoreRegra(regra, textoNormalizado) }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limite)
    .map((item) => item.norma)

  return Array.from(new Set([...baseTipo, ...scored]))
}

export function jaccardNormas(a: string[], b: string[]): number {
  const setA = new Set(a.map((item) => item.toLowerCase()))
  const setB = new Set(b.map((item) => item.toLowerCase()))
  if (setA.size === 0 && setB.size === 0) return 1
  const inter = [...setA].filter((item) => setB.has(item)).length
  const union = new Set([...setA, ...setB]).size
  return union === 0 ? 0 : Number((inter / union).toFixed(4))
}
