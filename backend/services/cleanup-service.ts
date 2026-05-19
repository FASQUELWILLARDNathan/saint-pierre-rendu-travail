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
 * Calcule l'espace utilisé par un utilisateur
 */
export async function getUserStorageUsage(userId: bigint): Promise<number> {
  const messages = await prisma.message.findMany({
    where: {
      OR: [{ id_expediteur: userId }, { id_destinataire: userId }],
    },
    include: { pieces_jointes: true },
  })

  let totalSize = 0
  for (const msg of messages) {
    for (const pj of msg.pieces_jointes) {
      totalSize += Number(pj.taille_octets)
    }
  }

  return totalSize
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

export const CLEANUP_MAX_STORAGE = MAX_STORAGE_PER_USER
