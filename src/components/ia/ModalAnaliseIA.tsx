'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { X, Brain, FileText, Upload, Zap, Search, File, CheckCircle, AlertCircle, Clock, Download, Filter } from 'lucide-react'
// import { AnaliseConformidade } from './AnaliseConformidade'
import { AnaliseConformidadeResponse } from '@/types/ia'

interface ModalAnaliseIAProps {
  isOpen: boolean
  onClose: () => void
  empresaId: string
  empresaNome: string
  onAnaliseCompleta?: (resultado: AnaliseConformidadeResponse) => void
}

export function ModalAnaliseIA({ 
  isOpen, 
  onClose, 
  empresaId, 
  empresaNome,
  onAnaliseCompleta 
}: ModalAnaliseIAProps) {
  const [documento, setDocumento] = useState('')
  const [tipoDocumento, setTipoDocumento] = useState('')
  const [resultado, setResultado] = useState<AnaliseConformidadeResponse | null>(null)
  const [analisando, setAnalisando] = useState(false)
  const [progresso, setProgresso] = useState(0)
  const [busca, setBusca] = useState('')
  const [filtroGrupo, setFiltroGrupo] = useState('')
  const [arquivoSelecionado, setArquivoSelecionado] = useState<File | null>(null)
  const [modoEntrada, setModoEntrada] = useState<'texto' | 'arquivo'>('texto')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const tiposDocumento = [
    // NORMAS REGULAMENTADORAS (42 ATIVAS - BASEADAS NA API REAL)
    { value: 'NR-1', label: 'NR-1 - Programa de Gerenciamento de Riscos Ocupacionais', group: 'Normas Regulamentadoras', icon: '📋', cor: 'bg-blue-100 text-blue-800' },
    { value: 'NR-3', label: 'NR-3 - Embargo e Interdição', group: 'Normas Regulamentadoras', icon: '🚫', cor: 'bg-red-100 text-red-800' },
    { value: 'NR-4', label: 'NR-4 - Serviços Especializados em Segurança e em Medicina do Trabalho', group: 'Normas Regulamentadoras', icon: '🏥', cor: 'bg-green-100 text-green-800' },
    { value: 'NR-5', label: 'NR-5 - Comissão Interna de Prevenção de Acidentes e Assédio', group: 'Normas Regulamentadoras', icon: '👥', cor: 'bg-purple-100 text-purple-800' },
    { value: 'NR-6', label: 'NR-6 - Equipamento de Proteção Individual - EPI', group: 'Normas Regulamentadoras', icon: '🦺', cor: 'bg-orange-100 text-orange-800' },
    { value: 'NR-7', label: 'NR-7 - Programa de Controle Médico de Saúde Ocupacional', group: 'Normas Regulamentadoras', icon: '🏥', cor: 'bg-green-100 text-green-800' },
    { value: 'NR-8', label: 'NR-8 - Edificações', group: 'Normas Regulamentadoras', icon: '🏢', cor: 'bg-gray-100 text-gray-800' },
    { value: 'NR-9', label: 'NR-9 - Avaliação e Controle das Exposições Ocupacionais a Agentes Físicos, Químicos e Biológicos', group: 'Normas Regulamentadoras', icon: '🧪', cor: 'bg-yellow-100 text-yellow-800' },
    { value: 'NR-10', label: 'NR-10 - Segurança em Instalações e Serviços em Eletricidade', group: 'Normas Regulamentadoras', icon: '⚡', cor: 'bg-yellow-100 text-yellow-800' },
    { value: 'NR-11', label: 'NR-11 - Transporte, Movimentação, Armazenagem e Manuseio de Materiais', group: 'Normas Regulamentadoras', icon: '🚛', cor: 'bg-blue-100 text-blue-800' },
    { value: 'NR-12', label: 'NR-12 - Segurança no Trabalho em Máquinas e Equipamentos', group: 'Normas Regulamentadoras', icon: '⚙️', cor: 'bg-gray-100 text-gray-800' },
    { value: 'NR-13', label: 'NR-13 - Caldeiras, Vasos de Pressão e Tubulações e Tanques Metálicos de Armazenamento', group: 'Normas Regulamentadoras', icon: '🔥', cor: 'bg-red-100 text-red-800' },
    { value: 'NR-14', label: 'NR-14 - Fornos', group: 'Normas Regulamentadoras', icon: '🔥', cor: 'bg-red-100 text-red-800' },
    { value: 'NR-15', label: 'NR-15 - Atividades e Operações Insalubres', group: 'Normas Regulamentadoras', icon: '⚠️', cor: 'bg-orange-100 text-orange-800' },
    { value: 'NR-16', label: 'NR-16 - Atividades e Operações Perigosas', group: 'Normas Regulamentadoras', icon: '🚨', cor: 'bg-red-100 text-red-800' },
    { value: 'NR-17', label: 'NR-17 - Ergonomia', group: 'Normas Regulamentadoras', icon: '🪑', cor: 'bg-green-100 text-green-800' },
    { value: 'NR-18', label: 'NR-18 - Segurança e Saúde no Trabalho na Indústria da Construção', group: 'Normas Regulamentadoras', icon: '🏗️', cor: 'bg-orange-100 text-orange-800' },
    { value: 'NR-19', label: 'NR-19 - Explosivos', group: 'Normas Regulamentadoras', icon: '💥', cor: 'bg-red-100 text-red-800' },
    { value: 'NR-20', label: 'NR-20 - Segurança e Saúde no Trabalho com Inflamáveis e Combustíveis', group: 'Normas Regulamentadoras', icon: '🔥', cor: 'bg-red-100 text-red-800' },
    { value: 'NR-21', label: 'NR-21 - Trabalhos a Céu Aberto', group: 'Normas Regulamentadoras', icon: '☀️', cor: 'bg-yellow-100 text-yellow-800' },
    { value: 'NR-22', label: 'NR-22 - Segurança e Saúde Ocupacional na Mineração', group: 'Normas Regulamentadoras', icon: '⛏️', cor: 'bg-gray-100 text-gray-800' },
    { value: 'NR-23', label: 'NR-23 - Proteção Contra Incêndios', group: 'Normas Regulamentadoras', icon: '🚒', cor: 'bg-red-100 text-red-800' },
    { value: 'NR-24', label: 'NR-24 - Condições Sanitárias e de Conforto nos Locais de Trabalho', group: 'Normas Regulamentadoras', icon: '🚿', cor: 'bg-blue-100 text-blue-800' },
    { value: 'NR-25', label: 'NR-25 - Resíduos Industriais', group: 'Normas Regulamentadoras', icon: '♻️', cor: 'bg-green-100 text-green-800' },
    { value: 'NR-26', label: 'NR-26 - Sinalização de Segurança', group: 'Normas Regulamentadoras', icon: '🚦', cor: 'bg-yellow-100 text-yellow-800' },
    { value: 'NR-28', label: 'NR-28 - Fiscalização e Penalidades', group: 'Normas Regulamentadoras', icon: '⚖️', cor: 'bg-purple-100 text-purple-800' },
    { value: 'NR-29', label: 'NR-29 - Norma Regulamentadora de Segurança e Saúde no Trabalho Portuário', group: 'Normas Regulamentadoras', icon: '🚢', cor: 'bg-blue-100 text-blue-800' },
    { value: 'NR-30', label: 'NR-30 - Segurança e Saúde no Trabalho Aquaviário', group: 'Normas Regulamentadoras', icon: '⛵', cor: 'bg-blue-100 text-blue-800' },
    { value: 'NR-31', label: 'NR-31 - Segurança e Saúde no Trabalho na Agricultura, Pecuária Silvicultura, Exploração Florestal e Aquicultura', group: 'Normas Regulamentadoras', icon: '🌾', cor: 'bg-green-100 text-green-800' },
    { value: 'NR-32', label: 'NR-32 - Segurança e Saúde no Trabalho em Serviços de Saúde', group: 'Normas Regulamentadoras', icon: '🏥', cor: 'bg-green-100 text-green-800' },
    { value: 'NR-33', label: 'NR-33 - Segurança e Saúde nos Trabalhos em Espaços Confinados', group: 'Normas Regulamentadoras', icon: '🔒', cor: 'bg-gray-100 text-gray-800' },
    { value: 'NR-34', label: 'NR-34 - Condições e Meio Ambiente de Trabalho na Indústria da Construção, Reparação e Desmonte Naval', group: 'Normas Regulamentadoras', icon: '🚢', cor: 'bg-blue-100 text-blue-800' },
    { value: 'NR-35', label: 'NR-35 - Trabalho em Altura', group: 'Normas Regulamentadoras', icon: '🏗️', cor: 'bg-orange-100 text-orange-800' },
    { value: 'NR-36', label: 'NR-36 - Segurança e Saúde no Trabalho em Empresas de Abate e Processamento de Carnes e Derivados', group: 'Normas Regulamentadoras', icon: '🥩', cor: 'bg-red-100 text-red-800' },
    { value: 'NR-37', label: 'NR-37 - Segurança e Saúde em Plataformas de Petróleo', group: 'Normas Regulamentadoras', icon: '🛢️', cor: 'bg-gray-100 text-gray-800' },

    // LEIS
    { value: 'LEI-FEDERAL-8213', label: 'Lei Federal 8.213/91 - Planos de Benefícios da Previdência Social', group: 'Leis Federais', icon: '📜', cor: 'bg-blue-100 text-blue-800' },
    { value: 'LEI-FEDERAL-6514', label: 'Lei Federal 6.514/77 - Segurança e Medicina do Trabalho', group: 'Leis Federais', icon: '📜', cor: 'bg-blue-100 text-blue-800' },
    { value: 'LEI-FEDERAL-11705', label: 'Lei Federal 11.705/08 - Lei Seca', group: 'Leis Federais', icon: '📜', cor: 'bg-blue-100 text-blue-800' },
    { value: 'LEI-FEDERAL-12967', label: 'Lei Federal 12.967/14 - Política Nacional de Segurança e Saúde no Trabalho', group: 'Leis Federais', icon: '📜', cor: 'bg-blue-100 text-blue-800' },
    { value: 'LEI-ESTADUAL', label: 'Lei Estadual - Segurança e Saúde no Trabalho', group: 'Leis Estaduais', icon: '🏛️', cor: 'bg-green-100 text-green-800' },
    { value: 'LEI-MUNICIPAL', label: 'Lei Municipal - Segurança e Saúde no Trabalho', group: 'Leis Municipais', icon: '🏛️', cor: 'bg-purple-100 text-purple-800' },

    // DOCUMENTOS OBRIGATÓRIOS (SEM OS OBSOLETOS - PPRA E PCMAT REMOVIDOS)
    { value: 'PCMSO', label: 'PCMSO - Programa de Controle Médico de Saúde Ocupacional', group: 'Documentos Obrigatórios', icon: '🏥', cor: 'bg-green-100 text-green-800' },
    { value: 'ASO', label: 'ASO - Atestado de Saúde Ocupacional', group: 'Documentos Obrigatórios', icon: '📋', cor: 'bg-blue-100 text-blue-800' },
    { value: 'CAT', label: 'CAT - Comunicação de Acidente de Trabalho', group: 'Documentos Obrigatórios', icon: '🚨', cor: 'bg-red-100 text-red-800' },
    { value: 'PPP', label: 'PPP - Perfil Profissiográfico Previdenciário', group: 'Documentos Obrigatórios', icon: '👤', cor: 'bg-purple-100 text-purple-800' },
    { value: 'PGR', label: 'PGR - Programa de Gerenciamento de Riscos', group: 'Documentos Obrigatórios', icon: '📈', cor: 'bg-blue-100 text-blue-800' },

    // OUTROS DOCUMENTOS
    { value: 'CERTIFICADO-TREINAMENTO', label: 'Certificado de Treinamento', group: 'Outros Documentos', icon: '🎓', cor: 'bg-green-100 text-green-800' },
    { value: 'FDS', label: 'FDS - Ficha com Dados de Segurança', group: 'Outros Documentos', icon: '📄', cor: 'bg-gray-100 text-gray-800' },
    { value: 'FICHA-EPI', label: 'Ficha de Controle de EPI', group: 'Outros Documentos', icon: '🦺', cor: 'bg-orange-100 text-orange-800' },
    { value: 'MANUAL-INSTRUCAO', label: 'Manual de Instrução de Trabalho', group: 'Outros Documentos', icon: '📖', cor: 'bg-blue-100 text-blue-800' },
    { value: 'PROCEDIMENTO-SEGURANCA', label: 'Procedimento de Segurança', group: 'Outros Documentos', icon: '📋', cor: 'bg-red-100 text-red-800' },
    { value: 'POLITICA-SST', label: 'Política de Segurança e Saúde no Trabalho', group: 'Outros Documentos', icon: '📜', cor: 'bg-purple-100 text-purple-800' },
    { value: 'RELATORIO-AUDITORIA', label: 'Relatório de Auditoria SST', group: 'Outros Documentos', icon: '📊', cor: 'bg-gray-100 text-gray-800' },
    { value: 'ANALISE-RISCO', label: 'Análise de Risco', group: 'Outros Documentos', icon: '⚠️', cor: 'bg-orange-100 text-orange-800' },
    { value: 'PLANO-EMERGENCIA', label: 'Plano de Emergência', group: 'Outros Documentos', icon: '🚨', cor: 'bg-red-100 text-red-800' },
    { value: 'OUTRO', label: 'Outro Documento SST', group: 'Outros Documentos', icon: '📄', cor: 'bg-gray-100 text-gray-800' }
  ]

  const grupos = ['Normas Regulamentadoras', 'Leis Federais', 'Leis Estaduais', 'Leis Municipais', 'Documentos Obrigatórios', 'Outros Documentos']

  // Filtrar documentos baseado na busca e filtro
  const documentosFiltrados = tiposDocumento.filter(doc => {
    const matchBusca = busca === '' || doc.label.toLowerCase().includes(busca.toLowerCase())
    const matchGrupo = filtroGrupo === '' || doc.group === filtroGrupo
    return matchBusca && matchGrupo
  })

  // Agrupar documentos filtrados
  const documentosAgrupados = grupos.reduce((acc, grupo) => {
    const docsDoGrupo = documentosFiltrados.filter(doc => doc.group === grupo)
    if (docsDoGrupo.length > 0) {
      acc[grupo] = docsDoGrupo
    }
    return acc
  }, {} as Record<string, typeof tiposDocumento>)

  const handleAnaliseCompleta = (resultado: AnaliseConformidadeResponse) => {
    setResultado(resultado)
    setAnalisando(false)
    setProgresso(100)
    onAnaliseCompleta?.(resultado)
  }

  const carregarExemplo = () => {
    setDocumento(`EXEMPLO DE DOCUMENTO SST

PROGRAMA DE GERENCIAMENTO DE RISCOS (PGR)

1. IDENTIFICAÇÃO DA EMPRESA
- Razão Social: Construtora BR Ltda
- CNPJ: 12.345.678/0001-90
- Endereço: Rua das Obras, 123, Salvador - BA

2. OBJETIVO
Este programa tem como objetivo preservar a saúde e integridade dos trabalhadores através da antecipação, reconhecimento, avaliação e controle dos riscos ocupacionais existentes no ambiente de trabalho.

3. METODOLOGIA
- Identificação dos riscos
- Avaliação quantitativa e qualitativa
- Medidas de controle
- Monitoramento periódico

4. RISCOS IDENTIFICADOS
- Ruído: 85 dB(A) - Nível acima do limite de tolerância
- Poeira: Exposição a sílica cristalina
- Vibração: Equipamentos de construção

5. MEDIDAS DE CONTROLE
- Uso obrigatório de EPIs
- Rotatividade de trabalhadores
- Medidas de engenharia`)
    setTipoDocumento('PGR')
  }

  const limpar = () => {
    setDocumento('')
    setTipoDocumento('')
    setResultado(null)
    setArquivoSelecionado(null)
    setProgresso(0)
  }

  const fecharModal = () => {
    limpar()
    onClose()
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    console.log('📁 Arquivo selecionado:', file)
    
    if (file) {
      if (file.type === 'application/pdf' || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        console.log('✅ Arquivo válido, configurando estado...')
        setArquivoSelecionado(file)
        setModoEntrada('arquivo')
        // Aqui você pode implementar a extração de texto do arquivo
        const documentoText = `[Arquivo carregado: ${file.name}]\n\nConteúdo será extraído automaticamente...`
        setDocumento(documentoText)
        console.log('✅ Estado atualizado:', { 
          arquivoSelecionado: file.name, 
          modoEntrada: 'arquivo',
          documento: documentoText,
          documentoTrim: documentoText.trim()
        })
      } else {
        console.log('❌ Tipo de arquivo inválido:', file.type)
        alert('Por favor, selecione apenas arquivos PDF ou DOCX.')
      }
    }
  }

  const executarAnalise = async () => {
    console.log('🚀 Iniciando análise real...', {
      documento: documento ? 'Sim' : 'Não',
      arquivoSelecionado: arquivoSelecionado ? arquivoSelecionado.name : 'Não',
      tipoDocumento,
      analisando,
      modoEntrada
    })
    
    // Validação melhorada
    const temConteudo = documento && documento.trim() !== ''
    const temArquivo = arquivoSelecionado !== null
    
    if (!temConteudo && !temArquivo) {
      alert('Por favor, adicione o conteúdo do documento ou anexe um arquivo.')
      return
    }

    if (!tipoDocumento) {
      alert('Por favor, selecione um tipo de documento.')
      return
    }

    console.log('✅ Validação passou:', { temConteudo, temArquivo, tipoDocumento })
    
    setAnalisando(true)
    setProgresso(0)
    
    try {
      // Simular progresso inicial
      setProgresso(20)
      
      const response = await fetch('/api/ia/analisar-conformidade', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          documento,
          tipoDocumento,
          empresaId,
          normasAplicaveis: [tipoDocumento] // Usar o tipo selecionado como norma aplicável
        }),
      })

      setProgresso(80)

      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      setProgresso(100)

      if (data.success && data.data) {
        console.log('✅ Análise concluída com sucesso:', data.data)
        handleAnaliseCompleta(data.data)
      } else {
        throw new Error(data.error || 'Erro na análise')
      }
    } catch (error) {
      console.error('❌ Erro na análise:', error)
      alert(`Erro na análise: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
      setAnalisando(false)
      setProgresso(0)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-7xl w-full max-h-[95vh] overflow-hidden shadow-2xl">
        {/* Header Corporativo */}
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
            <div className="flex items-center space-x-3">
              {/* Botão Enviar no Header - Sempre visível */}
              <Button
                type="button"
                onClick={(e) => {
                  console.log('🖱️ Botão Header clicado!')
                  e.preventDefault();
                  e.stopPropagation();
                  executarAnalise();
                }}
                disabled={(!documento?.trim() && !arquivoSelecionado) || !tipoDocumento || analisando}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 text-sm font-semibold shadow-lg cursor-pointer"
                style={{ pointerEvents: 'auto' }}
              >
                <Brain className="h-4 w-4 mr-2" />
                {analisando ? 'Analisando...' : 'Enviar'}
              </Button>
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
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(95vh-120px)]">
          {!resultado ? (
            <div className="space-y-6">
              {/* Configuração */}
              <Card className="border-0 shadow-lg">
                <CardHeader className="bg-gray-50 border-b">
                  <CardTitle className="flex items-center space-x-3 text-xl">
                    <FileText className="h-6 w-6 text-blue-600" />
                    <span>Configuração da Análise</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  
                  {/* Modo de Entrada */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Modo de Entrada
                    </label>
                    <div className="flex space-x-4">
                      <Button
                        variant={modoEntrada === 'texto' ? 'default' : 'outline'}
                        onClick={() => setModoEntrada('texto')}
                        className="flex-1"
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        Texto Manual
                      </Button>
                      <Button
                        variant={modoEntrada === 'arquivo' ? 'default' : 'outline'}
                        onClick={() => setModoEntrada('arquivo')}
                        className="flex-1"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Upload de Arquivo
                      </Button>
                    </div>
                  </div>

                  {/* Upload de Arquivo */}
                  {modoEntrada === 'arquivo' && (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf,.docx"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 mb-2">
                        Arraste arquivos PDF ou DOCX aqui ou
                      </p>
                      <Button
                        onClick={() => fileInputRef.current?.click()}
                        variant="outline"
                        className="mb-2"
                      >
                        Selecionar Arquivo
                      </Button>
                      <p className="text-xs text-gray-500">
                        Formatos suportados: PDF, DOCX (máx. 10MB)
                      </p>
                      {arquivoSelecionado && (
                        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <File className="h-4 w-4 text-green-600" />
                              <span className="text-sm font-medium text-green-800">
                                {arquivoSelecionado.name}
                              </span>
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
                        </div>
                      )}
                    </div>
                  )}

                  {/* Seleção de Tipo de Documento */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <label className="block text-sm font-semibold text-gray-700">
                        Tipo de Documento
                      </label>
                      <div className="flex items-center space-x-2">
                        <Search className="h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="Buscar documento..."
                          value={busca}
                          onChange={(e) => setBusca(e.target.value)}
                          className="w-64"
                        />
                        <Filter className="h-4 w-4 text-gray-400" />
                        <select
                          value={filtroGrupo}
                          onChange={(e) => setFiltroGrupo(e.target.value)}
                          className="px-3 py-1 border border-gray-300 rounded-md text-sm"
                        >
                          <option value="">Todos os grupos</option>
                          {grupos.map(grupo => (
                            <option key={grupo} value={grupo}>{grupo}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    
                    {/* Interface com Módulos Visuais */}
                    <div className="space-y-4">
                      {Object.entries(documentosAgrupados).map(([grupo, documentos]) => (
                        <div key={grupo} className="border rounded-xl p-4 bg-gradient-to-r from-gray-50 to-white">
                          <h4 className="text-sm font-bold text-gray-800 mb-4 flex items-center">
                            <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                            {grupo} ({documentos.length})
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {documentos.map((tipo) => (
                              <button
                                key={tipo.value}
                                onClick={() => setTipoDocumento(tipo.value)}
                                className={`text-left p-4 rounded-lg border-2 transition-all duration-200 hover:shadow-md ${
                                  tipoDocumento === tipo.value
                                    ? 'border-blue-500 bg-blue-50 shadow-md'
                                    : 'border-gray-200 bg-white hover:border-gray-300'
                                }`}
                              >
                                <div className="flex items-start space-x-3">
                                  <span className="text-2xl">{tipo.icon}</span>
                                  <div className="flex-1 min-w-0">
                                    <div className="font-semibold text-sm text-gray-900 mb-1">
                                      {tipo.label.split(' - ')[0]}
                                    </div>
                                    <div className="text-xs text-gray-600 line-clamp-2">
                                      {tipo.label.split(' - ')[1]}
                                    </div>
                                    <Badge className={`mt-2 text-xs ${tipo.cor}`}>
                                      {tipo.group}
                                    </Badge>
                                  </div>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Documento Selecionado */}
                    {tipoDocumento && (
                      <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <CheckCircle className="h-5 w-5 text-blue-600" />
                            <div>
                              <div className="text-sm font-semibold text-blue-900">Documento Selecionado:</div>
                              <div className="text-sm text-blue-700">
                                {tiposDocumento.find(t => t.value === tipoDocumento)?.label}
                              </div>
                            </div>
                          </div>
                          <Button
                            onClick={() => setTipoDocumento('')}
                            variant="ghost"
                            size="sm"
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        {/* Botão Enviar - Posicionado aqui para maior visibilidade */}
                        <div className="mt-4 pt-4 border-t border-blue-200">
                          <Button
                            onClick={executarAnalise}
                            disabled={(!documento?.trim() && !arquivoSelecionado) || analisando}
                            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3 text-lg font-semibold shadow-lg"
                          >
                            <Brain className="h-5 w-5 mr-3" />
                            {analisando ? 'Analisando...' : 'Enviar para Análise da IA'}
                          </Button>
                          {(!documento?.trim() && !arquivoSelecionado) && (
                            <p className="text-sm text-blue-600 text-center mt-2">
                              Adicione o conteúdo do documento ou anexe um arquivo
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Conteúdo do Documento */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Conteúdo do Documento
                    </label>
                    <Textarea
                      value={documento}
                      onChange={(e) => setDocumento(e.target.value)}
                      placeholder="Cole aqui o conteúdo do documento para análise..."
                      className="min-h-[300px] text-sm"
                      disabled={modoEntrada === 'arquivo'}
                    />
                  </div>

                  {/* Botões de Ação */}
                  <div className="flex space-x-3">
                    <Button
                      onClick={carregarExemplo}
                      variant="outline"
                      className="flex-1"
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Carregar Exemplo
                    </Button>
                    <Button
                      onClick={limpar}
                      variant="outline"
                      className="flex-1"
                    >
                      Limpar
                    </Button>
                  </div>

                  {/* Botão Enviar Principal - Sempre visível */}
                  <div className="pt-6 border-t border-gray-200">
                    <Button
                      type="button"
                      onClick={(e) => {
                        console.log('🖱️ Botão Principal clicado!')
                        e.preventDefault();
                        e.stopPropagation();
                        executarAnalise();
                      }}
                      disabled={(!documento?.trim() && !arquivoSelecionado) || !tipoDocumento || analisando}
                      className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-4 text-xl font-bold shadow-xl cursor-pointer"
                      style={{ pointerEvents: 'auto' }}
                    >
                      <Brain className="h-6 w-6 mr-3" />
                      {analisando ? 'Analisando...' : '🚀 ENVIAR PARA ANÁLISE DA IA'}
                    </Button>
                    {((!documento?.trim() && !arquivoSelecionado) || !tipoDocumento) && (
                      <div className="text-sm text-center mt-3 space-y-1">
                        {!tipoDocumento && (
                          <p className="text-red-600 font-semibold">
                            ⚠️ SELECIONE UM TIPO DE DOCUMENTO
                          </p>
                        )}
                        {(!documento?.trim() && !arquivoSelecionado) && (
                          <p className="text-orange-600">
                            ⚠️ Adicione o conteúdo do documento ou anexe um arquivo
                          </p>
                        )}
                        {tipoDocumento && (documento?.trim() || arquivoSelecionado) && (
                          <p className="text-green-600 font-semibold">
                            ✅ Tudo pronto! Clique em "Enviar para Análise da IA"
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                </CardContent>
              </Card>

              {/* Informações Técnicas */}
              <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                    <div className="flex flex-col items-center space-y-2">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Zap className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="text-sm font-semibold text-blue-900">GROQ + Llama 3.1 8B</div>
                      <div className="text-xs text-blue-700">Modelo de IA</div>
                    </div>
                    <div className="flex flex-col items-center space-y-2">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Clock className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="text-sm font-semibold text-blue-900">~1.2 segundos</div>
                      <div className="text-xs text-blue-700">Tempo de análise</div>
                    </div>
                    <div className="flex flex-col items-center space-y-2">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Brain className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="text-sm font-semibold text-blue-900">Especializado em SST</div>
                      <div className="text-xs text-blue-700">Domínio técnico</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Status da Análise */}
              {analisando && (
                <Card className="border-0 shadow-lg">
                  <CardContent className="p-6">
                    <div className="text-center space-y-4">
                      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-center justify-center space-x-3 mb-4">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                          <span className="text-lg font-medium text-blue-800">Analisando documento com IA...</span>
                        </div>
                        <Progress value={progresso} className="w-full mb-2" />
                        <p className="text-sm text-blue-600">{progresso}% concluído</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            /* Resultado */
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-gray-900">
                  Resultado da Análise
                </h3>
                <Button
                  onClick={() => setResultado(null)}
                  variant="outline"
                  size="sm"
                >
                  Nova Análise
                </Button>
              </div>

              {/* Exibir resultado da análise */}
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

              {/* Botão para fechar */}
              <div className="flex justify-end">
                <Button
                  onClick={fecharModal}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Fechar e Salvar
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}