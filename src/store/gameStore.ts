import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

export type Cell = number | null
export type HexGrid = Cell[][]
export type Direction = 'up' | 'down' | 'left' | 'right' | 'upLeft' | 'upRight' | 'downLeft' | 'downRight'

interface GameState {
  grid: HexGrid
  score: number
  bestScore: number
  isGameOver: boolean
  initGame: () => void
  move: (direction: Direction) => void
  resetGame: () => void
}

// Grid layout configuration for a flower/honeycomb pattern
const GRID_LAYOUT = [
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

// Direction vectors for hexagonal movement (using axial coordinates)
const DIRECTION_VECTORS: Record<Direction, { dq: number; dr: number }> = {
  up: { dq: 0, dr: -1 },
  down: { dq: 0, dr: 1 },
  upLeft: { dq: -1, dr: 0 },
  upRight: { dq: 1, dr: -1 },
  downLeft: { dq: -1, dr: 1 },
  downRight: { dq: 1, dr: 0 },
  left: { dq: -1, dr: 0 },
  right: { dq: 1, dr: 0 }
}

const createEmptyGrid = (): HexGrid => {
  const grid: HexGrid = []
  GRID_LAYOUT.forEach(row => {
    grid.push(Array(row.length).fill(null))
  })
  return grid
}

const getValidCells = (): [number, number][] => {
  const cells: [number, number][] = []
  GRID_LAYOUT.forEach((row, rowIndex) => {
    row.forEach((_, colIndex) => {
      cells.push([rowIndex, colIndex])
    })
  })
  return cells
}

const addNewTile = (grid: HexGrid): HexGrid => {
  const newGrid = grid.map(row => [...row])
  const emptyCells = getValidCells().filter(([row, col]) => newGrid[row][col] === null)

  if (emptyCells.length > 0) {
    const [row, col] = emptyCells[Math.floor(Math.random() * emptyCells.length)]
    newGrid[row][col] = Math.random() < 0.9 ? 2 : 4
  }

  return newGrid
}

const getNextCell = (row: number, col: number, direction: Direction): [number, number] | null => {
  const currentHex = GRID_LAYOUT[row][col]
  const vector = DIRECTION_VECTORS[direction]
  const nextQ = currentHex.q + vector.dq
  const nextR = currentHex.r + vector.dr

  // Find the corresponding grid position for the new axial coordinates
  for (let r = 0; r < GRID_LAYOUT.length; r++) {
    for (let c = 0; c < GRID_LAYOUT[r].length; c++) {
      if (GRID_LAYOUT[r][c].q === nextQ && GRID_LAYOUT[r][c].r === nextR) {
        return [r, c]
      }
    }
  }

  return null
}

export const useGameStore = create<GameState>()(
  devtools(
    (set, get) => ({
      grid: createEmptyGrid(),
      score: 0,
      bestScore: 0,
      isGameOver: false,

      initGame: () => {
        console.log('Initializing game')
        const initialGrid = addNewTile(addNewTile(createEmptyGrid()))
        set({ 
          grid: initialGrid,
          score: 0,
          isGameOver: false
        })
      },

      move: (direction: Direction) => {
        console.log('Moving in direction:', direction)
        const { grid, score } = get()
        const newGrid = grid.map(row => [...row])
        let newScore = score
        let moved = false

        // Process each cell in the grid
        const cells = getValidCells()
        cells.forEach(([row, col]) => {
          const value = newGrid[row][col]
          if (value === null) return

          let currentRow = row
          let currentCol = col
          let currentValue = value
          newGrid[row][col] = null

          let next: [number, number] | null
          while ((next = getNextCell(currentRow, currentCol, direction)) !== null) {
            const [nextRow, nextCol] = next
            const nextValue = newGrid[nextRow][nextCol]

            if (nextValue === null) {
              // Move to empty cell
              currentRow = nextRow
              currentCol = nextCol
              moved = true
            } else if (nextValue === currentValue) {
              // Merge with same value
              currentValue *= 2
              newScore += currentValue
              currentRow = nextRow
              currentCol = nextCol
              moved = true
              break
            } else {
              // Hit different value, stop
              break
            }
          }

          newGrid[currentRow][currentCol] = currentValue
        })

        if (moved) {
          console.log('Grid moved, adding new tile')
          const gridWithNewTile = addNewTile(newGrid)
          set({ 
            grid: gridWithNewTile,
            score: newScore,
            bestScore: Math.max(newScore, get().bestScore)
          })
        } else {
          console.log('No movement possible in this direction')
        }
      },

      resetGame: () => {
        console.log('Resetting game')
        get().initGame()
      }
    })
  )
) 