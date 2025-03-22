import { useEffect, useRef } from 'react'
import { useGameStore } from '@/store/gameStore'
import { HexGrid } from '@/components/game/HexGrid'
import { GameControls } from '@/components/game/GameControls'
import { GameScore } from '@/components/game/GameScore'

export function Game() {
  const { initGame } = useGameStore()
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    initGame()
  }, [initGame])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
      <div className="w-full max-w-2xl space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-bold text-foreground">2048 Hex</h1>
          <GameScore />
        </div>
        
        <div ref={containerRef} className="relative aspect-square w-full bg-muted rounded-lg overflow-hidden">
          <HexGrid />
        </div>

        <GameControls />
      </div>
    </div>
  )
} 