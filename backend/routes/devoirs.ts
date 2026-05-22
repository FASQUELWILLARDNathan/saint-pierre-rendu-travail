import { Router } from 'express'
import { prisma } from '../config.ts'
import { authenticateToken } from '../middleware/auth.ts'

const router = Router()

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
        matiere: {
          select: {
            id_matiere: true,
            nom_matiere: true,
            couleur: true,
            devoir_icon_url: true,
          },
        },
        cours: {
          select: {
            id_cours: true,
            nom_cours: true,
          },
        },
      },
      orderBy: {
        date_limite: 'asc',
      },
      take: 10,
    })

    // Formater les devoirs pour la réponse
    const travauxFormattes = devoirs.map((devoir) => ({
      id: devoir.id_devoir.toString(),
      titre: devoir.nom_devoir,
      matiere: devoir.matiere.nom_matiere,
      dateLimit: devoir.date_limite
        ? new Date(devoir.date_limite).toLocaleString('fr-FR')
        : 'Date non définie',
      description: devoir.description_devoir,
      matiereColor: devoir.matiere.couleur,
      matiereIcon: devoir.matiere.devoir_icon_url,
    }))

    res.json(travauxFormattes)
  } catch (error) {
    console.error('Erreur lors de la récupération des travaux:', error)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

// Get tous les devoirs pour une matière spécifique
router.get('/matiere/:matiereId', authenticateToken, async (req, res) => {
  try {
    const { matiereId } = req.params

    const devoirs = await prisma.devoir.findMany({
      where: {
        id_matiere: BigInt(matiereId),
      },
      include: {
        matiere: true,
        cours: true,
      },
    })

    res.json(devoirs)
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
      where.id_matiere = BigInt(id)
    } else if (kind === 'specialite') {
      const specialiteId = await resolveBigInt(id, 'specialite')
      if (!specialiteId) return res.json([])
      where.id_specialite = specialiteId
    } else if (kind === 'option') {
      const optionId = await resolveBigInt(id, 'option')
      if (!optionId) return res.json([])
      where.id_option = optionId
    } else {
      return res.json([])
    }

    const devoirs = await prisma.devoir.findMany({
      where,
      include: {
        matiere: true,
        cours: true,
      },
      orderBy: {
        date_limite: 'asc',
      },
    })

    res.json(devoirs)
  } catch (error) {
    console.error('Erreur lors de la récupération des devoirs par catégorie:', error)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

export default router
