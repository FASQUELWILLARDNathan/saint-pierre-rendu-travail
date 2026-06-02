import express from 'express'
import { prisma } from '../config.ts'
import bcrypt from 'bcrypt'
import { authenticateToken } from '../middleware/auth.ts'
import { authorizeRole } from '../middleware/role.ts'

const router = express.Router()

// GET /api/users/eleves/list - Get all eleves with their data (MUST BE BEFORE /:id)
router.get(
  '/eleves/list',
  authenticateToken,
  authorizeRole('administrateur', 'professeur'),
  async (req: express.Request, res: express.Response) => {
    try {
      const users = await prisma.utilisateur.findMany({
        where: { role: 'eleve' },
        select: {
          id_user: true,
          nom: true,
          prenom: true,
          email: true,
          eleve: {
            select: {
              id_classe: true,
              annee: true,
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
        },
        orderBy: {
          nom: 'asc',
        },
      })

      // Format the response
      const formattedUsers = users.map((user) => ({
        id_user: user.id_user.toString(),
        nom: user.nom,
        prenom: user.prenom,
        email: user.email,
        id_classe: user.eleve?.id_classe?.toString() || null,
        annee: user.eleve?.annee || null,
        specialites: user.eleve?.specialites.map((s) => s.specialite) || [],
        options: user.eleve?.options.map((o) => o.option) || [],
      }))

      res.json(formattedUsers)
    } catch (error) {
      console.error('Erreur lors de la récupération des élèves:', error)
      res.status(500).json({ error: 'Erreur serveur' })
    }
  },
)

// Recupere tous les utilisateurs
router.get(
  '/',
  authenticateToken,
  authorizeRole('administrateur'),
  async (req: express.Request, res: express.Response) => {
    try {
      const users = await prisma.utilisateur.findMany({
        select: {
          id_user: true,
          nom: true,
          prenom: true,
          login: true,
          email: true,
          role: true,

          eleve: {
            select: {
              id_user: true,
              classe: true,
              annee: true,
            },
          },

          professeur: {
            select: {
              id_user: true,
              matiere: true,
            },
          },
        },
      })

      // Transforme les BigInt en String
      const formattedUsers = users.map((user) => ({
        ...user,
        id_user: user.id_user.toString(),
      }))

      res.json(formattedUsers)
    } catch (error) {
      console.error('Erreur lors de la recherche d utilisateur:', error)
      res.status(500).json({ error: 'Echec lors de la recherche d utilisateur' })
    }
  },
)

// Recupere l'utilisateur par son ID
router.get(
  '/:id',
  authenticateToken,
  authorizeRole('administrateur'),
  async (req: express.Request, res: express.Response) => {
    try {
      const { id } = req.params

      const user = await prisma.utilisateur.findUnique({
        where: { id_user: BigInt(id) },
        select: {
          id_user: true,
          nom: true,
          prenom: true,
          login: true,
          email: true,
          role: true,

          eleve: {
            select: {
              id_user: true,
              classe: true,
              annee: true,
            },
          },

          professeur: {
            select: {
              id_user: true,
              matiere: true,
            },
          },
        },
      })

      if (!user) {
        return res.status(404).json({ error: 'Utilisateur non trouvé' })
      }

      res.json({
        ...user,
        id_user: user.id_user.toString(),
      })
    } catch (error) {
      console.error('Erreur lors de la recherche d utilisateur:', error)
      res.status(500).json({ error: 'Echec lors de la recherche d utilisateur' })
    }
  },
)

// PUT /api/users/:id - Update a user (for admins/profs to update eleves)
router.put(
  '/:id',
  authenticateToken,
  authorizeRole('administrateur'),
  async (req: express.Request, res: express.Response) => {
    try {
      const { id } = req.params
      const { nom, prenom, email, password, id_classe, annee, specialites, options } = req.body

      // Update user basic info (include password hashing if provided)
      const updateData: any = {
        nom: nom || undefined,
        prenom: prenom || undefined,
        email: email || undefined,
      }

      if (password) {
        updateData.hashed_password = await bcrypt.hash(password, 10)
      }

      await prisma.utilisateur.update({
        where: { id_user: BigInt(id) },
        data: updateData,
      })

      // Update eleve data
      if (id_classe !== undefined || annee || specialites || options) {
        const eleveUpdate: any = {}

        if (id_classe !== undefined) {
          eleveUpdate.id_classe = id_classe ? BigInt(id_classe) : null
        }

        if (annee !== undefined) {
          eleveUpdate.annee = annee || null
        }

        if (Array.isArray(specialites)) {
          eleveUpdate.specialites = {
            deleteMany: {},
            create: specialites.map((sid: any) => ({
              id_specialite: BigInt(sid),
            })),
          }
        }

        if (Array.isArray(options)) {
          eleveUpdate.options = {
            deleteMany: {},
            create: options.map((oid: any) => ({
              id_option: BigInt(oid),
            })),
          }
        }

        if (Object.keys(eleveUpdate).length > 0) {
          await prisma.eleve.update({
            where: { id_user: BigInt(id) },
            data: eleveUpdate,
          })
        }
      }

      res.json({ message: 'Utilisateur mis à jour avec succès' })
    } catch (error) {
      console.error("Erreur lors de la mise à jour de l'utilisateur:", error)
      res.status(500).json({ error: 'Erreur serveur' })
    }
  },
)

// POST /api/users - Create a new eleve (for admins/profs)
router.post(
  '/',
  authenticateToken,
  authorizeRole('administrateur'),
  async (req: express.Request, res: express.Response) => {
    try {
      const {
        nom,
        prenom,
        email,
        password,
        id_classe,
        annee,
        specialites = [],
        options = [],
        role = 'eleve',
      } = req.body

      // Validate required fields
      if (!nom || !prenom || !password) {
        return res.status(400).json({ error: 'Nom, prénom et mot de passe requis sont requis' })
      }

      // Check if email already exists
      const existingUser = await prisma.utilisateur.findUnique({
        where: { email },
      })

      if (existingUser) {
        return res.status(409).json({ error: 'Cet email existe déjà' })
      }

      // Generate login from nom/prenom
      const clean = (str: string) =>
        str
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/\s+/g, '')

      const login = clean(nom) + '.' + clean(prenom)

      // Check if login already exists
      const existingLogin = await prisma.utilisateur.findUnique({
        where: { login },
      })

      if (existingLogin) {
        return res.status(409).json({ error: 'Ce login existe déjà' })
      }

      if (!password) {
        return res.status(400).json({ error: 'Password requis' })
      }

      const hashedPassword = await bcrypt.hash(password, 10)

      // Create user with eleve data if role is 'eleve'
      const result = await prisma.$transaction(async (tx) => {
        const user = await tx.utilisateur.create({
          data: {
            nom,
            prenom,
            login,
            email,
            hashed_password: hashedPassword,
            role: role,
          },
        })

        if (role === 'eleve') {
          const eleveData: any = {
            id_user: user.id_user,
          }

          if (id_classe) {
            eleveData.id_classe = BigInt(id_classe)
          }

          if (annee) {
            eleveData.annee = annee
          }

          const eleve = await tx.eleve.create({
            data: eleveData,
          })

          // Add specialites
          if (Array.isArray(specialites) && specialites.length > 0) {
            await Promise.all(
              specialites.map((sid: any) =>
                tx.eleveSpecialite.create({
                  data: {
                    id_eleve: user.id_user,
                    id_specialite: BigInt(sid),
                  },
                }),
              ),
            )
          }

          // Add options
          if (Array.isArray(options) && options.length > 0) {
            await Promise.all(
              options.map((oid: any) =>
                tx.eleveOption.create({
                  data: {
                    id_eleve: user.id_user,
                    id_option: BigInt(oid),
                  },
                }),
              ),
            )
          }

          return { user, eleve }
        }

        return { user }
      })

      // Debug: re-read created user from DB to confirm stored value
      try {
        const created = await prisma.utilisateur.findUnique({
          where: { id_user: result.user?.id_user as any },
          select: { id_user: true, hashed_password: true },
        })
      } catch (dbgErr) {
        console.error('[DEBUG] erreur en vérifiant le hash stocké:', dbgErr)
      }

      res.json({
        message: 'Utilisateur créé avec succès',
        user: result.user,
      })
    } catch (error) {
      console.error("Erreur lors de la création de l'utilisateur:", error)
      res.status(500).json({ error: 'Erreur serveur' })
    }
  },
)

// DELETE /api/users/:id - Delete a user (for admins/profs)
router.delete(
  '/:id',
  authenticateToken,
  authorizeRole('administrateur'),
  async (req: express.Request, res: express.Response) => {
    try {
      const { id } = req.params

      // Check if user exists
      const user = await prisma.utilisateur.findUnique({
        where: { id_user: BigInt(id) },
        select: {
          id_user: true,
          nom: true,
          prenom: true,
          role: true,
        },
      })

      if (!user) {
        return res.status(404).json({ error: 'Utilisateur non trouvé' })
      }

      // Delete user (will cascade delete related records like eleve)
      await prisma.utilisateur.delete({
        where: { id_user: BigInt(id) },
      })

      res.json({
        message: `Utilisateur ${user.prenom} ${user.nom} supprimé avec succès`,
      })
    } catch (error) {
      console.error("Erreur lors de la suppression de l'utilisateur:", error)
      res.status(500).json({ error: 'Erreur serveur' })
    }
  },
)

export default router
