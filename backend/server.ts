import 'dotenv/config'
import express from 'express'
import { prisma, PORT } from './config.ts'
import { corsMiddleware } from './middleware/cors.ts'
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
import path from 'path'

const app = express()

// Trust proxy pour récupérer l'IP réelle derrière un proxy/load balancer
app.set('trust proxy', 1)

// Middleware
// Skip JSON parsing for multipart/form-data (used for file uploads with multer)
app.use((req, res, next) => {
  const contentType = req.headers['content-type']
  if (contentType && contentType.includes('multipart/form-data')) {
    return next()
  }
  return express.json()(req, res, next)
})
app.use(corsMiddleware)
app.use(bigintMiddleware)

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Routes
app.use('/auth', authRoutes)
app.use('/api/users', usersRoutes)
app.use('/api/devoirs', devoirsRoutes)
app.use('/api/evenements', evenementsRoutes)
app.use('/api/profile', profilRoutes)
app.use('/api/messages', messagesRoutes)
app.use('/api/matieres', matieresRoutes)
app.use('/api/cours', coursRoutes)
app.use('/cours', express.static('/app/public/cours'))
app.use('/public', express.static('/app/public'))
app.use('/api/rendus', rendusRoutes)

// Error de gestion
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Condition d erreur non pris en charge:', err)
  res.status(500).json({ error: 'Erreur serveur interne' })
})

// Gestion 404
app.use((req, res) => {
  res.status(404).json({ error: 'Route non trouvé' })
})

// Lancement du serveur
const server = app.listen(PORT, () => {
  console.log(`Api serveur tournant sur  http://localhost:${PORT}`)
  console.log(`Health check: http://localhost:${PORT}/api/health`)

  // Démarrer les tâches cron
  startCronJobs()
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
