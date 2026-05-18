import { PrismaClient } from '@prisma/client'
import { mockDeep, mockReset } from 'vitest-mock-extended'
import { beforeEach, vi } from 'vitest'

export const mockPrisma = mockDeep<PrismaClient>()

beforeEach(() => {
  mockReset(mockPrisma)
})
