import { Router } from 'express'
import { prisma } from '../config.ts'
import { authenticateToken } from '../middleware/auth.ts'

const router = Router()

/**
 * GET /api/evenements/a-venir - Récupérer les 10 prochains événements
 */
router.get('/a-venir', authenticateToken, async (req, res) => {
  try {
    const maintenant = new Date()

    // Récupérer les événements futurs
    const evenements = await prisma.evenement.findMany({
      where: {
        date_evenement: {
          gte: maintenant,
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
      orderBy: {
        date_evenement: 'asc',
      },
      take: 10,
    })

    // Formater les événements pour la réponse
    const evenementsFormattes = evenements.map((evt) => {
      let categorieName = ''
      let categorieColor = ''
      let categorieIcon = ''

      if (evt.matiere) {
        categorieName = evt.matiere.nom_matiere ?? ''
        categorieColor = evt.matiere.couleur ?? ''
        categorieIcon = evt.icon_url ?? ''
      } else if (evt.specialite) {
        categorieName = evt.specialite.nom_specialite ?? ''
        categorieColor = '#8B7355'
        categorieIcon = evt.icon_url ?? ''
      } else if (evt.option) {
        categorieName = evt.option.nom_option ?? ''
        categorieColor = '#556B7D'
        categorieIcon = evt.icon_url ?? ''
      }

      return {
        id: evt.id_evenement.toString(),
        titre: evt.nom_evenement,
        matiere: categorieName,
        date: new Date(evt.date_evenement).toLocaleString('fr-FR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
        description: evt.description,
        type: evt.type_evenement,
        duree: evt.duree_minutes,
        matiereColor: categorieColor,
        matiereIcon: categorieIcon,
      }
    })

    res.json(evenementsFormattes)
  } catch (error) {
    console.error('Erreur lors de la récupération des événements:', error)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

// Get tous les événements pour une matière spécifique
router.get('/matiere/:matiereId', authenticateToken, async (req, res) => {
  try {
    const { matiereId } = req.params

    const evenements = await prisma.evenement.findMany({
      where: {
        id_matiere: BigInt(matiereId),
      },
      include: {
        matiere: true,
      },
      orderBy: {
        date_evenement: 'asc',
      },
    })

    res.json(evenements)
  } catch (error) {
    console.error('Erreur lors de la récupération des événements:', error)
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
      where.id_specialite = BigInt(specialiteId)
    } else if (kind === 'option') {
      const optionId = await resolveBigInt(id, 'option')
      if (!optionId) return res.json([])
      where.id_option = BigInt(optionId)
    } else {
      return res.json([])
    }

    const evenements = await prisma.evenement.findMany({
      where,
      include: {
        matiere: true,
        specialite: true,
        option: true,
      },
      orderBy: {
        date_evenement: 'asc',
      },
    })

    // Retourner les événements bruts (même forme que /matiere/:id)
    res.json(evenements)
  } catch (error) {
    console.error('Erreur lors de la récupération des événements par catégorie:', error)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

// Créer un événement depuis un cours
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      id_cours,
      nom_evenement,
      type_evenement,
      date_evenement,
      description,
      duree_minutes,
      icon_url,
    } = req.body
    const userId = req.user?.id_user

    if (!id_cours || !nom_evenement || !type_evenement || !date_evenement) {
      return res.status(400).json({ error: 'Paramètres obligatoires manquants' })
    }

    // Récupérer le cours pour vérifier que l'utilisateur en est le professeur
    const cours = await prisma.cours.findUnique({
      where: { id_cours: BigInt(id_cours) },
      select: {
        id_user: true,
        id_matiere: true,
      },
    })

    if (!cours) {
      return res.status(404).json({ error: 'Cours non trouvé' })
    }

    // Vérifier que l'utilisateur est le professeur du cours
    if (cours.id_user !== BigInt(userId)) {
      return res.status(403).json({ error: 'Non autorisé' })
    }

    // Créer l'événement avec la matière du cours
    const evenement = await prisma.evenement.create({
      data: {
        id_matiere: cours.id_matiere!,
        nom_evenement,
        type_evenement,
        date_evenement: new Date(date_evenement),
        description: description || null,
        duree_minutes: duree_minutes ? Number(duree_minutes) : null,
        icon_url: icon_url || null,
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
      },
    })

    res.status(201).json({
      id: evenement.id_evenement.toString(),
      titre: evenement.nom_evenement,
      type: evenement.type_evenement,
      date: evenement.date_evenement,
      description: evenement.description,
      duree: evenement.duree_minutes,
      matiere: evenement.matiere?.nom_matiere,
      matiereColor: evenement.matiere?.couleur,
      matiereIcon: evenement.icon_url || evenement.matiere?.devoir_icon_url,
    })
  } catch (error) {
    console.error("Erreur lors de la création d'événement:", error)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

// Créer un événement directement pour une matière, spécialité ou option
router.post('/matiere', authenticateToken, async (req, res) => {
  try {
    const {
      id_matiere,
      nom_evenement,
      type_evenement,
      date_evenement,
      description,
      duree_minutes,
      icon_url,
    } = req.body
    const userId = req.user?.id_user

    if (!id_matiere || !nom_evenement || !type_evenement || !date_evenement) {
      return res.status(400).json({ error: 'Paramètres obligatoires manquants' })
    }

    // Vérifier que l'utilisateur a au moins un cours avec cette matière
    const cours = await prisma.cours.findFirst({
      where: {
        id_user: BigInt(userId),
        id_matiere: BigInt(id_matiere),
      },
    })

    if (!cours) {
      return res.status(403).json({ error: 'Non autorisé' })
    }

    // Créer l'événement
    const evenement = await prisma.evenement.create({
      data: {
        id_matiere: BigInt(id_matiere),
        nom_evenement,
        type_evenement,
        date_evenement: new Date(date_evenement),
        description: description || null,
        duree_minutes: duree_minutes ? Number(duree_minutes) : null,
        icon_url: icon_url || null,
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
      },
    })

    res.status(201).json({
      id: evenement.id_evenement.toString(),
      titre: evenement.nom_evenement,
      type: evenement.type_evenement,
      date: evenement.date_evenement,
      description: evenement.description,
      duree: evenement.duree_minutes,
      matiere: evenement.matiere?.nom_matiere,
      matiereColor: evenement.matiere?.couleur,
      matiereIcon: evenement.icon_url || evenement.matiere?.devoir_icon_url,
    })
  } catch (error) {
    console.error("Erreur lors de la création d'événement pour la matière:", error)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

// Créer un événement pour une spécialité
router.post('/specialite', authenticateToken, async (req, res) => {
  try {
    const {
      id_specialite,
      nom_evenement,
      type_evenement,
      date_evenement,
      description,
      duree_minutes,
      icon_url,
    } = req.body
    const userId = req.user?.id_user

    if (!id_specialite || !nom_evenement || !type_evenement || !date_evenement) {
      return res.status(400).json({ error: 'Paramètres obligatoires manquants' })
    }

    // Vérifier que l'utilisateur a au moins un cours avec cette spécialité
    const cours = await prisma.cours.findFirst({
      where: {
        id_user: BigInt(userId),
        id_specialite: BigInt(id_specialite),
      },
    })

    if (!cours) {
      return res.status(403).json({ error: 'Non autorisé' })
    }

    // Créer l'événement
    const evenement = await prisma.evenement.create({
      data: {
        id_specialite: BigInt(id_specialite),
        nom_evenement,
        type_evenement,
        date_evenement: new Date(date_evenement),
        description: description || null,
        duree_minutes: duree_minutes ? Number(duree_minutes) : null,
        icon_url: icon_url || null,
      },
      include: {
        specialite: {
          select: {
            id_specialite: true,
            nom_specialite: true,
          },
        },
      },
    })

    res.status(201).json({
      id: evenement.id_evenement.toString(),
      titre: evenement.nom_evenement,
      type: evenement.type_evenement,
      date: evenement.date_evenement,
      description: evenement.description,
      duree: evenement.duree_minutes,
      categorie: evenement.specialite?.nom_specialite,
    })
  } catch (error) {
    console.error("Erreur lors de la création d'événement pour la spécialité:", error)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

// Créer un événement pour une option
router.post('/option', authenticateToken, async (req, res) => {
  try {
    const {
      id_option,
      nom_evenement,
      type_evenement,
      date_evenement,
      description,
      duree_minutes,
      icon_url,
    } = req.body
    const userId = req.user?.id_user

    if (!id_option || !nom_evenement || !type_evenement || !date_evenement) {
      return res.status(400).json({ error: 'Paramètres obligatoires manquants' })
    }

    // Vérifier que l'utilisateur a au moins un cours avec cette option
    const cours = await prisma.cours.findFirst({
      where: {
        id_user: BigInt(userId),
        id_option: BigInt(id_option),
      },
    })

    if (!cours) {
      return res.status(403).json({ error: 'Non autorisé' })
    }

    // Créer l'événement
    const evenement = await prisma.evenement.create({
      data: {
        id_option: BigInt(id_option),
        nom_evenement,
        type_evenement,
        date_evenement: new Date(date_evenement),
        description: description || null,
        duree_minutes: duree_minutes ? Number(duree_minutes) : null,
        icon_url: icon_url || null,
      },
      include: {
        option: {
          select: {
            id_option: true,
            nom_option: true,
          },
        },
      },
    })

    res.status(201).json({
      id: evenement.id_evenement.toString(),
      titre: evenement.nom_evenement,
      type: evenement.type_evenement,
      date: evenement.date_evenement,
      description: evenement.description,
      duree: evenement.duree_minutes,
      categorie: evenement.option?.nom_option,
    })
  } catch (error) {
    console.error("Erreur lors de la création d'événement pour l'option:", error)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

router.delete('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id)

    await prisma.evenement.delete({
      where: { id_evenement: id },
    })

    res.json({ success: true })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Erreur suppression événement' })
  }
})

export default router
