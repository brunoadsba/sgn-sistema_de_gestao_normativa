import { useState, useCallback, useEffect, useRef } from 'react'
import { fetchWithRetry } from '@/lib/fetch-with-retry'

export function useExtracao(arquivo: File | null, analisando: boolean) {
  const [textoExtraidoChat, setTextoExtraidoChat] = useState<string | null>(null)
  const cacheExtracaoRef = useRef<Map<string, string>>(new Map())
  const extracaoEmAndamentoRef = useRef<Map<string, Promise<string>>>(new Map())

  const gerarArquivoKey = useCallback((file: File) => {
    return `${file.name}-${file.size}-${file.lastModified}`
  }, [])

  const extrairTextoDocumento = useCallback(
    async (file: File, options?: { silencioso?: boolean }): Promise<string> => {
      const key = gerarArquivoKey(file)
      const cacheAtual = cacheExtracaoRef.current.get(key)
      if (cacheAtual) return cacheAtual

      const requisicaoAtual = extracaoEmAndamentoRef.current.get(key)
      if (requisicaoAtual) return requisicaoAtual

      const silencioso = options?.silencioso ?? false
      const requisicao = (async () => {
        const formData = new FormData()
        formData.append('file', file)

        const response = await fetchWithRetry('/api/extrair-texto', {
          method: 'POST',
          body: formData,
        }, { retries: silencioso ? 1 : 2, timeoutMs: silencioso ? 30_000 : 120_000 })

        if (!response.ok) {
          if (response.status === 413) {
            throw new Error('O arquivo excede o limite de 4.5MB permitido pelo ambiente em nuvem (Vercel). Para documentos maiores, utilize a plataforma via Docker Local ou divida o arquivo.')
          }
          const err = await response.json().catch(() => ({}))
          throw new Error(err.error || `Erro ${response.status} ao extrair texto`)
        }

        const payload = await response.json()
        const texto = payload?.data?.texto
        if (typeof texto !== 'string' || texto.length === 0) {
          throw new Error('Resposta invalida ao extrair texto do documento')
        }

        cacheExtracaoRef.current.set(key, texto)
        setTextoExtraidoChat(texto)
        return texto
      })()

      extracaoEmAndamentoRef.current.set(key, requisicao)

      try {
        return await requisicao
      } finally {
        extracaoEmAndamentoRef.current.delete(key)
      }
    },
    [gerarArquivoKey]
  )

  useEffect(() => {
    if (!arquivo) {
      setTextoExtraidoChat(null)
      return
    }
    const key = gerarArquivoKey(arquivo)
    const textoCache = cacheExtracaoRef.current.get(key) ?? null
    setTextoExtraidoChat(textoCache)
  }, [arquivo, gerarArquivoKey])

  useEffect(() => {
    if (!arquivo || analisando) return
    let cancelado = false

    const extrairParaChat = async () => {
      try {
        const texto = await extrairTextoDocumento(arquivo, { silencioso: true })
        if (!cancelado) setTextoExtraidoChat(texto)
      } catch (e) {
        if (cancelado) return
        const mensagem = e instanceof Error ? e.message : 'Erro desconhecido'
        if (mensagem.includes('4.5MB')) return
        console.error('Erro na extracao silenciosa para chat:', e)
      }
    }

    void extrairParaChat()
    return () => { cancelado = true }
  }, [arquivo, analisando, extrairTextoDocumento])

  const limparCache = useCallback(() => {
    cacheExtracaoRef.current.clear()
    extracaoEmAndamentoRef.current.clear()
    setTextoExtraidoChat(null)
  }, [])

  return { textoExtraidoChat, extrairTextoDocumento, gerarArquivoKey, limparCache }
}
