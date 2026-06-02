// routes/matieres.ts
import { Router } from 'express'
import { prisma } from '../config.ts'
import { authenticateToken } from '../middleware/auth.ts'

const router = Router()

/**
 * GET /api/matieres - Lister toutes les matières
 */
router.get('/', authenticateToken, async (req, res) => {
  const matieres = await prisma.matiere.findMany()
  res.json(matieres)
})

export default router
