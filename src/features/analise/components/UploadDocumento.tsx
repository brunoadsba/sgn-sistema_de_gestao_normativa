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
            relative rounded-[2rem] border-2 border-dashed p-8 sm:p-10 text-center transition-all duration-500 overflow-hidden group
            ${desabilitado ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            ${dragging
              ? 'border-blue-500 bg-blue-500/10 scale-[1.02] shadow-[0_0_30px_rgba(59,130,246,0.2)]'
              : 'border-white/20 bg-white/5 dark:bg-white/5 hover:border-blue-400/50 hover:bg-white/10 dark:hover:bg-white/10 hover:shadow-2xl shadow-xl'
            }
            backdrop-blur-xl
          `}
        >
          {/* Background Decorative Glow */}
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-blue-500/10 blur-[100px] rounded-full group-hover:bg-blue-500/20 transition-colors" />

          <div className="relative flex flex-col items-center gap-6">
            <div className={`
                p-5 rounded-2xl transition-all duration-500 
                ${dragging
                ? 'bg-blue-600 shadow-blue-500/40 rotate-0'
                : 'bg-white/10 border border-white/10 group-hover:rotate-6 group-hover:scale-110 shadow-lg'
              }
            `}>
              <Upload className={`h-8 w-8 ${dragging ? 'text-white animate-bounce' : 'text-blue-400/80'}`} />
            </div>
            <div className="space-y-2">
              <p className="text-lg sm:text-xl font-black text-gray-900 dark:text-gray-100 tracking-tight">
                {dragging ? 'Solte para Iniciar' : 'Mergulhe seu documento aqui'}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                Arraste ou clique para buscar <span className="mx-2 opacity-30">•</span> <span className="font-mono text-[10px] bg-white/10 px-2 py-0.5 rounded-full uppercase">PDF, DOCX, TXT (Máx 4.5MB em nuvem)</span>
              </p>
            </div>
          </div>
          {!dragging && (
            <div className="absolute bottom-4 left-0 right-0">
              <p className="text-[10px] text-gray-400 dark:text-gray-500 font-black uppercase tracking-widest opacity-40">
                Data Auditor Engine v4.0
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="flex items-center justify-between gap-4 p-3 bg-gradient-to-r from-blue-500/5 to-indigo-500/5 border border-blue-500/20 rounded-2xl animate-in fade-in zoom-in-95">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 bg-indigo-500/10 rounded-lg">
              <FileText className="h-5 w-5 text-indigo-500" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate max-w-[150px] sm:max-w-xs" title={arquivo.name}>
                {arquivo.name}
              </p>
              <p className="text-[10px] font-bold text-indigo-500/70 uppercase">
                {formatarTamanho(arquivo.size)}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onArquivoChange(null)}
            className="text-gray-400 hover:text-red-500 hover:bg-red-500/10 h-8 w-8 rounded-full"
            disabled={desabilitado}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {erroLocal && (
        <p className="text-xs font-bold text-red-500 mt-2 flex items-center gap-1.5 animate-in slide-in-from-top-1">
          <X className="h-3 w-3" />
          {erroLocal}
        </p>
      )}
    </div>
  )
}
