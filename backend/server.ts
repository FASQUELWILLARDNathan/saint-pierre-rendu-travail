import express from 'express'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const app = express()

const connectionString =
  process.env.DATABASE_URL || 'postgresql://nathanf:Nathan17111983!@postgres:5432/saintpierrestage'

const adapter = new PrismaPg({
  connectionString,
})

const prisma = new PrismaClient({ adapter })
const PORT = process.env.PORT || 3000

// Middleware
app.use(express.json())

// CORS pour le frontend
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  if (req.method === 'OPTIONS') {
    res.sendStatus(200)
  } else {
    next()
  }
})

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
    res.status(500).json({ error: String(error) })
  }
})

app.get('/api/users/:id', async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id_user: BigInt(req.params.id) },
      include: {
        eleve: true,
        professeur: true,
      },
    })
    if (!user) {
      res.status(404).json({ error: 'User not found' })
    } else {
      res.json(user)
    }
  } catch (error) {
    res.status(500).json({ error: String(error) })
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
    res.status(500).json({ error: String(error) })
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
    res.status(500).json({ error: String(error) })
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
    res.status(500).json({ error: String(error) })
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
    res.status(500).json({ error: String(error) })
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
    res.status(500).json({ error: String(error) })
  }
})

// Error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err)
  res.status(500).json({ error: 'Internal Server Error' })
})

// Start server
app.listen(PORT, () => {
  console.log(`🚀 API Server running on http://localhost:${PORT}`)
  console.log(`📚 Health check: http://localhost:${PORT}/api/health`)
})

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down gracefully...')
  await prisma.$disconnect()
  process.exit(0)
})
