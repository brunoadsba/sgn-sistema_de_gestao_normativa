import { Suspense } from "react"
import { getNormas as getNormasData } from "@/lib/data/normas"
import { ListaNormasDinamica } from "@/features/normas/components/ListaNormasDinamica"

export default function NormasPage() {
  const todasNormas = getNormasData()

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="space-y-10">
        {/* Header */}
        <div className="text-center relative py-8">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[30rem] h-[10rem] bg-indigo-500/10 blur-[100px] -z-10 rounded-full"></div>
          <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-indigo-900 to-gray-900 dark:from-gray-100 dark:via-indigo-300 dark:to-gray-100 tracking-tighter mb-4 pb-4 leading-normal">
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
              <span className="text-sm font-bold text-gray-700 dark:text-gray-200">{todasNormas.length} NRs Disponíveis</span>
            </div>
          </div>
        </div>

        {/* Busca Dinâmica */}
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
          <ListaNormasDinamica normasIniciais={todasNormas} />
        </Suspense>
      </div>
    </div>
  )
}
