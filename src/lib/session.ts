import { getIronSession, SessionOptions } from 'iron-session'
import { cookies } from 'next/headers'

export interface SessionData {
  xAccessToken?: string
  xRefreshToken?: string
  xTokenExpiresAt?: number
  xUserId?: string
  xUsername?: string
  codeVerifier?: string
  state?: string
  claudeApiKey?: string
  usageData?: {
    totalInputTokens: number
    totalOutputTokens: number
    totalTokens: number
    totalCost: number
  }
}

const sessionOptions: SessionOptions = {
  password: process.env.SESSION_SECRET || 'complex_password_at_least_32_characters_long_for_security',
  cookieName: 'claude-token-share-session',
  cookieOptions: {
    // Use secure cookies only in production with proper HTTPS
    // Behind Cloudflare, we receive HTTP from nginx but the client is on HTTPS
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    // Use 'lax' for OAuth redirects to work properly
    sameSite: 'lax' as const,
    maxAge: 60 * 60 * 24, // 24 hours
    // Ensure cookie works for the domain
    path: '/',
  },
}

export async function getSession() {
  const cookieStore = await cookies()
  return getIronSession<SessionData>(cookieStore, sessionOptions)
}

export async function clearSession() {
  const session = await getSession()
  session.destroy()
}
