import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'

export async function GET() {
  try {
    const session = await getSession()

    const isXConnected = !!(session.xAccessToken && session.xTokenExpiresAt && session.xTokenExpiresAt > Date.now())

    console.log('[Auth Status] ========== STATUS CHECK ==========')
    console.log('[Auth Status] Has access token:', !!session.xAccessToken)
    console.log('[Auth Status] Has token expiry:', !!session.xTokenExpiresAt)
    console.log('[Auth Status] Token expired:', session.xTokenExpiresAt ? session.xTokenExpiresAt < Date.now() : 'N/A')
    console.log('[Auth Status] isXConnected:', isXConnected)
    console.log('[Auth Status] xUsername:', session.xUsername)

    return NextResponse.json({
      success: true,
      data: {
        xConnected: isXConnected,
        xUsername: session.xUsername || null,
        hasClaudeKey: !!session.claudeApiKey,
        hasUsageData: !!session.usageData,
      },
    })
  } catch (error) {
    console.error('Status check error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to check status' },
      { status: 500 }
    )
  }
}
