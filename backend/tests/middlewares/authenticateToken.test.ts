// Mock AVANT tout
vi.mock('../../jwt-manager.ts', () => require('../mocks/jwt-manager.ts'))

import express from 'express'
import request from 'supertest'
import { authenticateToken } from '../../middleware/auth.ts'
import { generateTestToken } from '../utils/jwt.ts'

// Mini-app Express isolée
const app = express()
app.get('/protected', authenticateToken, (req, res) => {
  res.status(200).json({ ok: true })
})

describe('authenticateToken middleware', () => {
  it('renvoie 401 si aucun token', async () => {
    const res = await request(app).get('/protected')
    expect(res.status).toBe(401)
  })

  it('renvoie 403 si token invalide', async () => {
    const res = await request(app).get('/protected').set('Authorization', 'Bearer invalid')

    expect(res.status).toBe(403)
  })

  it('passe avec un token valide', async () => {
    const token = generateTestToken({ id_user: 1, role: 'eleve' })

    const res = await request(app).get('/protected').set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
  })
})
