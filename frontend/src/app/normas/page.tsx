import { supabase } from '@/lib/supabase'
import { unstable_cache } from 'next/cache'
import Link from 'next/link'
import { Suspense } from 'react'

type SearchParams = {
  search?: string
  status?: string
  page?: string
}

type Norma = {
  id: string
  codigo: string
  titulo: string
  orgao_publicador: string
  created_at: string
}

const PAGE_SIZE = 10

// Cache global da página (invólucro estático por 60s)
export const revalidate = 60

// Cache de dados (lista) independente, com revalidação de 60s
const getNormasCached = unstable_cache(
  async (page: number, search: string, status: string) => {
    const from = (page - 1) * PAGE_SIZE
    const to = from + PAGE_SIZE - 1

    let query = supabase
      .from('normas')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to)

    if (search) {
      const term = `%${search}%`
      query = query.or(`codigo.ilike.${term},titulo.ilike.${term}`)
    }

    if (status === 'revogada') {
      query = query.ilike('titulo', '%REVOGADA%')
    } else if (status === 'ativa') {
      query = query.not('titulo', 'ilike', '%REVOGADA%')
    }

    const { data, count, error } = await query
    if (error) {
      console.error('Erro ao buscar normas:', error)
      return { data: [] as Norma[], count: 0 }
    }

    return { data: (data || []) as Norma[], count: count || 0 }
  },
  ['normas-rsc-list'],
  { revalidate: 60, tags: ['normas'] }
)

// Fallback leve para streaming (skeleton)
function ListFallback() {
  return (
    <div className="grid gap-4 mb-6">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="bg-white border rounded-lg p-6 animate-pulse">
          <div className="h-5 w-40 bg-gray-200 rounded mb-2" />
          <div className="h-4 w-3/4 bg-gray-200 rounded mb-1" />
          <div className="h-4 w-1/2 bg-gray-200 rounded" />
        </div>
      ))}
    </div>
  )
}

// Componente assíncrono (seção com dados + paginação)
async function NormasList({
  page,
  search,
  status
}: {
  page: number
  search: string
  status: string
}) {
  const { data: normas, count } = await getNormasCached(page, search, status)
  const totalPages = Math.max(1, Math.ceil(count / PAGE_SIZE))

  const urlFor = (params: Record<string, string | number | undefined>) => {
    const sp = new URLSearchParams()
    if (params.search ?? search) sp.set('search', String(params.search ?? search))
    if (params.status ?? status) sp.set('status', String(params.status ?? status))
    sp.set('page', String(params.page ?? page))
    return `/normas?${sp.toString()}`
  }

  return (
    <>
      <div className="grid gap-4 mb-6">
        {normas.map((norma) => (
          <div key={norma.id} className="bg-white border rounded-lg p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{norma.codigo}</h3>
                <p className="text-muted-foreground mt-1">{norma.titulo}</p>
                <div className="flex items-center gap-2 mt-3 text-sm">
                  <span className="px-2 py-1 rounded bg-secondary">{norma.orgao_publicador}</span>
                  {norma.titulo.includes('REVOGADA') ? (
                    <span className="px-2 py-1 rounded bg-red-600 text-white">Revogada</span>
                  ) : (
                    <span className="px-2 py-1 rounded bg-green-600 text-white">Ativa</span>
                  )}
                </div>
              </div>
              <Link
                href={`/normas/${norma.id}`}
                className="border rounded px-3 py-2 text-sm hover:bg-gray-50"
              >
                Ver Detalhes
              </Link>
            </div>
          </div>
        ))}

        {normas.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            Nenhuma norma encontrada.
          </div>
        )}
      </div>

      {/* Paginação */}
      <div className="flex items-center justify-between">
        <Link
          href={urlFor({ page: Math.max(1, page - 1) })}
          className={`border rounded px-3 py-2 ${page === 1 ? 'pointer-events-none opacity-50' : ''}`}
        >
          Anterior
        </Link>
        <span className="text-sm text-muted-foreground">
          Página {page} de {totalPages}
        </span>
        <Link
          href={urlFor({ page: Math.min(totalPages, page + 1) })}
          className={`border rounded px-3 py-2 ${page === totalPages ? 'pointer-events-none opacity-50' : ''}`}
        >
          Próxima
        </Link>
      </div>
    </>
  )
}

export default async function NormasPage({
  searchParams
}: {
  searchParams?: SearchParams
}) {
  const page = Math.max(1, Number(searchParams?.page || 1))
  const search = (searchParams?.search || '').trim()
  const status = (searchParams?.status || '').trim()

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Normas Regulamentadoras</h1>
          <p className="text-muted-foreground mt-2">Explore e pesquise todas as normas disponíveis</p>
        </div>

        {/* Filtros sem JS (form GET) – fora do Suspense para PPR */}
        <form method="get" className="mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
              <input
                type="text"
                name="search"
                defaultValue={search}
                  placeholder="Buscar por código ou título..."
                className="w-full rounded-md border px-3 py-2"
                />
              </div>
              <div className="flex gap-2">
              <input type="hidden" name="page" value="1" />
              <button
                type="submit"
                name="status"
                value={status === 'ativa' ? '' : 'ativa'}
                className={`px-3 py-2 rounded-md border ${status === 'ativa' ? 'bg-primary text-white' : ''}`}
                >
                  Ativas
              </button>
              <button
                type="submit"
                name="status"
                value={status === 'revogada' ? '' : 'revogada'}
                className={`px-3 py-2 rounded-md border ${status === 'revogada' ? 'bg-primary text-white' : ''}`}
              >
                Revogadas
              </button>
              <button
                type="submit"
                className="px-3 py-2 rounded-md border"
              >
                Aplicar
              </button>
            </div>
          </div>
        </form>

        {/* Seção de dados com streaming (PPR) */}
        <Suspense fallback={<ListFallback />}>
          {/* A lista é renderizada e transmitida assim que os dados chegam */}
          {/* Evita bloquear o HTML inicial */}
          {/* Cache por 60s aplicado no nível de dados */}
          {/* SSR sem hidratação de JS */}
          {/* TTFB reduzido + first paint mais cedo */}
          <NormasList page={page} search={search} status={status} />
        </Suspense>
      </div>
    </div>
  )
}
