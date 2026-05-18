/**
 * Tests unitaires - Utilitaires backend
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'

describe('Backend Utils Tests', () => {
  describe('Email Utilities', () => {
    const generateEmail = (nom: string, prenom: string) => {
      return `${prenom.toLowerCase()}.${nom.toLowerCase()}@saint-pierre.fr`
    }

    it('should generate valid student email', () => {
      const email = generateEmail('Dupont', 'Jean')

      expect(email).toBe('jean.dupont@saint-pierre.fr')
      expect(email).toContain('@saint-pierre.fr')
    })

    it('should handle accents in names', () => {
      const email = generateEmail('Müller', 'Françoise')

      expect(email).toContain('@saint-pierre.fr')
    })

    it('should convert to lowercase', () => {
      const email = generateEmail('DUPONT', 'JEAN')

      expect(email).toBe('jean.dupont@saint-pierre.fr')
    })

    it('should handle special characters', () => {
      const email = generateEmail("O'Brien", 'Mary-Jane')

      expect(email).toContain('@saint-pierre.fr')
    })
  })

  describe('Password Utilities', () => {
    const validatePassword = (password: string) => {
      return (
        password.length >= 8 &&
        /[A-Z]/.test(password) &&
        /[a-z]/.test(password) &&
        /[0-9]/.test(password)
      )
    }

    it('should validate strong password', () => {
      const isValid = validatePassword('StrongPass123')

      expect(isValid).toBe(true)
    })

    it('should reject weak password', () => {
      const weakPasswords = ['short', 'lowercase123', 'UPPERCASE123', '12345678', 'NoNumbers']

      weakPasswords.forEach((pwd) => {
        expect(validatePassword(pwd)).toBe(false)
      })
    })

    it('should require minimum length', () => {
      expect(validatePassword('Pass123')).toBe(false)
      expect(validatePassword('Pass1234')).toBe(true)
    })

    it('should require uppercase letter', () => {
      expect(validatePassword('lowercase123')).toBe(false)
      expect(validatePassword('Lowercase123')).toBe(true)
    })

    it('should require lowercase letter', () => {
      expect(validatePassword('UPPERCASE123')).toBe(false)
      expect(validatePassword('Uppercase123')).toBe(true)
    })

    it('should require digit', () => {
      expect(validatePassword('Password')).toBe(false)
      expect(validatePassword('Password1')).toBe(true)
    })
  })

  describe('Date Utilities', () => {
    const isDateValid = (date: Date) => {
      return date instanceof Date && !isNaN(date.getTime())
    }

    const isDateInFuture = (date: Date) => {
      return date.getTime() > Date.now()
    }

    const getDaysUntil = (date: Date) => {
      const now = new Date()
      const diff = date.getTime() - now.getTime()
      return Math.ceil(diff / (1000 * 60 * 60 * 24))
    }

    it('should validate date', () => {
      expect(isDateValid(new Date())).toBe(true)
      expect(isDateValid(new Date('invalid'))).toBe(false)
    })

    it('should check if date is in future', () => {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)

      expect(isDateInFuture(tomorrow)).toBe(true)
      expect(isDateInFuture(new Date('2020-01-01'))).toBe(false)
    })

    it('should calculate days until date', () => {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)

      const days = getDaysUntil(tomorrow)

      expect(days).toBe(1)
    })
  })

  describe('String Utilities', () => {
    const slugify = (text: string) => {
      return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, '-')
        .replace(/[^\w-]/g, '')
    }

    const capitalize = (text: string) => {
      return text.charAt(0).toUpperCase() + text.slice(1)
    }

    const truncate = (text: string, length: number) => {
      return text.length > length ? text.substring(0, length) + '...' : text
    }

    it('should slugify text', () => {
      expect(slugify('Hello World')).toBe('hello-world')
      expect(slugify('Devoir Mathématiques')).toBe('devoir-mathematiques')
    })

    it('should capitalize first letter', () => {
      expect(capitalize('hello')).toBe('Hello')
      expect(capitalize('HELLO')).toBe('HELLO')
    })

    it('should truncate long text', () => {
      const text = 'This is a very long text'
      const result = truncate(text, 10)

      expect(result).toBe('This is a ...')
      expect(result).toHaveLength(13)
    })
  })

  describe('Array Utilities', () => {
    const groupBy = <T>(arr: T[], key: keyof T) => {
      return arr.reduce(
        (groups, item) => {
          const groupKey = String(item[key])
          groups[groupKey] = groups[groupKey] || []
          groups[groupKey].push(item)
          return groups
        },
        {} as Record<string, T[]>,
      )
    }

    const unique = <T>(arr: T[]) => {
      return [...new Set(arr)]
    }

    const flatten = <T>(arr: T[][]): T[] => {
      return arr.flat()
    }

    it('should group array by key', () => {
      const users = [
        { id: 1, role: 'eleve' },
        { id: 2, role: 'prof' },
        { id: 3, role: 'eleve' },
      ]

      const grouped = groupBy(users, 'role')

      expect(Object.keys(grouped)).toHaveLength(2)
      expect(grouped['eleve']).toHaveLength(2)
    })

    it('should get unique values', () => {
      expect(unique([1, 2, 2, 3, 3, 3])).toEqual([1, 2, 3])
      expect(unique(['a', 'b', 'a'])).toEqual(['a', 'b'])
    })

    it('should flatten nested array', () => {
      expect(
        flatten([
          [1, 2],
          [3, 4],
        ]),
      ).toEqual([1, 2, 3, 4])
      expect(flatten([['a'], ['b', 'c']])).toEqual(['a', 'b', 'c'])
    })
  })

  describe('Object Utilities', () => {
    const pick = <T extends Record<string, any>, K extends keyof T>(
      obj: T,
      keys: K[],
    ): Pick<T, K> => {
      const result = {} as Pick<T, K>
      keys.forEach((key) => {
        result[key] = obj[key]
      })
      return result
    }

    const omit = <T extends Record<string, any>, K extends keyof T>(obj: T, keys: K[]) => {
      const result = { ...obj }
      keys.forEach((key) => {
        delete result[key]
      })
      return result
    }

    it('should pick specific properties', () => {
      const user = { id: 1, name: 'Jean', email: 'jean@test.fr', password: 'secret' }
      const picked = pick(user, ['id', 'name', 'email'])

      expect(picked).toEqual({ id: 1, name: 'Jean', email: 'jean@test.fr' })
      expect((picked as any).password).toBeUndefined()
    })

    it('should omit specific properties', () => {
      const user = { id: 1, name: 'Jean', email: 'jean@test.fr', password: 'secret' }
      const omitted = omit(user, ['password'])

      expect(omitted.id).toBe(1)
      expect(omitted.password).toBeUndefined()
    })
  })

  describe('Number Utilities', () => {
    const clamp = (value: number, min: number, max: number) => {
      return Math.max(min, Math.min(max, value))
    }

    const round = (value: number, decimals: number) => {
      return Number(Math.round(Number(value + 'e' + decimals)) + 'e-' + decimals)
    }

    it('should clamp number between min and max', () => {
      expect(clamp(5, 0, 10)).toBe(5)
      expect(clamp(-5, 0, 10)).toBe(0)
      expect(clamp(15, 0, 10)).toBe(10)
    })

    it('should round to decimal places', () => {
      expect(round(3.14159, 2)).toBe(3.14)
      expect(round(2.5, 0)).toBe(3)
    })
  })

  describe('Validation Utilities', () => {
    const isEmail = (email: string) => {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    }

    const isPhone = (phone: string) => {
      return /^[0-9\-\+\(\)\s]{10,}$/.test(phone)
    }

    const isURL = (url: string) => {
      try {
        new URL(url)
        return true
      } catch {
        return false
      }
    }

    it('should validate email', () => {
      expect(isEmail('test@example.com')).toBe(true)
      expect(isEmail('invalid.email')).toBe(false)
      expect(isEmail('user@')).toBe(false)
    })

    it('should validate phone number', () => {
      expect(isPhone('0123456789')).toBe(true)
      expect(isPhone('01 23 45 67 89')).toBe(true)
      expect(isPhone('+33123456789')).toBe(true)
      expect(isPhone('123')).toBe(false)
    })

    it('should validate URL', () => {
      expect(isURL('https://example.com')).toBe(true)
      expect(isURL('http://localhost:3000')).toBe(true)
      expect(isURL('not a url')).toBe(false)
    })
  })

  describe('Type Utilities', () => {
    const getType = (value: any) => {
      return Object.prototype.toString.call(value).slice(8, -1)
    }

    const isObject = (value: any) => {
      return value !== null && typeof value === 'object' && !Array.isArray(value)
    }

    const isEmpty = (value: any) => {
      if (Array.isArray(value)) return value.length === 0
      if (typeof value === 'string') return value.trim().length === 0
      if (isObject(value)) return Object.keys(value).length === 0
      return !value
    }

    it('should detect type correctly', () => {
      expect(getType([])).toBe('Array')
      expect(getType({})).toBe('Object')
      expect(getType('string')).toBe('String')
      expect(getType(123)).toBe('Number')
      expect(getType(true)).toBe('Boolean')
    })

    it('should check if object', () => {
      expect(isObject({})).toBe(true)
      expect(isObject({ a: 1 })).toBe(true)
      expect(isObject([])).toBe(false)
      expect(isObject('string')).toBe(false)
    })

    it('should check if empty', () => {
      expect(isEmpty([])).toBe(true)
      expect(isEmpty({})).toBe(true)
      expect(isEmpty('')).toBe(true)
      expect(isEmpty('   ')).toBe(true)
      expect(isEmpty([1])).toBe(false)
      expect(isEmpty({ a: 1 })).toBe(false)
    })
  })
})
