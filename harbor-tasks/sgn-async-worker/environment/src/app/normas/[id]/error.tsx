'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

export default function NormaDetalheError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Erro em /normas/[id]:', error)
  }, [error])

  return (
    <div className="container mx-auto max-w-3xl px-4 py-16 text-center">
      <h2 className="text-2xl font-bold">Não foi possível carregar esta norma</h2>
      <p className="mt-2 text-muted-foreground">
        Tente novamente em alguns instantes.
      </p>
      <Button className="mt-6" onClick={reset}>
        Tentar novamente
      </Button>
    </div>
  )
}
