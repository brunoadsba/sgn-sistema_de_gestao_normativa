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
    <div className="container mx-auto px-4 max-w-5xl">
      {/* Header */}
      <div className="text-center mb-12 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-blue-500/20 blur-3xl -z-10 rounded-full"></div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600 tracking-tight mb-4">
          Análise de Conformidade
        </h1>
        <p className="text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
          Faça upload do seu documento SST, selecione as normas aplicáveis e deixe nossa IA identificar gaps e gerar recomendações precisas instantaneamente.
        </p>
      </div>

      {resultado ? (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
          <ResultadoAnalise resultado={resultado} onNovaAnalise={novaAnalise} />
        </div>
      ) : (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            {/* Esquerda - Upload (Ocupa mais espaço) */}
            <div className="md:col-span-7">
              <Card className="h-full border-white/40 shadow-xl shadow-blue-900/5 bg-white/70 backdrop-blur-xl transition-all duration-300 hover:shadow-blue-900/10">
                <CardHeader className="pb-4 border-b border-gray-100/50">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 font-bold">1</div>
                    <CardTitle className="text-xl">Envio do Documento</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <UploadDocumento
                    arquivo={arquivo}
                    onArquivoChange={(f) => { setArquivo(f); setErro(null) }}
                    desabilitado={analisando}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Direita - Normas */}
            <div className="md:col-span-5">
              <Card className="h-full border-white/40 shadow-xl shadow-indigo-900/5 bg-white/70 backdrop-blur-xl transition-all duration-300 hover:shadow-indigo-900/10">
                <CardHeader className="pb-4 border-b border-gray-100/50">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">2</div>
                    <CardTitle className="text-xl">Normas Aplicáveis</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="pt-6 h-[calc(100%-5rem)]">
                  <SeletorNormas
                    normas={normas}
                    selecionadas={normasSelecionadas}
                    onSelecaoChange={(s) => { setNormasSelecionadas(s); setErro(null) }}
                    carregando={carregandoNormas}
                  />
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Erro */}
          {erro && (
            <div className="animate-in fade-in zoom-in-95 duration-300 flex items-center gap-3 p-4 bg-red-50/90 backdrop-blur-md border border-red-200 shadow-sm shadow-red-100 rounded-2xl text-red-800">
              <AlertCircle className="h-6 w-6 flex-shrink-0 text-red-500" />
              <p className="text-sm font-medium">{erro}</p>
            </div>
          )}

          {/* Progresso */}
          {analisando && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-4 p-6 bg-gradient-to-r from-blue-50/90 to-indigo-50/90 backdrop-blur-xl border border-blue-100 shadow-lg shadow-blue-100/50 rounded-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="absolute inset-0 bg-blue-400 rounded-full blur animate-pulse opacity-50"></div>
                    <div className="relative h-8 w-8 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin" />
                  </div>
                  <span className="text-base font-semibold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-indigo-700">
                    {etapa}
                  </span>
                </div>
                <span className="text-sm font-bold text-blue-600">{progresso}%</span>
              </div>
              <Progress value={progresso} className="h-3 bg-blue-100" />
            </div>
          )}

          {/* Botão Analisar */}
          <div className="pt-4">
            <Button
              onClick={executarAnalise}
              disabled={!podeAnalisar}
              size="lg"
              className="w-full h-16 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-lg font-bold shadow-xl shadow-blue-500/25 hover:shadow-2xl hover:shadow-blue-500/40 hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none"
            >
              <Brain className="h-6 w-6 mr-3 animate-pulse" />
              {analisando ? 'Processando com Inteligência Artificial...' : 'Analisar Conformidade com IA'}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
