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

    let particles: Particle[] = []
    const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const isMobile = window.matchMedia('(max-width: 767px)').matches
    const isLowPowerProfile = isReducedMotion || isMobile
    const connectionDistance = isLowPowerProfile ? 85 : 150

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      initParticles()
    }

    const initParticles = () => {
      particles = []
      const divider = isLowPowerProfile ? 42000 : 15000
      const maxParticles = isLowPowerProfile ? 35 : 140
      const numberOfParticles = Math.min(Math.floor((canvas.width * canvas.height) / divider), maxParticles)
      for (let i = 0; i < numberOfParticles; i++) {
        particles.push(
          new Particle(canvas.width, canvas.height, isLowPowerProfile ? 0.3 : 0.5, 0.12, isLowPowerProfile ? 0.2 : 0.35)
        )
      }
    }

    const connectParticles = () => {
      for (let a = 0; a < particles.length; a++) {
        for (let b = a; b < particles.length; b++) {
          const dx = particles[a].x - particles[b].x
          const dy = particles[a].y - particles[b].y
          const distance = Math.hypot(dx, dy)

          if (distance < connectionDistance) {
            ctx.beginPath()
            ctx.strokeStyle = `rgba(99, 102, 241, ${0.18 - distance / (connectionDistance * 10)})`
            ctx!.lineWidth = 1
            ctx!.moveTo(particles[a].x, particles[a].y)
            ctx!.lineTo(particles[b].x, particles[b].y)
            ctx!.stroke()
          }
        }
      }
    }



    const animate = () => {
      // Se não estiver visível (ou explicitamente pausado), não agenda próximo frame
      if (document.hidden) {
        if (animationFrameId !== null) {
          cancelAnimationFrame(animationFrameId)
          animationFrameId = null
        }
        return
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      for (let i = 0; i < particles.length; i++) {
        particles[i].update(canvas.width, canvas.height)
        particles[i].draw(ctx)
      }

      connectParticles()
      animationFrameId = requestAnimationFrame(animate)
    }

    const onVisibilityChange = () => {
      if (!document.hidden && animationFrameId === null) {
        // Retoma animação ao voltar o foco
        animationFrameId = requestAnimationFrame(animate)
      }
    }

    window.addEventListener('resize', resize)
    document.addEventListener('visibilitychange', onVisibilityChange)
    resize()
    animate()

    return () => {
      window.removeEventListener('resize', resize)
      document.removeEventListener('visibilitychange', onVisibilityChange)
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
