import express from 'express'
import { ALLOWED_ORIGINS } from '../config.ts'

// Middleware CORS permettant d'autoriser les requêtes provenant des origines définies dans ALLOWED_ORIGINS.
export const corsMiddleware = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) => {
  const origin = req.headers.origin

  if (ALLOWED_ORIGINS.includes(origin as string)) {
    res.header('Access-Control-Allow-Origin', origin)
  }

  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.header('Access-Control-Allow-Credentials', 'true')

  if (req.method === 'OPTIONS') {
    res.sendStatus(200)
  } else {
    next()
  }
}
