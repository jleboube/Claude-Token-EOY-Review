import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { LeaderboardEntry } from '@/types'

interface RouteParams {
  params: Promise<{ username: string }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { username } = await params
    const searchParams = request.nextUrl.searchParams
    const year = parseInt(searchParams.get('year') || '2025')

    if (!username) {
      return NextResponse.json(
        { error: 'Username is required' },
        { status: 400 }
      )
    }

    // Get user's entry and rank
    const result = await query<LeaderboardEntry & { rank: string }>(
      `WITH ranked AS (
        SELECT
          e.id,
          e.user_id as "userId",
          e.year,
          e.month,
          e.total_tokens as "totalTokens",
          e.total_input_tokens as "totalInputTokens",
          e.total_output_tokens as "totalOutputTokens",
          e.total_cost as "totalCost",
          e.submitted_at as "submittedAt",
          u.x_username as "xUsername",
          u.display_name as "displayName",
          RANK() OVER (ORDER BY e.total_tokens DESC) as rank
        FROM leaderboard_entries e
        JOIN leaderboard_users u ON e.user_id = u.id
        WHERE e.year = $1 AND e.month IS NULL
      )
      SELECT * FROM ranked WHERE LOWER("xUsername") = LOWER($2)`,
      [year, username]
    )

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'User not found on leaderboard' },
        { status: 404 }
      )
    }

    const entry = result.rows[0]

    return NextResponse.json({
      rank: parseInt(entry.rank),
      entry: {
        ...entry,
        totalCost: parseFloat(String(entry.totalCost)),
        rank: parseInt(entry.rank)
      }
    })
  } catch (error) {
    console.error('[Leaderboard] Error fetching rank:', error)
    return NextResponse.json(
      { error: 'Failed to fetch rank' },
      { status: 500 }
    )
  }
}
