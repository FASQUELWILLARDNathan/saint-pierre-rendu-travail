import { cleanupAllMessages, cleanupDevirsAndRendus } from './cleanup-service.ts'
import { prisma } from '../config.ts'
import cron from 'node-cron'

/**
 * Démarre les tâches cron (20 août : promotion des élèves et nettoyage)
 */
export function startCronJobs() {
  cron.schedule('0 0 20 8 *', async () => {
    try {
      await cleanupAllMessages()
      await cleanupDevirsAndRendus()
      await promoteStudents()
    } catch (error) {
      console.error('❌ Erreur cron promotion:', error)
    }
  })
}

/**
 * Promeut les élèves à la classe suivante le 20 août
 */
export async function promoteStudents() {
  const classes = await prisma.classe.findMany()

  const normalize = (str: string) =>
    str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')

  const getLevel = (name: string) => {
    const n = normalize(name)

    if (n.includes('6eme')) return '6eme'
    if (n.includes('5eme')) return '5eme'
    if (n.includes('4eme')) return '4eme'
    if (n.includes('3eme')) return '3eme'

    if (n.includes('2nde') || n.includes('seconde')) {
      return 'seconde'
    }

    if (n.includes('1ere') || n.includes('premiere')) {
      return 'premiere'
    }

    if (n.includes('terminale')) {
      return 'terminale'
    }

    return null
  }

  const getSuffix = (name: string) => {
    const n = normalize(name)

    return n
      .replace(/6eme|5eme|4eme|3eme/g, '')
      .replace(/2nde|seconde/g, '')
      .replace(/1ere|premiere/g, '')
      .replace(/terminale/g, '')
      .replace(/[^a-z0-9]/g, '')
      .trim()
  }

  const letterToNum: Record<string, string> = {
    a: '1',
    b: '2',
    c: '3',
    d: '4',
    e: '5',
  }

  const numToLetter: Record<string, string> = {
    '1': 'a',
    '2': 'b',
    '3': 'c',
    '4': 'd',
    '5': 'e',
  }

  const terminaleClasses = classes.filter((c) => getLevel(c.nom_classe) === 'terminale')

  for (const classe of terminaleClasses) {
    const eleves = await prisma.eleve.findMany({
      where: { id_classe: classe.id_classe },
      select: { id_user: true },
    })

    const ids = eleves.map((e) => e.id_user)

    if (ids.length > 0) {
      await prisma.eleve.deleteMany({
        where: { id_classe: classe.id_classe },
      })

      await prisma.utilisateur.deleteMany({
        where: {
          id_user: {
            in: ids,
          },
        },
      })
    }
  }

  const promotionMap: Record<string, string> = {
    '6eme': '5eme',
    '5eme': '4eme',
    '4eme': '3eme',
    '3eme': 'seconde',
    seconde: 'premiere',
    premiere: 'terminale',
  }

  const processingOrder = ['premiere', 'seconde', '3eme', '4eme', '5eme', '6eme']

  for (const currentLevel of processingOrder) {
    const currentClasses = classes.filter((c) => getLevel(c.nom_classe) === currentLevel)

    for (const classe of currentClasses) {
      const nextLevel = promotionMap[currentLevel]

      if (!nextLevel) continue

      const currentSuffix = getSuffix(classe.nom_classe)

      let targetSuffix = currentSuffix

      if (currentLevel === '3eme' && nextLevel === 'seconde') {
        targetSuffix = letterToNum[currentSuffix] || currentSuffix
      } else if (currentLevel === 'seconde' && nextLevel === 'premiere') {
        targetSuffix = numToLetter[currentSuffix] || currentSuffix
      }

      const nextClass = classes.find((c) => {
        return getLevel(c.nom_classe) === nextLevel && getSuffix(c.nom_classe) === targetSuffix
      })

      if (!nextClass) {
        continue
      }

      const updated = await prisma.eleve.updateMany({
        where: {
          id_classe: classe.id_classe,
        },
        data: {
          id_classe: nextClass.id_classe,
        },
      })

      if (updated.count > 0) {
      }
    }
  }
}
