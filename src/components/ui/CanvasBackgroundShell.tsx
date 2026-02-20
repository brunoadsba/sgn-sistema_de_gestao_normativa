'use client'

import dynamic from 'next/dynamic'

const CanvasBackground = dynamic(
  () => import('@/components/ui/CanvasBackground').then((mod) => mod.CanvasBackground),
  { ssr: false }
)

export function CanvasBackgroundShell() {
  return <CanvasBackground />
}
