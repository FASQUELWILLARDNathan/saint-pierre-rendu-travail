import express, { Router } from 'express'
import bcrypt from 'bcrypt'
import crypto from 'crypto'
import type { eleve } from '@prisma/client'
import { prisma } from '../config.ts'
import { signToken } from '../jwt-manager.ts'
import { sendResetPasswordEmail, sendWelcomeEmail } from '../mail-service.ts'

const router = Router()

// Helper function to generate email for student
function generateStudentEmail(nom: string, prenom: string): string {
  const clean = (str: string) =>
    str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // remove accents
      .replace(/\s+/g, '') // remove spaces

  return `${clean(nom)}.${clean(prenom)}@cs-saintpierrecalais.fr`
}

router.post('/sign-up', async (req: express.Request, res: express.Response) => {
  try {
    const { nom, prenom, login, password, role, classe, annee, email: professeurEmail } = req.body
    let eleve: eleve | undefined

    if (!nom || !prenom || !login || !password || !role) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    if (role === 'eleve' && (!classe || !annee)) {
      return res.status(400).json({
        error: 'Classe et année obligatoires pour un élève',
      })
    }

    if (role === 'professeur' && !professeurEmail) {
      return res.status(400).json({
        error: 'Email obligatoire pour un professeur',
      })
    }

    const existingUser = await prisma.utilisateur.findUnique({
      where: { login },
    })

    if (existingUser) {
      return res.status(409).json({ error: 'Login already exists' })
    }

    // Generate or use provided email
    const email = role === 'eleve' ? generateStudentEmail(nom, prenom) : professeurEmail

    // Check if email already exists
    const existingEmail = await prisma.utilisateur.findUnique({
      where: { email },
    })

    if (existingEmail) {
      return res.status(409).json({ error: 'Email already exists' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user
    const user = await prisma.utilisateur.create({
      data: {
        nom,
        prenom,
        login,
        email,
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

    // Send welcome email
    await sendWelcomeEmail(email, nom, prenom)

    const token = signToken({ id_user: user.id_user.toString(), login: user.login })

    return res.json({
      token,
      user: {
        id_user: user.id_user.toString(),
        nom: user.nom,
        prenom: user.prenom,
        login: user.login,
        email: user.email,
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
        email: user.email,
        role: user.role,
      },
    })
  } catch (error) {
    console.error('Error during sign in:', error)
    res.status(500).json({ error: 'Failed to sign in' })
  }
})

router.post('/forgot-password', async (req: express.Request, res: express.Response) => {
  try {
    const { email } = req.body

    if (!email) {
      return res.status(400).json({ error: 'Email is required' })
    }

    const user = await prisma.utilisateur.findUnique({
      where: { email },
    })

    if (!user) {
      // Don't reveal if email exists for security
      return res.json({ message: 'If email exists, reset link will be sent' })
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex')
    const resetTokenExpiry = new Date(Date.now() + 3600000) // 1 hour from now

    // Save reset token to user
    await prisma.utilisateur.update({
      where: { id_user: user.id_user },
      data: {
        reset_token: resetToken,
        reset_token_expiry: resetTokenExpiry,
      },
    })

    // Send reset password email
    await sendResetPasswordEmail(email, resetToken)

    res.json({ message: 'If email exists, reset link will be sent' })
  } catch (error) {
    console.error('Error in forgot-password:', error)
    res.status(500).json({ error: 'Failed to process forgot password request' })
  }
})

router.post('/reset-password', async (req: express.Request, res: express.Response) => {
  try {
    const { token, newPassword } = req.body

    if (!token || !newPassword) {
      return res.status(400).json({ error: 'Token and new password are required' })
    }

    // Find user with this reset token
    const user = await prisma.utilisateur.findFirst({
      where: {
        reset_token: token,
      },
    })

    if (!user) {
      return res.status(401).json({ error: 'Invalid reset token' })
    }

    // Check if token is expired
    if (user.reset_token_expiry && new Date() > user.reset_token_expiry) {
      return res.status(401).json({ error: 'Reset token has expired' })
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    // Update user password and clear reset token
    await prisma.utilisateur.update({
      where: { id_user: user.id_user },
      data: {
        hashed_password: hashedPassword,
        reset_token: null,
        reset_token_expiry: null,
      },
    })

    res.json({ message: 'Password reset successfully' })
  } catch (error) {
    console.error('Error in reset-password:', error)
    res.status(500).json({ error: 'Failed to reset password' })
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
