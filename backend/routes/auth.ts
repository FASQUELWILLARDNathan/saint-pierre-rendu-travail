import express, { Router } from 'express'
import bcrypt from 'bcrypt'
import crypto from 'crypto'
import type { eleve, professeur } from '@prisma/client'
import { prisma } from '../config.ts'
import { signToken } from '../jwt-manager.ts'
import { sendResetPasswordEmail, sendWelcomeEmail } from '../mail-service.ts'
import { authLimiter, signInLimiter, forgotPasswordLimiter } from '../middleware/rate-limit.ts'
import { authenticateToken } from '../middleware/auth.ts'
const router = Router()

// safe select pour la route users
export const safeUserSelect = {
  id_user: true,
  nom: true,
  prenom: true,
  login: true,
  email: true,
  role: true,

  eleve: {
    select: {
      annee: true,
      classe: {
        select: {
          id_classe: true,
          nom_classe: true,
          niveau: true,
          lettre: true,
          matieres: {
            select: {
              matiere: {
                select: {
                  id_matiere: true,
                  nom_matiere: true,
                  couleur: true,
                  icon_url: true,
                  devoir_icon_url: true,
                },
              },
            },
          },
        },
      },
      specialites: {
        select: {
          specialite: {
            select: {
              id_specialite: true,
              nom_specialite: true,
            },
          },
        },
      },
      options: {
        select: {
          option: {
            select: {
              id_option: true,
              nom_option: true,
            },
          },
        },
      },
    },
  },

  professeur: {
    select: {
      matiere: true,
      classes_enseignees: {
        select: {
          classe: {
            select: {
              id_classe: true,
              nom_classe: true,
            },
          },
        },
      },
      specialites_enseignees: {
        select: {
          specialite: {
            select: {
              id_specialite: true,
              nom_specialite: true,
            },
          },
        },
      },
      options_enseignees: {
        select: {
          option: {
            select: {
              id_option: true,
              nom_option: true,
            },
          },
        },
      },
    },
  },
}

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
router.post('/sign-up', authLimiter, async (req: express.Request, res: express.Response) => {
  try {
    const {
      nom,
      prenom,
      login,
      password,
      role,
      classe,
      annee,
      email: professeurEmail,
      specialites,
      options,
    } = req.body

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
    const result = await prisma.$transaction(async (tx) => {
      const createdUser = await tx.utilisateur.create({
        data: {
          nom,
          prenom,
          login,
          email,
          hashed_password: hashedPassword,
          role,
        },
      })

      let eleve = null
      let professeur = null

      if (role === 'eleve') {
        // Trouver la classe par ID
        const classeRecord = await tx.classe.findUnique({
          where: {
            id_classe: Number(req.body.classe),
          },
        })

        // Créer l'élève
        eleve = await tx.eleve.create({
          data: {
            id_user: createdUser.id_user,
            annee: String(req.body.annee),
            id_classe: classeRecord?.id_classe ?? null,
          },
        })

        // Enregistrer les spécialités
        if (Array.isArray(specialites)) {
          for (const id_specialite of specialites) {
            await tx.eleveSpecialite.create({
              data: {
                id_eleve: createdUser.id_user,
                id_specialite: Number(id_specialite),
              },
            })
          }
        }

        // Enregistrer les options
        if (Array.isArray(options)) {
          for (const id_option of options) {
            await tx.eleveOption.create({
              data: {
                id_eleve: createdUser.id_user,
                id_option: Number(id_option),
              },
            })
          }
        }
      }

      if (role === 'professeur') {
        professeur = await tx.professeur.create({
          data: {
            id_user: createdUser.id_user,
            matiere: req.body.matiere ?? null,
          },
        })
      }

      return { createdUser, eleve, professeur }
    })

    // Envoie mail lors de l'inscription
    await sendWelcomeEmail(email, nom, prenom)

    const token = signToken({
      id_user: result.createdUser.id_user.toString(),
      login: result.createdUser.login,
      role: result.createdUser.role,
    })

    const user = await prisma.utilisateur.findUnique({
      where: { id_user: result.createdUser.id_user },
      select: safeUserSelect,
    })

    return res.json({
      token,
      user,
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'L enregistrement a echouer' })
  }
})

// Route de connexion utilisateur.
// Vérifie les identifiants et retourne un token JWT.
router.post('/sign-in', signInLimiter, async (req: express.Request, res: express.Response) => {
  try {
    const { login, password } = req.body

    if (!login || !password) {
      return res.status(400).json({ error: 'Champs login ou mot de passe manquant' })
    }

    const user = await prisma.utilisateur.findUnique({
      where: { login },
      select: {
        ...safeUserSelect,
        hashed_password: true,
      },
    })

    if (!user) {
      return res.status(401).json({ error: 'Champs login ou mot de passe manquant' })
    }

    const isPasswordValid = await bcrypt.compare(password, user.hashed_password)

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Champs login ou mot de passe manquant' })
    }

    const token = signToken({
      id_user: user.id_user.toString(),
      login: user.login,
      role: user.role,
    })

    // Supprime le mot de passe hashé avant de renvoyer l'utilisateur
    const { hashed_password, ...safeUser } = user

    res.json({
      token,
      user: safeUser,
    })
  } catch (error) {
    console.error('Erreur durant l enregistrement:', error)
    res.status(500).json({ error: 'Erreur lors de l enregistrement' })
  }
})

/**
 * GET /me - Récupère le profil de l'utilisateur connecté
 */
router.get('/me', authenticateToken, async (req, res) => {
  const user = await prisma.utilisateur.findUnique({
    where: { id_user: BigInt(req.user.id_user) },
    select: safeUserSelect,
  })
  res.json({ user })
})

// Route permettant de demander une réinitialisation de mot de passe.
// Génère un token temporaire envoyé par email.
router.post(
  '/forgot-password',
  forgotPasswordLimiter,
  async (req: express.Request, res: express.Response) => {
    try {
      const { email } = req.body

      if (!email) {
        return res.status(400).json({ error: 'Un mail est requis' })
      }

      const user = await prisma.utilisateur.findUnique({
        where: { email },
        select: {
          id_user: true,
          email: true,
        },
      })

      if (!user) {
        // Pour des questions de securité il n'est pas précisé si l'email existe
        return res.json({
          message: 'Si cet email existe, un lien de reinitialisation sera envoyer',
        })
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
      res
        .status(500)
        .json({ error: 'Echec lors de la requete de reinitialisation de mot de passe' })
    }
  },
)

// Route de réinitialisation de mot de passe.
// Vérifie le token reçu puis met à jour le mot de passe utilisateur.
router.post('/reset-password', authLimiter, async (req: express.Request, res: express.Response) => {
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
      select: {
        id_user: true,
        reset_token_expiry: true,
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
