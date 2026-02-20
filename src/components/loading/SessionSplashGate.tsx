'use client'

import { useEffect, useState } from 'react'
import { AppOpeningScreen } from '@/components/loading/AppOpeningScreen'

const SESSION_SPLASH_KEY = 'sgn.opening.seen'
const SPLASH_DURATION_MS = 1100

export function SessionSplashGate({ children }: { children: React.ReactNode }) {
  const [showSplash, setShowSplash] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.sessionStorage.getItem(SESSION_SPLASH_KEY) !== '1'
  })

  useEffect(() => {
    if (!showSplash) return

    const timer = window.setTimeout(() => {
      window.sessionStorage.setItem(SESSION_SPLASH_KEY, '1')
      setShowSplash(false)
    }, SPLASH_DURATION_MS)

    return () => window.clearTimeout(timer)
  }, [showSplash])

  if (showSplash) {
    return (
      <AppOpeningScreen
        title="SGN"
        subtitle="Inicializando análise normativa com segurança e desempenho."
      />
    )
  }

  return <>{children}</>
}
