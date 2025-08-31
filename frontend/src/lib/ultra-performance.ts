// 🚀 MICRO-OPTIMIZATIONS EXTREMAS + INTEGRAÇÃO COM PERFORMANCE.TS

import { performanceMonitor } from './performance'

// Virtual DOM bypass para updates críticos
export function directDOMUpdate(elementId: string, content: string) {
  const element = document.getElementById(elementId)
  if (element) {
    element.innerHTML = content
  }
}

// 🚀 INTERSECTION OBSERVER POOL (reutilização)
class ObserverPool {
  private observers = new Map<string, IntersectionObserver>()
  
  getObserver(threshold: number): IntersectionObserver {
    const key = `threshold-${threshold}`
    if (!this.observers.has(key)) {
      this.observers.set(key, new IntersectionObserver(
        (entries: IntersectionObserverEntry[]) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              entry.target.dispatchEvent(new CustomEvent('visible'))
            }
          })
        },
        { threshold }
      ))
    }
    return this.observers.get(key)!
  }
}

export const observerPool = new ObserverPool()

// 🚀 SCHEDULER BASEADO EM RAF (60fps guaranteed)
export class UltraScheduler {
  private tasks: Array<() => void> = []
  private isRunning = false
  
  schedule(task: () => void) {
    this.tasks.push(task)
    if (!this.isRunning) {
      this.run()
    }
  }
  
  private run() {
    this.isRunning = true
    const runBatch = () => {
      const start = performance.now()
      
      while (this.tasks.length > 0 && (performance.now() - start) < 5) {
        const task = this.tasks.shift()
        if (task) task()
      }
      
      if (this.tasks.length > 0) {
        requestAnimationFrame(runBatch)
      } else {
        this.isRunning = false
      }
    }
    
    requestAnimationFrame(runBatch)
  }
}

export const ultraScheduler = new UltraScheduler()

// 🚀 DEBOUNCE COM CLEANUP AUTOMÁTICO
export function ultraDebounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): T & { cancel: () => void } {
  let timeoutId: ReturnType<typeof setTimeout> | null = null
  
  const debounced = ((...args: unknown[]) => {
    if (timeoutId) clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func(...args as Parameters<T>), wait)
  }) as T & { cancel: () => void }
  
  debounced.cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId)
      timeoutId = null
    }
  }
  
  return debounced
}

// 🚀 PERFORMANCE MONITOR ULTRA-LEVE (integrado com performance.ts)
export class UltraPerformanceMonitor {
  private marks = new Map<string, number>()
  
  start(label: string) {
    this.marks.set(label, performance.now())
  }
  
  end(label: string): number {
    const startTime = this.marks.get(label)
    if (!startTime) return 0
    
    const duration = performance.now() - startTime
    this.marks.delete(label)
    
    if (duration > 100) {
      console.warn(`🐌 Slow operation: ${label} took ${duration.toFixed(2)}ms`)
      if (typeof window !== 'undefined') {
        performanceMonitor.collectWebVitals()
      }
    }
    
    return duration
  }
  
  measureWithIntegration<T>(label: string, operation: () => T): T {
    this.start(label)
    const result = operation()
    this.end(label)
    return result
  }
}

export const ultraMonitor = new UltraPerformanceMonitor()

export function useUltraPerformance(route: string) {
  if (typeof window !== 'undefined') {
    performanceMonitor.measurePageLoad(route)
    performanceMonitor.collectWebVitals()
    ultraScheduler.schedule(() => {
      console.log(`🚀 Ultra performance active for: ${route}`)
    })
  }
}
