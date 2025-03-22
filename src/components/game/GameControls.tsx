import { useEffect } from 'react'
import { useGameStore } from '@/store/gameStore'
import { useSwipeable } from 'react-swipeable'

export function GameControls() {
  const { move, resetGame } = useGameStore()

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
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
        case 'Q':
          event.preventDefault()
          console.log('Moving up-left')
          move('upLeft')
          break
        case 'e':
        case 'E':
          event.preventDefault()
          console.log('Moving up-right')
          move('upRight')
          break
        case 'a':
        case 'A':
          event.preventDefault()
          console.log('Moving down-left')
          move('downLeft')
          break
        case 'd':
        case 'D':
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
    <div {...handlers} className="flex flex-col items-center space-y-4">
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="col-span-3 mb-2">
          <div className="text-sm text-muted-foreground">Game Controls</div>
        </div>
        <div className="col-span-1">
          <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg">
            Q
          </kbd>
          <div className="text-xs text-muted-foreground">Up Left</div>
        </div>
        <div className="col-span-1">
          <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg">
            E
          </kbd>
          <div className="text-xs text-muted-foreground">Up Right</div>
        </div>
        <div className="col-span-1">
          <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg">
            ←
          </kbd>
          <div className="text-xs text-muted-foreground">Left</div>
        </div>
        <div className="col-span-1">
          <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg">
            →
          </kbd>
          <div className="text-xs text-muted-foreground">Right</div>
        </div>
        <div className="col-span-1">
          <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg">
            A
          </kbd>
          <div className="text-xs text-muted-foreground">Down Left</div>
        </div>
        <div className="col-span-1">
          <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg">
            D
          </kbd>
          <div className="text-xs text-muted-foreground">Down Right</div>
        </div>
      </div>
      
      <button
        onClick={resetGame}
        className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
      >
        Reset Game
      </button>
    </div>
  )
} 