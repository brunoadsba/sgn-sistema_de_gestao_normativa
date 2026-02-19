'use client'

import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, X, CheckSquare, Square } from 'lucide-react'

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
    <div className="space-y-3">
      {/* Busca + ações */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Filtrar por código ou nome..."
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            className="pl-9 h-9"
          />
        </div>
        <div className="flex gap-2 shrink-0">
          <Button variant="outline" size="sm" onClick={selecionarTodas}>
            Todas
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={limparSelecao}
            disabled={selecionadas.length === 0}
          >
            Limpar
          </Button>
        </div>
      </div>

      {/* Chips das normas selecionadas */}
      {normasSelecionadasObjetos.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            {selecionadas.length} selecionada{selecionadas.length !== 1 ? 's' : ''}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {normasSelecionadasObjetos.map((norma) => (
              <span
                key={norma.id}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200"
              >
                <span className="font-semibold">{extrairCodigoCurto(norma.codigo)}</span>
                <span className="text-blue-600 max-w-[140px] truncate">{norma.titulo}</span>
                <button
                  type="button"
                  onClick={(e) => removerNorma(e, norma.codigo)}
                  className="ml-0.5 rounded-full hover:bg-blue-200 p-0.5 transition-colors"
                  aria-label={`Remover ${norma.codigo}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
          <div className="border-t border-gray-100 pt-2" />
        </div>
      )}

      {/* Contador quando nada selecionado */}
      {selecionadas.length === 0 && (
        <p className="text-sm text-gray-400">
          Nenhuma norma selecionada
        </p>
      )}

      {/* Lista de normas — 2 colunas, texto completo, sem truncamento */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-[380px] overflow-y-auto pr-1">
        {normasFiltradas.map((norma) => {
          const codigoCurto = extrairCodigoCurto(norma.codigo)
          const selecionada = selecionadas.includes(norma.codigo)

          return (
            <button
              key={norma.id}
              type="button"
              onClick={() => toggleNorma(norma.codigo)}
              className={`
                flex items-start gap-2.5 p-3 rounded-lg border text-left transition-all text-sm
                ${selecionada
                  ? 'border-blue-300 bg-blue-50 text-blue-900'
                  : 'border-gray-200 hover:border-blue-200 hover:bg-gray-50 text-gray-700'
                }
              `}
            >
              {selecionada
                ? <CheckSquare className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                : <Square className="h-4 w-4 text-gray-300 mt-0.5 flex-shrink-0" />
              }
              <div className="min-w-0">
                <span className={`font-semibold text-sm ${selecionada ? 'text-blue-700' : 'text-gray-800'}`}>
                  {codigoCurto}
                </span>
                {norma.titulo && (
                  <span className={`text-xs block leading-snug mt-0.5 ${selecionada ? 'text-blue-600' : 'text-gray-500'}`}>
                    {norma.titulo}
                  </span>
                )}
              </div>
            </button>
          )
        })}
      </div>

      {normasFiltradas.length === 0 && filtro && (
        <p className="text-center text-gray-500 py-4 text-sm">
          Nenhuma norma corresponde ao filtro &ldquo;{filtro}&rdquo;
        </p>
      )}
    </div>
  )
}
