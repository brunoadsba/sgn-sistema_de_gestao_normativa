import { Suspense } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FileText, Search, ArrowRight } from "lucide-react"
import Link from "next/link"
import { getNormas as getNormasData, NormaLocal } from "@/lib/data/normas"

function NormasList({ normas }: { normas: NormaLocal[] }) {
  if (!normas || normas.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-gray-200">
        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <Search className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-1">Nenhuma norma encontrada</h3>
        <p className="text-gray-500">Tente ajustar seus filtros de busca.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {normas.map((norma) => (
        <Card key={norma.id} className="group hover:shadow-xl hover:shadow-blue-900/5 dark:hover:shadow-black/30 transition-all duration-300 border-white/20 dark:border-gray-700/50 bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl flex flex-col h-full hover:-translate-y-1 overflow-hidden">
          <div className={`h-2 w-full ${norma.status === 'ativa' ? 'bg-gradient-to-r from-blue-500 to-indigo-500' : 'bg-gradient-to-r from-red-400 to-red-500'}`}></div>
          <CardHeader className="pb-4 grow">
            <div className="flex items-start justify-between gap-4 mb-3">
              <Badge
                variant={norma.status === 'ativa' ? 'default' : 'destructive'}
                className={`px-3 py-1 font-bold tracking-wide text-xs shadow-sm ${
                  norma.status === 'ativa' 
                  ? 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200' 
                  : 'bg-red-100 text-red-800 border-red-200 hover:bg-red-200'
                }`}
              >
                {norma.status === 'ativa' ? 'ATIVA' : 'REVOGADA'}
              </Badge>
              <div className="p-2 bg-gray-50 rounded-lg group-hover:bg-blue-50 transition-colors">
                <FileText className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
              </div>
            </div>
            <CardTitle className="text-2xl font-black text-gray-900 dark:text-gray-100 tracking-tight mb-2 group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors">
              {norma.codigo}
            </CardTitle>
            <CardDescription className="text-base text-gray-600 dark:text-gray-400 font-medium leading-relaxed line-clamp-3">
              {norma.titulo}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0 pb-6 border-t border-gray-100/50 dark:border-gray-700/40 mt-auto">
            <div className="pt-4 flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">Categoria</span>
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{norma.categoria}</span>
              </div>
              <Link href={`/normas/${norma.id}`}>
                <Button className="rounded-full bg-gray-900 text-white hover:bg-blue-600 hover:scale-105 transition-all shadow-md">
                  Ver Detalhes
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default async function NormasPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams
  const busca = (params.search as string | undefined) || ''

  const todasNormas = getNormasData()
  const normas = busca
    ? todasNormas.filter(
        (n) =>
          n.codigo.toLowerCase().includes(busca.toLowerCase()) ||
          n.titulo.toLowerCase().includes(busca.toLowerCase())
      )
    : todasNormas

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="space-y-10">
        {/* Header */}
        <div className="text-center relative py-8">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[30rem] h-[10rem] bg-indigo-500/10 blur-[100px] -z-10 rounded-full"></div>
          <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-indigo-900 to-gray-900 dark:from-gray-100 dark:via-indigo-300 dark:to-gray-100 tracking-tighter mb-6">
            Normas Regulamentadoras
          </h1>
          <p className="text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed font-medium mb-8">
            Explore nossa base de dados completa e atualizada com todas as NRs de Segurança e Saúde no Trabalho.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <div className="flex items-center gap-2 px-5 py-2.5 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-full border border-gray-200 dark:border-gray-700 shadow-sm">
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
              </span>
              <span className="text-sm font-bold text-gray-700 dark:text-gray-200">{normas.length} NRs Disponíveis</span>
            </div>
          </div>
        </div>

        {/* Busca e Lista combinados para melhor fluidez */}
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="relative max-w-3xl mx-auto">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Search className="h-6 w-6 text-gray-400" />
            </div>
            <Input
              placeholder="Digite o código ou palavra-chave (ex: NR-01, EPI, CIPA)..."
              defaultValue={busca}
              className="w-full h-16 pl-14 pr-4 text-lg bg-white/80 dark:bg-gray-900/80 dark:text-gray-100 dark:placeholder:text-gray-500 backdrop-blur-md border-2 border-gray-200 dark:border-gray-700 focus-visible:border-blue-500 focus-visible:ring-blue-500/20 rounded-2xl shadow-lg shadow-gray-200/50 dark:shadow-black/20 transition-all"
            />
            {/* O ideal seria converter isso para um Client Component para busca em tempo real, 
                mas mantemos o design atual por enquanto para simplificar a refatoração */}
          </div>

          <Suspense
            fallback={
              <div className="flex flex-col items-center justify-center py-20 space-y-4">
                <div className="relative w-16 h-16">
                  <div className="absolute inset-0 border-4 border-blue-100 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
                </div>
                <p className="text-gray-500 font-medium animate-pulse">Carregando normas...</p>
              </div>
            }
          >
            <NormasList normas={normas} />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
