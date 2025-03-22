import { useEffect, useRef } from 'react'
import { useGameStore } from '@/store/gameStore'
import { useSpring, animated } from '@react-spring/web'

const HEX_SIZE = 70 // Slightly reduced for better fit
const HEX_WIDTH = HEX_SIZE * Math.sqrt(3)
const HEX_HEIGHT = HEX_SIZE * 2
const HEX_SPACING = 8 // Increased gap between hexagons

// Convert axial coordinates to pixel coordinates
const axialToPixel = (q: number, r: number): [number, number] => {
  // Modified to create a tighter honeycomb pattern
  const x = HEX_SIZE * Math.sqrt(3) * (q + r/2)
  const y = HEX_SIZE * 3/2 * r
  return [x, y]
}

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

const drawHexagon = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => {
  ctx.beginPath()
  for (let i = 0; i < 6; i++) {
    const angle = (i * Math.PI) / 3 - Math.PI / 6 // Rotate to point upward
    const px = x + (size - HEX_SPACING) * Math.cos(angle)
    const py = y + (size - HEX_SPACING) * Math.sin(angle)
    if (i === 0) {
      ctx.moveTo(px, py)
    } else {
      ctx.lineTo(px, py)
    }
  }
  ctx.closePath()
}

export function HexGrid() {
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

    // Clear canvas
    ctx.fillStyle = '#bbada0'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Define the honeycomb layout coordinates
    const layout = [
      // Center hex
      [{ q: 0, r: 0 }],
      // Surrounding hexes (clockwise from top)
      [
        { q: 0, r: -1 },  // top
        { q: 1, r: -1 },  // top-right
        { q: 1, r: 0 },   // bottom-right
        { q: 0, r: 1 },   // bottom
        { q: -1, r: 1 },  // bottom-left
        { q: -1, r: 0 }   // top-left
      ]
    ]

    // Calculate bounds for centering
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity
    layout.forEach(ring => {
      ring.forEach(({ q, r }) => {
        const [x, y] = axialToPixel(q, r)
        minX = Math.min(minX, x)
        maxX = Math.max(maxX, x)
        minY = Math.min(minY, y)
        maxY = Math.max(maxY, y)
      })
    })

    const gridWidth = maxX - minX + HEX_WIDTH
    const gridHeight = maxY - minY + HEX_HEIGHT
    const startX = (canvas.width - gridWidth) / 2 - minX + HEX_WIDTH/2
    const startY = (canvas.height - gridHeight) / 2 - minY + HEX_HEIGHT/2

    // Draw grid
    layout.forEach((ring, ringIndex) => {
      ring.forEach((hex, hexIndex) => {
        const [x, y] = axialToPixel(hex.q, hex.r)
        const centerX = startX + x
        const centerY = startY + y

        // Get value from the grid
        const value = grid[ringIndex]?.[hexIndex] ?? null

        // Draw hexagon background
        ctx.fillStyle = getCellColor(value)
        drawHexagon(ctx, centerX, centerY, HEX_SIZE)
        ctx.fill()

        // Draw hexagon border
        ctx.strokeStyle = '#bbada0'
        ctx.lineWidth = 4
        drawHexagon(ctx, centerX, centerY, HEX_SIZE)
        ctx.stroke()

        if (value) {
          // Draw cell value
          ctx.fillStyle = getTextColor(value)
          ctx.font = `bold ${HEX_SIZE * 0.4}px Arial`
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillText(
            value.toString(),
            centerX,
            centerY
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
      width={500}
      height={500}
    />
  )
} 