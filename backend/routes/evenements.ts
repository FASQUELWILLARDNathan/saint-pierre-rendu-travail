import { Router } from 'express'
import { prisma } from '../config.ts'
import { authenticateToken } from '../middleware/auth.ts'

const router = Router()

// Get tous les événements à venir
// Triés par date en ordre croissant
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
      },
      orderBy: {
        date_evenement: 'asc',
      },
      take: 10,
    })

    // Formater les événements pour la réponse
    const evenementsFormattes = evenements.map((evt) => ({
      id: evt.id_evenement.toString(),
      titre: evt.nom_evenement,
      matiere: evt.matiere.nom_matiere,
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
      matiereColor: evt.matiere.couleur,
      matiereIcon: evt.icon_url,
    }))

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

export default router
