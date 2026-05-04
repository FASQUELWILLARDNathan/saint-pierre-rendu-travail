import express from 'express'
import { prisma } from '../config.ts'

const router = express.Router()

// Get all users
router.get('/', async (req: express.Request, res: express.Response) => {
  try {
    const users = await prisma.utilisateur.findMany({
      include: {
        eleve: true,
        professeur: true,
      },
    })

    // Transform bigint to string for JSON serialization
    const formattedUsers = users.map((user) => ({
      ...user,
      id_user: user.id_user.toString(),
    }))

    res.json(formattedUsers)
  } catch (error) {
    console.error('Error fetching users:', error)
    res.status(500).json({ error: 'Failed to fetch users' })
  }
})

// Get user by ID
router.get('/:id', async (req: express.Request, res: express.Response) => {
  try {
    const { id } = req.params

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

    res.json({
      ...user,
      id_user: user.id_user.toString(),
    })
  } catch (error) {
    console.error('Error fetching user:', error)
    res.status(500).json({ error: 'Failed to fetch user' })
  }
})

export default router
