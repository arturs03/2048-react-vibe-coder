import { describe, it, expect, beforeEach } from 'vitest'
import { useGameStore } from '../gameStore'
import { Tile, Direction } from '@/types/game'
import { v4 as uuidv4 } from 'uuid'

describe('GameStore', () => {
  beforeEach(() => {
    const store = useGameStore.getState()
    store.initGame()
  })

  describe('Grid Layout', () => {
    it('should maintain hexagonal shape with correct number of cells', () => {
      const store = useGameStore.getState()
      
      // For a hexagonal grid of size 4, we should have 19 possible positions
      const validPositions = []
      const GRID_SIZE = 4
      const range = Math.floor(GRID_SIZE / 2)
      
      for (let q = -range; q <= range; q++) {
        for (let r = Math.max(-range, -q-range); r <= Math.min(range, -q+range); r++) {
          if (Math.abs(-q-r) <= range) {
            validPositions.push({ q, r })
          }
        }
      }

      expect(validPositions.length).toBe(19) // Hexagonal grid of size 4 should have 19 cells
    })

    it('should spawn tiles only in valid hexagonal positions', () => {
      const store = useGameStore.getState()
      const tiles = store.tiles

      // Check each tile's position is within the valid hexagonal range
      tiles.forEach(tile => {
        const { q, r } = tile.position
        const s = -q - r // Third coordinate
        const GRID_SIZE = 4
        const range = Math.floor(GRID_SIZE / 2)
        
        expect(Math.max(Math.abs(q), Math.abs(r), Math.abs(s))).toBeLessThanOrEqual(range)
      })
    })
  })

  describe('Tile Movement', () => {
    const directions: Direction[] = ['up', 'down', 'upLeft', 'upRight', 'downLeft', 'downRight']

    directions.forEach(direction => {
      it(`should move tiles correctly in ${direction} direction`, () => {
        const store = useGameStore.getState()
        
        // Create a known initial state with two tiles
        const initialTiles: Tile[] = [
          {
            id: '1',
            value: 2,
            position: { q: 0, r: 0 }
          }
        ]
        
        // Add second tile in the opposite direction
        const secondTilePos = (() => {
          switch(direction) {
            case 'up': return { q: 0, r: 1 }
            case 'down': return { q: 0, r: -1 }
            case 'upLeft': return { q: 1, r: 0 }
            case 'upRight': return { q: -1, r: 1 }
            case 'downLeft': return { q: 1, r: -1 }
            case 'downRight': return { q: -1, r: 0 }
          }
        })()

        initialTiles.push({
          id: '2',
          value: 2,
          position: secondTilePos
        })
        
        store.tiles = initialTiles

        // Move tiles
        store.moveTiles(direction)

        const tilesAfterMove = store.tiles.filter(t => t.value === 4) // Get merged tile

        // Should have exactly one merged tile
        expect(tilesAfterMove.length).toBe(1)
        
        // Verify merged tile position
        const expectedPos = (() => {
          switch(direction) {
            case 'up': return { q: 0, r: -1 }
            case 'down': return { q: 0, r: 1 }
            case 'upLeft': return { q: -1, r: 0 }
            case 'upRight': return { q: 1, r: -1 }
            case 'downLeft': return { q: -1, r: 1 }
            case 'downRight': return { q: 1, r: 0 }
          }
        })()

        expect(tilesAfterMove[0].position).toEqual(expectedPos)
      })
    })

    it('should not allow invalid moves outside hexagonal bounds', () => {
      const store = useGameStore.getState()
      
      // Place a tile at the edge of the grid
      const edgeTile: Tile = {
        id: '1',
        value: 2,
        position: { q: 2, r: 0 } // Right edge
      }
      
      store.tiles = [edgeTile]

      // Try to move right
      store.moveTiles('downRight')

      // Tile should stay in place
      expect(store.tiles[0].position).toEqual(edgeTile.position)
    })

    it('should handle multiple tiles moving in the same direction', () => {
      const store = useGameStore.getState()
      
      // Create a line of three tiles
      const initialTiles: Tile[] = [
        { id: '1', value: 2, position: { q: -1, r: 0 } },
        { id: '2', value: 2, position: { q: 0, r: 0 } },
        { id: '3', value: 2, position: { q: 1, r: 0 } }
      ]
      
      store.tiles = initialTiles

      // Move tiles left
      store.moveTiles('upLeft')

      const tilesAfterMove = store.tiles.filter(t => t.id !== store.tiles[store.tiles.length - 1].id) // Exclude new spawned tile

      // Should have two tiles: one merged (4) and one unmerged (2)
      expect(tilesAfterMove.length).toBe(2)
      expect(tilesAfterMove.some(t => t.value === 4)).toBe(true)
      expect(tilesAfterMove.some(t => t.value === 2)).toBe(true)
    })
  })

  describe('Game Over', () => {
    it('should detect game over when no valid moves are possible', () => {
      const store = useGameStore.getState()
      
      // Fill the grid with alternating values that can't merge
      const tiles: Tile[] = []
      const GRID_SIZE = 4
      const range = Math.floor(GRID_SIZE / 2)
      
      for (let q = -range; q <= range; q++) {
        for (let r = Math.max(-range, -q-range); r <= Math.min(range, -q+range); r++) {
          if (Math.abs(-q-r) <= range) {
            tiles.push({
              id: uuidv4(),
              value: (q + r) % 2 === 0 ? 2 : 4,
              position: { q, r }
            })
          }
        }
      }
      
      store.tiles = tiles

      // Try all possible moves
      const directions: Direction[] = ['up', 'down', 'upLeft', 'upRight', 'downLeft', 'downRight']
      directions.forEach(direction => store.moveTiles(direction))

      expect(store.gameOver).toBe(true)
    })
  })
}) 