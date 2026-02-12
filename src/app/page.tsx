'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Brain, AlertCircle } from 'lucide-react'
import { UploadDocumento } from '@/components/analise/UploadDocumento'
import { SeletorNormas } from '@/components/analise/SeletorNormas'
import { ResultadoAnalise } from '@/components/analise/ResultadoAnalise'
import { AnaliseConformidadeResponse } from '@/types/ia'

interface Norma {
  id: string
  codigo: string
  titulo: string
}

export default function AnalisePage() {
  const [arquivo, setArquivo] = useState<File | null>(null)
  const [normas, setNormas] = useState<Norma[]>([])
  const [normasSelecionadas, setNormasSelecionadas] = useState<string[]>([])
  const [carregandoNormas, setCarregandoNormas] = useState(true)
  const [analisando, setAnalisando] = useState(false)
  const [progresso, setProgresso] = useState(0)
  const [etapa, setEtapa] = useState('')
  const [erro, setErro] = useState<string | null>(null)
  const [resultado, setResultado] = useState<AnaliseConformidadeResponse | null>(null)

  useEffect(() => {
    async function fetchNormas() {
      try {
        const res = await fetch('/api/normas')
        const data = await res.json()
        if (data.success && data.data) {
          setNormas(data.data)
        }
      } catch {
        // Silencioso - o componente mostra estado vazio
      } finally {
        setCarregandoNormas(false)
      }
    }
    fetchNormas()
  }, [])

  const executarAnalise = useCallback(async () => {
    if (!arquivo) {
      setErro('Selecione um documento para analisar.')
      return
    }
    if (normasSelecionadas.length === 0) {
      setErro('Selecione pelo menos uma norma regulamentadora.')
      return
    }

    setAnalisando(true)
    setErro(null)
    setProgresso(0)
    setResultado(null)

    try {
      // 1. Extrair texto do documento
      setEtapa('Extraindo texto do documento...')
      setProgresso(15)

      const formData = new FormData()
      formData.append('file', arquivo)

      const extractRes = await fetch('/api/extrair-texto', {
        method: 'POST',
        body: formData,
      })

      if (!extractRes.ok) {
        const err = await extractRes.json().catch(() => ({}))
        throw new Error(err.error || `Erro ${extractRes.status} ao extrair texto`)
      }

      const extractData = await extractRes.json()
      if (!extractData.success) {
        throw new Error(extractData.error || 'Falha na extração de texto')
      }

      const textoDocumento = extractData.data.texto
      setProgresso(40)

      // 2. Análise de conformidade com IA
      setEtapa('Analisando conformidade com IA...')
      setProgresso(50)

      const codigosNR = normasSelecionadas.map(codigo => {
        const match = codigo.match(/NR[-\s]*(\d+)/i)
        return match ? `NR-${parseInt(match[1])}` : codigo
      })

      const analysisRes = await fetch('/api/ia/analisar-conformidade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documento: textoDocumento,
          tipoDocumento: 'OUTRO',
          normasAplicaveis: codigosNR,
        }),
      })

      setProgresso(85)

      if (!analysisRes.ok) {
        const err = await analysisRes.json().catch(() => ({}))
        throw new Error(err.error || `Erro ${analysisRes.status} na análise`)
      }

      const analysisData = await analysisRes.json()
      if (!analysisData.success || !analysisData.data) {
        throw new Error(analysisData.error || 'Falha na análise de conformidade')
      }

      setProgresso(100)
      setEtapa('Concluída')
      setResultado(analysisData.data)
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro desconhecido na análise')
    } finally {
      setAnalisando(false)
    }
  }, [arquivo, normasSelecionadas])

  const novaAnalise = () => {
    setArquivo(null)
    setNormasSelecionadas([])
    setResultado(null)
    setErro(null)
    setProgresso(0)
    setEtapa('')
  }

  const podeAnalisar = arquivo && normasSelecionadas.length > 0 && !analisando

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Análise de Conformidade
        </h1>
        <p className="text-gray-500 mt-2 max-w-lg mx-auto">
          Faça upload do documento SST, selecione as NRs aplicáveis e receba a análise com IA
        </p>
      </div>

      {resultado ? (
        <ResultadoAnalise resultado={resultado} onNovaAnalise={novaAnalise} />
      ) : (
        <div className="space-y-6">
          {/* 1. Upload */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">1. Documento</CardTitle>
            </CardHeader>
            <CardContent>
              <UploadDocumento
                arquivo={arquivo}
                onArquivoChange={(f) => { setArquivo(f); setErro(null) }}
                desabilitado={analisando}
              />
            </CardContent>
          </Card>

          {/* 2. Seleção de NRs */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">2. Normas Regulamentadoras</CardTitle>
            </CardHeader>
            <CardContent>
              <SeletorNormas
                normas={normas}
                selecionadas={normasSelecionadas}
                onSelecaoChange={(s) => { setNormasSelecionadas(s); setErro(null) }}
                carregando={carregandoNormas}
              />
            </CardContent>
          </Card>

          {/* Erro */}
          {erro && (
            <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-xl text-red-800">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <p className="text-sm">{erro}</p>
            </div>
          )}

          {/* Progresso */}
          {analisando && (
            <div className="space-y-3 p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600 border-t-transparent" />
                <span className="text-sm font-medium text-blue-800">{etapa}</span>
              </div>
              <Progress value={progresso} />
            </div>
          )}

          {/* Botão Analisar */}
          <Button
            onClick={executarAnalise}
            disabled={!podeAnalisar}
            size="xl"
            className="w-full bg-blue-600 hover:bg-blue-700 text-base"
          >
            <Brain className="h-5 w-5 mr-2" />
            {analisando ? 'Analisando...' : 'Analisar Conformidade com IA'}
          </Button>
        </div>
      )}
    </div>
  )
}
