import { Suspense } from 'react'
import { unstable_cache } from 'next/cache'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Search, FileText, Calendar, AlertTriangle } from 'lucide-react'
import Link from 'next/link'

// Cache para buscar normas
const getNormas = unstable_cache(
  async (page: number, limit: number, search: string, status: string) => {
    let query = supabase
      .from('normas')
      .select('*', { count: 'exact' })
    
    if (search) {
      query = query.or(`codigo.ilike.%${search}%,titulo.ilike.%${search}%`)
    }
    
    if (status) {
      query = query.eq('status', status)
    }
    
    const offset = (page - 1) * limit
    const { data, error, count } = await query
      .range(offset, offset + limit - 1)
      .order('codigo', { ascending: true })
    
    if (error) throw error
    
    return { normas: data || [], total: count || 0 }
  },
  ['normas-list'],
  { revalidate: 300 }
)

// Cache para estatísticas
const getNormasStats = unstable_cache(
  async () => {
    const { count: total } = await supabase
      .from('normas')
      .select('*', { count: 'exact', head: true })
    
    // Como não há coluna status, todas as normas são ativas
    // Apenas verificar se há alguma com "REVOGADA" no título
    const { count: revogadas } = await supabase
      .from('normas')
      .select('*', { count: 'exact', head: true })
      .ilike('titulo', '%REVOGADA%')
    
    // Ativas = total - revogadas
    const ativas = (total || 0) - (revogadas || 0)
    
    return {
      total: total || 0,
      ativas: ativas,
      revogadas: revogadas || 0
    }
  },
  ['normas-stats'],
  { revalidate: 300 }
)

function NormasList({ normas, total, page, limit, search, status }: {
  normas: Array<{
    id: string
    codigo: string
    titulo: string
    status: string
    data_publicacao: string
    orgao: string
    descricao?: string
  }>
  total: number
  page: number
  limit: number
  search: string
  status: string
}) {
  const totalPages = Math.ceil(total / limit)
  
  return (
    <div className="space-y-6">
      {/* Lista de normas */}
      <div className="grid gap-4">
        {normas.map((norma) => (
          <Card key={norma.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <h3 className="text-lg font-semibold">{norma.codigo} - {norma.titulo}</h3>
                    <Badge variant={norma.status === 'ativa' ? 'default' : 'secondary'}>
                      {norma.status}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>Publicada: {new Date(norma.data_publicacao).toLocaleDateString('pt-BR')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>Órgão: {norma.orgao}</span>
                    </div>
                  </div>
                  
                  {norma.descricao && (
                    <p className="mt-3 text-sm text-muted-foreground line-clamp-2">
                      {norma.descricao}
                    </p>
                  )}
                </div>
                
                <div className="flex flex-col gap-2">
                  <Button asChild size="sm">
                    <Link href={`/normas/${norma.id}`}>
                      Ver Detalhes
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Paginação */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Mostrando {((page - 1) * limit) + 1} a {Math.min(page * limit, total)} de {total} normas
          </p>
          
          <div className="flex gap-2">
            {page > 1 && (
              <Button asChild variant="outline" size="sm">
                <Link href={`/normas?page=${page - 1}${search ? `&search=${search}` : ''}${status ? `&status=${status}` : ''}`}>
                  Anterior
                </Link>
              </Button>
            )}
            
            {page < totalPages && (
              <Button asChild variant="outline" size="sm">
                <Link href={`/normas?page=${page + 1}${search ? `&search=${search}` : ''}${status ? `&status=${status}` : ''}`}>
                  Próxima
                </Link>
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default async function NormasPage({ 
  searchParams 
}: { 
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }> 
}) {
  const params = await searchParams
  const page = Math.max(1, Number(params?.page || 1))
  const search = (params?.search as string || '').trim()
  const status = (params?.status as string || '').trim()
  
  const { normas, total } = await getNormas(page, 10, search, status)
  const stats = await getNormasStats()
  
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Normas Regulamentadoras</h1>
        <p className="text-muted-foreground">
          Explore e pesquise todas as normas disponíveis
        </p>
      </div>
      
      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Normas</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Normas Ativas</CardTitle>
            <Badge variant="default" className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.ativas}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Normas Revogadas</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.revogadas}</div>
          </CardContent>
        </Card>
      </div>
      
      {/* Filtros */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <form method="get" className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    name="search"
                    placeholder="Buscar por código ou título..."
                    defaultValue={search}
                    className="pl-10"
                  />
                </div>
              </div>
              <Button type="submit">
                <Search className="h-4 w-4 mr-2" />
                Buscar
              </Button>
            </div>
            
            <div className="flex gap-2">
              <Button 
                type="submit" 
                variant={status === 'ativa' ? 'default' : 'outline'}
                name="status"
                value="ativa"
              >
                Ativas
              </Button>
              <Button 
                type="submit" 
                variant={status === 'revogada' ? 'default' : 'outline'}
                name="status"
                value="revogada"
              >
                Revogadas
              </Button>
              {search || status ? (
                <Button type="button" variant="outline" asChild>
                  <Link href="/normas">Limpar</Link>
                </Button>
              ) : null}
            </div>
          </form>
        </CardContent>
      </Card>
      
      <Separator className="mb-6" />
      
      {/* Lista de normas */}
      <Suspense fallback={<div>Carregando normas...</div>}>
        <NormasList 
          normas={normas} 
          total={total} 
          page={page} 
          limit={10} 
          search={search} 
          status={status}
        />
      </Suspense>
    </div>
  )
}
