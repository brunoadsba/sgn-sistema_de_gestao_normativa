'use client'

import * as Sentry from '@sentry/nextjs'
import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-background">
        <main className="container mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center gap-4 px-4 text-center">
          <h1 className="text-2xl font-bold">Ocorreu um erro inesperado</h1>
          <p className="text-muted-foreground">
            O erro foi registrado. Tente novamente.
          </p>
          <button
            onClick={() => reset()}
            className="rounded-md bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
          >
            Tentar novamente
          </button>
        </main>
      </body>
    </html>
  )
}
