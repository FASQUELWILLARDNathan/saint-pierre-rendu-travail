import express, { Router } from 'express'
import bcrypt from 'bcrypt'
import crypto from 'crypto'
import type { eleve } from '@prisma/client'
import { prisma } from '../config.ts'
import { signToken } from '../jwt-manager.ts'
import { sendResetPasswordEmail, sendWelcomeEmail } from '../mail-service.ts'

const router = Router()

// Routes d'authentification de l'API.
// Gère l'inscription, la connexion, la déconnexion, ainsi que la réinitialisation de mot de passe des utilisateurs.
// Les mots de passe sont hashés avec bcrypt et l'authentification repose sur des tokens JWT.

// Génère automatiquement l'adresse email d'un élève à partir de son nom et prénom.
function generateStudentEmail(nom: string, prenom: string): string {
  const clean = (str: string) =>
    str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Enleve les accents
      .replace(/\s+/g, '') // Enleve les espaces

  return `${clean(nom)}.${clean(prenom)}@cs-saintpierrecalais.fr`
}

// Route d'inscription utilisateur.
// Crée un compte élève ou professeur, vérifie les doublons et envoie un email de bienvenue.
router.post('/sign-up', async (req: express.Request, res: express.Response) => {
  try {
    const { nom, prenom, login, password, role, classe, annee, email: professeurEmail } = req.body
    let eleve: eleve | undefined

    if (!nom || !prenom || !login || !password || !role) {
      return res.status(400).json({ error: 'Des champs sont manquants' })
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
      return res.status(409).json({ error: 'Ce login existe deja' })
    }

    // Genere ou utilise l'email donné en fonction du role de l'utilisateur
    const email = role === 'eleve' ? generateStudentEmail(nom, prenom) : professeurEmail

    // Check si l'email existe deja
    const existingEmail = await prisma.utilisateur.findUnique({
      where: { email },
    })

    if (existingEmail) {
      return res.status(409).json({ error: 'Cet email existe deja' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    // Créer l'utilisateur
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

    // Envoie mail lors de l'inscription
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
    return res.status(500).json({ error: 'L enregistrement a echouer' })
  }
})


// Route de connexion utilisateur.
// Vérifie les identifiants et retourne un token JWT.
router.post('/sign-in', async (req: express.Request, res: express.Response) => {
  try {
    const { login, password } = req.body

    if (!login || !password) {
      return res.status(400).json({ error: 'Champs login ou mot de passe manquant' })
    }

    const user = await prisma.utilisateur.findUnique({
      where: { login },
      include: {
        eleve: true,
        professeur: true,
      },
    })

    if (!user) {
      return res.status(401).json({ error: 'Champs login ou mot de passe manquant' })
    }

    const isPasswordValid = await bcrypt.compare(password, user.hashed_password)

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Champs login ou mot de passe manquant' })
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
    console.error('Erreur durant l enregistrement:', error)
    res.status(500).json({ error: 'Erreur lors de l enregistrement' })
  }
})


// Route permettant de demander une réinitialisation de mot de passe.
// Génère un token temporaire envoyé par email.
router.post('/forgot-password', async (req: express.Request, res: express.Response) => {
  try {
    const { email } = req.body

    if (!email) {
      return res.status(400).json({ error: 'Un mail est requis' })
    }

    const user = await prisma.utilisateur.findUnique({
      where: { email },
    })

    if (!user) {
      // Pour des questions de securité il n'est pas précisé si l'email existe
      return res.json({ message: 'Si cet email existe, un lien de reinitialisation sera envoyer' })
    }

    // Generete un token de reset de mot de passe
    const resetToken = crypto.randomBytes(32).toString('hex')
    const resetTokenExpiry = new Date(Date.now() + 3600000)

    // Enregistre le token de reset de mot de passe
    await prisma.utilisateur.update({
      where: { id_user: user.id_user },
      data: {
        reset_token: resetToken,
        reset_token_expiry: resetTokenExpiry,
      },
    })

    // Envoie le mail de reinitialisation de mot de passe
    await sendResetPasswordEmail(email, resetToken)

    res.json({ message: 'Si cet email existe, un lien de reinitialisation sera envoyer' })
  } catch (error) {
    console.error('Erreur dans forgot-password:', error)
    res.status(500).json({ error: 'Echec lors de la requete de reinitialisation de mot de passe' })
  }
})

// Route de réinitialisation de mot de passe.
// Vérifie le token reçu puis met à jour le mot de passe utilisateur.
router.post('/reset-password', async (req: express.Request, res: express.Response) => {
  try {
    const { token, newPassword } = req.body

    if (!token || !newPassword) {
      return res.status(400).json({ error: 'Un token et un nouveau mot de passe est requis' })
    }

    // Trouve le user avec ce token
    const user = await prisma.utilisateur.findFirst({
      where: {
        reset_token: token,
      },
    })

    if (!user) {
      return res.status(401).json({ error: 'Token de reset invalide' })
    }

    // Check si le token est expiré
    if (user.reset_token_expiry && new Date() > user.reset_token_expiry) {
      return res.status(401).json({ error: 'Token de reset a expirer' })
    }

    // Encrypte le nouveau mot de passe
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    // Met a jour le user et reset le password
    await prisma.utilisateur.update({
      where: { id_user: user.id_user },
      data: {
        hashed_password: hashedPassword,
        reset_token: null,
        reset_token_expiry: null,
      },
    })

    res.json({ message: 'Le mot de passe a été reinitialiser' })
  } catch (error) {
    console.error('Error in reset-password:', error)
    res.status(500).json({ error: 'Echec lors de la reinitialisation de mot de passe' })
  }
})

// Route de deconnexion de l'utilisateur.
router.post('/logout', async (req: express.Request, res: express.Response) => {
  try {
    res.json({ message: 'Deconnexion reussie' })
  } catch (error) {
    console.error('Erreur durant la deconnexion:', error)
    res.status(500).json({ error: 'Echec lors de la deconnexion' })
  }
})

export default router
