import express, { Router } from 'express'
import bcrypt from 'bcrypt'
import type { eleve } from '@prisma/client'
import { prisma } from '../config.ts'
import { signToken } from '../jwt-manager.ts'

const router = Router()

router.post('/sign-up', async (req: express.Request, res: express.Response) => {
  try {
    const { nom, prenom, login, password, role, classe, annee } = req.body
    let eleve: eleve | undefined

    if (!nom || !prenom || !login || !password || !role) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    if (role === 'eleve' && (!classe || !annee)) {
      return res.status(400).json({
        error: 'Classe et année obligatoires pour un élève',
      })
    }

    const existingUser = await prisma.utilisateur.findUnique({
      where: { login },
    })

    if (existingUser) {
      return res.status(409).json({ error: 'Login already exists' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user
    const user = await prisma.utilisateur.create({
      data: {
        nom,
        prenom,
        login,
        hashed_password: hashedPassword,
        role,
      },
      include: {
        eleve: true,
        professeur: true,
      },
    })

    if (role === 'eleve') {
      const safeClasse = String(req.body.classe)
      const safeAnnee = String(req.body.annee)

      eleve = await prisma.eleve.create({
        data: {
          id_user: user.id_user,
          classe: safeClasse,
          annee: safeAnnee,
        },
      })
    }

    const token = signToken({ id_user: user.id_user.toString(), login: user.login })

    return res.json({
      token,
      user: {
        id_user: user.id_user.toString(),
        nom: user.nom,
        prenom: user.prenom,
        login: user.login,
        role: user.role,
        eleve: eleve,
      },
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Failed to sign up' })
  }
})

router.post('/sign-in', async (req: express.Request, res: express.Response) => {
  try {
    const { login, password } = req.body

    if (!login || !password) {
      return res.status(400).json({ error: 'Missing login or password' })
    }

    const user = await prisma.utilisateur.findUnique({
      where: { login },
      include: {
        eleve: true,
        professeur: true,
      },
    })

    if (!user) {
      return res.status(401).json({ error: 'Invalid login or password' })
    }

    const isPasswordValid = await bcrypt.compare(password, user.hashed_password)

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid login or password' })
    }

    const token = signToken({ id_user: user.id_user.toString(), login: user.login })

    res.json({
      token,
      user: {
        id_user: user.id_user.toString(),
        nom: user.nom,
        prenom: user.prenom,
        login: user.login,
        role: user.role,
      },
    })
  } catch (error) {
    console.error('Error during sign in:', error)
    res.status(500).json({ error: 'Failed to sign in' })
  }
})

router.post('/logout', async (req: express.Request, res: express.Response) => {
  try {
    res.json({ message: 'Logged out successfully' })
  } catch (error) {
    console.error('Error during logout:', error)
    res.status(500).json({ error: 'Failed to logout' })
  }
})

export default router
