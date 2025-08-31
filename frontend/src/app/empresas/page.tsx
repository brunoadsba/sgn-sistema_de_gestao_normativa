import React, { Suspense } from 'react'
import { supabase } from '@/lib/supabase'
import { unstable_cache } from 'next/cache'
import Link from 'next/link'

type SearchParams = {
  search?: string
  page?: string
}

type Empresa = {
  id: string
  nome: string
  porte: string | null
  cnpj: string | null
  setor: string | null
  created_at: string
}

const PAGE_SIZE = 12
export const revalidate = 60

const getEmpresasCached = unstable_cache(
  async (page: number, search: string) => {
    const from = (page - 1) * PAGE_SIZE
    const to = from + PAGE_SIZE - 1

    let query = supabase
      .from('empresas')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to)

    if (search) {
      const term = `%${search}%`
      query = query.or(`nome.ilike.${term},cnpj.ilike.${term},setor.ilike.${term}`)
    }

    const { data, count, error } = await query
    if (error) {
      console.error('Erro ao buscar empresas:', error)
      return { data: [] as Empresa[], count: 0 }
    }

    return { data: (data || []) as Empresa[], count: count || 0 }
  },
  ['empresas-rsc-list'],
  { revalidate: 60, tags: ['empresas'] }
)

function ListFallback() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="border rounded-lg p-6 animate-pulse">
          <div className="h-5 w-40 bg-gray-200 rounded mb-3" />
          <div className="space-y-2">
            <div className="h-4 w-2/3 bg-gray-200 rounded" />
            <div className="h-4 w-1/2 bg-gray-200 rounded" />
            <div className="h-4 w-1/3 bg-gray-200 rounded" />
          </div>
        </div>
      ))}
    </div>
  )
}

const porteBadge = (porte: string | null) => {
  if (!porte) return 'bg-gray-200 text-gray-700'
  if (porte === 'grande') return 'bg-gray-900 text-white'
  if (porte === 'medio') return 'bg-gray-300 text-gray-900'
  return 'bg-white text-gray-900 border'
}

async function EmpresasList({
  page,
  search
}: {
  page: number
  search: string
}) {
  const { data: empresas, count } = await getEmpresasCached(page, search)

  const urlFor = (params: Record<string, string | number | undefined>) => {
    const sp = new URLSearchParams()
    if (params.search ?? search) sp.set('search', String(params.search ?? search))
    sp.set('page', String(params.page ?? page))
    return `/empresas?${sp.toString()}`
  }

  return (
    <>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {empresas.map((empresa) => (
          <div key={empresa.id} className="hover:shadow-lg transition-shadow border rounded-lg">
            <div className="p-6">
              <div className="flex items-start justify-between">
                <h2 className="text-lg font-semibold">{empresa.nome}</h2>
                <span className={`px-2 py-1 rounded text-xs ${porteBadge(empresa.porte)}`}>
                  {empresa.porte || 'indefinido'}
                </span>
              </div>

              <div className="mt-3 space-y-1 text-sm text-muted-foreground">
                <p>CNPJ: {empresa.cnpj || 'Não informado'}</p>
                <p>Setor: {empresa.setor || 'Não definido'}</p>
                <p>Cadastro: {new Date(empresa.created_at).toLocaleDateString()}</p>
              </div>

              <div className="mt-4 flex gap-2">
                <Link
                  href={`/empresas/${empresa.id}`}
                  className="inline-flex items-center rounded-md border px-3 py-2 text-sm hover:bg-gray-50"
                >
                  Ver Detalhes
                </Link>
                <Link
                  href={`/empresas/${empresa.id}/conformidade`}
                  className="inline-flex items-center rounded-md border px-3 py-2 text-sm bg-gray-900 text-white hover:opacity-90"
                >
                  Conformidade
                </Link>
              </div>
            </div>
          </div>
        ))}

        {empresas.length === 0 && (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            Nenhuma empresa encontrada.
          </div>
        )}
      </div>

      <div className="mt-6 flex items-center justify-between">
        <Link
          href={urlFor({ page: Math.max(1, page - 1) })}
          className={`border rounded px-3 py-2 text-sm ${page === 1 ? 'pointer-events-none opacity-50' : ''}`}
        >
          Anterior
        </Link>
        <span className="text-sm text-muted-foreground">
          Página {page} — Total: {count}
        </span>
        <Link
          href={urlFor({ page: page + 1 })}
          className={`border rounded px-3 py-2 text-sm ${empresas.length < PAGE_SIZE ? 'pointer-events-none opacity-50' : ''}`}
        >
          Próxima
        </Link>
      </div>
    </>
  )
}

export default async function EmpresasPage({ searchParams }: { searchParams?: SearchParams }) {
  const page = Number(searchParams?.page) || 1
  const search = searchParams?.search || ''

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Gestão de Empresas</h1>
          <p className="text-muted-foreground">
            Gerencie empresas clientes e suas análises de conformidade
          </p>
        </div>
        <Link
          href="/empresas/nova"
          className="inline-flex items-center rounded-md border px-3 py-2 text-sm font-medium hover:bg-gray-50"
        >
          Nova Empresa
        </Link>
      </div>

      <form method="get" className="mb-6">
        <div className="relative max-w-xl">
          <input
            type="text"
            name="search"
            defaultValue={search}
            placeholder="Buscar empresas (nome, CNPJ, setor)..."
            className="w-full rounded-md border px-3 py-2 pl-10"
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔎</span>
        </div>
      </form>

      <Suspense fallback={<ListFallback />}>
        <EmpresasList page={page} search={search} />
      </Suspense>
    </div>
  )
}
