import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'

// Generate PKCE code verifier and challenge
function generateCodeVerifier(): string {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return base64URLEncode(array)
}

async function generateCodeChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(verifier)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return base64URLEncode(new Uint8Array(digest))
}

function base64URLEncode(buffer: Uint8Array): string {
  return btoa(String.fromCharCode(...buffer))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

function generateState(): string {
  const array = new Uint8Array(16)
  crypto.getRandomValues(array)
  return base64URLEncode(array)
}

export async function GET() {
  try {
    const clientId = process.env.X_CLIENT_ID
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:47391'

    console.log('[OAuth] ========== INITIATING OAUTH ==========')
    console.log('[OAuth] Timestamp:', new Date().toISOString())
    console.log('[OAuth] Client ID present:', !!clientId)
    console.log('[OAuth] App URL:', appUrl)

    if (!clientId) {
      console.error('[OAuth] X_CLIENT_ID not configured')
      return NextResponse.json(
        { success: false, error: 'X OAuth is not configured. Please check server environment variables.' },
        { status: 500 }
      )
    }

    // Generate PKCE values
    const codeVerifier = generateCodeVerifier()
    const codeChallenge = await generateCodeChallenge(codeVerifier)
    const state = generateState()

    // Store in session for callback verification
    const session = await getSession()
    session.codeVerifier = codeVerifier
    session.state = state
    await session.save()

    console.log('[OAuth] Stored state in session:', state)
    console.log('[OAuth] Stored code verifier:', !!codeVerifier)

    // Build authorization URL
    const redirectUri = `${appUrl}/api/auth/x/callback`
    const scopes = ['tweet.read', 'tweet.write', 'users.read', 'offline.access']

    console.log('[OAuth] Redirect URI:', redirectUri)
    console.log('[OAuth] Scopes:', scopes.join(' '))

    const authUrl = new URL('https://twitter.com/i/oauth2/authorize')
    authUrl.searchParams.set('response_type', 'code')
    authUrl.searchParams.set('client_id', clientId)
    authUrl.searchParams.set('redirect_uri', redirectUri)
    authUrl.searchParams.set('scope', scopes.join(' '))
    authUrl.searchParams.set('state', state)
    authUrl.searchParams.set('code_challenge', codeChallenge)
    authUrl.searchParams.set('code_challenge_method', 'S256')

    return NextResponse.redirect(authUrl.toString())
  } catch (error) {
    console.error('OAuth initiation error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to initiate OAuth' },
      { status: 500 }
    )
  }
}
