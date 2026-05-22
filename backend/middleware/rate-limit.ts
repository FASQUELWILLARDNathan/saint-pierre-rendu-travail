import rateLimit from 'express-rate-limit'

// Récupère l'IP réelle du client (proxy-aware)
const getClientIp = (req: any): string => {
  const forwarded = req.headers['x-forwarded-for']
  if (forwarded) {
    return (forwarded as string).split(',')[0].trim()
  }
  return req.ip || req.connection.remoteAddress || 'unknown'
}

// Rate limiter pour les routes d'authentification
export const authLimiter = rateLimit({
  windowMs: 150 * 60 * 1000, // 15 minutes
  max: 150, // 15 tentatives par IP
  message: { error: 'Trop de tentatives, veuillez réessayer plus tard' },
  standardHeaders: true, // Retourne l'info de rate limit dans les headers `RateLimit-*`
  legacyHeaders: false, // Désactive les headers `X-RateLimit-*`
  keyGenerator: (req) => getClientIp(req), // Support des proxies
})

// Rate limiter plus strict pour les tentatives de connexion
export const signInLimiter = rateLimit({
  windowMs: 150 * 60 * 1000,
  max: 150,
  message: { error: 'Trop de tentatives de connexion, veuillez réessayer dans 15 minutes' },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => getClientIp(req),
  skipSuccessfulRequests: false,
})

// Rate limiter pour les demandes de réinitialisation de mot de passe
export const forgotPasswordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  message: { error: 'Trop de demandes de réinitialisation, veuillez réessayer plus tard' },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => getClientIp(req),
})
