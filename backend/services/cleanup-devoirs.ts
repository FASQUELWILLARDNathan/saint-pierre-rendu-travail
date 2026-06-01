import fs from 'fs'
import path from 'path'
import { prisma } from '../config.ts'

const devoirsDir = '/app/public/devoirs'

export async function cleanupDevoirsFolder() {
  try {
    // 1. Récupère tous les fichiers enregistrés en BDD
    const pieces = await prisma.piece_jointe_devoir.findMany({
      select: { chemin_fichier: true },
    })

    // 2. Transforme en noms de fichiers réels
    const validFiles = new Set(
      pieces.map((p) => {
        // /devoirs/123-456-file.pdf → 123-456-file.pdf
        return p.chemin_fichier.replace('/devoirs/', '')
      }),
    )

    // 3. Liste tous les fichiers du dossier
    const filesOnDisk = fs.readdirSync(devoirsDir)

    // 4. Supprime ceux qui ne sont pas en BDD
    for (const file of filesOnDisk) {
      if (!validFiles.has(file)) {
        const fullPath = path.join(devoirsDir, file)
        console.log('🗑️ Suppression fichier orphelin (devoir) :', fullPath)
        fs.unlinkSync(fullPath)
      }
    }

    console.log('✔️ Nettoyage des devoirs terminé')
  } catch (error) {
    console.error('Erreur nettoyage devoirs:', error)
  }
}
