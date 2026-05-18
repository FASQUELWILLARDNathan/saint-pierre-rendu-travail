import { expect, afterEach, vi } from 'vitest'
import '@testing-library/jest-dom'

// Configuration globale des tests

/**
 * Setup global pour tous les tests
 */

// Mock de fetch globalement (sera overridé dans les tests spécifiques si nécessaire)
global.fetch = vi.fn()

// Configuration du timeout global
afterEach(() => {
  vi.clearAllMocks()
})

// Augmentation des matchers personalisés si besoin
expect.extend({
  toBeWithinRange(received: number, floor: number, ceiling: number) {
    const pass = received >= floor && received <= ceiling
    if (pass) {
      return {
        message: () => `expected ${received} not to be within range ${floor} - ${ceiling}`,
        pass: true,
      }
    } else {
      return {
        message: () => `expected ${received} to be within range ${floor} - ${ceiling}`,
        pass: false,
      }
    }
  },
})

// Mock de process.env
process.env.VITE_API_URL = 'http://localhost:3000'
process.env.NODE_ENV = 'test'
process.env.JWT_SECRET = 'test-secret-key-for-jwt-testing-12345'
