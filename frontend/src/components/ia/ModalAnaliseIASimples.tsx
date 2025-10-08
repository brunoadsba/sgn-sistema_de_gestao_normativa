'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { X, Brain, Upload, File, CheckCircle, AlertCircle } from 'lucide-react'
import { AnaliseConformidadeResponse } from '@/types/ia'

interface ModalAnaliseIASimplesProps {
  isOpen: boolean
  onClose: () => void
  empresaId: string
  empresaNome: string
  onAnaliseCompleta?: (resultado: AnaliseConformidadeResponse) => void
}

export function ModalAnaliseIASimples({ 
  isOpen, 
  onClose, 
  empresaId, 
  empresaNome,
  onAnaliseCompleta 
}: ModalAnaliseIASimplesProps) {
  const [arquivoSelecionado, setArquivoSelecionado] = useState<File | null>(null)
  const [resultado, setResultado] = useState<AnaliseConformidadeResponse | null>(null)
  const [analisando, setAnalisando] = useState(false)
  const [progresso, setProgresso] = useState(0)
  const [erro, setErro] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    console.log('📁 Arquivo selecionado:', file)
    
    if (file) {
      if (file.type === 'application/pdf' || 
          file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
          file.type === 'text/plain') {
        console.log('✅ Arquivo válido')
        setArquivoSelecionado(file)
        setErro(null)
      } else {
        console.log('❌ Tipo de arquivo inválido:', file.type)
        setErro('Por favor, selecione apenas arquivos PDF, DOCX ou TXT.')
      }
    }
  }

  const lerConteudoArquivo = async (arquivo: File): Promise<string> => {
    console.log('📖 Iniciando extração real do arquivo:', {
      nome: arquivo.name,
      tipo: arquivo.type,
      tamanho: arquivo.size
    })

    try {
      // Criar FormData para enviar o arquivo
      const formData = new FormData()
      formData.append('file', arquivo)

      console.log('📤 Enviando arquivo para API de extração...')

      // Chamar API de extração de texto
      const response = await fetch('/api/extrair-texto', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Erro ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Erro na extração de texto')
      }

      console.log('✅ Texto extraído com sucesso:', {
        tamanho: data.data.tamanho,
        preview: data.data.texto.substring(0, 200) + '...'
      })

      return data.data.texto

    } catch (error) {
      console.error('❌ Erro na extração:', error)
      throw new Error(`Erro ao extrair texto do arquivo: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
    }
  }

  const executarAnalise = async () => {
    if (!arquivoSelecionado) {
      setErro('Por favor, selecione um arquivo.')
      return
    }
    
    console.log('🚀 Iniciando análise REAL do arquivo...', {
      arquivo: arquivoSelecionado.name,
      tipo: arquivoSelecionado.type,
      tamanho: arquivoSelecionado.size,
      empresaId
    })
    
    setAnalisando(true)
    setProgresso(0)
    setErro(null)
    
    try {
      // Progresso: Lendo arquivo
      setProgresso(10)
      console.log('📖 Lendo conteúdo real do arquivo...')
      
      const documentoText = await lerConteudoArquivo(arquivoSelecionado)
      console.log('✅ Conteúdo lido com sucesso, tamanho:', documentoText.length)
      
      setProgresso(30)
      
      setProgresso(40)
      
      console.log('📤 Enviando para IA:', {
        documento: documentoText.substring(0, 500) + '...',
        tamanhoCompleto: documentoText.length,
        tipoDocumento: 'OUTRO',
        empresaId,
        normasAplicaveis: ['OUTRO']
      })

      // Preparar dados para envio
      const dadosAnalise = {
        documento: documentoText,
        tipoDocumento: 'OUTRO',
        empresaId,
        normasAplicaveis: ['OUTRO']
      }

      console.log('📋 Dados preparados para envio:', {
        tamanhoDocumento: dadosAnalise.documento.length,
        empresaId: dadosAnalise.empresaId,
        tipoDocumento: dadosAnalise.tipoDocumento
      })
      
      let response
      try {
        response = await fetch('/api/ia/analisar-conformidade', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(dadosAnalise),
        })
      } catch (fetchError) {
        console.error('❌ Erro na requisição fetch:', fetchError)
        throw new Error(`Erro de conexão: ${fetchError instanceof Error ? fetchError.message : 'Erro desconhecido'}`)
      }

      console.log('📡 Resposta recebida:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      })

      setProgresso(80)

      if (!response.ok) {
        // Tentar obter detalhes do erro
        let errorDetails = ''
        try {
          const errorData = await response.json()
          errorDetails = errorData.error || errorData.detalhes || 'Erro desconhecido'
          console.error('❌ Detalhes do erro:', errorData)
        } catch (parseError) {
          errorDetails = `Erro ${response.status}: ${response.statusText}`
        }
        throw new Error(errorDetails)
      }

      const data = await response.json()
      setProgresso(100)

      if (data.success && data.data) {
        console.log('✅ Análise concluída com sucesso:', data.data)
        setResultado(data.data)
        onAnaliseCompleta?.(data.data)
      } else {
        throw new Error(data.error || 'Erro na análise')
      }
    } catch (error) {
      console.error('❌ Erro na análise:', error)
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido na análise'
      setErro(errorMessage)
      
      // Se for erro de extração, mostrar mensagem específica
      if (errorMessage.includes('extrair texto')) {
        setErro(`Erro ao processar o arquivo: ${errorMessage}`)
      }
    } finally {
      setAnalisando(false)
    }
  }

  const limpar = () => {
    setArquivoSelecionado(null)
    setResultado(null)
    setProgresso(0)
    setErro(null)
    setAnalisando(false)
  }

  const fecharModal = () => {
    limpar()
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2">
      <div className="bg-white rounded-xl w-full h-[95vh] overflow-hidden shadow-2xl">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 to-blue-800 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white bg-opacity-20 rounded-xl">
                <Brain className="h-8 w-8" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Análise de Conformidade com IA</h2>
                <p className="text-blue-100 text-sm">
                  {empresaNome} • Análise automatizada de documentos SST
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={fecharModal}
              className="text-white hover:bg-white hover:bg-opacity-20"
            >
              <X className="h-6 w-6" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(95vh-120px)]">
          
          {!resultado ? (
            <div className="space-y-6">
              
              {/* Upload de Arquivo */}
              <Card className="border-2 border-dashed border-gray-300">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Upload className="h-5 w-5" />
                    <span>Selecionar Documento</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.docx,.txt"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  
                  {!arquivoSelecionado ? (
                    <div className="text-center py-8">
                      <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 mb-4">
                        Clique para selecionar um arquivo ou arraste aqui
                      </p>
                      <Button
                        onClick={() => fileInputRef.current?.click()}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Selecionar Arquivo
                      </Button>
                      <p className="text-xs text-gray-500 mt-2">
                        Formatos suportados: PDF, DOCX, TXT (máx. 10MB)
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <File className="h-5 w-5 text-green-600" />
                          <div>
                            <p className="font-medium text-green-900">
                              {arquivoSelecionado.name}
                            </p>
                            <p className="text-sm text-green-700">
                              {(arquivoSelecionado.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                        <Button
                          onClick={() => setArquivoSelecionado(null)}
                          variant="ghost"
                          size="sm"
                          className="text-green-600 hover:text-green-800"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>

                      <Button
                        onClick={executarAnalise}
                        disabled={analisando}
                        className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-lg font-semibold"
                      >
                        <Brain className="h-5 w-5 mr-2" />
                        {analisando ? 'Analisando...' : '🚀 Analisar com IA'}
                      </Button>
                    </div>
                  )}

                  {/* Erro */}
                  {erro && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <AlertCircle className="h-5 w-5 text-red-600" />
                        <p className="text-red-800">{erro}</p>
                      </div>
                    </div>
                  )}

                  {/* Progresso */}
                  {analisando && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-center space-x-3">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                        <span className="text-lg font-medium text-blue-800">
                          Analisando documento com IA...
                        </span>
                      </div>
                      <Progress value={progresso} className="w-full" />
                      <p className="text-sm text-blue-600 text-center">{progresso}% concluído</p>
                    </div>
                  )}
                </CardContent>
              </Card>

            </div>
          ) : (
            /* Resultado */
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-gray-900">
                  Resultado da Análise
                </h3>
                <Button
                  onClick={limpar}
                  variant="outline"
                  size="sm"
                >
                  Nova Análise
                </Button>
              </div>

              {/* Resumo do Resultado */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-green-100 rounded-xl">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-green-900">
                      Análise Concluída com Sucesso!
                    </h4>
                    <p className="text-green-700">
                      Score: {resultado.score}/100 • Risco: {resultado.nivelRisco} • {resultado.gaps.length} gaps identificados
                    </p>
                  </div>
                </div>
              </div>

              {/* Detalhes da Análise */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Resumo</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700">{resultado.resumo}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Pontos Positivos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-1">
                      {resultado.pontosPositivos.map((ponto, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
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
                    <CardTitle className="text-lg">Gaps Identificados</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {resultado.gaps.map((gap, index) => (
                        <div key={index} className="p-3 border rounded-lg">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-semibold text-gray-900">{gap.descricao}</h4>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              gap.severidade === 'alta' ? 'bg-red-100 text-red-800' :
                              gap.severidade === 'media' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {gap.severidade}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{gap.recomendacao}</p>
                          <p className="text-xs text-gray-500">Prazo: {gap.prazo}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Botão para fechar */}
              <div className="flex justify-end">
                <Button
                  onClick={fecharModal}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3"
                >
                  Fechar
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
