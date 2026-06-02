import type { Request, Response, NextFunction } from 'express'

/**
 * Middleware d'autorisation basée sur les rôles
 * @param {...string} allowedRoles - Les rôles autorisés à accéder à la route
 * @returns {Function} Middleware Express
 */
export function authorizeRole(...allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      console.warn(`[SECURITY] Accès non authentifié à ${req.originalUrl}`)
      return res.status(401).json({ error: 'Non authentifié' })
    }

    if (!allowedRoles.includes(req.user.role)) {
      console.warn(
        `[SECURITY] Accès refusé - ${req.user.id_user} essaye d'accéder à ${req.originalUrl} avec le rôle ${req.user.role}`,
      )
      return res.status(403).json({ error: 'Accès refusé: rôle insuffisant' })
    }

    // Pour les routes administrateur, ajouter des vérifications supplémentaires
    if (allowedRoles.includes('administrateur') && req.user.role === 'administrateur') {
      // Vérifier que le token n'est pas expiré
      if (req.user.exp && req.user.exp * 1000 < Date.now()) {
        return res.status(403).json({ error: 'Token expiré' })
      }

      // Log l'action admin
      console.log(`[ADMIN] ${req.user.id_user} - ${req.method} ${req.originalUrl}`)
    }

    next()
  }
}
