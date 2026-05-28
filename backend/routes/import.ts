import { Router } from 'express'
import { prisma } from '../config.ts'
import { authenticateToken } from '../middleware/auth.ts'
import multer from 'multer'
import XLSX from 'xlsx'
import bcrypt from 'bcrypt'
import fs from 'fs'

const router = Router()
const upload = multer({ dest: '/tmp/imports/' })

// Colonnes selon le niveau
// 2de  : LVA(3) LVB(4) opt(5..10) Int1(11) Int2(12)
// 1ère : LVA(3) LVB(4) B1(5) B2(6) B3(7) opt(8..10) Int1(11) Int2(12)
// Tle  : LVA(3) LVB(4) B1(5) B2(6) opt(7..10) Int1(11) Int2(12)

const CODES_SPECIALITES: Record<string, string> = {
  MATHS: 'Mathématiques',
  'PH-CH': 'Physique',
  SVT: 'SVT',
  HGGSP: 'HGGSP',
  NSINF: 'NSI',
  NSI: 'NSI',
  'AMC 8': 'AMC',
  AMC8: 'AMC',
  HLPHI: 'HLP',
  HLP: 'HLP',
  SES: 'SES',
  LLCE: 'LLCE',
}

const CODES_OPTIONS: Record<string, string> = {
  // Langues
  AGL1: 'Anglais',
  ESP2: 'Espagnol',
  ALL2: 'Allemand',
  CHI3: 'Chinois',
  // Section européenne + DNL
  AGL9: 'Section Européenne',
  // Options lycée
  MATEX: 'Mathématiques expertes',
  MATCO: 'Mathématiques complémentaires',
  LCALA: 'Latin',
  DGEMC: 'DGEMC',
  MAGES: 'Management',
  // EPS
  EPS: 'Sport',
  HAND: 'Handball',
  FOOT: 'Football',
  VOLLE: 'Volleyball',
  // Cambridge / FirstCa
  ACCPE: 'ACCPE',
  FIRCA: 'FirstCa',
  FIRDN: 'FirstCa DNL',
  FIRST: 'FirstCa',
  PET: 'PET Cambridge',
  CHI: 'Chinois option',
}

// Tous les codes possibles (spé + option) pour filtrage
const TOUS_CODES = { ...CODES_SPECIALITES, ...CODES_OPTIONS }

router.post('/eleves', authenticateToken, upload.single('fichier'), async (req, res) => {
  try {
    const userId = req.user?.id_user
    const apiUser = await prisma.utilisateur.findUnique({ where: { id_user: BigInt(userId) } })
    if (apiUser?.role !== 'administrateur') {
      return res.status(403).json({ error: 'Réservé aux administrateurs' })
    }
    if (!req.file) {
      return res.status(400).json({ error: 'Fichier manquant' })
    }

    const workbook = XLSX.readFile(req.file.path)
    const results: any[] = []
    const errors: any[] = []

    for (const sheetName of workbook.SheetNames) {
      const sheet = workbook.Sheets[sheetName]
      const rows: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: null })

      const { nomClasse, niveau } = detecterClasse(sheetName, rows)
      if (!nomClasse) {
        errors.push({ feuille: sheetName, erreur: 'Classe non détectée' })
        continue
      }

      const classe = await prisma.classe.findFirst({
        where: { nom_classe: { equals: nomClasse, mode: 'insensitive' } },
      })

      if (!classe) {
        errors.push({ feuille: sheetName, erreur: `Classe "${nomClasse}" non trouvée en BDD` })
        continue
      }

      // Trouve la ligne header (contient "Nom-prénom")
      const headerRowIndex = rows.findIndex((row) =>
        row.some((cell) => typeof cell === 'string' && cell.toLowerCase().includes('nom')),
      )
      if (headerRowIndex === -1) continue

      // Détermine les index de colonnes selon l'en-tête
      const header = rows[headerRowIndex]
      const colIndex = detecterColonnes(header)

      let currentEleve: any = null

      for (let i = headerRowIndex + 1; i < rows.length; i++) {
        const row = rows[i]
        if (!row || row.every((c) => c === null)) continue

        const nomCell = row[0]
        const sexe = row[1]
        const dateNaissance = row[2]

        if (nomCell && typeof nomCell === 'string' && nomCell.trim()) {
          if (currentEleve) {
            await creerEleve(currentEleve, classe, niveau, results, errors)
          }
          const [nom, prenom] = parseNomPrenom(nomCell)
          currentEleve = {
            nom,
            prenom,
            sexe,
            dateNaissance,
            specialites: extraireSpecialites(row, colIndex),
            options: extraireOptions(row, colIndex),
          }
        } else if (currentEleve) {
          // Lignes suivantes sans nom = même élève (données supplémentaires)
          currentEleve.specialites.push(...extraireSpecialites(row, colIndex))
          currentEleve.options.push(...extraireOptions(row, colIndex))
        }
      }

      if (currentEleve) {
        await creerEleve(currentEleve, classe, niveau, results, errors)
      }
    }

    fs.unlinkSync(req.file.path)
    const download =
      String(req.query.download ?? '') === '1' || String(req.query.download ?? '') === 'true'

    if (download) {
      // Génère un fichier XLSX avec les identifiants créés
      const rows = results.map((r) => ({
        Nom: r.nom,
        Prenom: r.prenom,
        Login: r.login,
        Email: r.email,
        Mot_de_passe: r.password,
        Classe: r.classe,
        Specialites: (r.specialites || []).join(', '),
        Options: (r.options || []).join(', '),
      }))

      const ws = XLSX.utils.json_to_sheet(rows)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'Identifiants')
      const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' })

      const now = new Date()
      const fname = `import-result-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}.xlsx`

      res.setHeader('Content-Disposition', `attachment; filename="${fname}"`)
      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      )
      return res.send(buffer)
    }

    res.json({
      success: true,
      crees: results.length,
      erreurs: errors.length,
      details: results,
      erreurs_details: errors,
    })
  } catch (error) {
    console.error('Erreur import:', error)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

function detecterColonnes(header: any[]) {
  const result: { lva: number; lvb: number; spe: number[]; opt: number[]; int: number[] } = {
    lva: -1,
    lvb: -1,
    spe: [],
    opt: [],
    int: [],
  }

  let bCount = 0
  let optCount = 0
  let intCount = 0

  header.forEach((cell, idx) => {
    if (typeof cell !== 'string') return
    const h = cell.trim().toUpperCase()

    if (h === 'LVA') result.lva = idx
    else if (h === 'LVB') result.lvb = idx
    else if (h === 'B1' || h === 'B2' || h === 'B3') {
      result.spe.push(idx)
      bCount++
    } else if (h === 'OPT') {
      result.opt.push(idx)
      optCount++
    } else if (h === 'INT1' || h === 'INT2') {
      result.int.push(idx)
      intCount++
    }
  })

  return result
}

function detecterClasse(
  sheetName: string,
  rows: any[][],
): { nomClasse: string | null; niveau: string } {
  for (const row of rows.slice(0, 5)) {
    for (const cell of row) {
      if (typeof cell !== 'string') continue
      const upper = cell.toUpperCase().trim()

      if (upper.includes('TERMINALE')) {
        const m = upper.match(/TERMINALE\s+([A-E0-9]+)/)
        if (m) return { nomClasse: `Terminale ${m[1]}`, niveau: 'terminale' }
      }
      if (upper.includes('PREMIERE') || upper.includes('PREMIÈRE')) {
        const m = upper.match(/(?:PREMIERE|PREMIÈRE)\s+([A-E0-9]+)/)
        if (m) return { nomClasse: `1ère ${m[1]}`, niveau: 'premiere' }
      }
      if (upper.includes('SECONDE') || upper.includes('2NDE')) {
        const m = upper.match(/(?:SECONDE|2NDE)\s+([0-9A-E]+)/)
        if (m) return { nomClasse: `2nde ${m[1]}`, niveau: 'seconde' }
      }
    }
  }

  // Fallback sur le nom de la feuille
  const s = sheetName.toUpperCase()
  if (s.startsWith('T') && s.length === 2)
    return { nomClasse: `Terminale ${s[1]}`, niveau: 'terminale' }
  if (s.startsWith('1') && s.length === 2) return { nomClasse: `1ère ${s[1]}`, niveau: 'premiere' }
  if (s.startsWith('2') && s.length === 2) return { nomClasse: `2nde ${s[1]}`, niveau: 'seconde' }

  return { nomClasse: null, niveau: '' }
}

function extraireSpecialites(row: any[], cols: ReturnType<typeof detecterColonnes>): string[] {
  const result: string[] = []
  for (const idx of cols.spe) {
    const val = row[idx]
    if (typeof val === 'string') {
      const code = val.trim()
      if (CODES_SPECIALITES[code]) result.push(CODES_SPECIALITES[code])
    }
  }
  return result
}

function extraireOptions(row: any[], cols: ReturnType<typeof detecterColonnes>): string[] {
  const result: string[] = []
  const allOptCols = [cols.lva, cols.lvb, ...cols.opt, ...cols.int].filter((i) => i !== -1)
  for (const idx of allOptCols) {
    const val = row[idx]
    if (typeof val === 'string') {
      const code = val.trim()
      if (CODES_OPTIONS[code]) result.push(CODES_OPTIONS[code])
    }
  }
  return result
}

function parseNomPrenom(nomComplet: string): [string, string] {
  const parts = nomComplet.trim().split(/\s+/)
  // NOM en MAJUSCULES, Prénom avec majuscule initiale seulement
  const nomParts = parts.filter((p) => p === p.toUpperCase() && p.length > 1)
  const prenomParts = parts.filter((p) => p !== p.toUpperCase() || p.length === 1)
  const nom = nomParts.join(' ') || parts[0]
  const prenom = prenomParts.join(' ') || parts[parts.length - 1]
  return [nom, prenom]
}

async function creerEleve(data: any, classe: any, niveau: string, results: any[], errors: any[]) {
  try {
    const login = genererLogin(data.nom, data.prenom)
    const email = `${login}@cs-saintpierrecalais.fr`
    const password = generateSecurePassword()
    const hashedPassword = await bcrypt.hash(password, 10)

    const existing = await prisma.utilisateur.findFirst({
      where: { OR: [{ login }, { email }] },
    })
    if (existing) {
      errors.push({ nom: data.nom, prenom: data.prenom, erreur: 'Login/email déjà existant' })
      return
    }

    const specialitesUniques = [...new Set(data.specialites)] as string[]
    const optionsUniques = [...new Set(data.options)] as string[]

    const specialiteIds = (
      await Promise.all(
        specialitesUniques.map(async (nom: string) => {
          const s = await prisma.specialite.findFirst({
            where: { nom_specialite: { equals: nom, mode: 'insensitive' } },
          })
          return s?.id_specialite ?? null
        }),
      )
    ).filter(Boolean) as bigint[]

    const optionIds = (
      await Promise.all(
        optionsUniques.map(async (nom: string) => {
          const o = await prisma.option.findFirst({
            where: { nom_option: { equals: nom, mode: 'insensitive' } },
          })
          return o?.id_option ?? null
        }),
      )
    ).filter(Boolean) as bigint[]

    const utilisateur = await prisma.utilisateur.create({
      data: {
        nom: data.nom,
        prenom: data.prenom,
        login,
        email,
        hashed_password: hashedPassword,
        role: 'eleve',
      },
    })

    const annee = `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`

    await prisma.eleve.create({
      data: {
        id_user: utilisateur.id_user,
        id_classe: classe.id_classe,
        annee,
        specialites: { create: specialiteIds.map((id) => ({ id_specialite: id })) },
        options: { create: optionIds.map((id) => ({ id_option: id })) },
      },
    })

    results.push({
      nom: data.nom,
      prenom: data.prenom,
      login,
      email,
      password,
      classe: classe.nom_classe,
      specialites: specialitesUniques,
      options: optionsUniques,
    })
  } catch (err) {
    errors.push({ nom: data.nom, prenom: data.prenom, erreur: String(err) })
  }
}

function genererLogin(nom: string, prenom: string): string {
  const clean = (s: string) =>
    s
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z]/g, '')
  return `${clean(nom)}.${clean(prenom)}`
}

export function generateSecurePassword(): string {
  const lowercase = 'abcdefghijklmnopqrstuvwxyz'
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const digits = '0123456789'
  const specialChars = '!@#$%^&*()-_=+[]{}?:;'
  const allChars = lowercase + uppercase + digits + specialChars

  // Détection automatique de l'environnement (Navigateur ou Node.js) pour la sécurité
  const cryptoObj = typeof window !== 'undefined' ? window.crypto : (globalThis as any).crypto

  const getRandomChar = (pool: string): string => {
    if (cryptoObj?.getRandomValues) {
      const randomBuffer = new Uint32Array(1)
      cryptoObj.getRandomValues(randomBuffer)
      return pool[randomBuffer[0] % pool.length]
    }
    return pool[Math.floor(Math.random() * pool.length)]
  }

  const passwordArr: string[] = []
  passwordArr.push(getRandomChar(lowercase))
  passwordArr.push(getRandomChar(uppercase))
  passwordArr.push(getRandomChar(digits))
  passwordArr.push(getRandomChar(digits))
  passwordArr.push(getRandomChar(specialChars))
  passwordArr.push(getRandomChar(specialChars))

  while (passwordArr.length < 12) {
    passwordArr.push(getRandomChar(allChars))
  }

  // Mélange de Fisher-Yates
  for (let i = passwordArr.length - 1; i > 0; i--) {
    let j = 0
    if (cryptoObj?.getRandomValues) {
      const randomBuffer = new Uint32Array(1)
      cryptoObj.getRandomValues(randomBuffer)
      j = randomBuffer[0] % (i + 1)
    } else {
      j = Math.floor(Math.random() * (i + 1))
    }
    const temp = passwordArr[i]
    passwordArr[i] = passwordArr[j]
    passwordArr[j] = temp
  }

  return passwordArr.join('')
}

// Endpoint pour générer un XLSX depuis des résultats d'import (client-side request)
router.post('/export-results', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.id_user
    const apiUser = await prisma.utilisateur.findUnique({ where: { id_user: BigInt(userId) } })
    if (apiUser?.role !== 'administrateur') {
      return res.status(403).json({ error: 'Réservé aux administrateurs' })
    }

    const results = Array.isArray(req.body?.results) ? req.body.results : []

    const rows = results.map((r: any) => ({
      Nom: r.nom,
      Prenom: r.prenom,
      Login: r.login,
      Email: r.email,
      Mot_de_passe: r.password,
      Classe: r.classe,
      Specialites: (r.specialites || []).join(', '),
      Options: (r.options || []).join(', '),
    }))

    const ws = XLSX.utils.json_to_sheet(rows)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Identifiants')
    const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' })

    const now = new Date()
    const fname = `import-result-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}.xlsx`

    res.setHeader('Content-Disposition', `attachment; filename="${fname}"`)
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    )
    return res.send(buffer)
  } catch (err) {
    console.error('Erreur export-results:', err)
    return res.status(500).json({ error: 'Erreur serveur lors de la génération du fichier' })
  }
})

export default router