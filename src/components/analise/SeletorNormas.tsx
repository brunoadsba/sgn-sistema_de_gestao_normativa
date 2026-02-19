'use client'

import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, X, CheckSquare } from 'lucide-react'

interface Norma {
  id: string
  codigo: string
  titulo: string
}

interface SeletorNormasProps {
  normas: Norma[]
  selecionadas: string[]
  onSelecaoChange: (codigos: string[]) => void
  carregando?: boolean
}

function extrairCodigoCurto(codigo: string): string {
  const match = codigo.match(/NR[-\s]*(\d+)/i)
  return match ? `NR-${parseInt(match[1])}` : codigo.split(' - ')[0]
}

export function SeletorNormas({ normas, selecionadas, onSelecaoChange, carregando }: SeletorNormasProps) {
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
      <div className="flex items-center justify-center py-8 text-gray-500 text-sm">
        <div className="animate-spin rounded-full h-5 w-5 border-2 border-gray-400 border-t-transparent mr-3" />
        Carregando normas regulamentadoras...
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
            className="pl-10 h-11 bg-white/50 border-indigo-100 focus-visible:ring-indigo-500 rounded-xl shadow-sm text-base"
          />
        </div>
        <div className="flex gap-2 shrink-0 justify-between sm:justify-start">
          <Button variant="secondary" size="sm" onClick={selecionarTodas} className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg h-8">
            Selecionar Todas
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={limparSelecao}
            disabled={selecionadas.length === 0}
            className="text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg h-8"
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
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium bg-gradient-to-r from-indigo-50 to-blue-50 text-indigo-800 border border-indigo-200/60 shadow-sm"
                >
                  <span className="font-bold">{extrairCodigoCurto(norma.codigo)}</span>
                  <button
                    type="button"
                    onClick={(e) => removerNorma(e, norma.codigo)}
                    className="ml-1 rounded-full hover:bg-indigo-200/50 p-1 text-indigo-500 hover:text-red-500 transition-colors"
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

      {/* Lista de normas — Scroll customizado */}
      <div className="flex-1 overflow-y-auto pr-2 -mr-2 space-y-2 
        scrollbar-thin scrollbar-thumb-indigo-200 scrollbar-track-transparent hover:scrollbar-thumb-indigo-300">
        {normasFiltradas.map((norma) => {
          const codigoCurto = extrairCodigoCurto(norma.codigo)
          const selecionada = selecionadas.includes(norma.codigo)

          return (
            <button
              key={norma.id}
              type="button"
              onClick={() => toggleNorma(norma.codigo)}
              className={`
                w-full flex items-start gap-3 p-4 rounded-xl border text-left transition-all duration-200
                ${selecionada
                  ? 'border-indigo-400 bg-indigo-50/80 text-indigo-900 shadow-sm shadow-indigo-100'
                  : 'border-gray-200/80 hover:border-indigo-300 hover:bg-indigo-50/30 text-gray-700 bg-white/50'
                }
              `}
            >
              <div className={`mt-0.5 rounded flex items-center justify-center h-5 w-5 border transition-colors
                ${selecionada ? 'bg-indigo-600 border-indigo-600' : 'border-gray-300 bg-white'}`}>
                {selecionada && <CheckSquare className="h-4 w-4 text-white" />}
              </div>
              <div className="min-w-0 flex-1">
                <span className={`font-bold text-sm block mb-1 ${selecionada ? 'text-indigo-800' : 'text-gray-900'}`}>
                  {codigoCurto}
                </span>
                {norma.titulo && (
                  <span className={`text-sm block leading-snug ${selecionada ? 'text-indigo-600 font-medium' : 'text-gray-500'}`}>
                    {norma.titulo}
                  </span>
                )}
              </div>
            </button>
          )
        })}
        {normasFiltradas.length === 0 && filtro && (
          <div className="text-center py-10">
            <Search className="h-8 w-8 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">
              Nenhuma norma encontrada para "{filtro}"
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
