'use client'

import { useEffect, useRef } from 'react'

interface AppOpeningScreenProps {
  title: string
  subtitle: string
}

export function AppOpeningScreen({ title, subtitle }: AppOpeningScreenProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let raf = 0
    let time = 0

    const render = () => {
      const w = canvas.width
      const h = canvas.height

      ctx.clearRect(0, 0, w, h)

      // Base gradient
      const bg = ctx.createLinearGradient(0, 0, w, h)
      bg.addColorStop(0, '#050b1b')
      bg.addColorStop(0.55, '#142a67')
      bg.addColorStop(1, '#1e3a8a')
      ctx.fillStyle = bg
      ctx.fillRect(0, 0, w, h)

      // Ambient glow layers
      const glowA = ctx.createRadialGradient(w * 0.2, h * 0.2, 10, w * 0.2, h * 0.2, w * 0.65)
      glowA.addColorStop(0, 'rgba(59,130,246,0.35)')
      glowA.addColorStop(1, 'rgba(59,130,246,0)')
      ctx.fillStyle = glowA
      ctx.fillRect(0, 0, w, h)

      const glowB = ctx.createRadialGradient(w * 0.85, h * 0.8, 10, w * 0.85, h * 0.8, w * 0.5)
      glowB.addColorStop(0, 'rgba(99,102,241,0.28)')
      glowB.addColorStop(1, 'rgba(99,102,241,0)')
      ctx.fillStyle = glowB
      ctx.fillRect(0, 0, w, h)

      // Moving arcs for a premium "system boot" effect
      ctx.save()
      ctx.translate(w / 2, h * 0.42)
      ctx.rotate(time * 0.0022)
      ctx.strokeStyle = 'rgba(255,255,255,0.16)'
      ctx.lineWidth = 1.6
      ctx.beginPath()
      ctx.arc(0, 0, 115, 0.25 * Math.PI, 1.6 * Math.PI)
      ctx.stroke()
      ctx.restore()

      ctx.save()
      ctx.translate(w / 2, h * 0.42)
      ctx.rotate(-time * 0.0016)
      ctx.strokeStyle = 'rgba(147,197,253,0.26)'
      ctx.lineWidth = 1.1
      ctx.beginPath()
      ctx.arc(0, 0, 92, 0.7 * Math.PI, 1.9 * Math.PI)
      ctx.stroke()
      ctx.restore()

      time += 1
      raf = requestAnimationFrame(render)
    }

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.floor(window.innerWidth * dpr)
      canvas.height = Math.floor(window.innerHeight * dpr)
      canvas.style.width = `${window.innerWidth}px`
      canvas.style.height = `${window.innerHeight}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    resize()
    render()
    window.addEventListener('resize', resize)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <div className="relative min-h-[calc(100vh-3.5rem)] sm:min-h-[calc(100vh-4rem)] overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0" />

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.06),transparent_62%)]" />

      <div className="relative z-10 flex min-h-[calc(100vh-3.5rem)] sm:min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-6 text-center">
        <div className="mb-8 flex h-28 w-28 items-center justify-center rounded-[2rem] border border-white/30 bg-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.38)] backdrop-blur-xl">
          <span className="text-4xl font-extrabold tracking-tight text-white">SGN</span>
        </div>

        <h1 className="max-w-sm text-balance text-3xl font-semibold leading-tight text-white sm:text-4xl">
          {title}
        </h1>
        <p className="mt-3 max-w-xs text-sm leading-relaxed text-blue-100/90 sm:max-w-sm sm:text-base">
          {subtitle}
        </p>

        <div className="mt-8 h-1.5 w-44 overflow-hidden rounded-full bg-white/20">
          <div className="h-full w-1/2 animate-[pulse_1.4s_ease-in-out_infinite] rounded-full bg-gradient-to-r from-blue-300 to-indigo-200" />
        </div>
      </div>
    </div>
  )
}
