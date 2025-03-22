import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

export type Cell = number | null
export type HexGrid = Cell[][]
export type Direction = 'left' | 'right' | 'upLeft' | 'upRight' | 'downLeft' | 'downRight'

interface GameState {
  grid: HexGrid
  score: number
  bestScore: number
  isGameOver: boolean
  initGame: () => void
  move: (direction: Direction) => void
  resetGame: () => void
  getPosition: (row: number, col: number) => { q: number; r: number } | null
}

// Grid layout configuration for a flower/honeycomb pattern
const GRID_LAYOUT = [
  // Center hex
  [{ q: 0, r: 0 }],
  // First ring (clockwise from top)
  [
    { q: 0, r: -1 },  // top
    { q: 1, r: -1 },  // top-right
    { q: 1, r: 0 },   // bottom-right
    { q: 0, r: 1 },   // bottom
    { q: -1, r: 1 },  // bottom-left
    { q: -1, r: 0 }   // top-left
  ],
  // Second ring (clockwise from top)
  [
    { q: 0, r: -2 },  // top
    { q: 1, r: -2 },  // top-right
    { q: 2, r: -2 },  // top-right-right
    { q: 2, r: -1 },  // right-right
    { q: 2, r: 0 },   // bottom-right-right
    { q: 1, r: 1 },   // bottom-right
    { q: 0, r: 2 },   // bottom
    { q: -1, r: 2 },  // bottom-left
    { q: -2, r: 2 },  // bottom-left-left
    { q: -2, r: 1 },  // left-left
    { q: -2, r: 0 },  // top-left-left
    { q: -1, r: -1 }  // top-left
  ]
]

// Direction vectors for hexagonal movement (using axial coordinates)
const DIRECTION_VECTORS: Record<Direction, { dq: number; dr: number }> = {
  left: { dq: -1, dr: 0 },
  right: { dq: 1, dr: 0 },
  upLeft: { dq: -1, dr: 0 },
  upRight: { dq: 1, dr: -1 },
  downLeft: { dq: -1, dr: 1 },
  downRight: { dq: 1, dr: 0 }
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
    // 90% chance of 2, 10% chance of 4 (just like original 2048)
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

const canMove = (grid: HexGrid): boolean => {
  // Check for empty cells
  if (getValidCells().some(([row, col]) => grid[row][col] === null)) {
    return true
  }

  // Check for possible merges
  const directions: Direction[] = ['left', 'right', 'upLeft', 'upRight', 'downLeft', 'downRight']
  
  for (const [row, col] of getValidCells()) {
    const value = grid[row][col]
    if (value === null) continue

    for (const direction of directions) {
      const next = getNextCell(row, col, direction)
      if (next) {
        const [nextRow, nextCol] = next
        if (grid[nextRow][nextCol] === value) {
          return true
        }
      }
    }
  }

  return false
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

        // Get cells in the correct order based on direction
        const cells = getValidCells()
        // Sort cells so we process them in the correct order for the movement direction
        cells.sort(([r1, c1], [r2, c2]) => {
          const pos1 = GRID_LAYOUT[r1][c1]
          const pos2 = GRID_LAYOUT[r2][c2]
          const vector = DIRECTION_VECTORS[direction]
          
          // Project positions onto movement vector
          const proj1 = pos1.q * vector.dq + pos1.r * vector.dr
          const proj2 = pos2.q * vector.dq + pos2.r * vector.dr
          
          // Sort in reverse order of movement direction
          return vector.dq + vector.dr > 0 ? proj1 - proj2 : proj2 - proj1
        })

        // Process each cell
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
          const canMakeMove = canMove(gridWithNewTile)
          set({ 
            grid: gridWithNewTile,
            score: newScore,
            bestScore: Math.max(newScore, get().bestScore),
            isGameOver: !canMakeMove
          })
        }
      },

      resetGame: () => {
        console.log('Resetting game')
        get().initGame()
      },

      getPosition: (row: number, col: number) => {
        if (row >= 0 && row < GRID_LAYOUT.length && col >= 0 && col < GRID_LAYOUT[row].length) {
          return GRID_LAYOUT[row][col]
        }
        return null
      }
    })
  )
) 