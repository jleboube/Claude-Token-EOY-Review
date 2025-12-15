import { NextRequest, NextResponse } from 'next/server'
import { TwitterApi } from 'twitter-api-v2'
import { getSession } from '@/lib/session'
import type { XCredentials } from '@/types'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { credentials, message, useOAuth, imageBase64 } = body as {
      credentials?: XCredentials
      message: string
      useOAuth?: boolean
      imageBase64?: string  // Base64 encoded image data
    }

    if (!message) {
      return NextResponse.json(
        { success: false, error: 'Message is required' },
        { status: 400 }
      )
    }

    // Validate message length
    if (message.length > 280) {
      return NextResponse.json(
        { success: false, error: 'Message exceeds 280 characters' },
        { status: 400 }
      )
    }

    let client: TwitterApi
    let username: string

    if (useOAuth) {
      // Use OAuth 2.0 tokens from session
      const session = await getSession()

      if (!session.xAccessToken) {
        return NextResponse.json(
          { success: false, error: 'Not connected to X. Please connect your account first.' },
          { status: 401 }
        )
      }

      // Check if token is expired
      if (session.xTokenExpiresAt && session.xTokenExpiresAt < Date.now()) {
        // Try to refresh the token
        if (session.xRefreshToken) {
          const refreshed = await refreshToken(session.xRefreshToken)
          if (refreshed) {
            session.xAccessToken = refreshed.accessToken
            session.xRefreshToken = refreshed.refreshToken
            session.xTokenExpiresAt = refreshed.expiresAt
            await session.save()
          } else {
            return NextResponse.json(
              { success: false, error: 'X session expired. Please reconnect.' },
              { status: 401 }
            )
          }
        } else {
          return NextResponse.json(
            { success: false, error: 'X session expired. Please reconnect.' },
            { status: 401 }
          )
        }
      }

      // Create OAuth 2.0 client
      client = new TwitterApi(session.xAccessToken)
      username = session.xUsername || ''

      // If we don't have username, fetch it
      if (!username) {
        try {
          const me = await client.v2.me()
          username = me.data.username
          session.xUsername = username
          await session.save()
        } catch {
          // Continue without username
        }
      }
    } else {
      // Use OAuth 1.0a credentials (manual entry)
      if (!credentials) {
        return NextResponse.json(
          { success: false, error: 'X credentials are required' },
          { status: 400 }
        )
      }

      const { apiKey, apiSecret, accessToken, accessTokenSecret } = credentials

      if (!apiKey || !apiSecret || !accessToken || !accessTokenSecret) {
        return NextResponse.json(
          { success: false, error: 'All X credentials are required' },
          { status: 400 }
        )
      }

      // Create OAuth 1.0a client
      client = new TwitterApi({
        appKey: apiKey,
        appSecret: apiSecret,
        accessToken: accessToken,
        accessSecret: accessTokenSecret,
      })

      // Get username
      try {
        const me = await client.v2.me()
        username = me.data.username
      } catch {
        username = 'user'
      }
    }

    // Upload media if provided
    let mediaId: string | undefined

    if (imageBase64) {
      try {
        // Remove data URL prefix if present
        const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '')
        const imageBuffer = Buffer.from(base64Data, 'base64')

        console.log('Uploading media, buffer size:', imageBuffer.length, 'bytes')

        if (useOAuth) {
          // OAuth 2.0 User Context - media upload requires OAuth 1.0a app credentials
          // We need to use the app's OAuth 1.0a credentials for media upload
          const appKey = process.env.X_APP_KEY
          const appSecret = process.env.X_APP_SECRET
          const appAccessToken = process.env.X_APP_ACCESS_TOKEN
          const appAccessSecret = process.env.X_APP_ACCESS_SECRET

          if (appKey && appSecret && appAccessToken && appAccessSecret) {
            // Create OAuth 1.0a client for media upload
            const mediaClient = new TwitterApi({
              appKey,
              appSecret,
              accessToken: appAccessToken,
              accessSecret: appAccessSecret,
            })

            mediaId = await mediaClient.v1.uploadMedia(imageBuffer, {
              mimeType: 'image/png',
            })
            console.log('Media uploaded with OAuth 1.0a app credentials, mediaId:', mediaId)
          } else {
            console.log('OAuth 1.0a app credentials not configured, skipping media upload')
            console.log('To enable media upload, set X_APP_KEY, X_APP_SECRET, X_APP_ACCESS_TOKEN, X_APP_ACCESS_SECRET')
          }
        } else {
          // OAuth 1.0a user credentials - use v1 media upload directly
          mediaId = await client.v1.uploadMedia(imageBuffer, {
            mimeType: 'image/png',
          })
          console.log('Media uploaded with user OAuth 1.0a credentials, mediaId:', mediaId)
        }
      } catch (mediaError) {
        console.error('Error uploading media:', mediaError)
        // Log more details about the error
        if (mediaError instanceof Error) {
          console.error('Media upload error message:', mediaError.message)
          console.error('Media upload error stack:', mediaError.stack)
        }
        // Continue without media if upload fails
      }
    }

    // Post the tweet (with or without media)
    let tweet
    if (mediaId) {
      tweet = await client.v2.tweet({
        text: message,
        media: { media_ids: [mediaId] as [string] },
      })
    } else {
      tweet = await client.v2.tweet(message)
    }

    if (!tweet.data) {
      return NextResponse.json(
        { success: false, error: 'Failed to post tweet' },
        { status: 500 }
      )
    }

    const postUrl = `https://x.com/${username}/status/${tweet.data.id}`

    return NextResponse.json({
      success: true,
      data: {
        postId: tweet.data.id,
        postUrl,
      },
    })
  } catch (error) {
    console.error('Error posting to X:', error)

    if (error instanceof Error) {
      const errorMessage = error.message.toLowerCase()

      if (errorMessage.includes('401') || errorMessage.includes('unauthorized')) {
        return NextResponse.json(
          { success: false, error: 'X authentication failed. Please reconnect your account.' },
          { status: 401 }
        )
      }

      if (errorMessage.includes('403') || errorMessage.includes('forbidden')) {
        return NextResponse.json(
          { success: false, error: 'Access denied. Make sure your X app has Read and Write permissions.' },
          { status: 403 }
        )
      }

      if (errorMessage.includes('429') || errorMessage.includes('rate limit')) {
        return NextResponse.json(
          { success: false, error: 'Rate limit exceeded. Please try again later.' },
          { status: 429 }
        )
      }

      if (errorMessage.includes('duplicate')) {
        return NextResponse.json(
          { success: false, error: 'Duplicate tweet. You cannot post the same content twice.' },
          { status: 400 }
        )
      }

      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Failed to post to X. Please try again.' },
      { status: 500 }
    )
  }
}

async function refreshToken(refreshToken: string): Promise<{
  accessToken: string
  refreshToken: string
  expiresAt: number
} | null> {
  try {
    const clientId = process.env.X_CLIENT_ID
    const clientSecret = process.env.X_CLIENT_SECRET

    if (!clientId || !clientSecret) return null

    const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')

    const response = await fetch('https://api.twitter.com/2/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${basicAuth}`,
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      }),
    })

    if (!response.ok) return null

    const data = await response.json()

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token || refreshToken,
      expiresAt: Date.now() + data.expires_in * 1000,
    }
  } catch {
    return null
  }
}
