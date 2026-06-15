import { Router } from 'express'
import { prisma } from '../config.ts'
import type { Request } from 'express'
import { authenticateToken } from '../middleware/auth.ts'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import fsPromises from 'fs/promises'
import { authorizeRole } from '../middleware/role.ts'
import { toBigIntOrNull } from '../utils.ts'

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

/**
 * GET /api/cours - Lister les cours avec filtres optionnels
 * @query {string} kind - Type de filtre (specialite, option)
 * @query {string} id - ID pour le filtre
 * @query {string} id_matiere - ID de la matière
 * @query {string} id_specialite - ID de la spécialité
 * @query {string} id_option - ID de l'option
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.id_user

    const user = await prisma.utilisateur.findUnique({
      where: { id_user: toBigIntOrNull(userId) || BigInt(0) },
      include: {
        eleve: true,
        professeur: true,
      },
    })

    const where: any = {}

    const kind = String(req.query.kind ?? '')
    const id = String(req.query.id ?? '')
    const id_matiere = req.query.id_matiere as string
    const id_specialite = req.query.id_specialite as string
    const id_option = req.query.id_option as string

    const resolveBigInt = async (value: string, model: 'specialite' | 'option') => {
      if (/^\d+$/.test(value)) return toBigIntOrNull(value)

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
      if (id_matiere) {
        const matiereIdBigInt = toBigIntOrNull(id_matiere)
        if (!matiereIdBigInt) return res.status(400).json({ error: 'id_matiere invalide' })
        where.id_matiere = matiereIdBigInt
      }
      if (id_specialite) {
        if (/^\d+$/.test(id_specialite)) {
          const specIdBigInt = toBigIntOrNull(id_specialite)
          if (!specIdBigInt) return res.status(400).json({ error: 'id_specialite invalide' })
          where.id_specialite = specIdBigInt
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
      if (id_option) {
        const optIdBigInt = toBigIntOrNull(id_option)
        if (!optIdBigInt) return res.status(400).json({ error: 'id_option invalide' })
        where.id_option = optIdBigInt
      }
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
      const uid = toBigIntOrNull(userId)
      if (!uid) return res.status(400).json({ error: 'id_user invalide' })
      where.id_user = uid
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

router.post(
  '/',
  authenticateToken,
  authorizeRole('professeur', 'administrateur'),
  upload.array('fichiers', 10),
  async (req, res) => {
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

      const userIdBigInt = toBigIntOrNull(userId)
      if (!userIdBigInt) {
        return res.status(400).json({ error: 'ID utilisateur invalide' })
      }

      const cours = await prisma.cours.create({
        data: {
          id_user: userIdBigInt,
          id_matiere: toBigIntOrNull(id_matiere),
          id_classe: toBigIntOrNull(id_classe),
          id_specialite: toBigIntOrNull(id_specialite),
          id_option: toBigIntOrNull(id_option),
          nom_cours,
          description_cours: description_cours || null,
        },
      })

      const files = req.files as MulterCustom.File[]

      if (files && files.length > 0) {
        await prisma.ressource_cours.createMany({
          data: files.map((f) => ({
            id_cours: cours.id_cours,
            nom_fichier: f.originalname.slice(0, 254),
            chemin_fichier: `/cours/${f.filename}`.slice(0, 499),
            type_fichier: f.mimetype,
            taille_octets: toBigIntOrNull(f.size) || BigInt(0),
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
  },
)

router.get('/matiere/:matiereId', authenticateToken, async (req, res) => {
  try {
    const { matiereId } = req.params
    const userId = req.user?.id_user
    const userRole = req.user?.role

    // Récupère l'utilisateur avec ses infos
    const user = await prisma.utilisateur.findUnique({
      where: { id_user: toBigIntOrNull(userId) || BigInt(0) },
      include: {
        eleve: { include: { classe: true } },
        professeur: { include: { classes_enseignees: true } },
      },
    })

    const matiereIdBigInt = toBigIntOrNull(matiereId)
    if (!matiereIdBigInt) {
      return res.status(400).json({ error: 'ID matière invalide' })
    }

    let coursWhere: any = { id_matiere: matiereIdBigInt }

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
        id_matiere: matiereIdBigInt,
        id_user: { in: profIds },
      }
    }
    // Pour un prof : il voit uniquement ses propres cours
    else if (user?.role === 'professeur') {
      coursWhere = {
        id_matiere: matiereIdBigInt,
        id_user: toBigIntOrNull(userId) || BigInt(0),
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
        ressources: true,
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
      where: { id_user: toBigIntOrNull(userId) || BigInt(0) },
      include: { eleve: true, professeur: true },
    })

    const specIdBigInt = toBigIntOrNull(specialiteId)
    if (!specIdBigInt) {
      return res.status(400).json({ error: 'ID spécialité invalide' })
    }

    let where: any = { id_specialite: specIdBigInt }

    if (user?.role === 'professeur') {
      where = { id_specialite: specIdBigInt, id_user: toBigIntOrNull(userId) || BigInt(0) }
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
      where: { id_user: toBigIntOrNull(userId) || BigInt(0) },
      include: { eleve: true, professeur: true },
    })

    const optIdBigInt = toBigIntOrNull(optionId)
    if (!optIdBigInt) {
      return res.status(400).json({ error: 'ID option invalide' })
    }

    let where: any = { id_option: optIdBigInt }

    if (user?.role === 'professeur') {
      where = { id_option: optIdBigInt, id_user: toBigIntOrNull(userId) || BigInt(0) }
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
  const idBigInt = toBigIntOrNull(req.params.id)
  if (!idBigInt) {
    return res.status(400).json({ error: 'ID matière invalide' })
  }
  const matiere = await prisma.matiere.findUnique({
    where: { id_matiere: idBigInt },
  })
  res.json(matiere)
})

router.put(
  '/:id',
  authenticateToken,
  authorizeRole('professeur', 'administrateur'),
  upload.array('fichiers', 10),
  async (req, res) => {
    try {
      const { id } = req.params
      const { nom_cours, description_cours } = req.body
      const userId = toBigIntOrNull(req.user?.id_user)

      if (!userId) {
        return res.status(400).json({ error: 'ID utilisateur invalide' })
      }

      const idCoursBigInt = toBigIntOrNull(id)
      if (!idCoursBigInt) {
        return res.status(400).json({ error: 'ID cours invalide' })
      }

      // Vérifier que le cours appartient à l'utilisateur
      const existingCours = await prisma.cours.findFirst({
        where: {
          id_cours: idCoursBigInt,
          id_user: userId,
        },
      })

      if (!existingCours) {
        return res.status(404).json({ error: 'Cours non trouvé ou non autorisé' })
      }

      // Mettre à jour le cours
      const updatedCours = await prisma.cours.update({
        where: { id_cours: idCoursBigInt },
        data: {
          nom_cours: nom_cours || existingCours.nom_cours,
          description_cours:
            description_cours !== undefined ? description_cours : existingCours.description_cours,
        },
      })

      // Gérer les nouveaux fichiers
      const files = req.files as MulterCustom.File[]
      if (files?.length) {
        await prisma.ressource_cours.createMany({
          data: files.map((f) => ({
            id_cours: idCoursBigInt,
            nom_fichier: f.originalname.slice(0, 254),
            chemin_fichier: `/cours/${f.filename}`.slice(0, 499),
            type_fichier: f.mimetype,
            taille_octets: toBigIntOrNull(f.size) || BigInt(0),
          })),
        })
      }

      const coursComplet = await prisma.cours.findUnique({
        where: { id_cours: idCoursBigInt },
        include: { ressources: true, matiere: true, classe: true, specialite: true, option: true },
      })

      res.json(coursComplet)
    } catch (error) {
      console.error('Erreur mise à jour cours:', error)
      res.status(500).json({ error: 'Erreur serveur' })
    }
  },
)

router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params
    const userId = toBigIntOrNull(req.user?.id_user)
    if (!userId) {
      return res.status(400).json({ error: 'ID utilisateur invalide' })
    }

    const idCoursBigInt = toBigIntOrNull(id)
    if (!idCoursBigInt) {
      return res.status(400).json({ error: 'ID cours invalide' })
    }

    const cours = await prisma.cours.findFirst({
      where: {
        id_cours: idCoursBigInt,
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
        id_cours: idCoursBigInt,
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
