import { Suspense } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FileText, Search } from "lucide-react"
import Link from "next/link"
import { logger } from "@/utils/logger"

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
    
    // Adicionar limite maior para mostrar mais normas
    urlParams.append('limit', '50')
    
    if (params.search) {
      urlParams.append('search', params.search as string)
    }
    
    if (params.status) {
      urlParams.append('status', params.status as string)
    }
    
    if (params.page) {
      urlParams.append('page', params.page as string)
    }
    
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001'}/api/normas?${urlParams.toString()}`, {
      next: { revalidate: 60 }
    })
    
    if (!response.ok) {
      throw new Error('Falha ao carregar normas')
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
    logger.error({ error }, 'Erro ao carregar normas')
    return {
      success: false,
      data: {
        normas: [],
        total: 0,
        page: 1,
        limit: 50
      }
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
                    {norma.codigo}
                  </CardTitle>
                  <CardDescription className="text-sgn-sm text-sgn-gray-600">
                    {norma.titulo}
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
  const { data } = await getNormas(searchParams)
  const { normas, total } = data

  return (
    <div className="container mx-auto px-sgn-md py-sgn-lg">
      <div className="space-y-sgn-lg">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-sgn-3xl font-sgn-bold text-sgn-gray-900">
              Normas Regulamentadoras
            </h1>
            <p className="text-sgn-lg text-sgn-gray-600 mt-sgn-xs">
              {total} normas encontradas
            </p>
          </div>
        </div>

        {/* Filtros */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sgn-lg">Filtros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-sgn-md">
              <div className="flex-1">
                <Input
                  placeholder="Buscar por código ou título..."
                  className="w-full"
                />
              </div>
              <Button variant="outline">
                <Search className="w-sgn-sm h-sgn-sm mr-sgn-xs" />
                Buscar
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Normas */}
        <Suspense fallback={<div>Carregando normas...</div>}>
          <NormasList normas={normas} />
        </Suspense>
      </div>
    </div>
  )
}
