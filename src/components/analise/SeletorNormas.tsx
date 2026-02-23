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

  // Agrupamento por categoria
  const categoriasAgrupadas = useMemo(() => {
    const grupos: Record<string, Norma[]> = {}

    // Primeiro as sugeridas (se houver e não estiver filtrando)
    const normasSextraidas = sugeridas.length > 0 && !filtro
      ? normasFiltradas.filter(n => sugeridas.includes(n.codigo))
      : []

    if (normasSextraidas.length > 0) {
      grupos['Sugeridas pela IA'] = normasSextraidas
    }

    normasFiltradas.forEach(norma => {
      // Se já está nas sugeridas, não duplica na categoria original se estivermos no topo
      if (normasSextraidas.some(s => s.id === norma.id)) return

      const cat = norma.categoria || 'Geral'
      if (!grupos[cat]) grupos[cat] = []
      grupos[cat].push(norma)
    })

    return grupos
  }, [normasFiltradas, sugeridas, filtro])

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
          <Skeleton className="h-8 w-24 rounded-lg" />
          <Skeleton className="h-8 w-24 rounded-lg" />
        </div>
        <div className="flex-1 space-y-4 overflow-hidden">
          {[1, 2, 3].map(i => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-6 w-32 rounded" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <Skeleton className="h-16 w-full rounded-xl" />
                <Skeleton className="h-16 w-full rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (normas.length === 0) {
    return (
      <p className="text-center text-gray-500 py-6 text-sm">
        Nenhuma norma encontrada. Verifique a conexão com o banco de dados.
      </p>
    )
  }

  return (
    <div className="space-y-4 h-full flex flex-col">
      {/* Busca + ações */}
      <div className="flex flex-col gap-3">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-indigo-400" />
          <Input
            placeholder="Buscar norma por código ou nome..."
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            className="pl-10 h-11 bg-white/50 dark:bg-gray-800/50 dark:text-gray-100 dark:placeholder:text-gray-500 border-indigo-100 dark:border-indigo-900/50 focus-visible:ring-indigo-500 rounded-xl shadow-sm text-base"
          />
        </div>
        <div className="flex flex-wrap gap-2 shrink-0 justify-between sm:justify-start">
          <Button variant="secondary" size="sm" onClick={selecionarTodas} className="bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 rounded-lg h-8 text-xs sm:text-sm">
            Selecionar Todas
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={limparSelecao}
            disabled={selecionadas.length === 0}
            className="text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg h-8 text-xs sm:text-sm"
          >
            Limpar Seleção
          </Button>
        </div>
      </div>

      {/* Chips das normas selecionadas */}
      <div className="min-h-[60px]">
        {normasSelecionadasObjetos.length > 0 ? (
          <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
            <p className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
              {selecionadas.length} NRs Selecionadas
            </p>
            <div className="flex flex-wrap gap-2">
              {normasSelecionadasObjetos.map((norma) => (
                <span
                  key={norma.id}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-950/60 dark:to-blue-950/60 text-indigo-800 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-700/50 shadow-sm"
                >
                  <span className="font-bold">{extrairCodigoCurto(norma.codigo)}</span>
                  <button
                    type="button"
                    onClick={(e) => removerNorma(e, norma.codigo)}
                    className="ml-1 rounded-full hover:bg-indigo-200/50 dark:hover:bg-indigo-800/50 p-1 text-indigo-500 dark:text-indigo-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                    aria-label={`Remover ${norma.codigo}`}
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </span>
              ))}
            </div>
            <div className="border-t border-indigo-100/50 pt-2" />
          </div>
        ) : (
          <p className="text-sm text-gray-400 italic pt-2">
            Nenhuma norma selecionada. Selecione abaixo para começar.
          </p>
        )}
      </div>

      {/* Accordion Categorizado */}
      <div className="flex-1 overflow-y-auto pr-2 -mr-2 
        scrollbar-thin scrollbar-thumb-indigo-200 scrollbar-track-transparent hover:scrollbar-thumb-indigo-300">

        <Accordion
          type="multiple"
          defaultValue={sugeridas.length > 0 ? ["Sugeridas pela IA"] : []}
          className="space-y-3"
        >
          {Object.entries(categoriasAgrupadas).map(([categoria, normasDoGrupo]) => {
            const isIA = categoria === 'Sugeridas pela IA'
            const selecionadasNoGrupo = normasDoGrupo.filter(n => selecionadas.includes(n.codigo)).length

            return (
              <AccordionItem
                key={categoria}
                value={categoria}
                className="border-none bg-white/30 dark:bg-gray-800/20 rounded-2xl overflow-hidden"
              >
                <AccordionTrigger className={`
                  px-4 py-3 hover:no-underline transition-all
                  ${isIA ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}
                `}>
                  <div className="flex items-center gap-2 text-left">
                    {isIA && <Sparkles className="h-4 w-4 text-blue-500 animate-pulse" />}
                    <span className={`text-sm font-bold ${isIA ? 'text-blue-700 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'}`}>
                      {categoria}
                    </span>
                    {selecionadasNoGrupo > 0 && (
                      <span className="bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-400 text-[10px] px-1.5 py-0.5 rounded-full font-black">
                        {selecionadasNoGrupo}
                      </span>
                    )}
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-3 pb-4 pt-1">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {normasDoGrupo.map((norma) => {
                      const codigoCurto = extrairCodigoCurto(norma.codigo)
                      const selecionada = selecionadas.includes(norma.codigo)
                      const sugeridaIA = sugeridas.includes(norma.codigo)

                      return (
                        <button
                          key={norma.id}
                          type="button"
                          onClick={() => toggleNorma(norma.codigo)}
                          title={norma.titulo}
                          className={`
                            relative flex flex-col items-start p-2.5 rounded-xl border text-left transition-all duration-200
                            ${selecionada
                              ? 'border-indigo-400 dark:border-indigo-700 bg-indigo-50/80 dark:bg-indigo-950/50 text-indigo-900 dark:text-indigo-100 shadow-sm shadow-indigo-100 dark:shadow-indigo-950/20'
                              : 'border-gray-200/80 dark:border-gray-700/60 hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-indigo-50/30 dark:hover:bg-indigo-950/20 text-gray-700 dark:text-gray-300 bg-white/50 dark:bg-gray-800/30'
                            }
                            ${sugeridaIA && !selecionada && !isIA ? 'border-blue-400 dark:border-blue-800 animate-neural-pulse' : ''}
                          `}
                        >
                          <div className="flex items-start justify-between w-full mb-1">
                            <div className="flex items-center gap-1.5">
                              <span className={`font-bold text-sm leading-none ${selecionada ? 'text-indigo-800 dark:text-indigo-300' : 'text-gray-900 dark:text-gray-100'}`}>
                                {codigoCurto}
                              </span>
                              {sugeridaIA && !isIA && (
                                <span className="flex items-center gap-0.5 px-1 py-0.5 rounded bg-blue-100 dark:bg-blue-900/60 text-[8px] font-black uppercase text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                                  <Sparkles className="h-2 w-2" /> IA
                                </span>
                              )}
                            </div>
                            <div className={`shrink-0 ml-2 rounded flex items-center justify-center h-4 w-4 border transition-colors
                              ${selecionada ? 'bg-indigo-600 dark:bg-indigo-500 border-indigo-600 dark:border-indigo-500' : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'}`}>
                              {selecionada && <CheckSquare className="h-3 w-3 text-white" />}
                            </div>
                          </div>
                          {norma.titulo && (
                            <span className={`text-[11px] leading-tight block truncate w-full ${selecionada ? 'text-indigo-600 dark:text-indigo-400 font-medium' : 'text-gray-500 dark:text-gray-400'}`}>
                              {norma.titulo}
                            </span>
                          )}
                        </button>
                      )
                    })}
                  </div>
                </AccordionContent>
              </AccordionItem>
            )
          })}
        </Accordion>

        {normasFiltradas.length === 0 && filtro && (
          <div className="text-center py-10">
            <Search className="h-8 w-8 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">
              Nenhuma norma encontrada para &quot;{filtro}&quot;
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
