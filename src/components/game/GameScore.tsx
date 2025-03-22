import { useGameStore } from '@/store/gameStore'

export function GameScore() {
  const { score, bestScore } = useGameStore()

  return (
    <div className="flex gap-4">
      <div className="bg-muted px-4 py-2 rounded-md text-center">
        <div className="text-sm text-muted-foreground">Score</div>
        <div className="text-2xl font-bold">{score}</div>
      </div>
      <div className="bg-muted px-4 py-2 rounded-md text-center">
        <div className="text-sm text-muted-foreground">Best</div>
        <div className="text-2xl font-bold">{bestScore}</div>
      </div>
    </div>
  )
} 