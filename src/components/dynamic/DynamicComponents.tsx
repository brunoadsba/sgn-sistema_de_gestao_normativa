'use client'

import dynamic from 'next/dynamic'
import React from 'react'
import { LoadingSpinner, CardLoading, TableLoading } from '@/components/loading/LoadingSpinner'

// 🚀 LAZY LOADING OTIMIZADO - Componentes pesados carregados sob demanda

// Componentes de conformidade (carregados apenas quando necessário)
export const DynamicKpis = dynamic(
  () => import('@/components/conformidade/Kpis').then(mod => ({ default: mod.Kpis })),
  {
    loading: () => (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <CardLoading key={i} />
        ))}
      </div>
    ),
    ssr: false // 🚀 Desabilita SSR para componentes interativos
  }
)

export const DynamicGapsTable = dynamic(
  () => import('@/components/conformidade/GapsTable').then(mod => ({ default: mod.GapsTable })),
  {
    loading: () => <TableLoading rows={5} columns={4} />,
    ssr: false
  }
)

export const DynamicJobsList = dynamic(
  () => import('@/components/conformidade/JobsList').then(mod => ({ default: mod.JobsList })),
  {
    loading: () => (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <CardLoading key={i} />
        ))}
      </div>
    ),
    ssr: false
  }
)

// Toast system (carregado sob demanda)
export const DynamicToaster = dynamic(
  () => import('@/components/ui/toaster').then(mod => ({ default: mod.Toaster })),
  {
    loading: () => null,
    ssr: false
  }
)

// 🚀 HOC PARA LAZY LOADING CONDICIONAL
interface LazyWrapperProps {
  condition: boolean
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function LazyWrapper({ condition, children, fallback }: LazyWrapperProps) {
  if (!condition) {
    return <>{fallback || <LoadingSpinner />}</>
  }
  
  return <>{children}</>
}

// 🚀 HOOK PARA LAZY LOADING INTELIGENTE
export function useLazyLoading(threshold = 0.1) {
  const [isVisible, setIsVisible] = React.useState(false)
  const ref = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [threshold])

  return { ref, isVisible }
}

// 🚀 COMPONENTE DE LOADING PARA PÁGINAS
export const PageLoadingComponent = () => (
  <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
    <LoadingSpinner size="lg" />
    <div className="text-center space-y-2">
      <h3 className="text-lg font-medium">Carregando...</h3>
      <p className="text-sm text-muted-foreground max-w-sm">
        Preparando interface otimizada
      </p>
    </div>
  </div>
)

// 🚀 SKELETON PARA LISTAS
export const ListLoadingSkeleton = ({ items = 5 }: { items?: number }) => (
  <div className="space-y-3">
    {Array.from({ length: items }).map((_, i) => (
      <CardLoading key={i} />
    ))}
  </div>
)

// 🚀 COMPONENTE PRINCIPAL
export function DynamicComponents() {
  return null
}
