import { Router } from 'express'
import { prisma } from '../config.ts'
import { authenticateToken } from '../middleware/auth.ts'
import multer from 'multer'
import fs from 'fs'
import path from 'path'
import { authorizeRole } from '../middleware/role.ts'
import { toBigIntOrNull } from '../utils.ts'

const router = Router()

const uploadDir = '/app/public/rendus'
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
 * Supprime un fichier s'il existe
 * @param {string} filePath - Chemin du fichier à supprimer
 */
function removeFileIfExists(filePath: string) {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
    }
  } catch (error) {
    console.error('Erreur suppression fichier rendu:', error)
  }
}

/**
 * POST /api/rendus - Rendre un devoir (avec fichiers)
 * @body {string} id_devoir - ID du devoir
 * @body {File[]} fichiers - Fichiers à joindre
 */
router.post(
  '/',
  authenticateToken,
  authorizeRole('eleve'),
  upload.array('fichiers', 10),
  async (req, res) => {
    try {
      const userId = req.user?.id_user
      const { id_devoir } = req.body

      if (!id_devoir) return res.status(400).json({ error: 'id_devoir obligatoire' })

      const userIdBigInt = toBigIntOrNull(userId)
      const idDevoirBigInt = toBigIntOrNull(id_devoir)

      if (!userIdBigInt || !idDevoirBigInt) {
        return res.status(400).json({ error: 'IDs utilisateur ou devoir invalides' })
      }

      // Vérifie si déjà rendu
      const existing = await prisma.rendu.findUnique({
        where: { id_devoir_id_user: { id_devoir: idDevoirBigInt, id_user: userIdBigInt } },
      })

      let rendu
      if (existing) {
        // Met à jour la date
        rendu = await prisma.rendu.update({
          where: { id_rendu: existing.id_rendu },
          data: { date_rendu: new Date() },
        })
      } else {
        rendu = await prisma.rendu.create({
          data: {
            id_devoir: idDevoirBigInt,
            id_user: userIdBigInt,
            date_rendu: new Date(),
          },
        })
      }

      // Sauvegarde les fichiers
      const files = req.files as MulterCustom.File[]
      if (files && files.length > 0) {
        await prisma.piece_jointe_rendu.createMany({
          data: files.map((f) => ({
            id_rendu: rendu.id_rendu,
            nom_fichier: f.originalname.slice(0, 254),
            chemin_fichier: `/rendus/${f.filename}`.slice(0, 499),
            type_fichier: f.mimetype,
            taille_octets: toBigIntOrNull(f.size) || BigInt(0),
          })),
        })
      }

      const renduComplet = await prisma.rendu.findUnique({
        where: { id_rendu: rendu.id_rendu },
        include: { pieces_jointes: true },
      })

      res.json(renduComplet)
    } catch (error) {
      console.error('Erreur rendu:', error)
      res.status(500).json({ error: 'Erreur serveur' })
    }
  },
)

// Supprime le rendu courant de l'élève pour un devoir
router.delete('/devoir/:idDevoir', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.id_user
    const { idDevoir } = req.params

    const userIdBigInt = toBigIntOrNull(userId)
    const idDevoirBigInt = toBigIntOrNull(idDevoir)

    if (!userIdBigInt || !idDevoirBigInt) {
      return res.status(400).json({ error: 'IDs utilisateur ou devoir invalides' })
    }

    const rendu = await prisma.rendu.findUnique({
      where: { id_devoir_id_user: { id_devoir: idDevoirBigInt, id_user: userIdBigInt } },
      include: { pieces_jointes: true },
    })

    if (!rendu) {
      return res.status(404).json({ error: 'Rendu introuvable' })
    }

    for (const pj of rendu.pieces_jointes) {
      const absolutePath = path.join('/app/public', pj.chemin_fichier.replace(/^\//, ''))
      removeFileIfExists(absolutePath)
    }

    await prisma.piece_jointe_rendu.deleteMany({
      where: { id_rendu: rendu.id_rendu },
    })

    await prisma.rendu.delete({
      where: { id_rendu: rendu.id_rendu },
    })

    return res.json({ message: 'Rendu supprimé avec succès' })
  } catch (error) {
    console.error('Erreur suppression rendu:', error)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

// Met à jour la note et le retour d'un rendu pour un professeur
router.put('/:idRendu', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.id_user
    const { idRendu } = req.params
    const { note, retour } = req.body

    const currentUser = await prisma.utilisateur.findUnique({
      where: { id_user: BigInt(userId) },
      select: { role: true },
    })

    if (!currentUser) {
      return res.status(401).json({ error: 'Utilisateur introuvable' })
    }

    if (currentUser.role !== 'professeur') {
      return res.status(403).json({ error: 'Non autorisé' })
    }

    const rendu = await prisma.rendu.findUnique({
      where: { id_rendu: BigInt(idRendu) },
      include: {
        devoir: {
          include: {
            cours: {
              select: { id_user: true },
            },
          },
        },
      },
    })

    if (!rendu) {
      return res.status(404).json({ error: 'Rendu introuvable' })
    }

    if (rendu.devoir.cours.id_user !== BigInt(userId)) {
      return res.status(403).json({ error: 'Non autorisé' })
    }

    const updated = await prisma.rendu.update({
      where: { id_rendu: BigInt(idRendu) },
      data: {
        note: note === '' || note === null || note === undefined ? null : String(note),
        retour: retour === '' || retour === null || retour === undefined ? null : String(retour),
      },
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
    })

    res.json(updated)
  } catch (error) {
    console.error('Erreur mise à jour rendu:', error)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

// Récupère les notes d'un élève
router.get('/mes-notes', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.id_user

    const rendus = await prisma.rendu.findMany({
      where: {
        id_user: userId,
        note: {
          not: null,
        },
      },
      include: {
        devoir: {
          include: {
            cours: {
              include: {
                matiere: {
                  select: {
                    nom_matiere: true,
                    couleur: true,
                    icon_url: true,
                  },
                },
                specialite: {
                  select: {
                    nom_specialite: true,
                  },
                },
                option: {
                  select: {
                    nom_option: true,
                  },
                },
              },
            },
          },
        },
        pieces_jointes: true,
      },
      orderBy: {
        date_rendu: 'desc',
      },
    })

    res.json(rendus)
  } catch (error) {
    console.error('Erreur mes-notes:', error)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

// Archiver un rendu (le marquer comme archivé)
router.post('/:idRendu/archive', authenticateToken, async (req, res) => {
  try {
    const { idRendu } = req.params
    const userId = req.user?.id_user

    // Vérifie que le rendu appartient à un devoir du prof
    const rendu = await prisma.rendu.findUnique({
      where: { id_rendu: BigInt(idRendu) },
      include: {
        devoir: {
          include: {
            professeurs: true,
          },
        },
      },
    })

    if (!rendu) {
      return res.status(404).json({ error: 'Rendu non trouvé' })
    }

    // Vérifie que l'utilisateur est un professeur du devoir
    const isProfessor = rendu.devoir.professeurs.some((p) => p.id_user === BigInt(userId))
    if (!isProfessor) {
      return res.status(403).json({ error: 'Non autorisé' })
    }

    // Archive le rendu
    const archived = await prisma.rendu.update({
      where: { id_rendu: BigInt(idRendu) },
      data: { archive: true },
    })

    res.json(archived)
  } catch (error) {
    console.error('Erreur archivage rendu:', error)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

export default router
