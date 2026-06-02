// Mock du JWT manager AVANT tout
vi.mock('../../jwt-manager.ts', () => require('../mocks/jwt-manager.ts'))

import express from 'express'
import request from 'supertest'
import { authorizeRole } from '../../middleware/role.ts'
import { authenticateToken } from '../../middleware/auth.ts'
import { generateTestToken } from '../utils/jwt'

// Mini-app Express isolée
const app = express()

// Route protégée par authenticateToken + authorizeRole
app.get('/admin-only', authenticateToken, authorizeRole('administrateur'), (req, res) => {
  res.status(200).json({ ok: true })
})

describe('authorizeRole middleware', () => {
  it('renvoie 403 si le rôle ne correspond pas', async () => {
    const token = generateTestToken({ id_user: 1, role: 'eleve' })

    const res = await request(app).get('/admin-only').set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(403)
    expect(res.body.error).toBe('Accès refusé: rôle insuffisant')
  })

  it('autorise l’accès si le rôle correspond', async () => {
    const token = generateTestToken({ id_user: 1, role: 'administrateur' })

    const res = await request(app).get('/admin-only').set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body.ok).toBe(true)
  })

  it('renvoie 401 si aucun token', async () => {
    const res = await request(app).get('/admin-only')

    expect(res.status).toBe(401)
    expect(res.body.error).toBe('Accès refusé: token manquant')
  })
})
