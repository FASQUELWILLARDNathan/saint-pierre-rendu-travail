import express from 'express'
import { prisma } from '../config.ts'

const router = express.Router()

// GET /api/users/eleves/list - Get all eleves with their data (MUST BE BEFORE /:id)
router.get('/eleves/list', async (req: express.Request, res: express.Response) => {
  try {
    const users = await prisma.utilisateur.findMany({
      where: { role: 'eleve' },
      select: {
        id_user: true,
        nom: true,
        prenom: true,
        email: true,
        eleve: {
          select: {
            id_classe: true,
            specialites: {
              select: {
                specialite: {
                  select: {
                    id_specialite: true,
                    nom_specialite: true,
                  },
                },
              },
            },
            options: {
              select: {
                option: {
                  select: {
                    id_option: true,
                    nom_option: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        nom: 'asc',
      },
    })

    // Format the response
    const formattedUsers = users.map((user) => ({
      id_user: user.id_user.toString(),
      nom: user.nom,
      prenom: user.prenom,
      email: user.email,
      id_classe: user.eleve?.id_classe?.toString() || null,
      specialites: user.eleve?.specialites.map((s) => s.specialite) || [],
      options: user.eleve?.options.map((o) => o.option) || [],
    }))

    res.json(formattedUsers)
  } catch (error) {
    console.error('Erreur lors de la récupération des élèves:', error)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

// Recupere tous les utilisateurs
router.get('/', async (req: express.Request, res: express.Response) => {
  try {
    const users = await prisma.utilisateur.findMany({
      select: {
        id_user: true,
        nom: true,
        prenom: true,
        login: true,
        email: true,
        role: true,

        eleve: {
          select: {
            id_user: true,
            classe: true,
            annee: true,
          },
        },

        professeur: {
          select: {
            id_user: true,
            matiere: true,
          },
        },
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
      select: {
        id_user: true,
        nom: true,
        prenom: true,
        login: true,
        email: true,
        role: true,

        eleve: {
          select: {
            id_user: true,
            classe: true,
            annee: true,
          },
        },

        professeur: {
          select: {
            id_user: true,
            matiere: true,
          },
        },
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

// PUT /api/users/:id - Update a user (for admins/profs to update eleves)
router.put('/:id', async (req: express.Request, res: express.Response) => {
  try {
    const { id } = req.params
    const { nom, prenom, email, id_classe, specialites, options } = req.body

    // Update user basic info
    await prisma.utilisateur.update({
      where: { id_user: BigInt(id) },
      data: {
        nom: nom || undefined,
        prenom: prenom || undefined,
        email: email || undefined,
      },
    })

    // Update eleve data
    if (id_classe !== undefined || specialites || options) {
      const eleveUpdate: any = {}

      if (id_classe !== undefined) {
        eleveUpdate.id_classe = id_classe ? BigInt(id_classe) : null
      }

      if (Array.isArray(specialites)) {
        eleveUpdate.specialites = {
          deleteMany: {},
          create: specialites.map((sid: any) => ({
            id_specialite: BigInt(sid),
          })),
        }
      }

      if (Array.isArray(options)) {
        eleveUpdate.options = {
          deleteMany: {},
          create: options.map((oid: any) => ({
            id_option: BigInt(oid),
          })),
        }
      }

      if (Object.keys(eleveUpdate).length > 0) {
        await prisma.eleve.update({
          where: { id_user: BigInt(id) },
          data: eleveUpdate,
        })
      }
    }

    res.json({ message: 'Utilisateur mis à jour avec succès' })
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'utilisateur:", error)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

export default router
