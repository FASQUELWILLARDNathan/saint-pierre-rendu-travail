/**
 * Test Helpers et Utilities
 */

import { vi } from 'vitest'

/**
 * Mock API Response Helper
 */
export function mockFetchResponse<T>(data: T, status = 200, ok = true) {
  return new Response(JSON.stringify(data), {
    status,
    ok,
    headers: {
      'Content-Type': 'application/json',
    },
  })
}

/**
 * Mock API Error Response
 */
export function mockFetchError(message: string, status = 500) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    ok: false,
    headers: {
      'Content-Type': 'application/json',
    },
  })
}

/**
 * Wait for async operations
 */
export function waitFor(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Create mock user with defaults
 */
export function createMockUser(overrides = {}) {
  return {
    id_user: 1,
    nom: 'Test',
    prenom: 'User',
    login: 'testuser',
    email: 'test@example.com',
    role: 'eleve',
    ...overrides,
  }
}

/**
 * Create mock auth token
 */
export function createMockAuthToken(payload = {}) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64')
  const body = Buffer.from(JSON.stringify({ id: 1, role: 'eleve', ...payload })).toString('base64')
  const signature = 'mock-signature'

  return `${header}.${body}.${signature}`
}

/**
 * Mock localStorage wrapper for tests
 */
export function createMockStorage() {
  let store: { [key: string]: string } = {}

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    },
    length: Object.keys(store).length,
    key: (index: number) => Object.keys(store)[index] || null,
  }
}

/**
 * Mock Router for Vue components
 */
export function createMockRouter() {
  return {
    push: vi.fn(),
    replace: vi.fn(),
    go: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    currentRoute: {
      value: {
        path: '/',
        name: 'home',
        params: {},
        query: {},
      },
    },
  }
}

/**
 * Async test helper
 */
export async function testAsync(fn: () => Promise<void>) {
  return fn()
}

/**
 * Mock Prisma response
 */
export function mockPrismaResponse<T>(data: T) {
  return Promise.resolve(data)
}

/**
 * Mock Prisma error
 */
export function mockPrismaError(message: string) {
  return Promise.reject(new Error(message))
}

/**
 * Create test payload for auth
 */
export function createTestAuthPayload(overrides = {}) {
  return {
    id: 1,
    role: 'eleve',
    permissions: ['read'],
    ...overrides,
  }
}

/**
 * Delay execution for testing
 */
export async function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Mock window.matchMedia for responsive tests
 */
export function mockMatchMedia(matches = false) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query) => ({
      matches: matches,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  })
}

/**
 * Mock IntersectionObserver for visibility tests
 */
export function mockIntersectionObserver() {
  global.IntersectionObserver = class IntersectionObserver {
    constructor() {}
    disconnect() {}
    observe() {}
    takeRecords() {
      return []
    }
    unobserve() {}
  } as any
}

/**
 * Create test context with common mocks
 */
export function createTestContext() {
  return {
    fetch: vi.fn(),
    localStorage: createMockStorage(),
    router: createMockRouter(),
    console: {
      log: vi.fn(),
      error: vi.fn(),
      warn: vi.fn(),
      info: vi.fn(),
    },
  }
}

/**
 * Reset all mocks
 */
export function resetAllMocks() {
  vi.clearAllMocks()
  vi.resetAllMocks()
}

/**
 * Verify mock was called with specific arguments
 */
export function verifyMockCall(mockFn: any, expectedArgs: any[]) {
  expect(mockFn).toHaveBeenCalledWith(...expectedArgs)
}

/**
 * Create performance metrics helper
 */
export function measurePerformance(name: string, fn: () => void) {
  const start = performance.now()
  fn()
  const end = performance.now()

  return {
    name,
    duration: end - start,
    measure: () => console.log(`${name}: ${end - start}ms`),
  }
}
