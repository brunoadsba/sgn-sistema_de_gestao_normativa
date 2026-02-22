'use client'

import { useState, useEffect } from 'react'
import { AppOpeningScreen } from '@/components/loading/AppOpeningScreen'

const DEVICE_SPLASH_KEY = 'sgn.opening.seen.device'

export function SessionSplashGate({ children }: { children: React.ReactNode }) {
  const [showSplash, setShowSplash] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true)
    const hasSeen = window.localStorage.getItem(DEVICE_SPLASH_KEY) === '1'
    if (!hasSeen) {
      setShowSplash(true)
    }
  }, [])

  const handleContinue = () => {
    window.localStorage.setItem(DEVICE_SPLASH_KEY, '1')
    setShowSplash(false)
  }

  // Não renderiza nada até montar para garantir hidratação perfeita
  if (!isMounted) return null

  if (showSplash) {
    return (
      <AppOpeningScreen
        title="Sistema de Gestão Normativa"
        subtitle="Saúde e Segurança do Trabalho"
        actionLabel="Acessar Plataforma"
        onContinue={handleContinue}
      />
    )
  }

  return <>{children}</>
}
