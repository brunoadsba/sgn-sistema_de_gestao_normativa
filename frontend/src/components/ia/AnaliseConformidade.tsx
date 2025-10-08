'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Brain, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  FileText,
  TrendingUp,
  Target,
  Users,
  Calendar,
  Zap
} from 'lucide-react'
import { AnaliseConformidadeResponse, GapConformidade } from '@/types/ia'

interface AnaliseConformidadeProps {
  empresaId: string
  documento?: string
  tipoDocumento?: string
  onAnaliseCompleta?: (resultado: AnaliseConformidadeResponse) => void
}

export function AnaliseConformidade({ 
  empresaId, 
  documento, 
  tipoDocumento,
  onAnaliseCompleta 
}: AnaliseConformidadeProps) {
  const [analisando, setAnalisando] = useState(false)
  const [resultado, setResultado] = useState<AnaliseConformidadeResponse | null>(null)
  const [erro, setErro] = useState<string | null>(null)
  const [progresso, setProgresso] = useState(0)

  // Função para executar análise
  const executarAnalise = async () => {
    if (!documento || !tipoDocumento) {
      setErro('Documento e tipo são obrigatórios para análise')
      return
    }

    setAnalisando(true)
    setErro(null)
    setProgresso(0)

    try {
      // Simular progresso
      const interval = setInterval(() => {
        setProgresso(prev => Math.min(prev + 10, 90))
      }, 200)

      const response = await fetch('/api/ia/analisar-conformidade', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          documento,
          tipoDocumento,
          empresaId,
          normasAplicaveis: ['NR-1', 'NR-6', 'NR-7', 'NR-9', 'NR-12']
        })
      })

      clearInterval(interval)
      setProgresso(100)

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Erro na análise')
      }

      setResultado(data.data)
      onAnaliseCompleta?.(data.data)

    } catch (error) {
      console.error('Erro na análise:', error)
      setErro(error instanceof Error ? error.message : 'Erro desconhecido')
    } finally {
      setAnalisando(false)
      setProgresso(0)
    }
  }

  // Função para obter cor do score
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    if (score >= 40) return 'text-orange-600'
    return 'text-red-600'
  }

  // Função para obter cor do nível de risco
  const getRiscoColor = (nivel: string) => {
    switch (nivel) {
      case 'baixo': return 'bg-green-100 text-green-800'
      case 'medio': return 'bg-yellow-100 text-yellow-800'
      case 'alto': return 'bg-orange-100 text-orange-800'
      case 'critico': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  // Função para obter cor da severidade
  const getSeveridadeColor = (severidade: string) => {
    switch (severidade) {
      case 'baixa': return 'bg-blue-100 text-blue-800'
      case 'media': return 'bg-yellow-100 text-yellow-800'
      case 'alta': return 'bg-orange-100 text-orange-800'
      case 'critica': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Brain className="h-6 w-6 text-blue-600" />
            </div>
            <span>Análise de Conformidade com IA</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 mb-2">
                Analise documentos de SST usando inteligência artificial
              </p>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span className="flex items-center space-x-1">
                  <Zap className="h-4 w-4" />
                  <span>GROQ + Llama 3.1</span>
                </span>
                <span className="flex items-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span>~2-5 segundos</span>
                </span>
              </div>
            </div>
            <Button 
              onClick={executarAnalise}
              disabled={analisando || !documento || !tipoDocumento}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {analisando ? (
                <>
                  <Brain className="h-4 w-4 mr-2 animate-pulse" />
                  Analisando...
                </>
              ) : (
                <>
                  <Brain className="h-4 w-4 mr-2" />
                  Iniciar Análise
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Progresso */}
      {analisando && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Processando análise...</span>
                <span className="text-sm text-gray-500">{progresso}%</span>
              </div>
              <Progress value={progresso} className="h-2" />
              <p className="text-xs text-gray-500">
                Analisando documento com IA especializada em SST
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Erro */}
      {erro && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <div>
                <p className="font-medium text-red-800">Erro na análise</p>
                <p className="text-sm text-red-600">{erro}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Resultado */}
      {resultado && (
        <div className="space-y-6">
          {/* Score e Risco */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5" />
                  <span>Score de Conformidade</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className={`text-4xl font-bold ${getScoreColor(resultado.score)}`}>
                    {resultado.score}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">de 100 pontos</div>
                  <Progress value={resultado.score} className="mt-4 h-3" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="h-5 w-5" />
                  <span>Nível de Risco</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <Badge className={`text-lg px-4 py-2 ${getRiscoColor(resultado.nivelRisco)}`}>
                    {resultado.nivelRisco.toUpperCase()}
                  </Badge>
                  <div className="text-sm text-gray-500 mt-2">
                    {resultado.gaps.length} gaps identificados
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Resumo */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Resumo Executivo</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed">{resultado.resumo}</p>
            </CardContent>
          </Card>

          {/* Pontos Positivos e Atenção */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-green-700">
                  <CheckCircle className="h-5 w-5" />
                  <span>Pontos Positivos</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {resultado.pontosPositivos.map((ponto, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{ponto}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-orange-700">
                  <AlertTriangle className="h-5 w-5" />
                  <span>Pontos de Atenção</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {resultado.pontosAtencao.map((ponto, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <AlertTriangle className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{ponto}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Gaps Identificados */}
          {resultado.gaps.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5" />
                  <span>Gaps Identificados</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {resultado.gaps.map((gap, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <Badge className={getSeveridadeColor(gap.severidade)}>
                            {gap.severidade.toUpperCase()}
                          </Badge>
                          <span className="text-sm font-medium text-gray-600">
                            {gap.categoria}
                          </span>
                        </div>
                        <span className="text-sm text-gray-500">{gap.prazo}</span>
                      </div>
                      <p className="text-gray-700 mb-2">{gap.descricao}</p>
                      <p className="text-sm text-blue-600 font-medium">
                        💡 {gap.recomendacao}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Próximos Passos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>Próximos Passos</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {resultado.proximosPassos.map((passo, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                      {index + 1}
                    </div>
                    <span className="text-sm text-gray-700">{passo}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Metadados */}
          <Card className="bg-gray-50">
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Modelo:</span>
                  <p className="font-medium">{resultado.modeloUsado}</p>
                </div>
                <div>
                  <span className="text-gray-500">Tempo:</span>
                  <p className="font-medium">{resultado.tempoProcessamento}ms</p>
                </div>
                <div>
                  <span className="text-gray-500">Data:</span>
                  <p className="font-medium">
                    {new Date(resultado.timestamp).toLocaleString('pt-BR')}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">Gaps:</span>
                  <p className="font-medium">{resultado.gaps.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
