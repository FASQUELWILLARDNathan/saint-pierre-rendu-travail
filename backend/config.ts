import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { startKeyRotation } from './jwt-manager.ts'

// Configuration de la base de données
const connectionString = process.env.DATABASE_URL
if (!connectionString) {
  throw new Error('La variable d environnement DATABASE_URL est requis ')
}

const adapter = new PrismaPg({
  connectionString,
})

export const prisma = new PrismaClient({ adapter })

// Configuration de l'API
export const PORT = process.env.PORT
export const NODE_ENV = process.env.NODE_ENV

// Configuration du CORS
export const ALLOWED_ORIGINS = [
  'http://cssaintpierrecalais.fr:8079',
  'http://localhost:5173',
]

// Initialisation des services
startKeyRotation()

console.log(`Configue chargé: NODE_ENV=${NODE_ENV}, PORT=${PORT}`)
