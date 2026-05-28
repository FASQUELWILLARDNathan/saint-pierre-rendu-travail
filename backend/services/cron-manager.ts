import { cleanupAllMessages, cleanupDevirsAndRendus } from './cleanup-service.ts'

/**
 * Démarre les tâches cron pour le serveur
 */
export function startCronJobs() {
  // Nettoyer les messages et devoirs chaque 20 août à minuit
  scheduleCleanupJob()
}

/**
 * Planifie le nettoyage annuel pour le 20 août
 */
function scheduleCleanupJob() {
  const checkCleanup = () => {
    const now = new Date()
    const currentDay = now.getDate()
    const currentMonth = now.getMonth() + 1 // 0-indexed

    // Si c'est le 20 août
    if (currentMonth === 8 && currentDay === 20) {
      const hour = now.getHours()
      const minute = now.getMinutes()

      // Exécuter à minuit (00:00)
      if (hour === 0 && minute === 0) {
        console.log('🧹 Exécution du nettoyage annuel...')
        cleanupAllMessages()
        cleanupDevirsAndRendus()
      }
    }
  }

  // Vérifier chaque minute si c'est le moment de nettoyer
  setInterval(checkCleanup, 60 * 1000)

  console.log('✓ Tâche cron de nettoyage programmée (20 août à 00:00)')
}

/**
 * Alternative: utiliser node-cron pour une meilleure gestion (optional)
 * Pour utiliser ceci, installer: npm install node-cron
 * Décommenter le code ci-dessous et commenter la solution précédente
 */

/*
import cron from 'node-cron'

export function startCronJobs() {
  // Nettoyer les messages le 20 août à minuit
  cron.schedule('0 0 20 8 *', () => {
    console.log('🧹 Exécution du nettoyage annuel...')
    cleanupAllMessages()
  })

  console.log('✓ Tâche cron de nettoyage programmée (20 août à 00:00)')
}
*/
