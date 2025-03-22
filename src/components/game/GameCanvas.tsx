import { useEffect, useRef } from 'react'
import { useGameStore } from '@/store/gameStore'
import { useSpring, animated } from '@react-spring/web'

const GRID_SIZE = 4
const CELL_PADDING = 16
const CELL_BORDER_RADIUS = 8

const getCellColor = (value: number | null) => {
  if (!value) return '#cdc1b4'
  const colors: Record<number, string> = {
    2: '#eee4da',
    4: '#ede0c8',
    8: '#f2b179',
    16: '#f59563',
    32: '#f67c5f',
    64: '#f65e3b',
    128: '#edcf72',
    256: '#edcc61',
    512: '#edc850',
    1024: '#edc53f',
    2048: '#edc22e'
  }
  return colors[value] || '#edc22e'
}

const getTextColor = (value: number | null) => {
  if (!value) return '#776e65'
  return value <= 4 ? '#776e65' : '#f9f6f2'
}

export function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { grid } = useGameStore()
  const [springs] = useSpring(() => ({
    from: { scale: 0.8, opacity: 0 },
    to: { scale: 1, opacity: 1 },
    config: { tension: 300, friction: 20 }
  }))

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const cellSize = (canvas.width - CELL_PADDING * (GRID_SIZE + 1)) / GRID_SIZE

    // Clear canvas
    ctx.fillStyle = '#bbada0'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Draw grid
    grid.forEach((row, i) => {
      row.forEach((cell, j) => {
        const x = CELL_PADDING + j * (cellSize + CELL_PADDING)
        const y = CELL_PADDING + i * (cellSize + CELL_PADDING)

        // Draw cell background
        ctx.fillStyle = getCellColor(cell)
        ctx.beginPath()
        ctx.roundRect(x, y, cellSize, cellSize, CELL_BORDER_RADIUS)
        ctx.fill()

        if (cell) {
          // Draw cell value
          ctx.fillStyle = getTextColor(cell)
          ctx.font = `${cellSize * 0.5}px Arial`
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillText(
            cell.toString(),
            x + cellSize / 2,
            y + cellSize / 2
          )
        }
      })
    })
  }, [grid])

  return (
    <animated.canvas
      ref={canvasRef}
      style={{
        ...springs,
        width: '100%',
        height: '100%',
        touchAction: 'none'
      }}
      width={400}
      height={400}
    />
  )
} 