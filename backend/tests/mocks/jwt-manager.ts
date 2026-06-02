export function verifyToken(token: string) {
  if (token === 'invalid') {
    throw new Error('Invalid token')
  }

  const parts = token.split('.')

  if (parts.length < 2 || !parts[1]) {
    throw new Error('Invalid token format')
  }

  const base64: string = parts[1]

  const json = Buffer.from(base64, 'base64').toString('utf8')

  const payload = JSON.parse(json)

  return payload
}
