'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number | null
  max?: number
  label?: string
}

export const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(function Progress(
  { value = 0, max = 100, label = 'Progresso', className, ...props }, ref
) {
  const isIndeterminate = value === null || value === undefined
  const clamped = isIndeterminate ? 0 : Math.max(0, Math.min(max, value))
  const percent = isIndeterminate ? 0 : (clamped / max) * 100

  return (
    <div
      ref={ref}
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={isIndeterminate ? undefined : Math.round(clamped)}
      aria-valuetext={isIndeterminate ? 'Indeterminado' : `${Math.round(percent)}%`}
      data-state={isIndeterminate ? 'indeterminate' : percent >= 100 ? 'complete' : 'loading'}
      className={cn('h-2 w-full overflow-hidden rounded bg-muted', className)}
      {...props}
    >
      <div
        className={cn('h-full bg-primary transition-[width] duration-300', isIndeterminate && 'animate-pulse w-1/3')}
        style={isIndeterminate ? undefined : { width: `${percent}%` }}
      />
    </div>
  )
})
