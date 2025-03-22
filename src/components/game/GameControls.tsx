import { useEffect } from 'react'
import { useGameStore } from '@/store/gameStore'
import { useSwipeable } from 'react-swipeable'

export function GameControls() {
  const { move, resetGame } = useGameStore()

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      console.log('Key pressed:', event.key)
      switch (event.key) {
        case 'ArrowUp':
          event.preventDefault()
          console.log('Moving up')
          move('up')
          break
        case 'ArrowDown':
          event.preventDefault()
          console.log('Moving down')
          move('down')
          break
        case 'ArrowLeft':
          event.preventDefault()
          console.log('Moving left')
          move('left')
          break
        case 'ArrowRight':
          event.preventDefault()
          console.log('Moving right')
          move('right')
          break
        case 'q':
          event.preventDefault()
          console.log('Moving up-left')
          move('upLeft')
          break
        case 'e':
          event.preventDefault()
          console.log('Moving up-right')
          move('upRight')
          break
        case 'z':
          event.preventDefault()
          console.log('Moving down-left')
          move('downLeft')
          break
        case 'c':
          event.preventDefault()
          console.log('Moving down-right')
          move('downRight')
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [move])

  const handlers = useSwipeable({
    onSwipedUp: () => {
      console.log('Swiped up')
      move('up')
    },
    onSwipedDown: () => {
      console.log('Swiped down')
      move('down')
    },
    onSwipedLeft: () => {
      console.log('Swiped left')
      move('left')
    },
    onSwipedRight: () => {
      console.log('Swiped right')
      move('right')
    },
    preventScrollOnSwipe: true,
    trackMouse: true
  })

  return (
    <div className="flex flex-col items-center gap-4">
      <div {...handlers} className="w-full max-w-xs">
        <button
          onClick={resetGame}
          className="w-full py-2 px-4 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          New Game
        </button>
      </div>
      <p className="text-sm text-muted-foreground">
        Use arrow keys or swipe to move tiles. Q/E/Z/C for diagonal moves.
      </p>
    </div>
  )
} 