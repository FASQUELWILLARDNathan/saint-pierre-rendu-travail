import 'dotenv/config'
import app from './app.ts'
import { prisma, PORT } from './config.ts'
import { startCronJobs } from './services/cron-manager.ts'
import { cleanupRendusFolder } from './services/cleanup-rendus.ts'
import { cleanupDevoirsFolder } from './services/cleanup-devoirs.ts'
import { cleanupCoursFolder } from './services/cleanup-cours.ts'

const server = app.listen(PORT, () => {
  console.log(`Api serveur tournant sur http://localhost:${PORT}`)
  console.log(`Health check: http://localhost:${PORT}/api/health`)

  startCronJobs()
  cleanupRendusFolder()
  cleanupDevoirsFolder()
  cleanupCoursFolder()
})

const gracefulShutdown = async () => {
  console.log('\nShutting down...')
  server.close(async () => {
    await prisma.$disconnect()
    console.log('Serveur et base de données fermés')
    process.exit(0)
  })

  setTimeout(() => {
    console.error('Shutdown forcé')
    process.exit(1)
  }, 10000)
}

process.on('SIGINT', gracefulShutdown)
process.on('SIGTERM', gracefulShutdown)
