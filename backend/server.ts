import 'dotenv/config'
import express from 'express'
import { prisma, PORT } from './config.ts'
import { corsMiddleware } from './middleware/cors.ts'
import { bigintMiddleware } from './middleware/bigint.ts'
import authRoutes from './routes/auth.ts'
import usersRoutes from './routes/users.ts'

const app = express()

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

// Error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err)
  res.status(500).json({ error: 'Internal Server Error' })
})

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' })
})

// Server startup
const server = app.listen(PORT, () => {
  console.log(`API Server running on http://localhost:${PORT}`)
  console.log(`Health check: http://localhost:${PORT}/api/health`)
})

// Graceful shutdown
const gracefulShutdown = async () => {
  console.log('\nShutting down gracefully...')
  server.close(async () => {
    await prisma.$disconnect()
    console.log('Server closed and database disconnected')
    process.exit(0)
  })

  setTimeout(() => {
    console.error('Forcing shutdown')
    process.exit(1)
  }, 10000)
}

process.on('SIGINT', gracefulShutdown)
process.on('SIGTERM', gracefulShutdown)
