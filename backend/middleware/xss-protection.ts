import type { Request, Response, NextFunction } from 'express'

export function sanitizeInputs(req: Request, res: Response, next: NextFunction) {
  // Fonction pour nettoyer les chaînes XSS
  const sanitize = (str: string | any): any => {
    if (typeof str !== 'string') return str

    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;')
  }

  // Nettoyer le body
  if (req.body && typeof req.body === 'object') {
    const sanitizeObj = (obj: any): any => {
      for (const key in obj) {
        if (typeof obj[key] === 'string') {
          obj[key] = sanitize(obj[key])
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
          sanitizeObj(obj[key])
        }
      }
      return obj
    }
    req.body = sanitizeObj(req.body)
  }

  next()
}
