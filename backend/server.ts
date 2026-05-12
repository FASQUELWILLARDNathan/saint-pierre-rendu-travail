import 'dotenv/config'
import express from 'express'
import { prisma, PORT } from './config.ts'
import { corsMiddleware } from './middleware/cors.ts'
import { bigintMiddleware } from './middleware/bigint.ts'
import authRoutes from './routes/auth.ts'
import usersRoutes from './routes/users.ts'
import devoirsRoutes from './routes/devoirs.ts'
import evenementsRoutes from './routes/evenements.ts'
import profilRoutes from './routes/profil.ts'

const app = express()

// Trust proxy pour récupérer l'IP réelle derrière un proxy/load balancer
app.set('trust proxy', 1)

// Middleware
app.use(express.json())
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
