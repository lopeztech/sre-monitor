import { createCipheriv, createDecipheriv, randomBytes, createHash } from 'node:crypto'
import jwt from 'jsonwebtoken'
import type { GitHubUser } from '../../../shared/types/auth.js'

const ALGORITHM = 'aes-256-gcm'
const JWT_EXPIRY = '7d'

function getSecret(): string {
  const secret = process.env.JWT_SECRET
  if (!secret) throw new Error('JWT_SECRET environment variable is required')
  return secret
}

function deriveKey(secret: string): Buffer {
  return createHash('sha256').update(secret).digest()
}

// ── Token encryption ────────────────────────────────────────────────────────

export function encryptToken(token: string): string {
  const key = deriveKey(getSecret())
  const iv = randomBytes(12)
  const cipher = createCipheriv(ALGORITHM, key, iv)
  const encrypted = Buffer.concat([cipher.update(token, 'utf8'), cipher.final()])
  const authTag = cipher.getAuthTag()
  // Format: iv:authTag:ciphertext (all base64)
  return `${iv.toString('base64')}.${authTag.toString('base64')}.${encrypted.toString('base64')}`
}

export function decryptToken(encryptedStr: string): string {
  const key = deriveKey(getSecret())
  const [ivB64, tagB64, dataB64] = encryptedStr.split('.')
  if (!ivB64 || !tagB64 || !dataB64) throw new Error('Invalid encrypted token format')
  const iv = Buffer.from(ivB64, 'base64')
  const authTag = Buffer.from(tagB64, 'base64')
  const encrypted = Buffer.from(dataB64, 'base64')
  const decipher = createDecipheriv(ALGORITHM, key, iv)
  decipher.setAuthTag(authTag)
  return decipher.update(encrypted) + decipher.final('utf8')
}

// ── JWT creation / verification ─────────────────────────────────────────────

interface SessionPayload {
  enc: string
  ghUser: GitHubUser
}

export function createSessionJwt(githubToken: string, ghUser: GitHubUser): string {
  const payload: SessionPayload = {
    enc: encryptToken(githubToken),
    ghUser,
  }
  return jwt.sign(payload, getSecret(), { expiresIn: JWT_EXPIRY })
}

export function verifySessionJwt(token: string): { githubToken: string; ghUser: GitHubUser } {
  const payload = jwt.verify(token, getSecret()) as SessionPayload
  return {
    githubToken: decryptToken(payload.enc),
    ghUser: payload.ghUser,
  }
}
