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
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    return res.status(401).json({ error: 'Accès refusé: token manquant' })
  }

  try {
    const verified = verifyToken(token)
    req.user = verified
    next()
  } catch (error) {
    return res.status(403).json({ error: 'Token invalide ou expiré' })
  }
}
