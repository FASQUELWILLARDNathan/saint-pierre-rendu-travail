import express from 'express'
import { PrismaClient } from '@prisma/client'
import type { eleve } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import bcrypt from 'bcrypt'
import { signToken, startKeyRotation } from './jwt-manager'

const app = express()

const connectionString = process.env.DATABASE_URL
if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is required')
}

// Start JWT key rotation
startKeyRotation()

const adapter = new PrismaPg({
  connectionString,
})

const prisma = new PrismaClient({ adapter })
const PORT = process.env.PORT

app.use(express.json())

const ALLOWED_ORIGINS = (
  process.env.ALLOWED_ORIGINS || 'http://localhost:5173,http://localhost:3000'
).split(',')

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

app.use((req, res, next) => {
  const originalJson = res.json
  res.json = function (data: any) {
    return originalJson.call(
      this,
      JSON.parse(
        JSON.stringify(data, (key, value) => {
          if (typeof value === 'bigint') {
            return value.toString()
          }
          return value
        }),
      ),
    )
  }
  next()
})

function isValidBigInt(value: string): boolean {
  try {
    BigInt(value)
    return !isNaN(Number(value)) && Number(value) > 0
  } catch {
    return false
  }
}

// Routes API
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Authentication Routes
app.post('/auth/sign-up', async (req, res) => {
  try {
    const { nom, prenom, login, password, role, classe, annee } = req.body
    let eleve: eleve | undefined

    console.log('BODY SIGNUP:', req.body)
    console.log('CLASSE TYPE:', typeof classe, classe)
    console.log('ANNEE TYPE:', typeof annee, annee)

    if (!nom || !prenom || !login || !password || !role) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    if (role === 'eleve' && (!classe || !annee)) {
      return res.status(400).json({
        error: 'Classe et année obligatoires pour un élève',
      })
    }

    const existingUser = await prisma.utilisateur.findUnique({
      where: { login },
    })

    if (existingUser) {
      return res.status(409).json({ error: 'Login already exists' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    // 1. créer user
    const user = await prisma.utilisateur.create({
      data: {
        nom,
        prenom,
        login,
        hashed_password: hashedPassword,
        role,
      },
      include: {
        eleve: true,
        professeur: true,
      },
    })

    if (role === 'eleve') {
      const safeClasse = String(req.body.classe)
      const safeAnnee = String(req.body.annee)

      console.log('➡️ INSERT ELEVE:', {
        id_user: user.id_user,
        classe: safeClasse,
        annee: safeAnnee,
      })

      eleve = await prisma.eleve.create({
        data: {
          id_user: user.id_user,
          classe: safeClasse,
          annee: safeAnnee,
        },
      })
    }

    const token = signToken({ id_user: user.id_user.toString(), login: user.login })

    return res.json({
      token,
      user: {
        id_user: user.id_user.toString(),
        nom: user.nom,
        prenom: user.prenom,
        login: user.login,
        role: user.role,
        eleve: eleve,
      },
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Failed to sign up' })
  }
})

app.post('/auth/sign-in', async (req, res) => {
  try {
    const { login, password } = req.body

    if (!login || !password) {
      return res.status(400).json({ error: 'Missing login or password' })
    }

    const user = await prisma.utilisateur.findUnique({
      where: { login },
      include: {
        eleve: true,
        professeur: true,
      },
    })

    if (!user) {
      return res.status(401).json({ error: 'Invalid login or password' })
    }

    const isPasswordValid = await bcrypt.compare(password, user.hashed_password)

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid login or password' })
    }

    const token = signToken({ id_user: user.id_user.toString(), login: user.login })

    res.json({
      token,
      user: {
        id_user: user.id_user.toString(),
        nom: user.nom,
        prenom: user.prenom,
        login: user.login,
        role: user.role,
      },
    })
  } catch (error) {
    console.error('Error during sign in:', error)
    res.status(500).json({ error: 'Failed to sign in' })
  }
})

app.post('/auth/logout', async (req, res) => {
  try {
    res.json({ message: 'Logged out successfully' })
  } catch (error) {
    console.error('Error during logout:', error)
    res.status(500).json({ error: 'Failed to logout' })
  }
})

// Users
app.get('/api/users', async (req, res) => {
  try {
    const users = await prisma.utilisateur.findMany({
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

    const user = await prisma.utilisateur.findUnique({
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

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err)
  res.status(500).json({ error: 'Internal Server Error' })
})

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' })
})

const server = app.listen(PORT, () => {
  console.log(`🚀 API Server running on http://localhost:${PORT}`)
  console.log(`📚 Health check: http://localhost:${PORT}/api/health`)
})

const gracefulShutdown = async () => {
  console.log('\n🛑 Shutting down gracefully...')
  server.close(async () => {
    await prisma.$disconnect()
    console.log('✅ Server closed and database disconnected')
    process.exit(0)
  })

  setTimeout(() => {
    console.error('⚠️  Forcing shutdown')
    process.exit(1)
  }, 10000)
}

process.on('SIGINT', gracefulShutdown)
process.on('SIGTERM', gracefulShutdown)
