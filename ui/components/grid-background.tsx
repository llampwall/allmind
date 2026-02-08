"use client"

import dynamic from 'next/dynamic'

const Grid3D = dynamic(
  () => import('@/components/thegridcn/grid-3d').then(mod => ({ default: mod.Grid3D })),
  { ssr: false }
)

export function GridBackground() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none opacity-50">
      <Grid3D enableParticles enableBeams cameraAnimation />
    </div>
  )
}
