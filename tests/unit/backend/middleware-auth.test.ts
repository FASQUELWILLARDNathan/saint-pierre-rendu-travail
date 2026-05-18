import { describe, it, expect, beforeEach, vi } from 'vitest'
import { Request, Response, NextFunction } from 'express'
import { authenticateToken } from '../../../backend/middleware/auth'
import { signToken } from '../../../backend/jwt-manager'

// Unmock to test real implementation
vi.unmock('../../../backend/middleware/auth')
vi.unmock('../../../backend/jwt-manager')

describe('Auth Middleware - Real Implementation', () => {
  let req: Partial<Request>
  let res: Partial<Response>
  let next: NextFunction

  beforeEach(() => {
    req = {
      headers: {},
    }
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    }
    next = vi.fn()
  })

  describe('authenticateToken', () => {
    it('should return 401 if no token is provided', () => {
      authenticateToken(req as Request, res as Response, next)

      expect(res.status).toHaveBeenCalledWith(401)
      expect(res.json).toHaveBeenCalledWith({ error: expect.stringContaining('token manquant') })
      expect(next).not.toHaveBeenCalled()
    })

    it('should return 401 if Authorization header is missing', () => {
      req.headers = {}

      authenticateToken(req as Request, res as Response, next)

      expect(res.status).toHaveBeenCalledWith(401)
      expect(next).not.toHaveBeenCalled()
    })

    it('should return 403 if token is invalid', () => {
      req.headers = {
        authorization: 'Bearer invalid-token-format',
      }

      authenticateToken(req as Request, res as Response, next)

      expect(res.status).toHaveBeenCalledWith(403)
      expect(res.json).toHaveBeenCalledWith({ error: expect.stringContaining('Token invalide') })
      expect(next).not.toHaveBeenCalled()
    })

    it('should extract token from Authorization header', () => {
      const payload = { id: 1, role: 'eleve' }
      const validToken = signToken(payload)

      req.headers = {
        authorization: `Bearer ${validToken}`,
      }

      authenticateToken(req as Request, res as Response, next)

      expect(next).toHaveBeenCalled()
      expect((req as any).user).toBeDefined()
      expect((req as any).user.id).toBe(1)
      expect((req as any).user.role).toBe('eleve')
    })

    it('should attach verified user data to request', () => {
      const payload = { id: 42, role: 'professeur', email: 'prof@test.fr' }
      const validToken = signToken(payload)

      req.headers = {
        authorization: `Bearer ${validToken}`,
      }

      authenticateToken(req as Request, res as Response, next)

      expect((req as any).user).toEqual(expect.objectContaining(payload))
    })

    it('should handle malformed Authorization header', () => {
      req.headers = {
        authorization: 'InvalidFormat', // No space, so token will be undefined
      }

      authenticateToken(req as Request, res as Response, next)

      // Should return 401 because token is extracted as undefined
      expect(res.status).toHaveBeenCalledWith(401)
      expect(next).not.toHaveBeenCalled()
    })

    it('should handle Bearer prefix case-insensitive', () => {
      const validToken = signToken({ id: 1 })

      req.headers = {
        authorization: `Bearer ${validToken}`,
      }

      authenticateToken(req as Request, res as Response, next)

      expect(next).toHaveBeenCalled()
    })
  })
})
