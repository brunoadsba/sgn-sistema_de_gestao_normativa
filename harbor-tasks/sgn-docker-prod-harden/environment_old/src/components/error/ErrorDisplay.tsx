'use client'

import { AlertCircle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

type ErrorDisplayProps = {
  message: string
  onRetry?: () => void
  compact?: boolean
}

export function ErrorDisplay({ message, onRetry, compact = false }: ErrorDisplayProps) {
  return (
    <div
      role="alert"
      className={`flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50/90 p-4 text-red-800 shadow-sm dark:border-red-900/60 dark:bg-red-950/50 dark:text-red-300 ${
        compact ? 'text-sm' : ''
      }`}
    >
      <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-500 dark:text-red-400" />
      <div className="flex-1 space-y-2">
        <p className="font-medium">{message}</p>
        {onRetry ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onRetry}
            className="border-red-300 bg-white/70 text-red-700 hover:bg-red-100 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200 dark:hover:bg-red-900/50"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Tentar novamente
          </Button>
        ) : null}
      </div>
    </div>
  )
}
