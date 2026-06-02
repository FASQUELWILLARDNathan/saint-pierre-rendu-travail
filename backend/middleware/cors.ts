import express from 'express'
import { ALLOWED_ORIGINS } from '../config.ts'

export const corsMiddleware = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) => {
  const origin = req.headers.origin

  if (ALLOWED_ORIGINS.includes(origin as string)) {
    res.header('Access-Control-Allow-Origin', origin)
    res.header('Access-Control-Allow-Credentials', 'true')
  }

  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-CSRF-Token')
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH')
  res.header('Access-Control-Expose-Headers', 'X-CSRF-Token, Content-Length')
  res.header('Access-Control-Max-Age', '86400') // 24h

  // Gérer les requêtes preflight
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200)
  }

  next()
}
