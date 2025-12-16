import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { query, getClient } from '@/lib/db'
import { UsageData } from '@/types'

interface OptInRequest {
  usageData: UsageData
  consent: boolean
}

export async function POST(request: NextRequest) {
  const client = await getClient()

  try {
    // Get session to verify X authentication
    const session = await getSession()

    if (!session.xUsername || !session.xAccessToken) {
      return NextResponse.json(
        { error: 'You must be connected with X to join the leaderboard' },
        { status: 401 }
      )
    }

    const body: OptInRequest = await request.json()

    // Validate consent
    if (!body.consent) {
      return NextResponse.json(
        { error: 'You must consent to join the leaderboard' },
        { status: 400 }
      )
    }

    // Validate usage data
    if (!body.usageData || typeof body.usageData.totalTokens !== 'number') {
      return NextResponse.json(
        { error: 'Invalid usage data' },
        { status: 400 }
      )
    }

    const { usageData } = body
    const xUsername = session.xUsername
    const xUserId = session.xUserId || null

    // Start transaction
    await client.query('BEGIN')

    // Insert or get user
    const userResult = await client.query<{ id: number }>(
      `INSERT INTO leaderboard_users (x_username, x_user_id)
       VALUES ($1, $2)
       ON CONFLICT (x_username) DO UPDATE SET x_user_id = COALESCE($2, leaderboard_users.x_user_id)
       RETURNING id`,
      [xUsername, xUserId]
    )
    const userId = userResult.rows[0].id

    // Insert yearly entry (month = NULL)
    await client.query(
      `INSERT INTO leaderboard_entries
       (user_id, year, month, total_tokens, total_input_tokens, total_output_tokens, total_cost)
       VALUES ($1, $2, NULL, $3, $4, $5, $6)
       ON CONFLICT (user_id, year, month) DO UPDATE SET
         total_tokens = $3,
         total_input_tokens = $4,
         total_output_tokens = $5,
         total_cost = $6,
         submitted_at = NOW()`,
      [
        userId,
        usageData.year || 2025,
        usageData.totalTokens,
        usageData.totalInputTokens,
        usageData.totalOutputTokens,
        usageData.totalCost
      ]
    )

    // Insert monthly breakdowns if available
    if (usageData.monthlyBreakdown && usageData.monthlyBreakdown.length > 0) {
      for (const monthData of usageData.monthlyBreakdown) {
        // Parse month from format like "Jan", "Feb", etc.
        const monthIndex = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                          'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
                          .indexOf(monthData.month) + 1

        if (monthIndex > 0 && monthData.totalTokens > 0) {
          await client.query(
            `INSERT INTO leaderboard_entries
             (user_id, year, month, total_tokens, total_input_tokens, total_output_tokens, total_cost)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             ON CONFLICT (user_id, year, month) DO UPDATE SET
               total_tokens = $4,
               total_input_tokens = $5,
               total_output_tokens = $6,
               total_cost = $7,
               submitted_at = NOW()`,
            [
              userId,
              usageData.year || 2025,
              monthIndex,
              monthData.totalTokens,
              monthData.inputTokens,
              monthData.outputTokens,
              monthData.cost
            ]
          )
        }
      }
    }

    await client.query('COMMIT')

    // Get user's rank
    const rankResult = await query<{ rank: string }>(
      `SELECT rank FROM (
        SELECT user_id, RANK() OVER (ORDER BY total_tokens DESC) as rank
        FROM leaderboard_entries
        WHERE year = $1 AND month IS NULL
      ) ranked
      WHERE user_id = $2`,
      [usageData.year || 2025, userId]
    )
    const rank = parseInt(rankResult.rows[0]?.rank || '0')

    return NextResponse.json({
      success: true,
      rank,
      message: `You're #${rank} on the leaderboard!`
    })
  } catch (error) {
    await client.query('ROLLBACK')
    console.error('[Leaderboard] Opt-in error:', error)
    return NextResponse.json(
      { error: 'Failed to join leaderboard' },
      { status: 500 }
    )
  } finally {
    client.release()
  }
}
