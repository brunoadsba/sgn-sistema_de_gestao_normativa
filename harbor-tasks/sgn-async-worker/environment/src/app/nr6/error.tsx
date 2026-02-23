'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

export default function NR6Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Erro em /nr6:', error)
  }, [error])

  return (
    <div className="container mx-auto max-w-3xl px-4 py-16 text-center">
      <h2 className="text-2xl font-bold">Falha ao carregar análise NR-6</h2>
      <p className="mt-2 text-muted-foreground">
        Tente recarregar. Se o problema persistir, verifique os logs.
      </p>
      <Button className="mt-6" onClick={reset}>
        Recarregar
      </Button>
    </div>
  )
}
