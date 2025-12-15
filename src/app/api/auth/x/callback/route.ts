import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'

interface TokenResponse {
  access_token: string
  refresh_token?: string
  expires_in: number
  token_type: string
  scope: string
}

interface UserResponse {
  data: {
    id: string
    name: string
    username: string
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const error = searchParams.get('error')
    const errorDescription = searchParams.get('error_description')

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:47391'
    const clientId = process.env.X_CLIENT_ID
    const clientSecret = process.env.X_CLIENT_SECRET

    console.log('[OAuth Callback] ========== CALLBACK RECEIVED ==========')
    console.log('[OAuth Callback] Request URL:', request.url)
    console.log('[OAuth Callback] Code present:', !!code)
    console.log('[OAuth Callback] State present:', !!state)
    console.log('[OAuth Callback] State value:', state)
    console.log('[OAuth Callback] Error:', error)
    console.log('[OAuth Callback] App URL:', appUrl)
    console.log('[OAuth Callback] Client ID present:', !!clientId)
    console.log('[OAuth Callback] Client Secret present:', !!clientSecret)

    // Log cookies for debugging
    const cookieHeader = request.headers.get('cookie')
    console.log('[OAuth Callback] Cookie header present:', !!cookieHeader)
    console.log('[OAuth Callback] Session cookie present:', cookieHeader?.includes('claude-token-share-session'))

    // Handle OAuth errors
    if (error) {
      console.error('[OAuth Callback] OAuth error from X:', error, errorDescription)
      return NextResponse.redirect(`${appUrl}?error=${encodeURIComponent(errorDescription || error)}`)
    }

    if (!code || !state) {
      return NextResponse.redirect(`${appUrl}?error=${encodeURIComponent('Missing authorization code')}`)
    }

    if (!clientId || !clientSecret) {
      return NextResponse.redirect(`${appUrl}?error=${encodeURIComponent('OAuth not configured')}`)
    }

    // Get session and verify state
    const session = await getSession()

    console.log('[OAuth Callback] Session state:', session.state)
    console.log('[OAuth Callback] Received state:', state)
    console.log('[OAuth Callback] Code verifier present:', !!session.codeVerifier)

    if (state !== session.state) {
      console.error('[OAuth Callback] State mismatch! Expected:', session.state, 'Got:', state)
      return NextResponse.redirect(`${appUrl}?error=${encodeURIComponent('Invalid state parameter. Session may have expired. Please try again.')}`)
    }

    const codeVerifier = session.codeVerifier
    if (!codeVerifier) {
      console.error('[OAuth Callback] Code verifier not found in session')
      return NextResponse.redirect(`${appUrl}?error=${encodeURIComponent('Session expired. Please try again.')}`)
    }

    // Exchange code for tokens
    const redirectUri = `${appUrl}/api/auth/x/callback`
    const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')

    const tokenResponse = await fetch('https://api.twitter.com/2/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${basicAuth}`,
      },
      body: new URLSearchParams({
        code,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
        code_verifier: codeVerifier,
      }),
    })

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text()
      console.error('[OAuth Callback] Token exchange failed:', tokenResponse.status, errorText)
      try {
        const errorData = JSON.parse(errorText)
        const errorMsg = errorData.error_description || errorData.error || 'Failed to exchange token'
        return NextResponse.redirect(`${appUrl}?error=${encodeURIComponent(errorMsg)}`)
      } catch {
        return NextResponse.redirect(`${appUrl}?error=${encodeURIComponent('Failed to exchange token')}`)
      }
    }

    const tokens: TokenResponse = await tokenResponse.json()

    // Get user info
    const userResponse = await fetch('https://api.twitter.com/2/users/me', {
      headers: {
        'Authorization': `Bearer ${tokens.access_token}`,
      },
    })

    let userId = ''
    let username = ''

    if (userResponse.ok) {
      const userData: UserResponse = await userResponse.json()
      userId = userData.data.id
      username = userData.data.username
    }

    // Store tokens in session
    session.xAccessToken = tokens.access_token
    session.xRefreshToken = tokens.refresh_token
    session.xTokenExpiresAt = Date.now() + tokens.expires_in * 1000
    session.xUserId = userId
    session.xUsername = username

    // Clear OAuth state
    session.codeVerifier = undefined
    session.state = undefined

    await session.save()

    console.log('[OAuth Callback] Successfully stored tokens for user:', username)
    console.log('[OAuth Callback] Token expires at:', new Date(session.xTokenExpiresAt).toISOString())
    console.log('[OAuth Callback] Redirecting to:', `${appUrl}?x_connected=true&username=${encodeURIComponent(username)}`)

    // Redirect back to app with success
    return NextResponse.redirect(`${appUrl}?x_connected=true&username=${encodeURIComponent(username)}`)
  } catch (error) {
    console.error('OAuth callback error:', error)
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:47391'
    return NextResponse.redirect(`${appUrl}?error=${encodeURIComponent('OAuth callback failed')}`)
  }
}
