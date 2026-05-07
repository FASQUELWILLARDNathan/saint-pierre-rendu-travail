import express from 'express'
import { prisma } from '../config.ts'

const router = express.Router()

// Recupere tous les utilisateurs
router.get('/', async (req: express.Request, res: express.Response) => {
  try {
    const users = await prisma.utilisateur.findMany({
      include: {
        eleve: true,
        professeur: true,
      },
    })

    // Transforme les BigInt en String 
    const formattedUsers = users.map((user) => ({
      ...user,
      id_user: user.id_user.toString(),
    }))

    res.json(formattedUsers)
  } catch (error) {
    console.error('Erreur lors de la recherche d utilisateur:', error)
    res.status(500).json({ error: 'Echec lors de la recherche d utilisateur' })
  }
})

// Recupere l'utilisateur par son ID
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
      return res.status(404).json({ error: 'Utilisateur non trouvé' })
    }

    res.json({
      ...user,
      id_user: user.id_user.toString(),
    })
  } catch (error) {
    console.error('Erreur lors de la recherche d utilisateur:', error)
    res.status(500).json({ error: 'Echec lors de la recherche d utilisateur' })
  }
})

export default router
