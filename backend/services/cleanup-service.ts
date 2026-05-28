import { prisma } from '../config.ts'
import fs from 'fs'
import path from 'path'

const MAX_STORAGE_PER_USER = 100 * 1024 * 1024 // 100 MB par utilisateur

/**
 * Supprime tous les messages et pièces jointes d'un utilisateur
 */
export async function deleteAllUserMessages(userId: bigint) {
  try {
    // Récupérer tous les messages de l'utilisateur (envoyés et reçus)
    const messages = await prisma.message.findMany({
      where: {
        OR: [{ id_expediteur: userId }, { id_destinataire: userId }],
      },
      include: { pieces_jointes: true },
    })

    // Supprimer les fichiers du disque
    for (const msg of messages) {
      if (msg.pieces_jointes.length > 0) {
        for (const pj of msg.pieces_jointes) {
          const filePath = path.join(process.cwd(), 'public', pj.chemin_fichier)
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath)
          }
        }
      }
    }

    // Supprimer les messages de la base de données (cascade supprimera les pièces jointes)
    await prisma.message.deleteMany({
      where: {
        OR: [{ id_expediteur: userId }, { id_destinataire: userId }],
      },
    })

    console.log(`Nettoyage effectué pour l'utilisateur ${userId}`)
  } catch (error) {
    console.error(`Erreur lors du nettoyage pour l'utilisateur ${userId}:`, error)
  }
}

/**
 * Supprime tous les messages et pièces jointes de tous les utilisateurs (20 août)
 */
export async function cleanupAllMessages() {
  try {
    console.log('Début du nettoyage annuel des messages...')

    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'messages')

    // Supprimer tous les messages
    await prisma.message.deleteMany({})

    // Supprimer tous les fichiers du dossier uploads/messages
    if (fs.existsSync(uploadDir)) {
      fs.readdirSync(uploadDir).forEach((file) => {
        const filePath = path.join(uploadDir, file)
        if (fs.statSync(filePath).isFile()) {
          fs.unlinkSync(filePath)
        }
      })
      console.log('Dossier uploads/messages vidé')
    }

    console.log('Nettoyage annuel terminé avec succès')
  } catch (error) {
    console.error('Erreur lors du nettoyage annuel:', error)
  }
}

/**
 * Supprime tous les devoirs et rendus non archivés (20 août)
 * Les rendus archivés et les cours sont conservés
 */
export async function cleanupDevirsAndRendus() {
  try {
    console.log('Début du nettoyage annuel des devoirs et rendus...')

    // Récupérer tous les devoirs non archivés
    const rendusNonArchives = await prisma.rendu.findMany({
      where: { archive: false },
      include: { pieces_jointes: true },
    })

    // Supprimer les fichiers des rendus non archivés
    const uploadDir = path.join(process.cwd(), 'public', 'rendus')
    for (const rendu of rendusNonArchives) {
      if (rendu.pieces_jointes.length > 0) {
        for (const pj of rendu.pieces_jointes) {
          const filePath = path.join(uploadDir, path.basename(pj.chemin_fichier))
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath)
          }
        }
      }
    }

    // Supprimer tous les rendus non archivés (les fichiers en cascade)
    const devoirsToDelete = await prisma.devoir.findMany()

    const deletedRendus = await prisma.rendu.deleteMany({
      where: { archive: false },
    })

    // Supprimer tous les devoirs
    const deletedDevoirs = await prisma.devoir.deleteMany({})

    console.log(`✓ ${deletedRendus.count} rendus supprimés`)
    console.log(`✓ ${deletedDevoirs.count} devoirs supprimés`)
    console.log('Nettoyage annuel des devoirs et rendus terminé')
  } catch (error) {
    console.error('Erreur lors du nettoyage des devoirs et rendus:', error)
  }
}

/**
 * Calcule l'espace utilisé par un utilisateur et nettoie les pièces jointes orphelines
 */
export async function getUserStorageUsage(userId: bigint): Promise<number> {
  const result = await prisma.piece_jointe.aggregate({
    where: {
      message: {
        OR: [{ id_expediteur: userId }, { id_destinataire: userId }],
      },
    },
    _sum: {
      taille_octets: true,
    },
  })

  return Number(result._sum.taille_octets || 0)
}

/**
 * Vérifie si un utilisateur peut uploader un fichier
 */
export async function canUserUploadFile(userId: bigint, fileSize: number): Promise<boolean> {
  const currentUsage = await getUserStorageUsage(userId)
  return currentUsage + fileSize <= MAX_STORAGE_PER_USER
}

/**
 * Récupère le formatage lisible de l'espace utilisé
 */
export function formatStorageSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB'
  if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
  return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB'
}

/**
 * Récupère l'espace disponible restant pour un utilisateur
 */
export async function getUserRemainingStorage(userId: bigint): Promise<number> {
  const currentUsage = await getUserStorageUsage(userId)
  return MAX_STORAGE_PER_USER - currentUsage
}

/**
 * Nettoie tous les fichiers orphelines (en BDD mais supprimés du disque)
 */
export async function cleanupAllOrphanedAttachments(): Promise<number> {
  try {
    const allAttachments = await prisma.piece_jointe.findMany()

    let cleanedCount = 0
    const orphanIds: bigint[] = []

    for (const pj of allAttachments) {
      const filePath = path.join(process.cwd(), 'public', pj.chemin_fichier)

      // Si le fichier n'existe pas
      if (!fs.existsSync(filePath)) {
        orphanIds.push(pj.id_piece_jointe)
        cleanedCount++
      }
    }

    // Supprimer les orphelines en batch
    if (orphanIds.length > 0) {
      await prisma.piece_jointe.deleteMany({
        where: {
          id_piece_jointe: {
            in: orphanIds,
          },
        },
      })
      console.log(`✓ Nettoyage: ${cleanedCount} pièces jointes orphelines supprimées`)
    }

    return cleanedCount
  } catch (error) {
    console.error('Erreur lors du nettoyage des orphelines:', error)
    return 0
  }
}

/**
 * Nettoie les orphelines pour un utilisateur spécifique
 */
export async function cleanupUserOrphanedAttachments(userId: bigint): Promise<number> {
  try {
    const messages = await prisma.message.findMany({
      where: {
        OR: [{ id_expediteur: userId }, { id_destinataire: userId }],
      },
      include: { pieces_jointes: true },
    })

    let cleanedCount = 0
    const orphanIds: bigint[] = []

    for (const msg of messages) {
      for (const pj of msg.pieces_jointes) {
        const filePath = path.join(process.cwd(), 'public', pj.chemin_fichier)

        if (!fs.existsSync(filePath)) {
          orphanIds.push(pj.id_piece_jointe)
          cleanedCount++
        }
      }
    }

    if (orphanIds.length > 0) {
      await prisma.piece_jointe.deleteMany({
        where: {
          id_piece_jointe: {
            in: orphanIds,
          },
        },
      })
      console.log(
        `✓ Nettoyage utilisateur ${userId}: ${cleanedCount} pièces jointes orphelines supprimées`,
      )
    }

    return cleanedCount
  } catch (error) {
    console.error(`Erreur lors du nettoyage des orphelines pour ${userId}:`, error)
    return 0
  }
}

export const CLEANUP_MAX_STORAGE = MAX_STORAGE_PER_USER
