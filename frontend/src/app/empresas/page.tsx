import { Suspense } from 'react'
import { unstable_cache } from 'next/cache'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Search, Building2, Calendar, FileText } from 'lucide-react'
import Link from 'next/link'

// Cache para buscar empresas
const getEmpresas = unstable_cache(
  async (page: number, limit: number, search: string) => {
    let query = supabase
      .from('empresas')
      .select('*', { count: 'exact' })
    
    if (search) {
      query = query.ilike('nome', `%${search}%`)
    }
    
    const offset = (page - 1) * limit
    const { data, error, count } = await query
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    
    return { empresas: data || [], total: count || 0 }
  },
  ['empresas-list'],
  { revalidate: 300 }
)

// Cache para estatísticas
const getEmpresasStats = unstable_cache(
  async () => {
    const { count: total } = await supabase
      .from('empresas')
      .select('*', { count: 'exact', head: true })
    
    const { count: ativas } = await supabase
      .from('empresas')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'ativa')
    
    return {
      total: total || 0,
      ativas: ativas || 0,
      inativas: (total || 0) - (ativas || 0)
    }
  },
  ['empresas-stats'],
  { revalidate: 300 }
)

function EmpresasList({ empresas, total, page, limit, search }: {
  empresas: Array<{
    id: string
    nome: string
    status: string
    data_fundacao: string
    cnpj: string
    setor: string
    descricao?: string
  }>
  total: number
  page: number
  limit: number
  search: string
}) {
  const totalPages = Math.ceil(total / limit)
  
  return (
    <div className="space-y-6">
      {/* Lista de empresas */}
      <div className="grid gap-4">
        {empresas.map((empresa) => (
          <Card key={empresa.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Building2 className="h-5 w-5 text-blue-600" />
                    <h3 className="text-lg font-semibold">{empresa.nome}</h3>
                    <Badge variant={empresa.status === 'ativa' ? 'default' : 'secondary'}>
                      {empresa.status}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>Fundada: {new Date(empresa.data_fundacao).toLocaleDateString('pt-BR')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      <span>CNPJ: {empresa.cnpj}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>Setor: {empresa.setor}</span>
                    </div>
                  </div>
                  
                  {empresa.descricao && (
                    <p className="mt-3 text-sm text-muted-foreground line-clamp-2">
                      {empresa.descricao}
                    </p>
                  )}
                </div>
                
                <div className="flex flex-col gap-2">
                  <Button asChild size="sm">
                    <Link href={`/empresas/${empresa.id}`}>
                      Ver Detalhes
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/empresas/${empresa.id}/conformidade`}>
                      Conformidade
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
            Mostrando {((page - 1) * limit) + 1} a {Math.min(page * limit, total)} de {total} empresas
          </p>
          
          <div className="flex gap-2">
            {page > 1 && (
              <Button asChild variant="outline" size="sm">
                <Link href={`/empresas?page=${page - 1}${search ? `&search=${search}` : ''}`}>
                  Anterior
                </Link>
              </Button>
            )}
            
            {page < totalPages && (
              <Button asChild variant="outline" size="sm">
                <Link href={`/empresas?page=${page + 1}${search ? `&search=${search}` : ''}`}>
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

export default async function EmpresasPage({ 
  searchParams 
}: { 
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }> 
}) {
  const params = await searchParams
  const page = Number(params?.page) || 1
  const search = (params?.search as string) || ''
  
  const { empresas, total } = await getEmpresas(page, 10, search)
  const stats = await getEmpresasStats()
  
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Empresas</h1>
        <p className="text-muted-foreground">
          Gerencie e monitore as empresas cadastradas no sistema
        </p>
      </div>
      
      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Empresas</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Empresas Ativas</CardTitle>
            <Badge variant="default" className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.ativas}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Empresas Inativas</CardTitle>
            <Badge variant="secondary" className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.inativas}</div>
          </CardContent>
        </Card>
      </div>
      
      {/* Filtros */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <form method="get" className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  name="search"
                  placeholder="Buscar empresas..."
                  defaultValue={search}
                  className="pl-10"
                />
              </div>
            </div>
            <Button type="submit">
              <Search className="h-4 w-4 mr-2" />
              Buscar
            </Button>
            {search && (
              <Button type="button" variant="outline" asChild>
                <Link href="/empresas">Limpar</Link>
              </Button>
            )}
          </form>
        </CardContent>
      </Card>
      
      <Separator className="mb-6" />
      
      {/* Lista de empresas */}
      <Suspense fallback={<div>Carregando empresas...</div>}>
        <EmpresasList 
          empresas={empresas} 
          total={total} 
          page={page} 
          limit={10} 
          search={search} 
        />
      </Suspense>
    </div>
  )
}
