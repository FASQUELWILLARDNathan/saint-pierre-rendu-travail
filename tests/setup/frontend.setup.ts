import { vi, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

/**
 * Setup pour les tests frontend (Vue 3 + Pinia)
 */

// Reset pinia avant chaque test
beforeEach(() => {
  setActivePinia(createPinia())
  vi.clearAllMocks()
})

// Mock de localStorage
const localStorageMock: { [key: string]: string } = {}

global.localStorage = {
  getItem: vi.fn((key: string) => localStorageMock[key] || null),
  setItem: vi.fn((key: string, value: string) => {
    localStorageMock[key] = value
  }),
  removeItem: vi.fn((key: string) => {
    delete localStorageMock[key]
  }),
  clear: vi.fn(() => {
    Object.keys(localStorageMock).forEach((key) => {
      delete localStorageMock[key]
    })
  }),
  length: 0,
  key: vi.fn(),
} as any

// Mock de sessionStorage
const sessionStorageMock: { [key: string]: string } = {}

global.sessionStorage = {
  getItem: vi.fn((key: string) => sessionStorageMock[key] || null),
  setItem: vi.fn((key: string, value: string) => {
    sessionStorageMock[key] = value
  }),
  removeItem: vi.fn((key: string) => {
    delete sessionStorageMock[key]
  }),
  clear: vi.fn(() => {
    Object.keys(sessionStorageMock).forEach((key) => {
      delete sessionStorageMock[key]
    })
  }),
  length: 0,
  key: vi.fn(),
} as any

// Mock de document.cookie
Object.defineProperty(document, 'cookie', {
  writable: true,
  value: '',
})

// Configuration pour les tests du frontend
process.env.VITE_API_URL = 'http://localhost:3000'
