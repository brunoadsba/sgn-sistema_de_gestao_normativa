'use client'

import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, CheckSquare, Square } from 'lucide-react'

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

function extrairTituloCurto(codigo: string, titulo: string): string {
  if (titulo && titulo !== codigo) {
    return titulo.length > 60 ? titulo.substring(0, 57) + '...' : titulo
  }
  const parts = codigo.split(' - ')
  if (parts.length > 1) {
    const t = parts.slice(1).join(' - ')
    return t.length > 60 ? t.substring(0, 57) + '...' : t
  }
  return ''
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

  const selecionarTodas = () => onSelecaoChange(normas.map(n => n.codigo))
  const limparSelecao = () => onSelecaoChange([])

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
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Filtrar normas..."
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            className="pl-9 h-9"
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={selecionarTodas}>
            Todas
          </Button>
          <Button variant="outline" size="sm" onClick={limparSelecao}>
            Limpar
          </Button>
        </div>
      </div>

      <p className="text-sm text-gray-500">
        {selecionadas.length} de {normas.length} normas selecionadas
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-[320px] overflow-y-auto pr-1">
        {normasFiltradas.map((norma) => {
          const codigoCurto = extrairCodigoCurto(norma.codigo)
          const titulo = extrairTituloCurto(norma.codigo, norma.titulo)
          const selecionada = selecionadas.includes(norma.codigo)

          return (
            <button
              key={norma.id}
              type="button"
              onClick={() => toggleNorma(norma.codigo)}
              className={`
                flex items-start gap-2 p-2.5 rounded-lg border text-left transition-all text-sm
                ${selecionada
                  ? 'border-blue-300 bg-blue-50 text-blue-900'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700'
                }
              `}
            >
              {selecionada
                ? <CheckSquare className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                : <Square className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
              }
              <div className="min-w-0">
                <span className="font-semibold">{codigoCurto}</span>
                {titulo && (
                  <span className="text-xs block text-gray-500 truncate">{titulo}</span>
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
