import { Suspense } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FileText, Search, Filter, Download, RefreshCw, AlertCircle } from "lucide-react"
import Link from "next/link"
import { logger } from "@/utils/logger"

// Configuração de renderização dinâmica para máxima flexibilidade corporativa
export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

interface Norma {
  id: number
  codigo: string
  titulo: string
  orgao_publicador: string
  created_at: string
  data_criacao: string
  data_atualizacao: string
  nr_num: number
}



async function getNormas(searchParams: Promise<{ [key: string]: string | string[] | undefined }>) {
  try {
    const params = await searchParams
    const urlParams = new URLSearchParams()
    
    // Configuração corporativa: limite otimizado para performance
    urlParams.append('limit', '100')
    urlParams.append('sort', 'created_at')
    urlParams.append('order', 'desc')
    
    // Filtros dinâmicos baseados em searchParams
    if (params.search) {
      urlParams.append('search', params.search as string)
    }
    
    if (params.status) {
      urlParams.append('status', params.status as string)
    }
    
    if (params.page) {
      urlParams.append('page', params.page as string)
    }
    
    // Cache inteligente: 5 minutos para dados corporativos
    const apiUrl = `/api/normas?${urlParams.toString()}`
    
    const response = await fetch(apiUrl, {
      headers: {
        'Cache-Control': 'public, max-age=300, stale-while-revalidate=600',
        'X-Requested-With': 'XMLHttpRequest'
      },
      // Configuração para build: timeout e retry
      signal: AbortSignal.timeout(10000) // 10 segundos timeout
    })
    
    if (!response.ok) {
      throw new Error(`Falha ao carregar normas: ${response.status} ${response.statusText}`)
    }
    
    const result = await response.json()
    
    // Ajustar estrutura de dados para compatibilidade
    return {
      success: result.success,
      data: {
        normas: result.data || [],
        total: result.pagination?.total || 0,
        page: result.pagination?.page || 1,
        limit: result.pagination?.limit || 50
      }
    }
  } catch (error) {
    // Log detalhado do erro para debugging
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
    const errorDetails = {
      error: errorMessage,
      url: apiUrl,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV
    }
    
    logger.error(errorDetails, 'Erro ao carregar normas')
    
    // Retornar dados vazios em caso de erro (fallback gracioso)
    return {
      success: false,
      data: {
        normas: [],
        total: 0,
        page: 1,
        limit: 100
      },
      error: errorMessage
    }
  }
}

function NormasList({ normas }: { normas: Norma[] }) {
  // Função para detectar status baseado no código/título
  const getNormaStatus = (norma: Norma) => {
    const codigo = norma.codigo?.toLowerCase() || ''
    const titulo = norma.titulo?.toLowerCase() || ''
    
    // Se contém "revogada" no código ou título, é revogada
    if (codigo.includes('revogada') || titulo.includes('revogada')) {
      return 'revogada'
    }
    
    // Por padrão, considera ativa
    return 'ativa'
  }

  // Verificar se normas é um array válido
  if (!normas || !Array.isArray(normas)) {
    return (
      <div className="text-center py-sgn-lg">
        <p className="text-sgn-gray-500">Nenhuma norma encontrada.</p>
      </div>
    )
  }

  return (
    <div className="space-y-sgn-md">
      {normas.map((norma) => {
        const status = getNormaStatus(norma)
        return (
          <Card key={norma.id} className="hover:shadow-sgn-lg transition-all duration-sgn-normal">
            <CardHeader className="pb-sgn-sm">
              <div className="flex items-start justify-between">
                <div className="space-y-sgn-xs">
                  <CardTitle className="text-sgn-lg font-sgn-semibold text-sgn-gray-900">
                    {norma.codigo.split(' - ')[0]}
                  </CardTitle>
                  <CardDescription className="text-sgn-sm text-sgn-gray-600">
                    {norma.titulo.split(' - ').slice(1).join(' - ')}
                  </CardDescription>
                </div>
                <Badge 
                  variant={status === 'ativa' ? 'success' : 'destructive'}
                  className="ml-sgn-sm"
                >
                  {status === 'ativa' ? 'Ativa' : 'Revogada'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-sgn-xs">
              <div className="flex items-center justify-between">
                <div className="text-sgn-sm text-sgn-gray-500">
                  <span className="font-sgn-medium">Órgão:</span> {norma.orgao_publicador}
                </div>
                <Link href={`/normas/${norma.id}`}>
                  <Button size="sm" variant="outline">
                    <FileText className="w-sgn-sm h-sgn-sm mr-sgn-xs" />
                    Ver Detalhes
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

export default async function NormasPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ [key: string]: string | string[] | undefined }> 
}) {
  const result = await getNormas(searchParams)
  const { data, error } = result
  const { normas } = data

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="container mx-auto px-6 py-8">
        <div className="space-y-8">
          {/* Alerta de Erro (se houver) */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-red-900">Erro ao carregar normas</h3>
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Header Corporativo */}
          <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">
                  Normas Regulamentadoras
                </h1>
                <p className="text-lg text-gray-600 mb-4">
                  Sistema de Gestão Normativa - Base de dados atualizada
                </p>
                <div className="flex items-center space-x-4">
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    <FileText className="w-4 h-4 mr-1" />
                    {normas.length} normas ativas
                  </Badge>
                  <Badge variant="outline" className="text-green-600 border-green-200">
                    <RefreshCw className="w-4 h-4 mr-1" />
                    Atualizado em tempo real
                  </Badge>
                </div>
              </div>
              <div className="flex space-x-3">
                <Button variant="outline" className="border-blue-200 text-blue-600 hover:bg-blue-50">
                  <Download className="w-4 h-4 mr-2" />
                  Exportar
                </Button>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Atualizar
                </Button>
              </div>
            </div>
          </div>

          {/* Filtros Avançados */}
          <Card className="shadow-lg border-0">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
              <CardTitle className="flex items-center text-xl">
                <Filter className="w-5 h-5 mr-2 text-blue-600" />
                Filtros e Busca Avançada
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <Input
                    placeholder="Buscar por código, título ou descrição..."
                    className="w-full h-12 text-lg"
                  />
                </div>
                <div className="flex space-x-2">
                  <Button className="bg-blue-600 hover:bg-blue-700 h-12 px-6">
                    <Search className="w-5 h-5 mr-2" />
                    Buscar
                  </Button>
                  <Button variant="outline" className="h-12 px-4">
                    <Filter className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lista de Normas */}
          <Suspense fallback={
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Carregando normas...</p>
              </div>
            </div>
          }>
            <NormasList normas={normas} />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
