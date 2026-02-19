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
    <div>
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
            relative rounded-xl border-2 border-dashed p-10 text-center transition-all
            ${desabilitado ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            ${dragging
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
            }
          `}
        >
          <Upload className={`h-10 w-10 mx-auto mb-3 ${dragging ? 'text-blue-500' : 'text-gray-400'}`} />
          <p className="text-base font-medium text-gray-700">
            {dragging ? 'Solte o arquivo aqui' : 'Arraste o documento ou clique para selecionar'}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            PDF, DOCX ou TXT — máximo 100MB
          </p>
        </div>
      ) : (
        <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <FileText className="h-5 w-5 text-green-700" />
            </div>
            <div>
              <p className="font-medium text-green-900">{arquivo.name}</p>
              <p className="text-sm text-green-700">{formatarTamanho(arquivo.size)}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onArquivoChange(null)}
            className="text-green-600 hover:text-red-600 hover:bg-red-50"
            disabled={desabilitado}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {erroLocal && (
        <p className="text-sm text-red-600 mt-2">{erroLocal}</p>
      )}
    </div>
  )
}
