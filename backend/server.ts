import express from 'express'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const app = express()

const connectionString = process.env.DATABASE_URL
if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is required')
}

const adapter = new PrismaPg({
  connectionString,
})

const prisma = new PrismaClient({ adapter })
const PORT = process.env.PORT || 3000

// Middleware
app.use(express.json())

// CORS - Accepter seulement le frontend local
const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000',
]

app.use((req, res, next) => {
  const origin = req.headers.origin

  if (ALLOWED_ORIGINS.includes(origin as string)) {
    res.header('Access-Control-Allow-Origin', origin)
  }

  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.header('Access-Control-Allow-Credentials', 'true')

  if (req.method === 'OPTIONS') {
    res.sendStatus(200)
  } else {
    next()
  }
})

// Utility functions
function isValidBigInt(value: string): boolean {
  try {
    BigInt(value)
    return !isNaN(Number(value)) && Number(value) > 0
  } catch {
    return false
  }
}

// Routes API

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Users
app.get('/api/users', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      include: {
        eleve: true,
        professeur: true,
      },
    })
    res.json(users)
  } catch (error) {
    console.error('Error fetching users:', error)
    res.status(500).json({ error: 'Failed to fetch users' })
  }
})

app.get('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params

    if (!isValidBigInt(id)) {
      return res.status(400).json({ error: 'Invalid user ID' })
    }

    const user = await prisma.user.findUnique({
      where: { id_user: BigInt(id) },
      include: {
        eleve: true,
        professeur: true,
      },
    })

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    res.json(user)
  } catch (error) {
    console.error('Error fetching user:', error)
    res.status(500).json({ error: 'Failed to fetch user' })
  }
})

// Professeurs
app.get('/api/professeurs', async (req, res) => {
  try {
    const professeurs = await prisma.professeur.findMany({
      include: {
        user: true,
        cours: true,
      },
    })
    res.json(professeurs)
  } catch (error) {
    console.error('Error fetching professeurs:', error)
    res.status(500).json({ error: 'Failed to fetch professeurs' })
  }
})

// Élèves
app.get('/api/eleves', async (req, res) => {
  try {
    const eleves = await prisma.eleve.findMany({
      include: {
        user: true,
        rendus: true,
      },
    })
    res.json(eleves)
  } catch (error) {
    console.error('Error fetching eleves:', error)
    res.status(500).json({ error: 'Failed to fetch eleves' })
  }
})

// Cours
app.get('/api/cours', async (req, res) => {
  try {
    const cours = await prisma.cours.findMany({
      include: {
        professeur: {
          include: {
            user: true,
          },
        },
        devoirs: true,
      },
    })
    res.json(cours)
  } catch (error) {
    console.error('Error fetching cours:', error)
    res.status(500).json({ error: 'Failed to fetch cours' })
  }
})

// Devoirs
app.get('/api/devoirs', async (req, res) => {
  try {
    const devoirs = await prisma.devoir.findMany({
      include: {
        cours: {
          include: {
            professeur: {
              include: {
                user: true,
              },
            },
          },
        },
        rendus: true,
      },
    })
    res.json(devoirs)
  } catch (error) {
    console.error('Error fetching devoirs:', error)
    res.status(500).json({ error: 'Failed to fetch devoirs' })
  }
})

// Rendus
app.get('/api/rendus', async (req, res) => {
  try {
    const rendus = await prisma.rendu.findMany({
      include: {
        devoir: {
          include: {
            cours: true,
          },
        },
        eleve: {
          include: {
            user: true,
          },
        },
      },
    })
    res.json(rendus)
  } catch (error) {
    console.error('Error fetching rendus:', error)
    res.status(500).json({ error: 'Failed to fetch rendus' })
  }
})

// Global error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err)
  res.status(500).json({ error: 'Internal Server Error' })
})

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' })
})

// Start server
const server = app.listen(PORT, () => {
  console.log(`🚀 API Server running on http://localhost:${PORT}`)
  console.log(`📚 Health check: http://localhost:${PORT}/api/health`)
})

// Graceful shutdown
const gracefulShutdown = async () => {
  console.log('\n🛑 Shutting down gracefully...')
  server.close(async () => {
    await prisma.$disconnect()
    console.log('✅ Server closed and database disconnected')
    process.exit(0)
  })

  // Force close after 10 seconds
  setTimeout(() => {
    console.error('⚠️  Forcing shutdown')
    process.exit(1)
  }, 10000)
}

process.on('SIGINT', gracefulShutdown)
process.on('SIGTERM', gracefulShutdown)
