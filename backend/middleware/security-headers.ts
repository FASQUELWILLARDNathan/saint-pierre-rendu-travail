import helmet from 'helmet'
import { NODE_ENV, ALLOWED_ORIGINS } from '../config.ts'

// Extraire les domaines frontendsources
const frontendOrigins = ALLOWED_ORIGINS.map((origin) => {
  try {
    return new URL(origin).hostname
  } catch {
    return origin
  }
})

export const securityHeaders = helmet({
  // CSP adaptée au CORS et dev/prod
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      connectSrc: [
        "'self'",
        "http://neyznn.fr:8079",
        "http://localhost:5173",
      ],
      styleSrc: ["'self'", "'unsafe-inline'"], // Pour Vue/Vite en dev
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      fontSrc: ["'self'", 'data:'],
      mediaSrc: ["'self'"],
    },
  },
  // En prod: forcer HTTPS. En dev: désactiver
  hsts: NODE_ENV === 'production' ? { maxAge: 31536000, includeSubDomains: true } : false,
  noSniff: true,
  xssFilter: true,
  // Désactiver COOP/CORP en dev pour éviter les blocages cross-origin
  crossOriginOpenerPolicy: false,
  crossOriginResourcePolicy: false,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
})
