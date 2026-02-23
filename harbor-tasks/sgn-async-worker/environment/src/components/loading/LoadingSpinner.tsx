'use client'

import { cn } from '@/lib/utils'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'default' | 'muted' | 'accent'
  className?: string
  label?: string
}

// 🚀 SPINNER OTIMIZADO COM CSS TRANSFORMS (HARDWARE ACCELERATED)
export function LoadingSpinner({ 
  size = 'md', 
  variant = 'default',
  className,
  label = 'Carregando...'
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6', 
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  }

  const variantClasses = {
    default: 'border-primary',
    muted: 'border-muted-foreground', 
    accent: 'border-accent-foreground'
  }

  return (
    <div className="flex items-center justify-center space-x-2" role="status" aria-label={label}>
      <div 
        className={cn(
          // 🚀 OTIMIZAÇÃO: will-change para GPU acceleration
          'animate-spin rounded-full border-2 border-solid border-t-transparent will-change-transform',
          sizeClasses[size],
          variantClasses[variant],
          className
        )}
        style={{
          // 🚀 FORÇA HARDWARE ACCELERATION
          transform: 'translateZ(0)',
          backfaceVisibility: 'hidden',
          perspective: '1000px'
        }}
      />
      <span className="sr-only">{label}</span>
    </div>
  )
}

// 🚀 SKELETON LOADER OTIMIZADO
interface SkeletonProps {
  className?: string
  variant?: 'text' | 'rectangular' | 'circular'
  width?: string | number
  height?: string | number
  animation?: boolean
}

export function Skeleton({
  className,
  variant = 'text',
  width,
  height,
  animation = true,
  ...props
}: SkeletonProps) {
  const variantClasses = {
    text: 'rounded',
    rectangular: 'rounded-md',
    circular: 'rounded-full'
  }

  return (
    <div
      className={cn(
        'bg-muted',
        animation && 'animate-pulse',
        variantClasses[variant],
        className
      )}
      style={{ 
        width, 
        height,
        // 🚀 OTIMIZAÇÃO: Composite layer
        willChange: animation ? 'opacity' : 'auto'
      }}
      {...props}
    />
  )
}

// 🚀 LOADING STATE PARA PÁGINAS
interface PageLoadingProps {
  title?: string
  description?: string
}

export function PageLoading({ 
  title = 'Carregando página...',
  description = 'Aguarde enquanto preparamos o conteúdo'
}: PageLoadingProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
      <LoadingSpinner size="lg" />
      <div className="text-center space-y-2">
        <h3 className="text-lg font-medium">{title}</h3>
        <p className="text-sm text-muted-foreground max-w-sm">{description}</p>
      </div>
    </div>
  )
}

// 🚀 LOADING STATE PARA TABELAS
export function TableLoading({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex space-x-4">
          {Array.from({ length: columns }).map((_, j) => (
            <Skeleton 
              key={j} 
              className="h-4" 
              width={j === 0 ? '120px' : j === columns - 1 ? '80px' : '100px'} 
            />
          ))}
        </div>
      ))}
    </div>
  )
}

// 🚀 LOADING STATE PARA CARDS
export function CardLoading() {
  return (
    <div className="space-y-3 p-6 border rounded-lg">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <div className="space-y-2">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-5/6" />
      </div>
    </div>
  )
}
