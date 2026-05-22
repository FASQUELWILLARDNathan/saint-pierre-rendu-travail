import { Router } from 'express'
import { prisma } from '../config.ts'
import { authenticateToken } from '../middleware/auth.ts'
import multer from 'multer'
import path from 'path'
import fs from 'fs'

const router = Router()
const uploadDir = '/app/public/cours'
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true })

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`
    cb(null, `${unique}-${file.originalname}`)
  },
})

const upload = multer({ storage })

router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.id_user

    const user = await prisma.utilisateur.findUnique({
      where: { id_user: BigInt(userId) },
      include: {
        eleve: true,
        professeur: { include: { classes_enseignees: true } },
      },
    })

    let where: any = {}

    if (user?.role === 'eleve' && user.eleve?.id_classe) {
      const profsDeClasse = await prisma.classeProfesseur.findMany({
        where: { id_classe: user.eleve.id_classe },
        select: { id_professeur: true },
      })
      const profIds = profsDeClasse.map((p) => p.id_professeur)
      if (profIds.length === 0) return res.json([])
      where = { id_user: { in: profIds }, id_classe: user.eleve.id_classe }
    } else if (user?.role === 'professeur') {
      where = { id_user: BigInt(userId) }
    }

    const cours = await prisma.cours.findMany({
      where,
      include: {
        matiere: true,
        classe: true,
        ressources: true,
        professeur: {
          include: { user: { select: { nom: true, prenom: true } } },
        },
      },
    })

    res.json(cours)
  } catch (error) {
    console.error('Erreur récupération cours:', error)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

router.get('/matiere/:matiereId', authenticateToken, async (req, res) => {
  try {
    const { matiereId } = req.params
    const userId = req.user?.id_user
    const userRole = req.user?.role

    // Récupère l'utilisateur avec ses infos
    const user = await prisma.utilisateur.findUnique({
      where: { id_user: BigInt(userId) },
      include: {
        eleve: { include: { classe: true } },
        professeur: { include: { classes_enseignees: true } },
      },
    })

    let coursWhere: any = { id_matiere: BigInt(matiereId) }

    if (user?.role === 'eleve' && user.eleve?.id_classe) {
      const profsDeClasse = await prisma.classeProfesseur.findMany({
        where: { id_classe: user.eleve.id_classe },
        select: { id_professeur: true },
      })
      const profIds = profsDeClasse.map((p) => p.id_professeur)

      // Aucun prof dans cette classe = aucun cours
      if (profIds.length === 0) {
        return res.json([])
      }

      coursWhere = {
        id_matiere: BigInt(matiereId),
        id_user: { in: profIds },
      }
    }
    // Pour un prof : il voit uniquement ses propres cours
    else if (user?.role === 'professeur') {
      coursWhere = {
        id_matiere: BigInt(matiereId),
        id_user: BigInt(userId),
      }
    }

    const cours = await prisma.cours.findMany({
      where: coursWhere,
      include: {
        professeur: {
          include: {
            user: { select: { nom: true, prenom: true } },
          },
        },
        matiere: {
          select: { nom_matiere: true, couleur: true, icon_url: true, devoir_icon_url: true },
        },
        devoirs: {
          select: { id_devoir: true, nom_devoir: true, date_limite: true },
        },
      },
    })

    res.json(cours)
  } catch (error) {
    console.error('Erreur lors de la récupération des cours:', error)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

router.get('/:id', authenticateToken, async (req, res) => {
  const matiere = await prisma.matiere.findUnique({
    where: { id_matiere: BigInt(req.params.id) },
  })
  res.json(matiere)
})

router.post('/', authenticateToken, upload.array('fichiers', 10), async (req, res) => {
  try {
    const userId = req.user?.id_user
    const { nom_cours, description_cours, id_matiere, id_classe } = req.body

    if (!nom_cours || !id_matiere) {
      return res.status(400).json({ error: 'Nom et matière obligatoires' })
    }

    const cours = await prisma.cours.create({
      data: {
        id_user: BigInt(userId),
        id_matiere: BigInt(id_matiere),
        id_classe: id_classe ? BigInt(id_classe) : null,
        nom_cours,
        description_cours: description_cours || null,
      },
    })

    // Sauvegarde les fichiers
    const files = req.files as Express.Multer.File[]
    if (files && files.length > 0) {
      await prisma.ressource_cours.createMany({
        data: files.map((f) => ({
          id_cours: cours.id_cours,
          nom_fichier: f.originalname,
          chemin_fichier: `/cours/${f.filename}`,
          type_fichier: f.mimetype,
          taille_octets: BigInt(f.size),
        })),
      })
    }

    const coursComplet = await prisma.cours.findUnique({
      where: { id_cours: cours.id_cours },
      include: { ressources: true, matiere: true, classe: true },
    })

    res.json(coursComplet)
  } catch (error) {
    console.error('Erreur création cours:', error)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

export default router