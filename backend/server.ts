import 'dotenv/config'
import express from 'express'
import { prisma, PORT } from './config.ts'
import { bigintMiddleware } from './middleware/bigint.ts'
import { startCronJobs } from './services/cron-manager.ts'
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
import { cleanupRendusFolder } from './services/cleanup-rendus.ts'
import { cleanupDevoirsFolder } from './services/cleanup-devoirs.ts'
import { cleanupCoursFolder } from './services/cleanup-cours.ts'
import path from 'path'
import cookieParser from 'cookie-parser'
import helmet from 'helmet'
import { authenticateToken } from './middleware/auth.ts'
import { securityHeaders } from './middleware/security-headers.ts'
import { auditAdminActions } from './middleware/admin-audit.ts'
import { requestSizeLimit } from './middleware/request-size-limit.ts'
import { sanitizeInputs } from './middleware/xss-protection.ts'
import { generateCsrfToken, verifyCsrfToken } from './middleware/csrf-protection.ts'
import { corsMiddleware } from './middleware/cors.ts'
import swaggerUi from 'swagger-ui-express'
import YAML from 'yamljs'

const app = express()
const swaggerDocument = YAML.load('./swagger.yaml')

// Trust proxy pour récupérer l'IP réelle derrière un proxy/load balancer
app.set('trust proxy', 1)

app.use(corsMiddleware)

// Parser les données
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ limit: '50mb', extended: true }))
app.use(cookieParser())

// Middlewares de sécurité (APRÈS CORS)
app.use(securityHeaders) // Helmet
app.use(sanitizeInputs) // Protection XSS
app.use(bigintMiddleware)

// BigInt middleware
app.use(bigintMiddleware)

// Health check (SANS authentification)
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.use('/auth', authRoutes) // Routes d'auth (pas d'authenticateToken ici)
app.use(authenticateToken)

// Middlewares d'authentification/audit (SEULEMENT après les routes publiques)
app.use(generateCsrfToken) // Générer token CSRF pour les admins
app.use(auditAdminActions) // Audit logging

// Routes
app.use('/api/users', usersRoutes)
app.use('/api/devoirs', devoirsRoutes)
app.use('/api/evenements', evenementsRoutes)
app.use('/api/profile', profilRoutes)
app.use('/api/messages', messagesRoutes)
app.use('/api/matieres', matieresRoutes)
app.use('/api/cours', coursRoutes)
app.use('/api/import', importRoutes)
app.use('/cours', express.static('/app/public/cours'))
app.use('/public', express.static('/app/public'))
app.use('/api/rendus', rendusRoutes)
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))

// Gestion des erreurs
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Erreur non prise en charge:', err)
  res.status(500).json({ error: 'Erreur serveur interne' })
})

// 404
app.use((req, res) => {
  res.status(404).json({ error: 'Route non trouvée' })
})

// Lancement du serveur
const server = app.listen(PORT, () => {
  console.log(`Api serveur tournant sur  http://localhost:${PORT}`)
  console.log(`Health check: http://localhost:${PORT}/api/health`)

  // Démarrer les tâches cron
  startCronJobs()
  cleanupRendusFolder()
  cleanupDevoirsFolder()
  cleanupCoursFolder()
})

// Shutdown
const gracefulShutdown = async () => {
  console.log('\nShutting down...')
  server.close(async () => {
    await prisma.$disconnect()
    console.log('Serveur et base de données fermés')
    process.exit(0)
  })

  setTimeout(() => {
    console.error('Shutdown forcé')
    process.exit(1)
  }, 10000)
}

process.on('SIGINT', gracefulShutdown)
process.on('SIGTERM', gracefulShutdown)
