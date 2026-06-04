import { Router } from 'express'
import { prisma } from '../config.ts'

const router = Router()

router.get('/classes', async (req, res) => {
  const classes = await prisma.classe.findMany()
  res.json(classes)
})

router.get('/specialites', async (req, res) => {
  const specialites = await prisma.specialite.findMany()
  res.json(specialites)
})

router.get('/options', async (req, res) => {
  const options = await prisma.option.findMany()
  res.json(options)
})

export default router
