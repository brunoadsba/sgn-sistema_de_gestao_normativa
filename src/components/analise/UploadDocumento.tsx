'use client'

import { useState, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Upload, FileText, X } from 'lucide-react'

interface UploadDocumentoProps {
  arquivo: File | null
  onArquivoChange: (arquivo: File | null) => void
  desabilitado?: boolean
}

const TIPOS_VALIDOS = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
]
const EXTENSOES_VALIDAS = ['.pdf', '.docx', '.txt']
const TAMANHO_MAXIMO = 100 * 1024 * 1024 // 100MB

function formatarTamanho(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

export function UploadDocumento({ arquivo, onArquivoChange, desabilitado }: UploadDocumentoProps) {
  const [dragging, setDragging] = useState(false)
  const [erroLocal, setErroLocal] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validarArquivo = useCallback((file: File): string | null => {
    const nome = file.name.toLowerCase()
    const tipoValido = TIPOS_VALIDOS.includes(file.type) || EXTENSOES_VALIDAS.some(ext => nome.endsWith(ext))
    if (!tipoValido) return 'Formato não suportado. Use PDF, DOCX ou TXT.'
    if (file.size > TAMANHO_MAXIMO) return 'Arquivo muito grande. Máximo 100MB.'
    return null
  }, [])

  const handleFile = useCallback((file: File) => {
    const erro = validarArquivo(file)
    if (erro) {
      setErroLocal(erro)
      return
    }
    setErroLocal(null)
    onArquivoChange(file)
  }, [validarArquivo, onArquivoChange])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    if (desabilitado) return
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }, [handleFile, desabilitado])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    if (!desabilitado) setDragging(true)
  }, [desabilitado])

  const handleDragLeave = useCallback(() => setDragging(false), [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <div className="w-full">
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.docx,.txt"
        onChange={handleInputChange}
        className="hidden"
      />

      {!arquivo ? (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => !desabilitado && fileInputRef.current?.click()}
          className={`
            relative rounded-2xl border-2 border-dashed p-10 text-center transition-all duration-300 flex flex-col items-center justify-center min-h-[280px]
            ${desabilitado ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            ${dragging
              ? 'border-blue-500 bg-blue-50/80 scale-[1.02] shadow-inner'
              : 'border-blue-200 hover:border-blue-400 hover:bg-blue-50/30'
            }
          `}
        >
          <div className={`p-4 rounded-full mb-4 transition-colors duration-300 ${dragging ? 'bg-blue-100' : 'bg-gray-50 group-hover:bg-blue-50'}`}>
            <Upload className={`h-10 w-10 ${dragging ? 'text-blue-600 animate-bounce' : 'text-blue-400'}`} />
          </div>
          <p className="text-lg font-semibold text-gray-700 mb-1">
            {dragging ? 'Solte o arquivo agora!' : 'Arraste seu documento SST aqui'}
          </p>
          <p className="text-sm text-gray-500 mb-4">
            ou clique para buscar no seu computador
          </p>
          <div className="flex gap-2">
            <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded">PDF</span>
            <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded">DOCX</span>
            <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded">TXT</span>
          </div>
          <p className="text-xs text-gray-400 mt-4 font-medium">Máximo: 100MB</p>
        </div>
      ) : (
        <div className="flex items-center justify-between p-5 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white rounded-xl shadow-sm border border-blue-100">
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-900 truncate max-w-[200px] sm:max-w-xs" title={arquivo.name}>
                {arquivo.name}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm font-medium text-blue-700">{formatarTamanho(arquivo.size)}</span>
                <span className="w-1 h-1 rounded-full bg-blue-300"></span>
                <span className="text-xs text-gray-500 uppercase">{arquivo.name.split('.').pop()}</span>
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onArquivoChange(null)}
            className="text-gray-400 hover:text-red-600 hover:bg-red-50 h-10 w-10 rounded-full transition-colors"
            disabled={desabilitado}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      )}

      {erroLocal && (
        <p className="text-sm font-medium text-red-600 mt-3 flex items-center gap-1.5 animate-in fade-in slide-in-from-top-1">
          <X className="h-4 w-4" />
          {erroLocal}
        </p>
      )}
    </div>
  )
}
