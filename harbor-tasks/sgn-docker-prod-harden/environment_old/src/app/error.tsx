'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Erro global capturado:', error)
  }, [error])

  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-background">
        <div className="container mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center gap-4 px-4 text-center">
          <h2 className="text-2xl font-bold">Falha inesperada</h2>
          <p className="text-muted-foreground">
            Ocorreu um erro não tratado na aplicação. Tente novamente.
          </p>
          <Button onClick={reset}>Tentar novamente</Button>
        </div>
      </body>
    </html>
  )
}
