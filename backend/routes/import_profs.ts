import { Router } from 'express'
import { prisma } from '../config.ts'
import { authenticateToken } from '../middleware/auth.ts'
import multer from 'multer'
import XLSX from 'xlsx'
import bcrypt from 'bcrypt'
import { generateSecurePassword } from './import.ts'

const router = Router()
const upload = multer({ storage: multer.memoryStorage() })

// Mapping matières → seed
const MATIERES_MAP: Record<string, string> = {
  MATH: 'Mathématiques',
  MATHS: 'Mathématiques',
  MATHEMATIQUES: 'Mathématiques',

  FRANCAIS: 'Français',
  FRANÇAIS: 'Français',

  ANGLAIS: 'Anglais',
  ANGL: 'Anglais',
  ENG: 'Anglais',

  ESPAGNOL: 'Espagnol',
  ESP: 'Espagnol',

  ALLEMAND: 'Allemand',
  ALL: 'Allemand',

  HG: 'Histoire-Géo',
  HISTOIRE: 'Histoire-Géo',
  GEOGRAPHIE: 'Histoire-Géo',
  GEO: 'Histoire-Géo',

  EMC: 'EMC',

  SVT: 'SVT',

  PHYSIQUE: 'Physique',
  CHIMIE: 'Physique',
  'PH-CH': 'Physique',

  TECHNOLOGIE: 'Technologie',
  TECHNO: 'Technologie',

  EPS: 'Sport',
  SPORT: 'Sport',

  ARTS: 'Arts Plastiques',
  'ARTS PLASTIQUES': 'Arts Plastiques',

  MUSIQUE: 'Musique',

  SES: 'SES',
  SNT: 'SNT',
  PHILOSOPHIE: 'Philosophie',
  PHILO: 'Philosophie',

  'ENSEIGNEMENT SCIENTIFIQUE': 'Enseignement Scientifique',
  ES: 'Enseignement Scientifique',
}

function normalize(s: string) {
  return s
    .trim()
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

router.post('/profs', authenticateToken, upload.single('fichier'), async (req, res) => {
  try {
    const userId = req.user?.id_user
    const apiUser = await prisma.utilisateur.findUnique({ where: { id_user: BigInt(userId) } })
    if (apiUser?.role !== 'administrateur') {
      return res.status(403).json({ error: 'Réservé aux administrateurs' })
    }

    if (!req.file?.buffer) {
      return res.status(400).json({ error: 'Fichier manquant ou vide' })
    }

    const workbook = XLSX.read(new Uint8Array(req.file.buffer), { type: 'array' })
    const results: any[] = []
    const errors: any[] = []

    for (const sheetName of workbook.SheetNames) {
      const sheet = workbook.Sheets[sheetName]
      const rows: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: null })

      const headerIndex = rows.findIndex((r) =>
        r.some((c) => typeof c === 'string' && c.toLowerCase().includes('nom')),
      )
      if (headerIndex === -1) continue

      for (let i = headerIndex + 1; i < rows.length; i++) {
        const row = rows[i]
        if (!row || row.every((c) => c === null)) continue

        const nom = row[0]
        const prenom = row[1]

        if (!nom || !prenom) continue

        const login = genererLogin(nom, prenom)
        const email = `${login}@cs-saintpierrecalais.fr`
        const password = generateSecurePassword()
        const hashed = await bcrypt.hash(password, 10)

        const existing = await prisma.utilisateur.findFirst({
          where: { OR: [{ login }, { email }] },
        })
        if (existing) {
          errors.push({ nom, prenom, erreur: 'Login/email déjà existant' })
          continue
        }

        const utilisateur = await prisma.utilisateur.create({
          data: {
            nom,
            prenom,
            login,
            email,
            hashed_password: hashed,
            role: 'professeur',
          },
        })

        await prisma.professeur.create({
          data: {
            id_user: utilisateur.id_user,
            already_connected: false,
          },
        })

        results.push({
          nom,
          prenom,
          login,
          email,
          password,
        })
      }
    }

    res.json({
      success: true,
      crees: results.length,
      erreurs: errors.length,
      details: results,
      erreurs_details: errors,
    })
  } catch (err) {
    console.error('Erreur import profs:', err)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

router.get('/profs/list', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.id_user
    const apiUser = await prisma.utilisateur.findUnique({ where: { id_user: BigInt(userId) } })
    if (apiUser?.role !== 'administrateur') {
      return res.status(403).json({ error: 'Réservé aux administrateurs' })
    }

    const profs = await prisma.utilisateur.findMany({
      where: { role: 'professeur' },
      include: { professeur: true },
      orderBy: [{ nom: 'asc' }, { prenom: 'asc' }],
    })

    const result = profs.map((p) => ({
      id_user: String(p.id_user),
      nom: p.nom,
      prenom: p.prenom,
      email: p.email,
      login: p.login,
      matiere: p.professeur?.matiere ?? null,
    }))

    res.json(result)
  } catch (err) {
    console.error('Erreur liste profs:', err)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

function genererLogin(nom: string, prenom: string): string {
  const clean = (s: string) =>
    s
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z]/g, '')
  return `${clean(nom)}.${clean(prenom)}`
}

export default router
