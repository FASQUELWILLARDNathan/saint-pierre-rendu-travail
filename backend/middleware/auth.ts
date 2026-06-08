import { type Request, type Response, type NextFunction } from 'express'
import { verifyToken } from '../jwt-manager.ts'

declare global {
  namespace Express {
    interface Request {
      user?: any
    }
  }
}

export function authenticateToken(req: Request, res: Response, next: NextFunction) {
  // 1. Lire le token depuis le cookie
  const tokenFromCookie = req.cookies?.token

  // 2. Lire le token depuis Authorization si jamais tu l'utilises aussi
  let authHeader = req.headers['authorization']
  if (Array.isArray(authHeader)) authHeader = authHeader[0]

  const tokenFromHeader = typeof authHeader === 'string' ? authHeader.split(' ')[1] : null

  // 3. Choisir la source prioritaire
  const token = tokenFromCookie || tokenFromHeader

  if (!token) {
    return res.status(401).json({ error: 'Accès refusé: token manquant' })
  }

  try {
    const verified = verifyToken(token.replace(/"/g, ''))
    req.user = verified
    next()
  } catch (error) {
    return res.status(403).json({ error: 'Token invalide ou expiré' })
  }
}
