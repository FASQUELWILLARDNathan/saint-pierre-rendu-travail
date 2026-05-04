import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { startKeyRotation } from './jwt-manager.ts'

// Database Configuration
const connectionString = process.env.DATABASE_URL
if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is required')
}

const adapter = new PrismaPg({
  connectionString,
})

export const prisma = new PrismaClient({ adapter })

// API Configuration
export const PORT = process.env.PORT
export const NODE_ENV = process.env.NODE_ENV

// CORS Configuration
export const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : []

// Initialize services
startKeyRotation()

console.log(`🔧 Config loaded: NODE_ENV=${NODE_ENV}, PORT=${PORT}`)
