'use client'

import { useEffect, useRef } from 'react'

class Particle {
  x: number
  y: number
  size: number
  speedX: number
  speedY: number
  color: string

  constructor(
    width: number,
    height: number,
    speedFactor: number,
    alphaMin: number,
    alphaRange: number
  ) {
    this.x = Math.random() * width
    this.y = Math.random() * height
    this.size = Math.random() * 2 + 0.5
    this.speedX = (Math.random() - 0.5) * speedFactor
    this.speedY = (Math.random() - 0.5) * speedFactor
    this.color = `rgba(99, 102, 241, ${Math.random() * alphaRange + alphaMin})`
  }

  update(width: number, height: number) {
    this.x += this.speedX
    this.y += this.speedY

    if (this.x > width) this.x = 0
    else if (this.x < 0) this.x = width

    if (this.y > height) this.y = 0
    else if (this.y < 0) this.y = height
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = this.color
    ctx.beginPath()
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
    ctx.fill()
  }
}

export function CanvasBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrameId: number | null = null
    let analysisState: 'idle' | 'processing' = 'idle'

    let particles: Particle[] = []
    const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const isMobile = window.matchMedia('(max-width: 767px)').matches
    const isLowPowerProfile = isReducedMotion || isMobile

    // Configurações dinâmicas
    let currentSpeedFactor = isLowPowerProfile ? 0.3 : 0.5
    let currentConnectionDistance = isLowPowerProfile ? 85 : 150
    let currentAlphaRange = isLowPowerProfile ? 0.2 : 0.35

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      initParticles()
    }

    const initParticles = () => {
      particles = []
      const divider = isLowPowerProfile ? 42000 : 15000
      const baseMax = isLowPowerProfile ? 35 : 140
      const maxParticles = analysisState === 'processing' ? baseMax * 1.5 : baseMax

      const numberOfParticles = Math.min(Math.floor((canvas.width * canvas.height) / divider), maxParticles)
      for (let i = 0; i < numberOfParticles; i++) {
        particles.push(
          new Particle(
            canvas.width,
            canvas.height,
            currentSpeedFactor,
            0.12,
            currentAlphaRange
          )
        )
      }
    }

    const connectParticles = () => {
      const distanceLimit = analysisState === 'processing' ? currentConnectionDistance * 1.3 : currentConnectionDistance
      const alphaBase = analysisState === 'processing' ? 0.3 : 0.18

      for (let a = 0; a < particles.length; a++) {
        for (let b = a; b < particles.length; b++) {
          const dx = particles[a].x - particles[b].x
          const dy = particles[a].y - particles[b].y
          const distance = Math.hypot(dx, dy)

          if (distance < distanceLimit) {
            ctx.beginPath()
            const opacity = alphaBase - distance / (distanceLimit * 10)
            ctx.strokeStyle = `rgba(99, 102, 241, ${opacity})`
            ctx.lineWidth = analysisState === 'processing' ? 1.5 : 1
            ctx.moveTo(particles[a].x, particles[a].y)
            ctx.lineTo(particles[b].x, particles[b].y)
            ctx.stroke()
          }
        }
      }
    }

    const animate = () => {
      if (document.hidden) {
        if (animationFrameId !== null) {
          cancelAnimationFrame(animationFrameId)
          animationFrameId = null
        }
        return
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      for (let i = 0; i < particles.length; i++) {
        particles[i].speedX = (particles[i].speedX / Math.abs(particles[i].speedX || 1)) * currentSpeedFactor
        particles[i].speedY = (particles[i].speedY / Math.abs(particles[i].speedY || 1)) * currentSpeedFactor
        particles[i].update(canvas.width, canvas.height)
        particles[i].draw(ctx)
      }

      connectParticles()
      animationFrameId = requestAnimationFrame(animate)
    }

    const onVisibilityChange = () => {
      if (!document.hidden && animationFrameId === null) {
        animationFrameId = requestAnimationFrame(animate)
      }
    }

    const handleAnalysisStart = () => {
      analysisState = 'processing'
      currentSpeedFactor = isLowPowerProfile ? 0.8 : 2.0
      currentAlphaRange = 0.5
      initParticles() // Adiciona mais partículas para efeito neural
    }

    const handleAnalysisStop = () => {
      analysisState = 'idle'
      currentSpeedFactor = isLowPowerProfile ? 0.3 : 0.5
      currentAlphaRange = isLowPowerProfile ? 0.2 : 0.35
      // Reduz partículas gradualmente (reinicia)
      initParticles()
    }

    window.addEventListener('resize', resize)
    document.addEventListener('visibilitychange', onVisibilityChange)
    window.addEventListener('sgn-analysis-start' as any, handleAnalysisStart)
    window.addEventListener('sgn-analysis-stop' as any, handleAnalysisStop)

    resize()
    animate()

    return () => {
      window.removeEventListener('resize', resize)
      document.removeEventListener('visibilitychange', onVisibilityChange)
      window.removeEventListener('sgn-analysis-start' as any, handleAnalysisStart)
      window.removeEventListener('sgn-analysis-stop' as any, handleAnalysisStop)
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId)
      }
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none -z-10"
      style={{ background: 'linear-gradient(to bottom right, #0d1117, #0f1525)' }}
    />
  )
}
