import type { Request, Response, NextFunction } from 'express'
import crypto from 'crypto'

const csrfTokens = new Map<string, { token: string; createdAt: number }>()
const CSRF_TOKEN_EXPIRY = 1000 * 60 * 30 // 30 minutes

export function generateCsrfToken(req: Request, res: Response, next: NextFunction) {
  // Générer CSRF token pour les admins
  if (req.user?.role === 'administrateur') {
    const token = crypto.randomBytes(32).toString('hex')
    const userId = req.user.id_user.toString()

    csrfTokens.set(userId, {
      token,
      createdAt: Date.now(),
    })

    res.set('X-CSRF-Token', token)
  }
  next()
}

export function verifyCsrfToken(req: Request, res: Response, next: NextFunction) {
  // Vérifier CSRF token pour les requêtes non-GET
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next()
  }

  if (req.user?.role === 'administrateur') {
    const userId = req.user.id_user.toString()
    const headerToken = req.get('X-CSRF-Token')
    const storedTokenData = csrfTokens.get(userId)

    if (!headerToken || !storedTokenData) {
      return res.status(403).json({ error: 'CSRF token manquant' })
    }

    if (Date.now() - storedTokenData.createdAt > CSRF_TOKEN_EXPIRY) {
      csrfTokens.delete(userId)
      return res.status(403).json({ error: 'CSRF token expiré' })
    }

    if (headerToken !== storedTokenData.token) {
      return res.status(403).json({ error: 'CSRF token invalide' })
    }
  }

  next()
}
