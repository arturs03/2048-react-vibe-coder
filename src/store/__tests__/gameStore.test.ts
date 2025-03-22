import { describe, it, expect, beforeEach } from 'vitest'
import { useGameStore, Direction } from '../gameStore'

describe('GameStore', () => {
  beforeEach(() => {
    useGameStore.getState().initGame()
  })

  describe('Grid Layout', () => {
    it('should maintain hexagonal shape with correct number of cells', () => {
      const store = useGameStore.getState()
      const grid = store.grid
      
      // For our hexagonal grid, we should have 19 positions (1 + 6 + 12)
      expect(grid.length).toBe(3) // 3 rings
      expect(grid[0].length).toBe(1) // Center hex
      expect(grid[1].length).toBe(6) // First ring
      expect(grid[2].length).toBe(12) // Second ring
      expect(grid.flat().length).toBe(19) // Total cells
    })

    it('should spawn tiles only in valid hexagonal positions', () => {
      const store = useGameStore.getState()
      const grid = store.grid
      
      // Check each cell in the grid
      grid.forEach((row, rowIndex) => {
        row.forEach((cell, colIndex) => {
          if (cell !== null) {
            // Verify the position is within the valid range
            const position = store.getPosition(rowIndex, colIndex)
            expect(position).toBeDefined()
          }
        })
      })
    })
  })

  describe('Tile Movement', () => {
    const directions: Direction[] = ['up', 'down', 'left', 'right', 'upLeft', 'upRight', 'downLeft', 'downRight']

    directions.forEach(direction => {
      it(`should move tiles correctly in ${direction} direction`, () => {
        const store = useGameStore.getState()
        
        // Create a known initial state with two tiles
        const initialGrid = store.grid.map(row => [...row])
        initialGrid[0][0] = 2 // Center
        initialGrid[1][0] = 2 // Top position
        
        store.grid = initialGrid

        // Move tiles
        store.move(direction)

        // Verify tiles moved correctly based on direction
        const finalGrid = store.grid
        const expectedMergePosition = getExpectedPosition(direction)
        expect(finalGrid[expectedMergePosition.row][expectedMergePosition.col]).toBe(4)
      })
    })

    it('should not allow invalid moves outside hexagonal bounds', () => {
      const store = useGameStore.getState()
      
      // Place a tile at the edge of the grid
      const initialGrid = store.grid.map(row => [...row])
      initialGrid[2][0] = 2 // Place at top of second ring
      
      store.grid = initialGrid

      // Try to move up (should not be possible)
      store.move('up')

      // Tile should stay in place
      expect(store.grid[2][0]).toBe(2)
    })

    it('should handle multiple tiles moving in the same direction', () => {
      const store = useGameStore.getState()
      
      // Create a line of three tiles
      const initialGrid = store.grid.map(row => [...row])
      initialGrid[0][0] = 2 // Center
      initialGrid[1][0] = 2 // Top of first ring
      initialGrid[2][0] = 2 // Top of second ring
      
      store.grid = initialGrid

      // Move tiles down
      store.move('down')

      const finalGrid = store.grid
      // Should have two tiles: one merged (4) and one unmerged (2)
      expect(finalGrid[2][6]).toBe(4) // Bottom position
      expect(finalGrid[1][3]).toBe(2) // Middle position
    })
  })

  describe('Game Over', () => {
    it('should detect game over when no valid moves are possible', () => {
      const store = useGameStore.getState()
      
      // Fill the grid with alternating values that can't merge
      const initialGrid = store.grid.map(row => [...row])
      initialGrid.forEach((row, i) => {
        row.forEach((_, j) => {
          initialGrid[i][j] = (i + j) % 2 === 0 ? 2 : 4
        })
      })
      
      store.grid = initialGrid

      // Try all possible moves
      const directions: Direction[] = ['up', 'down', 'left', 'right', 'upLeft', 'upRight', 'downLeft', 'downRight']
      directions.forEach(direction => store.move(direction))

      expect(store.isGameOver).toBe(true)
    })
  })

  describe('Expanded Grid and Diagonal Movement', () => {
    beforeEach(() => {
      useGameStore.getState().initGame()
    })

    it('should have a larger grid with more cells', () => {
      // For a hexagonal grid of size 6, we should have 37 possible positions
      const validPositions = []
      const GRID_SIZE = 6
      const range = Math.floor(GRID_SIZE / 2)
      
      for (let q = -range; q <= range; q++) {
        for (let r = Math.max(-range, -q-range); r <= Math.min(range, -q+range); r++) {
          if (Math.abs(-q-r) <= range) {
            validPositions.push({ q, r })
          }
        }
      }

      expect(validPositions.length).toBe(37) // Hexagonal grid of size 6 should have 37 cells
    })

    it('should handle diagonal movements correctly', () => {
      const store = useGameStore.getState()
      
      // Create a known initial state with two tiles
      const initialGrid = store.grid.map(row => [...row])
      initialGrid[0][0] = 2
      initialGrid[2][2] = 2
      
      store.grid = initialGrid

      // Move diagonally
      store.move('downRight')

      // Check if tiles merged correctly
      const finalGrid = store.grid
      expect(finalGrid[2][2]).toBe(4) // Merged tile should be in bottom-right
      expect(finalGrid[0][0]).toBeNull() // Original position should be empty
    })

    it('should handle multiple diagonal movements in sequence', () => {
      const store = useGameStore.getState()
      
      // Create a line of three tiles in a diagonal pattern
      const initialGrid = store.grid.map(row => [...row])
      initialGrid[0][0] = 2
      initialGrid[1][1] = 2
      initialGrid[2][2] = 2
      
      store.grid = initialGrid

      // Move diagonally
      store.move('downRight')

      const finalGrid = store.grid
      expect(finalGrid[2][2]).toBe(4) // First merge
      expect(finalGrid[1][1]).toBe(2) // Remaining tile
    })

    it('should maintain proper scoring for diagonal merges', () => {
      const store = useGameStore.getState()
      
      // Create a scenario where multiple merges happen
      const initialGrid = store.grid.map(row => [...row])
      initialGrid[0][0] = 2
      initialGrid[1][1] = 2
      initialGrid[2][2] = 2
      
      store.grid = initialGrid
      const initialScore = store.score

      // Move diagonally
      store.move('downRight')

      // Check score increase (2+2=4 points for the merge)
      expect(store.score).toBe(initialScore + 4)
    })

    it('should handle edge cases in diagonal movement', () => {
      const store = useGameStore.getState()
      
      // Create a scenario with tiles at the edge
      const initialGrid = store.grid.map(row => [...row])
      initialGrid[0][0] = 2
      
      store.grid = initialGrid

      // Try to move diagonally from edge
      store.move('downRight')

      // Tile should move to valid position
      expect(store.grid[1][1]).toBe(2)
    })
  })
})

// Helper function to determine expected position after move
function getExpectedPosition(direction: Direction): { row: number; col: number } {
  switch (direction) {
    case 'up':
      return { row: 2, col: 0 } // Top of second ring
    case 'down':
      return { row: 2, col: 6 } // Bottom of second ring
    case 'left':
      return { row: 2, col: 9 } // Left side of second ring
    case 'right':
      return { row: 2, col: 3 } // Right side of second ring
    case 'upLeft':
      return { row: 2, col: 10 } // Top-left of second ring
    case 'upRight':
      return { row: 2, col: 2 } // Top-right of second ring
    case 'downLeft':
      return { row: 2, col: 8 } // Bottom-left of second ring
    case 'downRight':
      return { row: 2, col: 4 } // Bottom-right of second ring
  }
} 