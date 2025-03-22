import { useEffect, useRef } from 'react'
import { useGameStore } from '@/store/gameStore'
import { HexGrid } from '@/components/game/HexGrid'
import { GameControls } from '@/components/game/GameControls'
import { GameScore } from '@/components/game/GameScore'

export function Game() {
  const { initGame, move } = useGameStore()
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    initGame()
  }, [initGame])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowLeft':
          move('left')
          break
        case 'ArrowRight':
          move('right')
          break
        case 'q':
        case 'Q':
          move('upLeft')
          break
        case 'e':
        case 'E':
          move('upRight')
          break
        case 'a':
        case 'A':
          move('downLeft')
          break
        case 'd':
        case 'D':
          move('downRight')
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [move])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
      <div className="w-full max-w-4xl space-y-8">
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