'use client'

import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, X, CheckSquare, Sparkles } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

interface Norma {
  id: string
  codigo: string
  titulo: string
  categoria: string
}

interface SeletorNormasProps {
  normas: Norma[]
  selecionadas: string[]
  onSelecaoChange: (codigos: string[]) => void
  carregando?: boolean
  sugeridas?: string[]
}

function extrairCodigoCurto(codigo: string): string {
  const match = codigo.match(/NR[-\s]*(\d+)/i)
  return match ? `NR-${parseInt(match[1])}` : codigo.split(' - ')[0]
}

export function SeletorNormas({ normas, selecionadas, onSelecaoChange, carregando, sugeridas = [] }: SeletorNormasProps) {
  const [filtro, setFiltro] = useState('')

  const normasFiltradas = useMemo(() => {
    if (!filtro) return normas
    const termo = filtro.toLowerCase()
    return normas.filter(n =>
      n.codigo.toLowerCase().includes(termo) ||
      n.titulo.toLowerCase().includes(termo)
    )
  }, [normas, filtro])

  const toggleNorma = (codigo: string) => {
    if (selecionadas.includes(codigo)) {
      onSelecaoChange(selecionadas.filter(c => c !== codigo))
    } else {
      onSelecaoChange([...selecionadas, codigo])
    }
  }

  const removerNorma = (e: React.MouseEvent, codigo: string) => {
    e.stopPropagation()
    onSelecaoChange(selecionadas.filter(c => c !== codigo))
  }

  const selecionarTodas = () => onSelecaoChange(normas.map(n => n.codigo))
  const limparSelecao = () => onSelecaoChange([])

  const normasSelecionadasObjetos = useMemo(
    () => normas.filter(n => selecionadas.includes(n.codigo)),
    [normas, selecionadas]
  )

  if (carregando) {
    return (
      <div className="space-y-4 h-full flex flex-col">
        <Skeleton className="h-11 w-full rounded-xl" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-16 rounded-lg" />
          <Skeleton className="h-8 w-16 rounded-lg" />
        </div>
        <div className="flex-1 grid grid-cols-1 gap-2 overflow-hidden">
          <Skeleton className="h-16 w-full rounded-xl" />
          <Skeleton className="h-16 w-full rounded-xl" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 h-full flex flex-col">
      {/* Busca + ações */}
      <div className="flex flex-col gap-4">
        <div className="relative w-full group">
          <div className="absolute inset-0 bg-indigo-500/5 blur-xl group-focus-within:bg-indigo-500/10 transition-colors -z-10" />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-indigo-400/70 group-focus-within:text-indigo-500 transition-colors" />
          <Input
            placeholder="Buscar Norma Regulamentadora"
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            className="h-14 bg-white/10 dark:bg-white/5 border-white/20 dark:border-white/10 focus-visible:ring-indigo-500/50 rounded-2xl shadow-xl text-base dark:text-gray-100 placeholder:text-gray-400 backdrop-blur-md transition-all pl-10"
          />
        </div>
        <div className="flex flex-wrap gap-2 shrink-0">
          <Button
            variant="secondary"
            size="sm"
            onClick={selecionarTodas}
            className="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/20 border border-indigo-500/20 rounded-xl h-8 px-4 text-xs font-semibold uppercase tracking-wide transition-all"
          >
            Todas
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={limparSelecao}
            disabled={selecionadas.length === 0}
            className="text-gray-400 hover:text-red-500 hover:bg-red-500/5 rounded-xl h-8 px-4 text-xs font-semibold uppercase tracking-wide transition-all"
          >
            Limpar
          </Button>
        </div>
      </div>

      {/* Chips das normas selecionadas */}
      <div className="min-h-[44px]">
        {normasSelecionadasObjetos.length > 0 && (
          <div className="flex flex-wrap gap-2 animate-in fade-in slide-in-from-top-2">
            {normasSelecionadasObjetos.map((norma) => (
              <span
                key={norma.id}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-br from-indigo-500 to-blue-600 text-white shadow-lg shadow-indigo-500/20 uppercase tracking-tight"
              >
                {extrairCodigoCurto(norma.codigo)}
                <button
                  type="button"
                  onClick={(e) => removerNorma(e, norma.codigo)}
                  className="rounded-full hover:bg-black/20 p-0.5 transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Accordion Único (Dropdown) que oculta a lista exaustiva */}
      <div className="flex-1 overflow-y-auto pr-2 -mr-2 scrollbar-none">
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="lista-normas" className="border-none">
            <AccordionTrigger className="flex w-full items-center justify-between p-4 rounded-2xl bg-white/5 dark:bg-white/5 border border-white/10 hover:border-indigo-500/30 hover:bg-white/10 hover:no-underline group transition-all">
              <div className="flex items-center gap-3">
                <div className="bg-indigo-500/20 p-2 rounded-xl group-hover:scale-110 transition-transform">
                  <CheckSquare className="h-5 w-5 text-indigo-400" />
                </div>
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-tight">
                  {filtro ? 'Resultados Encontrados' : 'Catálogo de Normas'}
                </span>
              </div>
            </AccordionTrigger>

            <AccordionContent className="pt-4 pb-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[400px] overflow-y-auto p-1 scrollbar-thin scrollbar-thumb-indigo-200">
                {normasFiltradas.map((norma) => {
                  const codigoCurto = extrairCodigoCurto(norma.codigo)
                  const selecionada = selecionadas.includes(norma.codigo)
                  const sugeridaIA = sugeridas.includes(norma.codigo)

                  return (
                    <button
                      key={norma.id}
                      type="button"
                      onClick={() => toggleNorma(norma.codigo)}
                      className={`
                        relative flex flex-col items-start p-2.5 rounded-xl border text-left transition-all duration-200
                        ${selecionada
                          ? 'border-indigo-400 dark:border-indigo-700 bg-indigo-50/80 dark:bg-indigo-950/50 text-indigo-900 dark:text-indigo-100 shadow-sm'
                          : 'border-gray-200/80 dark:border-gray-700/60 hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-indigo-50/30'
                        }
                        ${sugeridaIA && !selecionada ? 'border-blue-400 dark:border-blue-800 animate-neural-pulse' : ''}
                      `}
                    >
                      <div className="flex items-start justify-between w-full">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-xs">{codigoCurto}</span>
                          {sugeridaIA && (
                            <span className="flex items-center gap-0.5 px-1 py-0.5 rounded bg-blue-100 dark:bg-blue-900 text-xs font-semibold uppercase text-blue-600 dark:text-blue-400">
                              <Sparkles className="h-2 w-2" /> IA
                            </span>
                          )}
                        </div>
                        {selecionada && <CheckSquare className="h-3 w-3 text-indigo-600" />}
                      </div>
                      <span className="text-xs leading-tight text-gray-500 line-clamp-1 group-hover:line-clamp-none transition-all">
                        {norma.titulo}
                      </span>
                    </button>
                  )
                })}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  )
}
