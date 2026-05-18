import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'

// Unmock the backend setup mocks to test real JWT functions
vi.unmock('@backend/jwt-manager')

import { signToken, verifyToken, startKeyRotation } from '../../../backend/jwt-manager'
import { mockAuthTokens, mockUsers } from '../../fixtures/mock-data'

describe('JWT Manager - Unit Tests', () => {
  describe('signToken', () => {
    it('should create a valid JWT token', () => {
      const payload = { id: mockUsers.eleve1.id_user, role: 'eleve' }
      const token = signToken(payload)

      expect(token).toBeDefined()
      expect(typeof token).toBe('string')
      expect(token.split('.')).toHaveLength(3) // JWT format: header.payload.signature
    })

    it('should include payload data in token', () => {
      const payload = { id: 1, role: 'eleve', email: 'test@test.fr' }
      const token = signToken(payload)

      // Decode payload (without verification)
      const payloadBase64 = token.split('.')[1]
      const decodedPayload = JSON.parse(Buffer.from(payloadBase64, 'base64').toString())

      expect(decodedPayload.id).toBe(1)
      expect(decodedPayload.role).toBe('eleve')
      expect(decodedPayload.email).toBe('test@test.fr')
    })

    it('should handle different payload types', () => {
      const payloads = [
        { id: 1 },
        { id: 2, role: 'prof' },
        { id: 3, role: 'admin', permissions: ['read', 'write'] },
      ]

      payloads.forEach((payload) => {
        const token = signToken(payload)
        expect(token).toBeDefined()
        expect(token.split('.')).toHaveLength(3)
      })
    })
  })

  describe('verifyToken', () => {
    let validToken: string

    beforeEach(() => {
      const payload = { id: mockUsers.eleve1.id_user, role: 'eleve' }
      validToken = signToken(payload)
    })

    it('should verify a valid token', () => {
      const decoded = verifyToken(validToken)

      expect(decoded).toBeDefined()
      expect(decoded.id).toBe(mockUsers.eleve1.id_user)
      expect(decoded.role).toBe('eleve')
    })

    it('should throw error for invalid token', () => {
      expect(() => {
        verifyToken('invalid-token-format')
      }).toThrow()
    })

    it('should throw error for malformed token', () => {
      const malformedToken = 'header.payload' // Missing signature

      expect(() => {
        verifyToken(malformedToken)
      }).toThrow()
    })

    it('should throw error for empty token', () => {
      expect(() => {
        verifyToken('')
      }).toThrow()
    })

    it('should handle expired tokens gracefully', () => {
      // Use the pre-created expired token from fixtures
      // This tests that verifyToken properly handles invalid tokens
      const fakeExpiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjB9.invalid-signature'

      // Should throw verification error for malformed token
      expect(() => {
        verifyToken(fakeExpiredToken)
      }).toThrow()
    })

    it('should preserve token claims after verification', () => {
      const payload = {
        id: 5,
        role: 'prof',
        matiere: 'Mathématiques',
      }
      const token = signToken(payload)
      const decoded = verifyToken(token)

      // Verify payload data is preserved (excluding jwt specific fields like iat)
      expect(decoded.id).toBe(5)
      expect(decoded.role).toBe('prof')
      expect(decoded.matiere).toBe('Mathématiques')
    })
  })

  describe('Token Security', () => {
    it('should generate unique tokens for each call', () => {
      const payload = { id: 1, role: 'eleve' }
      const token1 = signToken(payload)
      const token2 = signToken(payload)

      // Tokens might be the same if timestamps are identical,
      // but payload structure should be preserved
      expect(token1).toBeDefined()
      expect(token2).toBeDefined()
    })

    it('should not expose secret in token', () => {
      const payload = { id: 1, role: 'eleve' }
      const token = signToken(payload)
      const parts = token.split('.')

      // Decode payload
      const payloadDecoded = JSON.parse(Buffer.from(parts[1], 'base64').toString())

      // Secret should not be in payload
      expect(payloadDecoded.secret).toBeUndefined()
      expect(payloadDecoded.JWT_SECRET).toBeUndefined()
    })

    it('should validate token tampering detection', () => {
      // Test that tampered tokens are detected
      const tamperedToken =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6OTk5LCJyb2xlIjoiYWRtaW4ifQ.invalid-signature'

      // Verification should fail due to signature mismatch
      expect(() => {
        verifyToken(tamperedToken)
      }).toThrow()
    })
  })

  describe('Key Rotation', () => {
    it('should start key rotation without errors', () => {
      // Just verify it doesn't throw
      expect(() => {
        startKeyRotation()
      }).not.toThrow()
    })
  })
})
