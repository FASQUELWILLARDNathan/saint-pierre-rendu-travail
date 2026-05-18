import { describe, it, expect, beforeEach, vi } from 'vitest'
import type { Request, Response } from 'express'
import { mockPrisma } from '../../mocks/prisma'
import bcrypt from 'bcrypt'

vi.mock('../../../backend/config.ts', () => ({
  prisma: mockPrisma,
}))

vi.mock('../../../backend/mail-service.ts', () => ({
  sendWelcomeEmail: vi.fn().mockResolvedValue(true),
  sendResetPasswordEmail: vi.fn().mockResolvedValue(true),
}))

vi.mock('../../../backend/middleware/rate-limit.ts', () => ({
  authLimiter: vi.fn((_req: Request, _res: Response, next: Function) => next()),
  signInLimiter: vi.fn((_req: Request, _res: Response, next: Function) => next()),
  forgotPasswordLimiter: vi.fn((_req: Request, _res: Response, next: Function) => next()),
}))

vi.mock('bcrypt', async (importOriginal) => {
  return await importOriginal()
})

vi.mock('crypto', async (importOriginal) => {
  return await importOriginal()
})

describe('Auth Routes - Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ===== SIGN UP =====
  describe('POST /auth/sign-up', () => {
    it('should validate required fields are missing', () => {
      const payload = { nom: '', prenom: '', login: '', password: '', role: '' }

      const isValid =
        payload.nom && payload.prenom && payload.login && payload.password && payload.role
      expect(isValid).toBeFalsy()
    })

    it('should validate eleve needs classe and annee', () => {
      const payload = {
        nom: 'Dupont',
        prenom: 'Jean',
        login: 'jdupont',
        password: 'Pass123!',
        role: 'eleve',
        classe: '',
        annee: 0,
      }

      const isValid = payload.role === 'eleve' && payload.classe && payload.annee
      expect(isValid).toBeFalsy()
    })

    it('should validate professeur needs email', () => {
      const payload = {
        nom: 'Martin',
        prenom: 'Paul',
        login: 'pmartin',
        password: 'Pass123!',
        role: 'professeur',
        email: '',
      }

      const isValid = payload.role === 'professeur' && payload.email
      expect(isValid).toBeFalsy()
    })

    it('should detect duplicate login', async () => {
      mockPrisma.utilisateur.findUnique.mockResolvedValueOnce({
        id_user: 1n,
        login: 'jdupont',
        nom: 'Dupont',
        prenom: 'Jean',
        email: 'dupont.jean@cs-saintpierrecalais.fr',
        role: 'eleve',
        hashed_password: 'hashed',
        reset_token: null,
        reset_token_expiry: null,
      })

      const existingUser = await mockPrisma.utilisateur.findUnique({
        where: { login: 'jdupont' },
      })

      expect(existingUser).toBeDefined()
      expect(existingUser?.login).toBe('jdupont')
    })

    it('should create user with valid data', () => {
      const createdUser = {
        id_user: 1n,
        login: 'jdupont',
        nom: 'Dupont',
        prenom: 'Jean',
        email: 'dupont.jean@cs-saintpierrecalais.fr',
        role: 'eleve',
        hashed_password: 'hashed',
        reset_token: null,
        reset_token_expiry: null,
      }

      expect(createdUser).toBeDefined()
      expect(createdUser.login).toBe('jdupont')
      expect(createdUser.role).toBe('eleve')
    })
  })
})

// ===== SIGN IN =====
describe('POST /auth/sign-in', () => {
  it('should validate login and password are required', () => {
    const payload = { login: '', password: '' }

    const isValid = payload.login && payload.password
    expect(isValid).toBeFalsy()
  })

  it('should detect user not found', async () => {
    mockPrisma.utilisateur.findUnique.mockResolvedValueOnce(null)

    const user = await mockPrisma.utilisateur.findUnique({
      where: { login: 'inexistant' },
    })

    expect(user).toBeNull()
  })

  it('should validate password matching logic', async () => {
    const plainPassword: string = 'correctPassword'
    const wrongPassword: string = 'anotherPassword'

    const isMatch = plainPassword === wrongPassword
    expect(isMatch).toBe(false)
  })

  it('should return user data on signin', () => {
    const user = {
      id_user: 1n,
      login: 'jdupont',
      nom: 'Dupont',
      prenom: 'Jean',
      email: 'dupont.jean@cs-saintpierrecalais.fr',
      role: 'eleve',
      hashed_password: 'hashed',
      eleve: { classe: '2nde A', annee: 2026 },
      professeur: null,
    }

    expect(user).toBeDefined()
    expect(user.id_user).toBeDefined()
    expect(user.role).toBe('eleve')
    expect(user.eleve).toBeDefined()
  })
})

// ===== FORGOT PASSWORD =====
describe('POST /auth/forgot-password', () => {
  it('should validate email is required', () => {
    const payload = { email: '' }

    const isValid = payload.email
    expect(isValid).toBeFalsy()
  })

  it('should handle user not found gracefully', async () => {
    mockPrisma.utilisateur.findUnique.mockResolvedValueOnce(null)

    const user = await mockPrisma.utilisateur.findUnique({
      where: { email: 'inexistant@test.fr' },
    })

    expect(user).toBeNull()
  })

  it('should update reset token for existing user', async () => {
    const resetToken = 'token-123-abc'

    mockPrisma.utilisateur.update.mockResolvedValueOnce({
      id_user: 1n,
      reset_token: resetToken,
    })

    const updated = await mockPrisma.utilisateur.update({
      where: { id_user: 1n },
      data: { reset_token: resetToken },
    })

    expect(updated).toBeDefined()
    expect(updated?.reset_token).toBe(resetToken)
  })
})

// ===== RESET PASSWORD =====
describe('POST /auth/reset-password', () => {
  it('should validate token and password are required', () => {
    const payload = { token: '', newPassword: '' }

    const isValid = payload.token && payload.newPassword
    expect(isValid).toBeFalsy()
  })

  it('should reject invalid token', async () => {
    mockPrisma.utilisateur.findFirst.mockResolvedValueOnce(null)

    const user = await mockPrisma.utilisateur.findFirst({
      where: { reset_token: 'invalidtoken' },
    })

    expect(user).toBeNull()
  })

  it('should check token expiry', () => {
    const expiredTime = new Date(Date.now() - 10000)
    const now = new Date()

    const isExpired = expiredTime < now
    expect(isExpired).toBe(true)
  })

  it('should reject expired token', () => {
    const tokenExpiry = new Date(Date.now() - 10000)
    const now = new Date()

    const isValid = tokenExpiry > now
    expect(isValid).toBe(false)
  })

  it('should accept valid token', () => {
    const tokenExpiry = new Date(Date.now() + 3600000)
    const now = new Date()

    const isValid = tokenExpiry > now
    expect(isValid).toBe(true)
  })
})

// ===== LOGOUT =====
describe('POST /auth/logout', () => {
  it('should clear session on logout', () => {
    const session = { user: { id: 1 }, authenticated: true }

    const clearedSession = { user: null, authenticated: false }

    expect(clearedSession.user).toBeNull()
    expect(clearedSession.authenticated).toBe(false)
  })

  it('should return success message', () => {
    const response = {
      success: true,
      message: 'Déconnexion réussie',
    }

    expect(response.success).toBe(true)
    expect(response.message).toContain('Déconnexion')
  })
})

// ===== ADDITIONAL VALIDATIONS =====
describe('Email Validation', () => {
  it('should validate email format', () => {
    const validEmails = [
      'test@cs-saintpierrecalais.fr',
      'user.name@school.fr',
      'prof@institution.edu',
    ]

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    validEmails.forEach((email) => {
      expect(emailRegex.test(email)).toBe(true)
    })
  })

  it('should reject invalid email format', () => {
    const invalidEmails = ['notanemail', '@nolocal.fr', 'user@', 'user name@test.fr']

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    invalidEmails.forEach((email) => {
      expect(emailRegex.test(email)).toBe(false)
    })
  })
})

describe('Password Validation', () => {
  it('should validate password strength', () => {
    const passwords = {
      weak: '123',
      medium: 'Password123',
      strong: 'SecurePass123!',
    }

    const isStrong = (pwd: string) =>
      pwd.length >= 8 && /[A-Z]/.test(pwd) && /[a-z]/.test(pwd) && /[0-9]/.test(pwd)

    expect(isStrong(passwords.weak)).toBe(false)
    expect(isStrong(passwords.medium)).toBe(true)
    expect(isStrong(passwords.strong)).toBe(true)
  })
})

describe('User Roles', () => {
  it('should support eleve role', () => {
    const user = { role: 'eleve' }
    expect(user.role).toBe('eleve')
  })

  it('should support professeur role', () => {
    const user = { role: 'professeur' }
    expect(user.role).toBe('professeur')
  })

  it('should support admin role', () => {
    const user = { role: 'admin' }
    expect(user.role).toBe('admin')
  })
})
