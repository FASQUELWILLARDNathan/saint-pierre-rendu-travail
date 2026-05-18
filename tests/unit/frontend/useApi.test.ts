import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useApi } from '../../../src/composables/useApi'
import { useStorage } from '../../../src/composables/useStorage'
import { mockUsers, mockAuthResponse } from '../../fixtures/mock-data'

/**
 * Tests for useApi composable - HTTP API client with JWT injection
 */

// Mock fetch globally
global.fetch = vi.fn()

// Mock environment variable
vi.stubGlobal('import', {
  meta: {
    env: {
      VITE_API_URL: 'http://localhost:3000',
    },
  },
})

describe('useApi Composable', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    document.cookie = ''
  })

  describe('Authentication Methods', () => {
    it('signIn should call POST /auth/sign-in with credentials', async () => {
      const mockFetch = vi.mocked(global.fetch)
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockAuthResponse,
      } as Response)

      const api = useApi()
      const result = await api.signIn({
        login: 'jdupont',
        password: 'password123',
      })

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/auth/sign-in',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            login: 'jdupont',
            password: 'password123',
          }),
        }),
      )
      expect(result.token).toBeDefined()
      expect(result.user).toBeDefined()
    })

    it('signUp should call POST /auth/sign-up with user data', async () => {
      const mockFetch = vi.mocked(global.fetch)
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockAuthResponse,
      } as Response)

      const api = useApi()
      const signUpData = {
        nom: 'Dupont',
        prenom: 'Jean',
        login: 'jdupont',
        password: 'SecurePass123!',
        role: 'eleve' as const,
        classe: '2nde A',
        annee: 2026,
        email: 'dupont.jean@cs-saintpierrecalais.fr',
      }

      const result = await api.signUp(signUpData)

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/auth/sign-up',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(signUpData),
        }),
      )
      expect(result.token).toBeDefined()
    })

    it('logout should call POST /auth/logout', async () => {
      const mockFetch = vi.mocked(global.fetch)
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      } as Response)

      const api = useApi()
      await api.logout()

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/auth/logout',
        expect.objectContaining({
          method: 'POST',
        }),
      )
    })
  })

  describe('Request Headers', () => {
    it('should inject JWT token in Authorization header when available', async () => {
      const storage = useStorage()
      const testToken = 'jwt-token-test-123'
      storage.set('token', testToken)

      const mockFetch = vi.mocked(global.fetch)
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: 'test' }),
      } as Response)

      const api = useApi()
      await api.getCours()

      // Verify Authorization header contains the token
      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: `Bearer ${testToken}`,
            'Content-Type': 'application/json',
          }),
        }),
      )
    })

    it('should not include Authorization header when token is missing', async () => {
      const mockFetch = vi.mocked(global.fetch)
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: 'test' }),
      } as Response)

      const api = useApi()
      await api.getCours()

      // Verify no Authorization header
      const callArgs = mockFetch.mock.calls[0][1] as RequestInit
      expect(callArgs.headers).not.toHaveProperty('Authorization')
    })

    it('should include Content-Type header', async () => {
      const mockFetch = vi.mocked(global.fetch)
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      } as Response)

      const api = useApi()
      await api.getCours()

      const callArgs = mockFetch.mock.calls[0][1] as RequestInit
      expect((callArgs.headers as Record<string, string>)['Content-Type']).toBe('application/json')
    })
  })

  describe('Data Retrieval Methods', () => {
    beforeEach(() => {
      const mockFetch = vi.mocked(global.fetch)
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ data: 'test' }),
      } as Response)
    })

    it('getCours should call GET /api/cours', async () => {
      const mockFetch = vi.mocked(global.fetch)
      const api = useApi()
      await api.getCours()

      expect(mockFetch).toHaveBeenCalledWith('http://localhost:3000/api/cours', expect.any(Object))
    })

    it('getDevoirs should call GET /api/devoirs', async () => {
      const mockFetch = vi.mocked(global.fetch)
      const api = useApi()
      await api.getDevoirs()

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/devoirs',
        expect.any(Object),
      )
    })

    it('getEleves should call GET /api/eleves', async () => {
      const mockFetch = vi.mocked(global.fetch)
      const api = useApi()
      await api.getEleves()

      expect(mockFetch).toHaveBeenCalledWith('http://localhost:3000/api/eleves', expect.any(Object))
    })

    it('getProfesseurs should call GET /api/professeurs', async () => {
      const mockFetch = vi.mocked(global.fetch)
      const api = useApi()
      await api.getProfesseurs()

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/professeurs',
        expect.any(Object),
      )
    })

    it('getUsers should call GET /api/users', async () => {
      const mockFetch = vi.mocked(global.fetch)
      const api = useApi()
      await api.getUsers()

      expect(mockFetch).toHaveBeenCalledWith('http://localhost:3000/api/users', expect.any(Object))
    })

    it('getClasses should call GET /api/profile/classes', async () => {
      const mockFetch = vi.mocked(global.fetch)
      const api = useApi()
      await api.getClasses()

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/profile/classes',
        expect.any(Object),
      )
    })

    it('getMatieres should call GET /api/profile/matieres', async () => {
      const mockFetch = vi.mocked(global.fetch)
      const api = useApi()
      await api.getMatieres()

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/profile/matieres',
        expect.any(Object),
      )
    })
  })

  describe('Error Handling', () => {
    it('should throw error on 4xx response', async () => {
      const mockFetch = vi.mocked(global.fetch)
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ message: 'Unauthorized' }),
      } as Response)

      const api = useApi()
      await expect(api.getCours()).rejects.toThrow('Unauthorized')
    })

    it('should throw error on 5xx response', async () => {
      const mockFetch = vi.mocked(global.fetch)
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ message: 'Internal Server Error' }),
      } as Response)

      const api = useApi()
      await expect(api.getCours()).rejects.toThrow('Internal Server Error')
    })

    it('should throw error with status code if no message provided', async () => {
      const mockFetch = vi.mocked(global.fetch)
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({}),
      } as Response)

      const api = useApi()
      await expect(api.getCours()).rejects.toThrow('Erreur 404')
    })

    it('should handle JSON parse errors gracefully', async () => {
      const mockFetch = vi.mocked(global.fetch)
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 503,
        json: async () => {
          throw new Error('Parse error')
        },
      } as Response)

      const api = useApi()
      await expect(api.getCours()).rejects.toThrow('Erreur 503')
    })
  })

  describe('Response Parsing', () => {
    it('should properly parse successful response', async () => {
      const mockFetch = vi.mocked(global.fetch)
      const expectedData = { id: 1, nom: 'Mathématiques' }
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => expectedData,
      } as Response)

      const api = useApi()
      const result = await api.getCours()

      expect(result).toEqual(expectedData)
    })

    it('should preserve data types in response', async () => {
      const mockFetch = vi.mocked(global.fetch)
      const mockResponse = {
        id: 123,
        nom: 'Test',
        actif: true,
        createdAt: '2026-05-18T10:00:00Z',
        note: 18.5,
      }
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response)

      const api = useApi()
      const result = await api.getCours()

      expect(typeof result.id).toBe('number')
      expect(typeof result.nom).toBe('string')
      expect(typeof result.actif).toBe('boolean')
      expect(typeof result.note).toBe('number')
    })
  })
})
