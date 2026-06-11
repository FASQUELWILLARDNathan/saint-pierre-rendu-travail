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

// GET /api/profile/onboarding-status - Check if user needs onboarding
router.get('/onboarding-status', authenticateToken, async (req: Request, res: Response) => {
  const userId = req.user?.id_user
  const user = await prisma.utilisateur.findUnique({
    where: { id_user: BigInt(userId) },
    include: { professeur: true },
  })

  if (user?.role === 'professeur') {
    if (user.professeur) {
      await prisma.professeur.update({
        where: { id_user: BigInt(userId) },
        data: {
          already_connected: true,
        },
      })
      res.json({ needs_onboarding: !user.professeur.already_connected })
    } else {
      // Si le professeur n'existe pas, il faut créer l'entrée
      await prisma.professeur.create({
        data: {
          id_user: BigInt(userId),
          already_connected: false,
        },
      })
      res.json({ needs_onboarding: true })
    }
  } else {
    res.json({ needs_onboarding: false })
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
      try {
        await prisma.$transaction(async (tx) => {
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
              const currentEleve = await tx.eleve.findUnique({
                where: { id_user: BigInt(userId) },
                select: { id_classe: true },
              })
              classId = currentEleve?.id_classe?.toString()
            }

            if (classId) {
              const classe = await tx.classe.findUnique({
                where: { id_classe: BigInt(classId) },
                select: { nom_classe: true },
              })

              if (classe) {
                const level = getSchoolLevel(classe.nom_classe)

                if (level === 'college' || level === 'seconde') {
                  // No specialites allowed
                  if (specialites.length > 0) {
                    throw new Error('Les spécialités ne sont pas disponibles pour cette classe')
                  }
                } else if (level === 'premiere') {
                  // Exactly 3 specialites required
                  if (specialites.length !== 3) {
                    throw new Error('Vous devez sélectionner exactement 3 spécialités en première')
                  }
                } else if (level === 'terminale') {
                  // Exactly 2 specialites required
                  if (specialites.length !== 2) {
                    throw new Error('Vous devez sélectionner exactement 2 spécialités en terminale')
                  }
                }
              }
            }

            // Delete all existing specialites
            await tx.eleveSpecialite.deleteMany({
              where: { id_eleve: BigInt(userId) },
            })
            // Create new specialites
            if (specialites.length > 0) {
              await Promise.all(
                specialites.map((id: any) =>
                  tx.eleveSpecialite.create({
                    data: {
                      id_eleve: BigInt(userId),
                      id_specialite: BigInt(id),
                    },
                  }),
                ),
              )
            }
          }

          if (Array.isArray(options)) {
            // Delete all existing options
            await tx.eleveOption.deleteMany({
              where: { id_eleve: BigInt(userId) },
            })
            // Create new options
            if (options.length > 0) {
              await Promise.all(
                options.map((id: any) =>
                  tx.eleveOption.create({
                    data: {
                      id_eleve: BigInt(userId),
                      id_option: BigInt(id),
                    },
                  }),
                ),
              )
            }
          }

          if (Object.keys(eleveUpdate).length > 0) {
            await tx.eleve.update({
              where: { id_user: BigInt(userId) },
              data: eleveUpdate,
            })
          }
        })
      } catch (err: any) {
        return res.status(400).json({ error: err.message })
      }
    }

    // Update professeur-specific data (only for professeurs)
    if (user.role === 'professeur') {
      await prisma.$transaction(async (tx) => {
        // Ensure professeur exists
        const prof = await tx.professeur.findUnique({
          where: { id_user: BigInt(userId) },
        })

        if (!prof) {
          await tx.professeur.create({
            data: {
              id_user: BigInt(userId),
              already_connected: true,
              matiere: matiere || null,
            },
          })
        } else {
          // Update basic info
          await tx.professeur.update({
            where: { id_user: BigInt(userId) },
            data: {
              already_connected: true,
              matiere: matiere || null,
            },
          })
        }

        // Handle classes_enseignees
        if (Array.isArray(classes_enseignees)) {
          // Delete all existing connections
          await tx.classeProfesseur.deleteMany({
            where: { id_professeur: BigInt(userId) },
          })
          // Create new connections
          if (classes_enseignees.length > 0) {
            await Promise.all(
              classes_enseignees.map((id: any) =>
                tx.classeProfesseur.create({
                  data: {
                    id_professeur: BigInt(userId),
                    id_classe: BigInt(id),
                  },
                }),
              ),
            )
          }
        }

        // Handle specialites_enseignees
        if (Array.isArray(specialites_enseignees)) {
          // Delete all existing connections
          await tx.professeurSpecialite.deleteMany({
            where: { id_professeur: BigInt(userId) },
          })
          // Create new connections
          if (specialites_enseignees.length > 0) {
            await Promise.all(
              specialites_enseignees.map((id: any) =>
                tx.professeurSpecialite.create({
                  data: {
                    id_professeur: BigInt(userId),
                    id_specialite: BigInt(id),
                  },
                }),
              ),
            )
          }
        }

        // Handle options_enseignees
        if (Array.isArray(options_enseignees)) {
          // Delete all existing connections
          await tx.professeurOption.deleteMany({
            where: { id_professeur: BigInt(userId) },
          })
          // Create new connections
          if (options_enseignees.length > 0) {
            await Promise.all(
              options_enseignees.map((id: any) =>
                tx.professeurOption.create({
                  data: {
                    id_professeur: BigInt(userId),
                    id_option: BigInt(id),
                  },
                }),
              ),
            )
          }
        }
      })
    }

    res.json({ message: 'Profil mis à jour avec succès' })
  } catch (error) {
    console.error('Erreur lors de la mise à jour du profil:', error)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

router.post('/test-promotion', authenticateToken, async (req: Request, res: Response) => {
  try {
    if (req.user?.role !== 'administrateur') {
      return res.status(403).json({ error: 'Accès interdit' })
    }
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
