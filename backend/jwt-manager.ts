import jwt from 'jsonwebtoken'

interface JWTKeyStore {
  current: string
  previous?: string
  rotatedAt: Date
}

const initialSecret = process.env.JWT_SECRET
if (!initialSecret) {
  throw new Error('La variable d environnement JWT_SECRET est requis')
}

let keyStore: JWTKeyStore = {
  current: initialSecret,
  rotatedAt: new Date(),
}

export function signToken(payload: object): string {
  return jwt.sign(payload, keyStore.current)
}

type RotateResponse = {
  key: string
}

// Verification du token
export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, keyStore.current)
  } catch (err) {
    if (keyStore.previous) {
      try {
        return jwt.verify(token, keyStore.previous)
      } catch {
        throw err
      }
    }
    throw err
  }
}

export function startKeyRotation(): void {
  setInterval(
    async () => {
      try {
        const response = await fetch('https://api.jwtsecrets.com/rotate?length=64&type=HS256')

        const data = (await response.json()) as RotateResponse

        keyStore.previous = keyStore.current
        keyStore.current = data.key
        keyStore.rotatedAt = new Date()

        console.log('🔄 JWT key rotated at', new Date().toISOString())
      } catch (error) {
        console.error('Failed to rotate JWT key:', error)
      }
    },
    24 * 60 * 60 * 1000,
  )
}
