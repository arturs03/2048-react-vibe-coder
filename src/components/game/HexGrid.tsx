import { useEffect, useRef, useState } from 'react'
import { useGameStore } from '@/store/gameStore'
import { useSpring, animated } from '@react-spring/web'

const HEX_SIZE = 45 // Base size for hexagons
const HEX_WIDTH = HEX_SIZE * Math.sqrt(3)
const HEX_HEIGHT = HEX_SIZE * 2
const HEX_SPACING = 4
const ANIMATION_DURATION = 200 // Animation duration in ms

interface AnimatedTile {
  value: number
  fromX: number
  fromY: number
  toX: number
  toY: number
  opacity: number
  scale: number
}

// Convert axial coordinates to pixel coordinates
const axialToPixel = (q: number, r: number): [number, number] => {
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
    2048: '#edc22e',
    4096: '#b885ac',
    8192: '#af6da9'
  }
  return colors[value] || '#3c3a32'
}

const getTextColor = (value: number | null) => {
  if (!value) return '#776e65'
  return value <= 4 ? '#776e65' : '#f9f6f2'
}

const getFontSize = (value: number | null) => {
  if (!value) return HEX_SIZE * 0.4
  if (value >= 1000) return HEX_SIZE * 0.3
  if (value >= 100) return HEX_SIZE * 0.35
  return HEX_SIZE * 0.4
}

const drawHexagon = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => {
  ctx.beginPath()
  for (let i = 0; i < 6; i++) {
    const angle = (i * Math.PI) / 3 - Math.PI / 6
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
  const [prevGrid, setPrevGrid] = useState<(number | null)[][]>([])
  
  const [springs] = useSpring(() => ({
    from: { scale: 0.8, opacity: 0 },
    to: { scale: 1, opacity: 1 },
    config: { tension: 300, friction: 20 }
  }))

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    // Set up high DPI canvas
    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Scale context for high DPI display
    ctx.scale(dpr, dpr)

    // Enable crisp edges
    ctx.imageSmoothingEnabled = false

    // Clear canvas
    ctx.fillStyle = '#bbada0'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Define the honeycomb layout coordinates
    const layout = [
      [{ q: 0, r: 0 }],
      [
        { q: 0, r: -1 },
        { q: 1, r: -1 },
        { q: 1, r: 0 },
        { q: 0, r: 1 },
        { q: -1, r: 1 },
        { q: -1, r: 0 }
      ],
      [
        { q: 0, r: -2 },
        { q: 1, r: -2 },
        { q: 2, r: -2 },
        { q: 2, r: -1 },
        { q: 2, r: 0 },
        { q: 1, r: 1 },
        { q: 0, r: 2 },
        { q: -1, r: 2 },
        { q: -2, r: 2 },
        { q: -2, r: 1 },
        { q: -2, r: 0 },
        { q: -1, r: -1 }
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

    const padding = HEX_SIZE * 1.5
    const gridWidth = maxX - minX + HEX_WIDTH + padding * 2
    const gridHeight = maxY - minY + HEX_HEIGHT + padding * 2
    const startX = (rect.width - gridWidth) / 2 - minX + padding
    const startY = (rect.height - gridHeight) / 2 - minY + padding

    // Track tiles that need animation
    const newAnimatedTiles: AnimatedTile[] = []

    // Draw grid
    layout.forEach((ring, ringIndex) => {
      ring.forEach((hex, hexIndex) => {
        const [x, y] = axialToPixel(hex.q, hex.r)
        const centerX = startX + x
        const centerY = startY + y

        const value = grid[ringIndex]?.[hexIndex] ?? null
        const prevValue = prevGrid[ringIndex]?.[hexIndex] ?? null

        // Handle animations
        if (value !== prevValue && value !== null) {
          if (!prevValue) {
            // New tile animation
            newAnimatedTiles.push({
              value,
              fromX: centerX,
              fromY: centerY,
              toX: centerX,
              toY: centerY,
              opacity: 0,
              scale: 0.5
            })
          } else if (value !== prevValue) {
            // Merge animation
            newAnimatedTiles.push({
              value,
              fromX: centerX,
              fromY: centerY,
              toX: centerX,
              toY: centerY,
              opacity: 1,
              scale: 1.2
            })
          }
        }

        // Draw background cell
        ctx.save()
        ctx.shadowColor = 'rgba(0, 0, 0, 0.2)'
        ctx.shadowBlur = 4
        ctx.shadowOffsetX = 0
        ctx.shadowOffsetY = 2
        ctx.fillStyle = getCellColor(value)
        drawHexagon(ctx, centerX, centerY, HEX_SIZE)
        ctx.fill()
        ctx.restore()

        // Draw border
        ctx.strokeStyle = '#bbada0'
        ctx.lineWidth = 2
        drawHexagon(ctx, centerX, centerY, HEX_SIZE)
        ctx.stroke()

        if (value) {
          // Draw value
          ctx.fillStyle = getTextColor(value)
          ctx.font = `bold ${getFontSize(value)}px Arial`
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillText(value.toString(), centerX, centerY)
        }
      })
    })

    // Update previous grid state
    setPrevGrid(grid.map(row => [...row]))

    // Animate tiles
    let animationFrame: number
    const startTime = performance.now()

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / ANIMATION_DURATION, 1)

      // Clear the canvas for animation frame
      ctx.fillStyle = '#bbada0'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Redraw the base grid
      layout.forEach((ring, ringIndex) => {
        ring.forEach((hex, hexIndex) => {
          const [x, y] = axialToPixel(hex.q, hex.r)
          const centerX = startX + x
          const centerY = startY + y
          const value = grid[ringIndex]?.[hexIndex] ?? null

          ctx.save()
          ctx.shadowColor = 'rgba(0, 0, 0, 0.2)'
          ctx.shadowBlur = 4
          ctx.shadowOffsetX = 0
          ctx.shadowOffsetY = 2
          ctx.fillStyle = getCellColor(value)
          drawHexagon(ctx, centerX, centerY, HEX_SIZE)
          ctx.fill()
          ctx.restore()

          ctx.strokeStyle = '#bbada0'
          ctx.lineWidth = 2
          drawHexagon(ctx, centerX, centerY, HEX_SIZE)
          ctx.stroke()

          if (value) {
            ctx.fillStyle = getTextColor(value)
            ctx.font = `bold ${getFontSize(value)}px Arial`
            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'
            ctx.fillText(value.toString(), centerX, centerY)
          }
        })
      })

      // Draw animated tiles
      newAnimatedTiles.forEach(tile => {
        const scale = tile.scale + (1 - tile.scale) * progress
        const opacity = tile.opacity + (1 - tile.opacity) * progress

        ctx.save()
        ctx.globalAlpha = opacity
        ctx.translate(tile.toX, tile.toY)
        ctx.scale(scale, scale)
        ctx.translate(-tile.toX, -tile.toY)

        // Draw animated tile
        ctx.fillStyle = getCellColor(tile.value)
        drawHexagon(ctx, tile.toX, tile.toY, HEX_SIZE)
        ctx.fill()

        // Draw value
        ctx.fillStyle = getTextColor(tile.value)
        ctx.font = `bold ${getFontSize(tile.value)}px Arial`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(tile.value.toString(), tile.toX, tile.toY)

        ctx.restore()
      })

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate)
      }
    }

    if (newAnimatedTiles.length > 0) {
      animationFrame = requestAnimationFrame(animate)
    }

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame)
      }
    }
  }, [grid, prevGrid])

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