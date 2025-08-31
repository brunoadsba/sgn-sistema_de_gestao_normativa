'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { PlusIcon, SearchIcon, BuildingIcon } from 'lucide-react'
import Link from 'next/link'
import type { Empresa, ApiResponseEmpresas } from '@/types/conformidade'

export default function EmpresasPage() {
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [total, setTotal] = useState(0)

  useEffect(() => {
    fetchEmpresas()
  }, [search])

  const fetchEmpresas = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      
      const response = await fetch(`/api/empresas?${params}`)
      const result: ApiResponseEmpresas = await response.json()
      
      if (response.ok && result.success) {
        setEmpresas(result.data)
        setTotal(result.pagination.total)
      }
    } catch (error) {
      console.error('Erro ao buscar empresas:', error)
    } finally {
      setLoading(false)
    }
  }

  const getPorteVariant = (porte: string) => {
    switch (porte) {
      case 'grande': return 'default'
      case 'medio': return 'secondary'  
      case 'pequeno': return 'outline'
      default: return 'secondary'
    }
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Gestão de Empresas</h1>
          <p className="text-muted-foreground">
            Gerencie empresas clientes e suas análises de conformidade
          </p>
        </div>
        <Button asChild>
          <Link href="/empresas/nova">
            <PlusIcon className="h-4 w-4 mr-2" />
            Nova Empresa
          </Link>
        </Button>
      </div>

      <div className="mb-6">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar empresas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-3">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-muted rounded"></div>
                  <div className="h-3 bg-muted rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          empresas.map((empresa) => (
            <Card key={empresa.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <BuildingIcon className="h-5 w-5" />
                  {empresa.nome}
                </CardTitle>
                <Badge variant={getPorteVariant(empresa.porte)}>
                  {empresa.porte}
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>CNPJ: {empresa.cnpj || 'Não informado'}</p>
                  <p>Setor: {empresa.setor || 'Não definido'}</p>
                  <p>Cadastro: {new Date(empresa.created_at).toLocaleDateString()}</p>
                </div>
                <div className="mt-4 flex gap-2">
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/empresas/${empresa.id}`}>
                      Ver Detalhes
                    </Link>
                  </Button>
                  <Button asChild size="sm">
                    <Link href={`/empresas/${empresa.id}/conformidade`}>
                      Conformidade
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {!loading && empresas.length === 0 && (
        <div className="text-center py-12">
          <BuildingIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Nenhuma empresa encontrada</h3>
          <p className="text-muted-foreground mb-4">
            {search ? 'Tente ajustar os filtros de busca' : 'Comece cadastrando sua primeira empresa'}
          </p>
          <Button asChild>
            <Link href="/empresas/nova">Cadastrar Empresa</Link>
          </Button>
        </div>
      )}

      {total > 0 && (
        <div className="mt-6 text-center text-sm text-muted-foreground">
          Total: {total} empresa{total !== 1 ? 's' : ''} cadastrada{total !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  )
}
