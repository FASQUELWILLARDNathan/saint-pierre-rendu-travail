import { Router } from 'express'
import { prisma } from '../config.ts'
import { authenticateToken } from '../middleware/auth.ts'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import fsPromises from 'fs/promises'

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
        professeur: true,
      },
    })

    let where: any = {}

    const kind = String(req.query.kind ?? '')
    const id = String(req.query.id ?? '')
    const id_matiere = req.query.id_matiere as string
    const id_specialite = req.query.id_specialite as string
    const id_option = req.query.id_option as string

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

    if (kind === 'specialite' && id) {
      const specialiteId = await resolveBigInt(id, 'specialite')
      if (!specialiteId) return res.json([])
      where.id_specialite = specialiteId
    } else if (kind === 'option' && id) {
      const optionId = await resolveBigInt(id, 'option')
      if (!optionId) return res.json([])
      where.id_option = optionId
    } else {
      if (id_matiere) where.id_matiere = BigInt(id_matiere)
      if (id_specialite) {
        if (/^\d+$/.test(id_specialite)) {
          where.id_specialite = BigInt(id_specialite)
        } else {
          const specialite = await prisma.specialite.findFirst({
            where: {
              nom_specialite: {
                mode: 'insensitive',
                equals: id_specialite,
              },
            },
            select: { id_specialite: true },
          })

          if (!specialite) {
            return res.json([])
          }

          where.id_specialite = specialite.id_specialite
        }
      }
      if (id_option) where.id_option = BigInt(id_option)
    }

    // Restriction selon le rôle
    if (user?.role === 'eleve' && user.eleve?.id_classe) {
      const profsDeClasse = await prisma.classeProfesseur.findMany({
        where: { id_classe: user.eleve.id_classe },
        select: { id_professeur: true },
      })

      const profIds = profsDeClasse.map((p) => p.id_professeur)

      if (profIds.length === 0) {
        return res.json([])
      }

      where.id_user = {
        in: profIds,
      }
    }

    // Un prof ne voit que SES cours
    else if (user?.role === 'professeur') {
      where.id_user = BigInt(userId)
    }

    const coursList = await prisma.cours.findMany({
      where,
      include: {
        matiere: true,
        classe: true,
        specialite: true,
        option: true,
        ressources: true,
        professeur: {
          include: {
            user: { select: { nom: true, prenom: true } },
          },
        },
      },
    })

    res.json(coursList)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

router.post('/', authenticateToken, upload.array('fichiers', 10), async (req, res) => {
  try {
    const userId = req.user?.id_user
    const { nom_cours, description_cours, id_matiere, id_classe, id_specialite, id_option } =
      req.body

    if (!nom_cours) {
      return res.status(400).json({ error: 'Nom obligatoire' })
    }

    if (!id_matiere && !id_specialite && !id_option) {
      return res.status(400).json({ error: 'Matière, spécialité ou option obligatoire' })
    }

    const cours = await prisma.cours.create({
      data: {
        id_user: BigInt(userId),
        id_matiere: id_matiere ? BigInt(id_matiere) : null,
        id_classe: id_classe ? BigInt(id_classe) : null,
        id_specialite: id_specialite ? BigInt(id_specialite) : null,
        id_option: id_option ? BigInt(id_option) : null,
        nom_cours,
        description_cours: description_cours || null,
      },
    })

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
      include: { ressources: true, matiere: true, classe: true, specialite: true, option: true },
    })

    res.json(coursComplet)
  } catch (error) {
    console.error('Erreur création cours:', error)
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
        ressources: true
      },
    })

    res.json(cours)
  } catch (error) {
    console.error('Erreur lors de la récupération des cours:', error)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

router.get('/specialite/:specialiteId', authenticateToken, async (req, res) => {
  try {
    const { specialiteId } = req.params
    const userId = req.user?.id_user

    const user = await prisma.utilisateur.findUnique({
      where: { id_user: BigInt(userId) },
      include: { eleve: true, professeur: true },
    })

    let where: any = { id_specialite: BigInt(specialiteId) }

    if (user?.role === 'professeur') {
      where = { id_specialite: BigInt(specialiteId), id_user: BigInt(userId) }
    }

    const { nom_devoir, description_devoir, id_cours, date_limite } = req.body

    const cours = await prisma.cours.findMany({
      where,
      include: {
        professeur: { include: { user: { select: { nom: true, prenom: true } } } },
        matiere: {
          select: { nom_matiere: true, couleur: true, icon_url: true, devoir_icon_url: true },
        },
        specialite: true,
        classe: true,
        ressources: true,
        devoirs: { select: { id_devoir: true, nom_devoir: true, date_limite: true } },
      },
    })

    res.json(cours)
  } catch (error) {
    console.error('Erreur récupération cours spécialité:', error)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

router.get('/option/:optionId', authenticateToken, async (req, res) => {
  try {
    const { optionId } = req.params
    const userId = req.user?.id_user

    const user = await prisma.utilisateur.findUnique({
      where: { id_user: BigInt(userId) },
      include: { eleve: true, professeur: true },
    })

    let where: any = { id_option: BigInt(optionId) }

    if (user?.role === 'professeur') {
      where = { id_option: BigInt(optionId), id_user: BigInt(userId) }
    }

    const cours = await prisma.cours.findMany({
      where,
      include: {
        professeur: { include: { user: { select: { nom: true, prenom: true } } } },
        matiere: {
          select: { nom_matiere: true, couleur: true, icon_url: true, devoir_icon_url: true },
        },
        option: true,
        classe: true,
        ressources: true,
        devoirs: { select: { id_devoir: true, nom_devoir: true, date_limite: true } },
      },
    })

    res.json(cours)
  } catch (error) {
    console.error('Erreur récupération cours option:', error)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

router.get('/:id', authenticateToken, async (req, res) => {
  const matiere = await prisma.matiere.findUnique({
    where: { id_matiere: BigInt(req.params.id) },
  })
  res.json(matiere)
})

router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params
    const userId = BigInt(req.user?.id_user)

    const cours = await prisma.cours.findFirst({
      where: {
        id_cours: BigInt(id),
        id_user: userId,
      },
      include: {
        ressources: true,
      },
    })

    if (!cours) {
      return res.status(404).json({ error: 'Cours non trouvé' })
    }

    for (const ressource of cours.ressources) {
      const filePath = path.join(process.cwd(), 'public', ressource.chemin_fichier)

      if (fs.existsSync(filePath)) {
        await fsPromises.unlink(filePath).catch(() => {})
      }
    }

    await prisma.cours.delete({
      where: {
        id_cours: BigInt(id),
      },
    })

    res.json({
      message: 'Cours supprimé avec succès',
    })
  } catch (error) {
    console.error('Erreur suppression cours:', error)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

export default router
