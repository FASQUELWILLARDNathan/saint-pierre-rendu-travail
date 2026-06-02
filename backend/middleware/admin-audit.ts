import type { Request, Response, NextFunction } from 'express'
import fs from 'fs'
import path from 'path'

const auditLogPath = path.join(process.cwd(), 'logs', 'admin-audit.log')

export function auditAdminActions(req: Request, res: Response, next: NextFunction) {
  // Seulement pour les admins
  if (req.user?.role === 'administrateur') {
    const logEntry = {
      timestamp: new Date().toISOString(),
      userId: req.user.id_user,
      method: req.method,
      route: req.originalUrl,
      ip: req.ip,
      userAgent: req.get('user-agent'),
      body: req.method !== 'GET' ? JSON.stringify(req.body) : 'N/A',
    }

    // Créer le dossier logs s'il n'existe pas
    if (!fs.existsSync(path.dirname(auditLogPath))) {
      fs.mkdirSync(path.dirname(auditLogPath), { recursive: true })
    }

    fs.appendFileSync(auditLogPath, JSON.stringify(logEntry) + '\n')
  }

  next()
}
