'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle, XCircle, AlertTriangle, Clock } from 'lucide-react'

interface AnaliseResultado {
  score: number
  nivelRisco: string
  gaps: Array<{
    id: string
    descricao: string
    severidade: string
    categoria: string
    recomendacao: string
    prazo: string
  }>
  resumo: string
  conformidadeNR6: {
    ca_valido: boolean
    treinamento_realizado: boolean
    epi_adequado: boolean
    documentacao_completa: boolean
  }
}

export default function NR6Page() {
  const [documento, setDocumento] = useState('')
  const [tipoDocumento, setTipoDocumento] = useState('')
  const [empresaId, setEmpresaId] = useState('')
  const [loading, setLoading] = useState(false)
  const [resultado, setResultado] = useState<AnaliseResultado | null>(null)
  const [error, setError] = useState('')

  const analisarDocumento = async () => {
    if (!documento || !tipoDocumento || !empresaId) {
      setError('Preencha todos os campos obrigatórios')
      return
    }

    setLoading(true)
    setError('')
    setResultado(null)

    try {
      const response = await fetch('/api/nr6/analisar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          documento,
          tipoDocumento,
          empresaId
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro na análise')
      }

      setResultado(data.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }

  const getRiscoColor = (risco: string) => {
    switch (risco) {
      case 'baixo': return 'bg-green-500'
      case 'medio': return 'bg-yellow-500'
      case 'alto': return 'bg-orange-500'
      case 'critico': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const getSeveridadeIcon = (severidade: string) => {
    switch (severidade) {
      case 'baixa': return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'media': return <Clock className="h-4 w-4 text-yellow-500" />
      case 'alta': return <AlertTriangle className="h-4 w-4 text-orange-500" />
      case 'critica': return <XCircle className="h-4 w-4 text-red-500" />
      default: return null
    }
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="container mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">
            MVP NR-6 - Análise de EPIs
          </h1>
          <p className="text-muted-foreground mt-2">
            Análise especializada de conformidade com a NR-6 (Equipamento de Proteção Individual)
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Formulário de Análise */}
          <Card>
            <CardHeader>
              <CardTitle>Analisar Documento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Empresa ID</label>
                <input
                  type="text"
                  value={empresaId}
                  onChange={(e) => setEmpresaId(e.target.value)}
                  placeholder="Ex: empresa-123"
                  className="w-full p-2 border rounded-md"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Tipo de Documento</label>
                <Select value={tipoDocumento} onValueChange={setTipoDocumento}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ficha_entrega_epi">Ficha de Entrega de EPI</SelectItem>
                    <SelectItem value="treinamento_epi">Treinamento de EPI</SelectItem>
                    <SelectItem value="inspecao_epi">Inspeção de EPI</SelectItem>
                    <SelectItem value="pgr">PGR (Programa de Gerenciamento de Riscos) ⭐ Principal</SelectItem>
                    <SelectItem value="nr1_gro">NR-1 GRO</SelectItem>
                    <SelectItem value="ppra">PPRA (Legado - substituído por PGR)</SelectItem>
                    <SelectItem value="outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Documento</label>
                <Textarea
                  value={documento}
                  onChange={(e) => setDocumento(e.target.value)}
                  placeholder="Cole aqui o conteúdo do documento para análise..."
                  rows={10}
                />
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button 
                onClick={analisarDocumento} 
                disabled={loading}
                className="w-full"
              >
                {loading ? 'Analisando...' : 'Analisar com NR-6'}
              </Button>
            </CardContent>
          </Card>

          {/* Resultado da Análise */}
          {resultado && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Resultado da Análise
                  <Badge className={getRiscoColor(resultado.nivelRisco)}>
                    Score: {resultado.score}/100
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Status de Conformidade NR-6 */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center gap-2">
                    {resultado.conformidadeNR6.ca_valido ? 
                      <CheckCircle className="h-4 w-4 text-green-500" /> : 
                      <XCircle className="h-4 w-4 text-red-500" />
                    }
                    <span className="text-sm">CA Válido</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {resultado.conformidadeNR6.treinamento_realizado ? 
                      <CheckCircle className="h-4 w-4 text-green-500" /> : 
                      <XCircle className="h-4 w-4 text-red-500" />
                    }
                    <span className="text-sm">Treinamento</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {resultado.conformidadeNR6.epi_adequado ? 
                      <CheckCircle className="h-4 w-4 text-green-500" /> : 
                      <XCircle className="h-4 w-4 text-red-500" />
                    }
                    <span className="text-sm">EPI Adequado</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {resultado.conformidadeNR6.documentacao_completa ? 
                      <CheckCircle className="h-4 w-4 text-green-500" /> : 
                      <XCircle className="h-4 w-4 text-red-500" />
                    }
                    <span className="text-sm">Documentação</span>
                  </div>
                </div>

                {/* Resumo */}
                <div>
                  <h4 className="font-medium">Resumo</h4>
                  <p className="text-sm text-muted-foreground">{resultado.resumo}</p>
                </div>

                {/* Gaps */}
                <div>
                  <h4 className="font-medium">Gaps Identificados ({resultado.gaps.length})</h4>
                  <div className="space-y-2">
                    {resultado.gaps.map((gap) => (
                      <div key={gap.id} className="border rounded-md p-3">
                        <div className="flex items-center gap-2 mb-1">
                          {getSeveridadeIcon(gap.severidade)}
                          <Badge variant="outline">{gap.categoria}</Badge>
                          <span className="text-xs text-muted-foreground">{gap.prazo}</span>
                        </div>
                        <p className="text-sm font-medium">{gap.descricao}</p>
                        <p className="text-xs text-muted-foreground mt-1">{gap.recomendacao}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}