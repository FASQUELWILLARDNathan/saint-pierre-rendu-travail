import express from 'express'
import { prisma } from '../config.ts'
import { authenticateToken } from '../middleware/auth.ts'
import {
  canUserUploadFile,
  getUserRemainingStorage,
  formatStorageSize,
} from '../services/cleanup-service.ts'
import multer from 'multer'
import path from 'path'
import fs from 'fs'

const router = express.Router()

// Configure multer for file uploads
const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'messages')
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
    cb(null, uniqueSuffix + path.extname(file.originalname))
  },
})

const upload = multer({ storage })

// Apply auth middleware to all routes
router.use(authenticateToken)

// GET /api/messages/received - Get all received messages for current user
router.get('/received', async (req: express.Request, res: express.Response) => {
  try {
    const userId = BigInt((req as any).user.id_user)

    const messages = await prisma.message.findMany({
      where: { id_destinataire: userId },
      include: {
        expediteur: {
          select: {
            id_user: true,
            nom: true,
            prenom: true,
            email: true,
          },
        },
        pieces_jointes: true,
      },
      orderBy: {
        date_envoi: 'desc',
      },
    })

    const formatted = messages.map((msg) => ({
      id_message: msg.id_message.toString(),
      id_expediteur: msg.id_expediteur.toString(),
      id_destinataire: msg.id_destinataire.toString(),
      sujet: msg.sujet,
      contenu: msg.contenu,
      date_envoi: msg.date_envoi,
      lu: msg.lu,
      expediteur: {
        id_user: msg.expediteur.id_user.toString(),
        nom: msg.expediteur.nom,
        prenom: msg.expediteur.prenom,
        email: msg.expediteur.email,
      },
      pieces_jointes: msg.pieces_jointes.map((pj) => ({
        id_piece_jointe: pj.id_piece_jointe.toString(),
        nom_fichier: pj.nom_fichier,
        chemin_fichier: pj.chemin_fichier,
        type_fichier: pj.type_fichier,
        taille_octets: pj.taille_octets.toString(),
      })),
    }))

    res.json(formatted)
  } catch (error) {
    console.error('Erreur lors de la récupération des messages reçus:', error)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

// GET /api/messages/sent - Get all sent messages for current user
router.get('/sent', async (req: express.Request, res: express.Response) => {
  try {
    const userId = BigInt((req as any).user.id_user)

    const messages = await prisma.message.findMany({
      where: { id_expediteur: userId },
      include: {
        destinataire: {
          select: {
            id_user: true,
            nom: true,
            prenom: true,
            email: true,
          },
        },
        pieces_jointes: true,
      },
      orderBy: {
        date_envoi: 'desc',
      },
    })

    const formatted = messages.map((msg) => ({
      id_message: msg.id_message.toString(),
      id_expediteur: msg.id_expediteur.toString(),
      id_destinataire: msg.id_destinataire.toString(),
      sujet: msg.sujet,
      contenu: msg.contenu,
      date_envoi: msg.date_envoi,
      lu: msg.lu,
      destinataire: {
        id_user: msg.destinataire.id_user.toString(),
        nom: msg.destinataire.nom,
        prenom: msg.destinataire.prenom,
        email: msg.destinataire.email,
      },
      pieces_jointes: msg.pieces_jointes.map((pj) => ({
        id_piece_jointe: pj.id_piece_jointe.toString(),
        nom_fichier: pj.nom_fichier,
        chemin_fichier: pj.chemin_fichier,
        type_fichier: pj.type_fichier,
        taille_octets: pj.taille_octets.toString(),
      })),
    }))

    res.json(formatted)
  } catch (error) {
    console.error('Erreur lors de la récupération des messages envoyés:', error)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

// GET /api/messages/conversation/:id - Get conversation with a specific user
router.get('/conversation/:id', async (req: express.Request, res: express.Response) => {
  try {
    const userId = BigInt((req as any).user.id_user)
    const { id } = req.params

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { id_expediteur: userId, id_destinataire: BigInt(id) },
          { id_expediteur: BigInt(id), id_destinataire: userId },
        ],
      },
      include: {
        expediteur: {
          select: {
            id_user: true,
            nom: true,
            prenom: true,
            email: true,
          },
        },
        pieces_jointes: true,
      },
      orderBy: {
        date_envoi: 'asc',
      },
    })

    const formatted = messages.map((msg) => ({
      id_message: msg.id_message.toString(),
      id_expediteur: msg.id_expediteur.toString(),
      id_destinataire: msg.id_destinataire.toString(),
      sujet: msg.sujet,
      contenu: msg.contenu,
      date_envoi: msg.date_envoi,
      lu: msg.lu,
      expediteur: {
        id_user: msg.expediteur.id_user.toString(),
        nom: msg.expediteur.nom,
        prenom: msg.expediteur.prenom,
        email: msg.expediteur.email,
      },
      pieces_jointes: msg.pieces_jointes.map((pj) => ({
        id_piece_jointe: pj.id_piece_jointe.toString(),
        nom_fichier: pj.nom_fichier,
        chemin_fichier: pj.chemin_fichier,
        type_fichier: pj.type_fichier,
        taille_octets: pj.taille_octets.toString(),
      })),
    }))

    res.json(formatted)
  } catch (error) {
    console.error('Erreur lors de la récupération de la conversation:', error)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

// POST /api/messages - Send a new message with file uploads
router.post(
  '/',
  upload.array('pieces_jointes', 5),
  async (req: express.Request, res: express.Response) => {
    try {
      const userId = BigInt((req as any).user.id_user)
      const { id_destinataire, sujet, contenu } = req.body
      const files = req.files as Express.Multer.File[]

      // Validate required fields
      if (!id_destinataire || !sujet || !contenu) {
        return res.status(400).json({ error: 'Destinataire, sujet et contenu sont requis' })
      }

      // Validate content length
      if (contenu.length > 5000) {
        return res.status(400).json({ error: 'Le message ne peut pas dépasser 5000 caractères' })
      }

      // Check if recipient exists
      const recipient = await prisma.utilisateur.findUnique({
        where: { id_user: BigInt(id_destinataire) },
      })

      if (!recipient) {
        return res.status(404).json({ error: 'Destinataire non trouvé' })
      }

      // Check file size limit for user
      if (files && files.length > 0) {
        let totalFileSize = 0
        for (const file of files) {
          totalFileSize += file.size
        }

        const canUpload = await canUserUploadFile(userId, totalFileSize)
        if (!canUpload) {
          const remaining = await getUserRemainingStorage(userId)
          return res.status(413).json({
            error: `Espace de stockage insuffisant. Vous pouvez encore uploader ${formatStorageSize(remaining)}.`,
            remainingSpace: formatStorageSize(remaining),
          })
        }
      }

      // Create message
      const message = await prisma.message.create({
        data: {
          id_expediteur: userId,
          id_destinataire: BigInt(id_destinataire),
          sujet,
          contenu,
        },
      })

      // Add attachments if any
      if (files && files.length > 0) {
        const attachments = files.map((file) => ({
          id_message: message.id_message,
          nom_fichier: file.originalname || file.filename,
          chemin_fichier: `/uploads/messages/${file.filename}`,
          type_fichier: file.mimetype,
          taille_octets: BigInt(file.size),
        }))

        await prisma.piece_jointe.createMany({
          data: attachments,
        })
      }

      res.json({
        message: 'Message envoyé avec succès',
        id_message: message.id_message.toString(),
      })
    } catch (error) {
      console.error("Erreur lors de l'envoi du message:", error)
      res.status(500).json({ error: 'Erreur serveur' })
    }
  },
)

// PUT /api/messages/:id/read - Mark message as read
router.put('/:id/read', async (req: express.Request, res: express.Response) => {
  try {
    const { id } = req.params

    await prisma.message.update({
      where: { id_message: BigInt(id) },
      data: { lu: true },
    })

    res.json({ message: 'Message marqué comme lu' })
  } catch (error) {
    console.error('Erreur lors de la mise à jour du message:', error)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

// DELETE /api/messages/:id - Delete a message
router.delete('/:id', async (req: express.Request, res: express.Response) => {
  try {
    const { id } = req.params

    // Get message with attachments
    const message = await prisma.message.findUnique({
      where: { id_message: BigInt(id) },
      include: { pieces_jointes: true },
    })

    if (!message) {
      return res.status(404).json({ error: 'Message non trouvé' })
    }

    // Delete attached files
    if (message.pieces_jointes && message.pieces_jointes.length > 0) {
      for (const pj of message.pieces_jointes) {
        const filePath = path.join(process.cwd(), 'public', pj.chemin_fichier)
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath)
        }
      }
    }

    // Delete message (cascades to pieces_jointes)
    await prisma.message.delete({
      where: { id_message: BigInt(id) },
    })

    res.json({ message: 'Message supprimé avec succès' })
  } catch (error) {
    console.error('Erreur lors de la suppression du message:', error)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

// GET /api/messages/storage/info - Get user storage information
router.get('/storage/info', async (req: express.Request, res: express.Response) => {
  try {
    const userId = BigInt((req as any).user.id_user)
    const { getUserStorageUsage, getUserRemainingStorage, CLEANUP_MAX_STORAGE } =
      await import('../services/cleanup-service.ts')

    const used = await getUserStorageUsage(userId)
    const remaining = await getUserRemainingStorage(userId)
    const max = CLEANUP_MAX_STORAGE

    res.json({
      used: formatStorageSize(used),
      used_bytes: used,
      remaining: formatStorageSize(remaining),
      remaining_bytes: remaining,
      max: formatStorageSize(max),
      max_bytes: max,
      percentage: Math.round((used / max) * 100),
    })
  } catch (error) {
    console.error("Erreur lors de la récupération de l'info de stockage:", error)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

// DELETE /api/messages/cleanup/user - Delete all messages for current user (manual cleanup)
router.delete('/cleanup/user', async (req: express.Request, res: express.Response) => {
  try {
    const userId = BigInt((req as any).user.id_user)
    const { deleteAllUserMessages } = await import('../services/cleanup-service.ts')

    await deleteAllUserMessages(userId)

    res.json({ message: 'Tous vos messages et pièces jointes ont été supprimés' })
  } catch (error) {
    console.error('Erreur lors du nettoyage des messages utilisateur:', error)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

export default router
