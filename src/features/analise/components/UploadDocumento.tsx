'use client'

import { useState, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Upload, FileText, X } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

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
  const { toast } = useToast()
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
      toast({ variant: 'destructive', title: 'Falha no upload', description: erro })
      return
    }
    setErroLocal(null)
    onArquivoChange(file)
  }, [validarArquivo, onArquivoChange, toast])

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
            relative rounded-xl sm:rounded-2xl border-2 border-dashed p-6 sm:p-10 text-center transition-all duration-500 overflow-hidden group
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

          <div className="relative flex flex-col items-center gap-4 sm:gap-6">
            <div className={`
                p-4 sm:p-5 rounded-xl sm:rounded-2xl transition-all duration-500 
                ${dragging
                ? 'bg-blue-600 shadow-blue-500/40 rotate-0'
                : 'bg-white/10 border border-white/10 group-hover:rotate-6 group-hover:scale-110 shadow-lg'
              }
            `}>
              <Upload className={`h-7 w-7 sm:h-8 sm:w-8 ${dragging ? 'text-white animate-bounce' : 'text-blue-400/80'}`} />
            </div>
            <div className="space-y-1.5 sm:space-y-2">
              <p className="text-base sm:text-xl font-semibold text-gray-900 dark:text-gray-100 tracking-tight">
                {dragging ? 'Solte para Iniciar' : 'Arraste o documento aqui'}
              </p>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-medium flex flex-col sm:flex-row sm:items-center sm:gap-1 sm:flex-wrap justify-center gap-0.5">
                <span>Arraste ou clique para buscar</span>
                <span className="hidden sm:inline opacity-30">•</span>
                <span className="font-mono text-[10px] sm:text-xs bg-white/10 px-2 py-0.5 rounded-full uppercase">PDF, DOCX, TXT (máx 4.5MB)</span>
              </p>
            </div>
          </div>

        </div>
      ) : (
        <div className="flex items-center justify-between gap-3 sm:gap-4 p-3 bg-gradient-to-r from-blue-500/5 to-indigo-500/5 border border-blue-500/20 rounded-xl sm:rounded-2xl animate-in fade-in zoom-in-95">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <div className="p-1.5 sm:p-2 bg-indigo-500/10 rounded-lg shrink-0">
              <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-500" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-bold text-gray-900 dark:text-gray-100 truncate" title={arquivo.name}>
                {arquivo.name}
              </p>
              <p className="text-xs font-medium text-indigo-500/70 uppercase">
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
