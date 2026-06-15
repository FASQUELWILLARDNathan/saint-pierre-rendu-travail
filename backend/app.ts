import express from 'express'
import { bigintMiddleware } from './middleware/bigint.ts'
import authRoutes from './routes/auth.ts'
import usersRoutes from './routes/users.ts'
import devoirsRoutes from './routes/devoirs.ts'
import evenementsRoutes from './routes/evenements.ts'
import profilRoutes from './routes/profil.ts'
import messagesRoutes from './routes/messages.ts'
import matieresRoutes from './routes/matieres.ts'
import coursRoutes from './routes/cours.ts'
import rendusRoutes from './routes/rendus.ts'
import importRoutes from './routes/import.ts'
import cookieParser from 'cookie-parser'
import { authenticateToken } from './middleware/auth.ts'
import { securityHeaders } from './middleware/security-headers.ts'
import { sanitizeInputs } from './middleware/xss-protection.ts'
import { generateCsrfToken } from './middleware/csrf-protection.ts'
import { corsMiddleware } from './middleware/cors.ts'
import swaggerUi from 'swagger-ui-express'
import YAML from 'yamljs'
import type { Request, Response, NextFunction } from 'express'
import publicRoutes from './routes/public.routes.ts'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const swaggerPath = path.join(__dirname, '../swagger.yaml')

const app = express()
const swaggerDocument = YAML.load(swaggerPath)

// Trust proxy
app.set('trust proxy', 1)

// CORS
app.use(corsMiddleware)

// Body parsing
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ limit: '50mb', extended: true }))
app.use(cookieParser())

// Security
app.use(securityHeaders)
app.use(bigintMiddleware)

// Health check (public)
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Public routes
app.use('/auth', authRoutes)
app.use('/api', publicRoutes)

// Auth middleware
app.use(authenticateToken)

// CSRF + XSS pour tout le monde
app.use(generateCsrfToken)
app.use(sanitizeInputs)

// Protected routes
app.use('/api/users', usersRoutes)
app.use('/api/devoirs', devoirsRoutes)
app.use('/api/evenements', evenementsRoutes)
app.use('/api/profile', profilRoutes)
app.use('/api/messages', messagesRoutes)
app.use('/api/matieres', matieresRoutes)
app.use('/api/cours', coursRoutes)
app.use('/api/rendus', rendusRoutes)
app.use('/api/import', importRoutes)

// Static
app.use('/cours', express.static('/app/public/cours'))
app.use('/public', express.static('/app/public'))

// Swagger
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))

// Error handler
app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
  console.error('Erreur non prise en charge:', err)
  res.status(500).json({ error: 'Erreur serveur interne' })
})

// 404
app.use((req, res) => {
  res.status(404).json({ error: 'Route non trouvée' })
})

export default app
