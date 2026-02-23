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
      <div className="flex flex-col gap-3">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-indigo-400" />
          <Input
            placeholder="Buscar norma..."
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            className="pl-10 h-11 bg-white/50 dark:bg-gray-800/50 dark:text-gray-100 dark:placeholder:text-gray-500 border-indigo-100 dark:border-indigo-900/50 focus-visible:ring-indigo-500 rounded-xl shadow-sm text-base"
          />
        </div>
        <div className="flex flex-wrap gap-2 shrink-0 justify-between sm:justify-start">
          <Button variant="secondary" size="sm" onClick={selecionarTodas} className="bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 rounded-lg h-7 text-[10px] uppercase font-bold">
            Todas
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={limparSelecao}
            disabled={selecionadas.length === 0}
            className="text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg h-7 text-[10px] uppercase font-bold"
          >
            Limpar
          </Button>
        </div>
      </div>

      {/* Chips das normas selecionadas */}
      <div className="min-h-[40px]">
        {normasSelecionadasObjetos.length > 0 && (
          <div className="flex flex-wrap gap-2 animate-in fade-in slide-in-from-top-2">
            {normasSelecionadasObjetos.map((norma) => (
              <span
                key={norma.id}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold bg-indigo-500 text-white shadow-sm"
              >
                {extrairCodigoCurto(norma.codigo)}
                <button
                  type="button"
                  onClick={(e) => removerNorma(e, norma.codigo)}
                  className="ml-1 rounded-full hover:bg-white/20 p-0.5"
                >
                  <X className="h-3 w-3" />
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
            <AccordionTrigger className="flex w-full items-center justify-between p-3 rounded-2xl bg-white/40 dark:bg-gray-800/20 border border-indigo-100/50 dark:border-indigo-900/30 hover:no-underline group">
              <div className="flex items-center gap-2">
                <div className="bg-indigo-500/10 p-1.5 rounded-lg group-hover:bg-indigo-500/20 transition-colors">
                  <CheckSquare className="h-4 w-4 text-indigo-500" />
                </div>
                <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
                  {filtro ? 'Resultados da busca' : 'Selecionar Normas Aplicáveis'}
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
                            <span className="flex items-center gap-0.5 px-1 py-0.5 rounded bg-blue-100 dark:bg-blue-900 text-[8px] font-black uppercase text-blue-600 dark:text-blue-400">
                              <Sparkles className="h-2 w-2" /> IA
                            </span>
                          )}
                        </div>
                        {selecionada && <CheckSquare className="h-3 w-3 text-indigo-600" />}
                      </div>
                      <span className="text-[10px] leading-tight text-gray-500 line-clamp-1 group-hover:line-clamp-none transition-all">
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
