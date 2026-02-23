'use client'

import { AlertCircle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

type ErrorDisplayProps = {
  message: string
  onRetry?: () => void
  compact?: boolean
  variant?: 'error' | 'info'
}

export function ErrorDisplay({ message, onRetry, compact = false, variant = 'error' }: ErrorDisplayProps) {
  const isInfo = variant === 'info'

  return (
    <div
      role="alert"
      className={`flex items-start gap-3 rounded-2xl border backdrop-blur-md transition-all duration-300 ${isInfo
          ? 'border-blue-200 bg-blue-50/80 text-blue-800 dark:border-blue-900/60 dark:bg-blue-950/40 dark:text-blue-300 shadow-blue-500/10'
          : 'border-red-200 bg-red-50/90 p-4 text-red-800 shadow-sm dark:border-red-900/60 dark:bg-red-950/50 dark:text-red-300'
        } p-4 ${compact ? 'text-sm' : ''}`}
    >
      <AlertCircle
        className={`h-5 w-5 flex-shrink-0 ${isInfo ? 'text-blue-500 dark:text-blue-400' : 'text-red-500 dark:text-red-400'
          }`}
      />
      <div className="flex-1 space-y-2">
        <p className="font-medium leading-relaxed">{message}</p>
        {onRetry && !isInfo ? (
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
