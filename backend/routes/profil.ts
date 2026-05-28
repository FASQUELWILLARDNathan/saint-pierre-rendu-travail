import { type Request, type Response, Router } from 'express'
import { prisma } from '../config.ts'
import { authenticateToken } from '../middleware/auth.ts'
import { promoteStudents } from '../services/cron-manager.ts'

const router = Router()

// Helper function to get school level from class name
function getSchoolLevel(
  className: string,
): 'college' | 'seconde' | 'premiere' | 'terminale' | null {
  const lowerName = className.toLowerCase()

  if (
    lowerName.includes('6ème') ||
    lowerName.includes('5ème') ||
    lowerName.includes('4ème') ||
    lowerName.includes('3ème')
  ) {
    return 'college'
  }

  if (lowerName.includes('seconde')) {
    return 'seconde'
  }

  if (lowerName.includes('première') || lowerName.includes('1ère')) {
    return 'premiere'
  }

  if (lowerName.includes('terminale') || lowerName.includes('tale')) {
    return 'terminale'
  }

  return null
}

// GET /api/profil/matieres - Get all matieres
router.get('/matieres', async (req: Request, res: Response) => {
  try {
    const matieres = await prisma.matiere.findMany({
      orderBy: {
        nom_matiere: 'asc',
      },
    })

    res.json(matieres)
  } catch (error) {
    console.error('Erreur lors de la récupération des matières:', error)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

// GET /api/profil/classes - Get all classes
router.get('/classes', async (req: Request, res: Response) => {
  try {
    const classes = await prisma.classe.findMany()

    // Custom sort: Terminale > Première > Seconde > College (3ème > 4ème > 5ème > 6ème)
    const levelOrder: { [key: string]: number } = {
      terminale: 0,
      premiere: 1,
      seconde: 2,
      college: 3,
    }

    const sorted = classes.sort((a, b) => {
      const levelA = getSchoolLevel(a.nom_classe) || 'college'
      const levelB = getSchoolLevel(b.nom_classe) || 'college'

      const orderA = levelOrder[levelA]
      const orderB = levelOrder[levelB]

      // If same level, sort by name
      if (orderA === orderB) {
        return a.nom_classe.localeCompare(b.nom_classe, 'fr')
      }

      return orderA - orderB
    })

    res.json(sorted)
  } catch (error) {
    console.error('Erreur lors de la récupération des classes:', error)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

// GET /api/profil/specialites - Get all specialites
router.get('/specialites', async (req: Request, res: Response) => {
  try {
    const specialites = await prisma.specialite.findMany({
      orderBy: {
        nom_specialite: 'asc',
      },
    })

    res.json(specialites)
  } catch (error) {
    console.error('Erreur lors de la récupération des spécialités:', error)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

// GET /api/profil/options - Get all options
router.get('/options', async (req: Request, res: Response) => {
  try {
    const options = await prisma.option.findMany({
      orderBy: {
        nom_option: 'asc',
      },
    })

    res.json(options)
  } catch (error) {
    console.error('Erreur lors de la récupération des options:', error)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

// GET /api/profil - Get current user profil
router.get('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id_user

    if (!userId) {
      return res.status(401).json({ error: 'Non authentifié' })
    }

    const user = await prisma.utilisateur.findUnique({
      where: { id_user: BigInt(userId) },
      select: {
        id_user: true,
        nom: true,
        prenom: true,
        email: true,
        role: true,
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
        professeur: {
          select: {
            matiere: true,
            classes_enseignees: {
              select: {
                classe: {
                  select: {
                    id_classe: true,
                    nom_classe: true,
                  },
                },
              },
            },
            specialites_enseignees: {
              select: {
                specialite: {
                  select: {
                    id_specialite: true,
                    nom_specialite: true,
                  },
                },
              },
            },
            options_enseignees: {
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
    })

    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' })
    }

    // Convertir les BigInt en string et construire le profil
    const profil: any = {
      id_user: user.id_user.toString(),
      nom: user.nom,
      prenom: user.prenom,
      email: user.email,
      role: user.role,
    }

    // Ajouter les données élève si l'utilisateur en est un
    if (user.eleve) {
      profil.id_classe = user.eleve.id_classe?.toString() || null
      profil.specialites = user.eleve.specialites.map((s) => s.specialite) || []
      profil.options = user.eleve.options.map((o) => o.option) || []
    }

    // Ajouter les données professeur si l'utilisateur en est un
    if (user.professeur) {
      profil.matiere = user.professeur.matiere

      profil.classes_enseignees =
        user.professeur.classes_enseignees?.map((c: any) => ({
          ...c.classe,
          id_classe: c.classe.id_classe.toString(),
        })) || []

      profil.specialites_enseignees =
        user.professeur.specialites_enseignees?.map((s: any) => ({
          ...s.specialite,
          id_specialite: s.specialite.id_specialite.toString(),
        })) || []

      profil.options_enseignees =
        user.professeur.options_enseignees?.map((o: any) => ({
          ...o.option,
          id_option: o.option.id_option.toString(),
        })) || []
    }

    res.json(profil)
  } catch (error) {
    console.error('Erreur lors de la récupération du profil:', error)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

// PUT /api/profil - Update current user profil
router.put('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id_user
    const {
      nom,
      prenom,
      email,
      id_classe,
      specialites,
      options,
      matiere,
      classes_enseignees,
      specialites_enseignees,
      options_enseignees,
    } = req.body

    if (!userId) {
      return res.status(401).json({ error: 'Non authentifié' })
    }

    // Get user role
    const user = await prisma.utilisateur.findUnique({
      where: { id_user: BigInt(userId) },
      select: { role: true },
    })

    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' })
    }

    // Update user basic info
    await prisma.utilisateur.update({
      where: { id_user: BigInt(userId) },
      data: {
        nom: nom || undefined,
        prenom: prenom || undefined,
        email: email || undefined,
      },
    })

    // Update eleve-specific data (only for eleves)
    if (user.role === 'eleve' && (specialites || options || id_classe !== undefined)) {
      const eleveUpdate: any = {}

      if (id_classe !== undefined) {
        eleveUpdate.id_classe = id_classe ? BigInt(id_classe) : null
      }

      // Validate specialites based on school level
      if (Array.isArray(specialites)) {
        // Get the class to determine school level
        let classId = id_classe
        if (classId === undefined || classId === null) {
          // If not updating class, get current class
          const currentEleve = await prisma.eleve.findUnique({
            where: { id_user: BigInt(userId) },
            select: { id_classe: true },
          })
          classId = currentEleve?.id_classe?.toString()
        }

        if (classId) {
          const classe = await prisma.classe.findUnique({
            where: { id_classe: BigInt(classId) },
            select: { nom_classe: true },
          })

          if (classe) {
            const level = getSchoolLevel(classe.nom_classe)

            if (level === 'college' || level === 'seconde') {
              // No specialites allowed
              if (specialites.length > 0) {
                return res.status(400).json({
                  error: 'Les spécialités ne sont pas disponibles pour cette classe',
                })
              }
            } else if (level === 'premiere') {
              // Exactly 3 specialites required
              if (specialites.length !== 3) {
                return res
                  .status(400)
                  .json({ error: 'Vous devez sélectionner exactement 3 spécialités en première' })
              }
            } else if (level === 'terminale') {
              // Exactly 2 specialites required
              if (specialites.length !== 2) {
                return res
                  .status(400)
                  .json({ error: 'Vous devez sélectionner exactement 2 spécialités en terminale' })
              }
            }
          }
        }

        eleveUpdate.specialites = {
          deleteMany: {},
          create: specialites.map((id: any) => ({
            id_specialite: BigInt(id),
          })),
        }
      }

      if (Array.isArray(options)) {
        eleveUpdate.options = {
          deleteMany: {},
          create: options.map((id: any) => ({
            id_option: BigInt(id),
          })),
        }
      }

      if (Object.keys(eleveUpdate).length > 0) {
        await prisma.eleve.update({
          where: { id_user: BigInt(userId) },
          data: eleveUpdate,
        })
      }
    }

    // Update professeur-specific data (only for professeurs)
    if (user.role === 'professeur') {
      const profUpdate: any = {}

      if (matiere !== undefined) {
        profUpdate.matiere = matiere || null
      }

      if (Array.isArray(classes_enseignees)) {
        profUpdate.classes_enseignees = {
          deleteMany: {},
          create: classes_enseignees.map((id: any) => ({
            id_classe: BigInt(id),
          })),
        }
      }

      if (Array.isArray(specialites_enseignees)) {
        profUpdate.specialites_enseignees = {
          deleteMany: {},
          create: specialites_enseignees.map((id: any) => ({
            id_specialite: BigInt(id),
          })),
        }
      }

      if (Array.isArray(options_enseignees)) {
        profUpdate.options_enseignees = {
          deleteMany: {},
          create: options_enseignees.map((id: any) => ({
            id_option: BigInt(id),
          })),
        }
      }

      if (Object.keys(profUpdate).length > 0) {
        await prisma.professeur.update({
          where: { id_user: BigInt(userId) },
          data: profUpdate,
        })
      }
    }

    res.json({ message: 'Profil mis à jour avec succès' })
  } catch (error) {
    console.error('Erreur lors de la mise à jour du profil:', error)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

router.post('/test-promotion', async (req, res) => {
  try {
    await promoteStudents()

    res.json({
      message: 'Promotion exécutée',
    })
  } catch (error) {
    console.error(error)

    res.status(500).json({
      error: 'Erreur test promotion',
    })
  }
})

export default router
