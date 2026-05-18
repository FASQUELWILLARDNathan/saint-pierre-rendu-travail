import { vi, beforeEach } from 'vitest'
import { DeepMockProxy, mockDeep, mockReset } from 'vitest-mock-extended'
import type { PrismaClient } from '@prisma/client'

/**
 * Setup pour les tests backend
 * Mocking de Prisma et services externes
 */

// Mock de Prisma
vi.mock('@backend/config', () => ({
  prisma: mockDeep<PrismaClient>(),
  PORT: '3000',
  NODE_ENV: 'test',
  ALLOWED_ORIGINS: ['http://localhost:5173', 'http://localhost:3000'],
}))

// Mock des services
vi.mock('@backend/jwt-manager', () => ({
  signToken: vi.fn((payload: object) => `mock-token-${JSON.stringify(payload)}`),
  verifyToken: vi.fn((token: string) => ({ id: 1, role: 'eleve' })),
  startKeyRotation: vi.fn(),
}))

vi.mock('@backend/mail-service', () => ({
  sendResetPasswordEmail: vi.fn().mockResolvedValue(true),
  sendWelcomeEmail: vi.fn().mockResolvedValue(true),
}))

// Mock de bcrypt
vi.mock('bcrypt', () => ({
  hash: vi.fn().mockResolvedValue('hashed-password'),
  compare: vi.fn().mockResolvedValue(true),
}))

// Mock de crypto
vi.mock('crypto', () => ({
  randomBytes: vi.fn().mockReturnValue(Buffer.from('mock-token')),
}))

// Mock de mailjet
vi.mock('node-mailjet', () => ({
  default: {
    apiConnect: vi.fn().mockReturnValue({
      post: vi.fn().mockReturnValue({
        request: vi.fn().mockResolvedValue({ success: true }),
      }),
    }),
  },
}))

// Reset des mocks avant chaque test
beforeEach(() => {
  vi.clearAllMocks()
})

// Configuration des variables d'environnement pour le backend
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test'
process.env.JWT_SECRET = 'test-secret-key-for-testing'
process.env.PORT = '3000'
process.env.NODE_ENV = 'test'
process.env.MAILJET_API_KEY = 'test-key'
process.env.MAILJET_API_SECRET = 'test-secret'
process.env.MAILJET_FROM_EMAIL = 'noreply@saint-pierre.fr'
process.env.MAILJET_FROM_NAME = 'Saint-Pierre'
process.env.FRONTEND_URL = 'http://localhost:5173'
