import fs from 'fs'
import path from 'path'
import { prisma } from '../config.ts'

const coursDir = '/app/public/cours'

export async function cleanupCoursFolder() {
  try {
    if (!fs.existsSync(coursDir)) return

    const pieces = await prisma.ressource_cours.findMany({
      select: { chemin_fichier: true },
    })

    const validFiles = new Set(pieces.map((p) => p.chemin_fichier.replace('/cours/', '')))

    const filesOnDisk = fs.readdirSync(coursDir)

    for (const file of filesOnDisk) {
      if (!validFiles.has(file)) {
        const fullPath = path.join(coursDir, file)
        fs.unlinkSync(fullPath)
      }
    }
    console.log('✔️ Nettoyage des cours terminé')
  } catch (error) {
    console.error('Erreur nettoyage cours:', error)
  }
}
