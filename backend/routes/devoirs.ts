import { Router } from 'express'
import { prisma } from '../config.ts'
import { authenticateToken } from '../middleware/auth.ts'
import { uploadDevoir } from '../middleware/uploadDevoir.ts'
import { authorizeRole } from '../middleware/role.ts'
import { toBigIntOrNull, resolveMathsVisibility } from '../utils.ts'
import { ZipArchive } from 'archiver'
import path from 'path'
import fs from 'fs'

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

/**
 * POST /api/devoirs - Créer un devoir (Professeur uniquement)
 * @body {string} id_cours - ID du cours
 * @body {string} nom_devoir - Nom du devoir
 * @body {string} [description_devoir] - Description optionnelle
 * @body {string} [date_limite] - Date limite optionnelle
 * @body {number} [coefficient] - Coefficient optionnel
 * @body {File[]} [fichiers] - Fichiers à joindre
 */
router.post(
  '/',
  authenticateToken,
  authorizeRole('professeur', 'administrateur'),
  uploadDevoir.array('fichiers', 10),
  async (req, res) => {
    try {
      const { nom_devoir, description_devoir, id_cours, date_limite, coefficient } = req.body

      if (!nom_devoir || !id_cours) {
        return res.status(400).json({ error: 'Champs manquants' })
      }

      const idCoursBigInt = toBigIntOrNull(id_cours)
      if (!idCoursBigInt) {
        return res.status(400).json({ error: 'ID cours invalide' })
      }

      const devoir = await prisma.devoir.create({
        data: {
          nom_devoir,
          description_devoir: description_devoir || null,
          date_limite: date_limite ? new Date(date_limite) : null,
          coefficient: coefficient ? Number(coefficient) : 1,
          cours: {
            connect: { id_cours: idCoursBigInt },
          },
        },
      })

      const files = req.files as Express.Multer.File[];

      if (files?.length) {
        await prisma.piece_jointe_devoir.createMany({
          data: files.map((f) => ({
            id_devoir: devoir.id_devoir,
            nom_fichier: f.originalname.slice(0, 254),
            chemin_fichier: `/devoirs/${f.filename}`.slice(0, 499),
            type_fichier: f.mimetype,
            taille_octets: toBigIntOrNull(f.size) || BigInt(0),
          })),
        })
      }

      res.json(devoir)
    } catch (e) {
      console.error(e)
      res.status(500).json({ error: 'Erreur serveur' })
    }
  },
)

router.put(
  '/:id',
  authenticateToken,
  authorizeRole('professeur', 'administrateur'),
  uploadDevoir.array('fichiers', 10),
  async (req, res) => {
    try {
      const { id } = req.params
      const { nom_devoir, description_devoir, date_limite, coefficient } = req.body

      const idDevoirBigInt = toBigIntOrNull(id)
      if (!idDevoirBigInt) {
        return res.status(400).json({ error: 'ID devoir invalide' })
      }

      // Vérifier que le devoir existe
      const existingDevoir = await prisma.devoir.findUnique({
        where: { id_devoir: idDevoirBigInt },
      })

      if (!existingDevoir) {
        return res.status(404).json({ error: 'Devoir non trouvé' })
      }

      // Mettre à jour le devoir
      const updatedDevoir = await prisma.devoir.update({
        where: { id_devoir: idDevoirBigInt },
        data: {
          nom_devoir: nom_devoir || existingDevoir.nom_devoir,
          description_devoir:
            description_devoir !== undefined
              ? description_devoir
              : existingDevoir.description_devoir,
          date_limite: date_limite ? new Date(date_limite) : existingDevoir.date_limite,
          coefficient: coefficient ? Number(coefficient) : existingDevoir.coefficient,
        },
      })

      // Gérer les nouveaux fichiers
      const files = req.files as Express.Multer.File[]
      if (files?.length) {
        await prisma.piece_jointe_devoir.createMany({
          data: files.map((f) => ({
            id_devoir: idDevoirBigInt,
            nom_fichier: f.originalname.slice(0, 254),
            chemin_fichier: `/devoirs/${f.filename}`.slice(0, 499),
            type_fichier: f.mimetype,
            taille_octets: toBigIntOrNull(f.size) || BigInt(0),
          })),
        })
      }


      res.json(updatedDevoir)
    } catch (e) {
      console.error(e)
      res.status(500).json({ error: 'Erreur serveur' })
    }
  },
)

router.get('/travaux-a-rendre', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.id_user

    if (!userId) {
      return res.status(401).json({ error: 'Non authentifié' })
    }

    const userIdBigInt = toBigIntOrNull(userId)
    if (!userIdBigInt) {
      return res.status(400).json({ error: 'ID utilisateur invalide' })
    }

    // Récupérer tous les devoirs qui n'ont pas été rendus par cet élève
    const devoirs = await prisma.devoir.findMany({
      where: {
        rendus: {
          none: {
            id_user: userIdBigInt,
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

    const userIdBigInt = toBigIntOrNull(userId)
    if (!userIdBigInt) {
      return res.status(400).json({ error: 'ID utilisateur invalide' })
    }

    const user = await prisma.utilisateur.findUnique({
      where: { id_user: userIdBigInt },
      select: { role: true },
    })

    if (!user) {
      return res.status(401).json({ error: 'Utilisateur introuvable' })
    }

    if (user.role === 'professeur') {
      const devoirs = await prisma.devoir.findMany({
        where: {
          cours: {
            is: {
              id_user: userIdBigInt,
            },
          },
        },
        include: {
          cours: coursSelect,
          pieceJointeDevoirs: true,
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

      const enriched = await Promise.all(
        devoirs.map(async (devoir) => {
          const expectedEleves = await getExpectedElevesForCours(devoir.cours)

          const renduIds = new Set((devoir.rendus ?? []).map((r: any) => String(r.id_user)))

          const elevesNonRendus = expectedEleves.filter((e) => !renduIds.has(String(e.id_user)))

          return {
            ...formatDevoirWithMatiere(devoir),
            eleves_non_rendus: elevesNonRendus,
          }
        }),
      )

      return res.json(enriched)
    }

    if (user.role !== 'eleve') {
      return res.status(403).json({ error: 'Non autorisé' })
    }

    const eleve = await prisma.eleve.findUnique({
      where: { id_user: userIdBigInt },
      include: {
        specialites: true,
        options: true,
        classe: {
          include: {
            matieres: true,
          },
        },
      },
    })

    if (!eleve) {
      return res.status(403).json({ error: 'Non autorisé' })
    }

    const specialiteIds = eleve.specialites.map((s) => s.id_specialite)
    const optionIds = eleve.options.map((o) => o.id_option)
    const matiereIds = (eleve.classe?.matieres ?? []).map((m) => m.id_matiere)

    const devoirs = await prisma.devoir.findMany({
      where: {
        cours: {
          is: {
            OR: [
              ...(specialiteIds.length ? [{ id_specialite: { in: specialiteIds } }] : []),

              ...(optionIds.length ? [{ id_option: { in: optionIds } }] : []),

              ...(matiereIds.length ? [{ id_matiere: { in: matiereIds } }] : []),
            ],
          },
        },
      },
      include: {
        cours: coursSelect,
        pieceJointeDevoirs: true,
        rendus: {
          where: { id_user: userIdBigInt },
          include: { pieces_jointes: true },
        },
      },
      orderBy: { date_limite: 'asc' },
    })

    return res.json(devoirs.map(formatDevoirWithMatiere))
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

router.get(
  '/:id/download-all-rendus',
  authenticateToken,
  authorizeRole('professeur', 'administrateur'),
  async (req, res) => {
    try {
      const id = toBigIntOrNull(req.params.id)
      if (!id) return res.status(400).json({ error: 'ID invalide' })

      const devoir = await prisma.devoir.findUnique({
        where: { id_devoir: id },
        include: {
          cours: true,
          rendus: {
            include: {
              eleve: {
                include: {
                  user: true,
                },
              },
              pieces_jointes: true,
            },
          },
        },
      })

      if (!devoir) {
        return res.status(404).json({ error: 'Devoir introuvable' })
      }

      res.setHeader('Content-Type', 'application/zip')
      res.setHeader('Content-Disposition', `attachment; filename="${devoir.nom_devoir}.zip"`)

      const archive = new ZipArchive({
        zlib: { level: 9 },
      })
      archive.pipe(res)

      for (const rendu of devoir.rendus) {
        const studentName = `${rendu.eleve.user.prenom} ${rendu.eleve.user.nom}`

        for (const file of rendu.pieces_jointes) {
          const filePath = path.join(process.cwd(), 'public', file.chemin_fichier)

          if (fs.existsSync(filePath)) {
            archive.file(filePath, {
              name: `${studentName}/${file.nom_fichier}`,
            })
          }
        }
      }

      await archive.finalize()
    } catch (err) {
      console.error(err)
      res.status(500).json({ error: 'Erreur serveur ZIP' })
    }
  },
)

export default router
