import { Router } from 'express'
import { prisma } from '../config.ts'
import { authenticateToken } from '../middleware/auth.ts'
import { uploadDevoir } from '../middleware/uploadDevoir.ts'

const router = Router()

const matiereSelect = {
  select: {
    id_matiere: true,
    nom_matiere: true,
    couleur: true,
    icon_url: true,
    devoir_icon_url: true,
  },
}

const coursSelect = {
  select: {
    id_cours: true,
    nom_cours: true,
    id_matiere: true,
    id_classe: true,
    id_specialite: true,
    id_option: true,
    matiere: matiereSelect,
    specialite: {
      select: {
        id_specialite: true,
        nom_specialite: true,
      },
    },
    option: {
      select: {
        id_option: true,
        nom_option: true,
      },
    },
  },
}

function getDevoirCategoryMeta(devoir: any) {
  if (devoir.cours?.matiere) {
    return {
      nom: devoir.cours.matiere.nom_matiere,
      couleur: devoir.cours.matiere.couleur ?? '#CCCCCC',
      devoirIcon: devoir.cours.matiere.devoir_icon_url ?? '/other-devoir-icon.svg',
      matiere: devoir.cours.matiere,
    }
  }

  if (devoir.cours?.specialite) {
    return {
      nom: devoir.cours.specialite.nom_specialite,
      couleur: '#70BEFA',
      devoirIcon: '/other-devoir-icon.svg',
      matiere: {
        nom_matiere: devoir.cours.specialite.nom_specialite,
      },
    }
  }

  if (devoir.cours?.option) {
    return {
      nom: devoir.cours.option.nom_option,
      couleur: '#70BEFA',
      devoirIcon: '/other-devoir-icon.svg',
      matiere: {
        nom_matiere: devoir.cours.option.nom_option,
      },
    }
  }

  return {
    nom: 'Catégorie inconnue',
    couleur: '#CCCCCC',
    devoirIcon: '/other-devoir-icon.svg',
    matiere: null,
  }
}

async function getExpectedElevesForCours(cours: any) {
  if (cours.id_classe) {
    const eleves = await prisma.eleve.findMany({
      where: { id_classe: cours.id_classe },
      include: {
        user: {
          select: {
            id_user: true,
            nom: true,
            prenom: true,
            login: true,
          },
        },
      },
    })

    return eleves
      .filter((eleve) => eleve.user)
      .map((eleve) => ({
        id_user: eleve.id_user.toString(),
        nom: eleve.user.nom,
        prenom: eleve.user.prenom,
        login: eleve.user.login,
      }))
  }

  if (cours.id_specialite) {
    const eleves = await prisma.eleve.findMany({
      where: {
        specialites: {
          some: {
            id_specialite: cours.id_specialite,
          },
        },
      },
      include: {
        user: {
          select: {
            id_user: true,
            nom: true,
            prenom: true,
            login: true,
          },
        },
      },
    })

    return eleves
      .filter((eleve) => eleve.user)
      .map((eleve) => ({
        id_user: eleve.id_user.toString(),
        nom: eleve.user.nom,
        prenom: eleve.user.prenom,
        login: eleve.user.login,
      }))
  }

  if (cours.id_option) {
    const eleves = await prisma.eleve.findMany({
      where: {
        options: {
          some: {
            id_option: cours.id_option,
          },
        },
      },
      include: {
        user: {
          select: {
            id_user: true,
            nom: true,
            prenom: true,
            login: true,
          },
        },
      },
    })

    return eleves
      .filter((eleve) => eleve.user)
      .map((eleve) => ({
        id_user: eleve.id_user.toString(),
        nom: eleve.user.nom,
        prenom: eleve.user.prenom,
        login: eleve.user.login,
      }))
  }

  if (cours.id_matiere) {
    const eleves = await prisma.eleve.findMany({
      where: {
        classe: {
          matieres: {
            some: {
              id_matiere: cours.id_matiere,
            },
          },
        },
      },
      include: {
        user: {
          select: {
            id_user: true,
            nom: true,
            prenom: true,
            login: true,
          },
        },
      },
    })

    return eleves
      .filter((eleve) => eleve.user)
      .map((eleve) => ({
        id_user: eleve.id_user.toString(),
        nom: eleve.user.nom,
        prenom: eleve.user.prenom,
        login: eleve.user.login,
      }))
  }

  return []
}

function formatDevoirWithMatiere(devoir: any) {
  const category = getDevoirCategoryMeta(devoir)

  return {
    ...devoir,
    matiere: category.matiere,
  }
}

router.post('/', authenticateToken, uploadDevoir.array('fichiers', 10), async (req, res) => {
  try {
    const { nom_devoir, description_devoir, id_cours, date_limite, coefficient } = req.body

    if (!nom_devoir || !id_cours) {
      return res.status(400).json({ error: 'Champs manquants' })
    }

    const devoir = await prisma.devoir.create({
      data: {
        nom_devoir,
        description_devoir: description_devoir || null,
        date_limite: date_limite ? new Date(date_limite) : null,
        coefficient: coefficient ? Number(coefficient) : 1,
        cours: {
          connect: { id_cours: BigInt(id_cours) },
        },
      },
    })

    const files = req.files as Express.Multer.File[]

    if (files?.length) {
      console.log('PIECES MODELS:', Object.keys(prisma))
      await prisma.piece_jointe_devoir.createMany({
        data: files.map((f) => ({
          id_devoir: devoir.id_devoir,
          nom_fichier: f.originalname,
          chemin_fichier: `/devoirs/${f.filename}`,
          type_fichier: f.mimetype,
          taille_octets: BigInt(f.size),
        })),
      })
    }

    res.json(devoir)
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

// Get tous les devoirs (travaux à rendre) pour un élève
// Triés par date limite en ordre croissant
router.get('/travaux-a-rendre', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.id_user

    if (!userId) {
      return res.status(401).json({ error: 'Non authentifié' })
    }

    // Récupérer tous les devoirs qui n'ont pas été rendus par cet élève
    const devoirs = await prisma.devoir.findMany({
      where: {
        rendus: {
          none: {
            id_user: BigInt(userId),
          },
        },
      },
      include: {
        cours: coursSelect,
        pieceJointeDevoirs: true,
      },
      orderBy: {
        date_limite: 'asc',
      },
      take: 10,
    })

    // Formater les devoirs pour la réponse
    const travauxFormattes = devoirs.map((devoir) => {
      const category = getDevoirCategoryMeta(devoir)

      return {
        id: devoir.id_devoir.toString(),
        titre: devoir.nom_devoir,
        matiere: category.nom,
        dateLimit: devoir.date_limite
          ? new Date(devoir.date_limite).toLocaleString('fr-FR')
          : 'Date non définie',
        description: devoir.description_devoir,
        matiereColor: category.couleur,
        matiereIcon: category.devoirIcon,
      }
    })

    res.json(travauxFormattes)
  } catch (error) {
    console.error('Erreur lors de la récupération des travaux:', error)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

// GET tous les devoirs d'un élève (rendus et non rendus)
router.get('/mes-devoirs', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.id_user

    if (!userId) {
      return res.status(401).json({ error: 'Non authentifié' })
    }

    const user = await prisma.utilisateur.findUnique({
      where: { id_user: BigInt(userId) },
      select: { role: true },
    })

    if (!user) {
      return res.status(401).json({ error: 'Utilisateur introuvable' })
    }

    if (user.role === 'professeur') {
      const devoirsProf = await prisma.devoir.findMany({
        where: {
          cours: {
            is: {
              id_user: BigInt(userId),
            },
          },
        },
        include: {
          cours: coursSelect,
          piece_jointe_devoir: true,
          rendus: {
            include: {
              pieces_jointes: true,
              eleve: {
                include: {
                  user: {
                    select: {
                      id_user: true,
                      nom: true,
                      prenom: true,
                      login: true,
                    },
                  },
                },
              },
            },
          },
        },
        orderBy: { date_limite: 'asc' },
      })

      const devoirsProfAvecAbsents = await Promise.all(
        devoirsProf.map(async (devoir) => {
          const expectedEleves = await getExpectedElevesForCours(devoir.cours)
          const renduIds = new Set((devoir.rendus ?? []).map((rendu: any) => String(rendu.id_user)))
          const elevesNonRendus = expectedEleves.filter(
            (eleve) => !renduIds.has(String(eleve.id_user)),
          )

          return {
            ...formatDevoirWithMatiere(devoir),
            eleves_non_rendus: elevesNonRendus,
          }
        }),
      )

      return res.json(devoirsProfAvecAbsents)
    }

    if (user.role !== 'eleve') {
      return res.status(403).json({ error: 'Non autorisé' })
    }

    const eleve = await prisma.eleve.findUnique({
      where: { id_user: BigInt(userId) },
      include: { classe: true },
    })

    if (!eleve) return res.status(403).json({ error: 'Non autorisé' })

    // Récupère les profs de la classe
    const profsDeClasse = await prisma.classeProfesseur.findMany({
      where: { id_classe: eleve.id_classe! },
      select: { id_professeur: true },
    })
    const profIds = profsDeClasse.map((p) => p.id_professeur)

    const devoirs = await prisma.devoir.findMany({
      where: {
        cours: {
          is: {
            id_user: { in: profIds },
          },
        },
      },
      include: {
        cours: coursSelect,
        piece_jointe_devoir: true,
        rendus: {
          where: { id_user: BigInt(userId) },
          include: { pieces_jointes: true },
        },
      },
      orderBy: { date_limite: 'asc' },
    })

    res.json(devoirs.map(formatDevoirWithMatiere))
  } catch (error) {
    console.error('Erreur mes-devoirs:', error)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

// Get tous les devoirs pour une matière spécifique
router.get('/matiere/:matiereId', authenticateToken, async (req, res) => {
  try {
    const { matiereId } = req.params

    const devoirs = await prisma.devoir.findMany({
      where: {
        cours: {
          is: {
            id_matiere: BigInt(matiereId),
          },
        },
      },
      include: {
        cours: coursSelect,
        pieceJointeDevoirs: true,
      },
    })

    res.json(devoirs.map(formatDevoirWithMatiere))
  } catch (error) {
    console.error('Erreur lors de la récupération des devoirs:', error)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

router.get('/categorie', authenticateToken, async (req, res) => {
  try {
    const kind = String(req.query.kind ?? '')
    const id = String(req.query.id ?? '')

    if (!kind || !id) {
      return res.json([])
    }

    const resolveBigInt = async (value: string, model: 'specialite' | 'option') => {
      if (/^\d+$/.test(value)) return BigInt(value)

      if (model === 'specialite') {
        const specialite = await prisma.specialite.findFirst({
          where: {
            nom_specialite: {
              mode: 'insensitive',
              equals: value,
            },
          },
          select: { id_specialite: true },
        })
        return specialite?.id_specialite ?? null
      }

      const option = await prisma.option.findFirst({
        where: {
          nom_option: {
            mode: 'insensitive',
            equals: value,
          },
        },
        select: { id_option: true },
      })
      return option?.id_option ?? null
    }

    const where: any = {}
    if (kind === 'matiere') {
      where.cours = { is: { id_matiere: BigInt(id) } }
    } else if (kind === 'specialite') {
      const specialiteId = await resolveBigInt(id, 'specialite')
      if (!specialiteId) return res.json([])
      where.cours = { is: { id_specialite: specialiteId } }
    } else if (kind === 'option') {
      const optionId = await resolveBigInt(id, 'option')
      if (!optionId) return res.json([])
      where.cours = { is: { id_option: optionId } }
    } else {
      return res.json([])
    }

    const devoirs = await prisma.devoir.findMany({
      where,
      include: {
        cours: coursSelect,
        pieceJointeDevoirs: true,
      },
      orderBy: {
        date_limite: 'asc',
      },
    })

    res.json(devoirs.map(formatDevoirWithMatiere))
  } catch (error) {
    console.error('Erreur lors de la récupération des devoirs par catégorie:', error)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

router.delete('/:id', async (req, res) => {
  const id = Number(req.params.id)

  await prisma.devoir.delete({
    where: { id_devoir: id },
  })

  res.json({ success: true })
})

export default router
