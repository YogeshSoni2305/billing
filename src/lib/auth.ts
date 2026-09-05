import { SignJWT, jwtVerify } from 'jose'
import bcrypt from 'bcryptjs'

export const AUTH_COOKIE_NAME = 'auth_token'

const getJwtSecretKey = () => {
  const secret = process.env.JWT_SECRET || 'sagar_electricals_secret_jwt_key_987654321'
  return new TextEncoder().encode(secret)
}

export interface JWTPayload {
  userId: number
  username: string
  name?: string
  role: string
}

/**
 * Sign a JWT token using edge-compatible `jose` library
 */
export async function signJWT(payload: JWTPayload): Promise<string> {
  const token = await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(getJwtSecretKey())
  return token
}

/**
 * Verify a JWT token using edge-compatible `jose` library
 */
export async function verifyJWT(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecretKey())
    return payload as unknown as JWTPayload
  } catch (error) {
    return null
  }
}

/**
 * Hash a plain text password using bcryptjs
 */
export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 10)
}

/**
 * Verify password against stored hash using bcryptjs
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash)
}
