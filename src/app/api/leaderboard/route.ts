import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { LeaderboardEntry, LeaderboardResponse, LeaderboardView } from '@/types'

const PAGE_SIZE = 25

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const view = (searchParams.get('view') || '2025') as LeaderboardView
    const search = searchParams.get('search') || ''

    let whereClause = ''
    const params: (string | number)[] = []
    let paramIndex = 1

    // Filter by view type
    if (view === '2025') {
      whereClause = `WHERE e.year = 2025 AND e.month IS NULL`
    } else if (view === 'all-time') {
      // Sum all entries per user
      whereClause = `WHERE e.month IS NULL`
    } else if (view === 'monthly') {
      whereClause = `WHERE e.year = 2025 AND e.month IS NOT NULL`
    }

    // Add search filter
    if (search) {
      whereClause += whereClause ? ' AND ' : 'WHERE '
      whereClause += `LOWER(u.x_username) LIKE LOWER($${paramIndex})`
      params.push(`%${search}%`)
      paramIndex++
    }

    // Get total count
    const countQuery = `
      SELECT COUNT(DISTINCT u.id) as total
      FROM leaderboard_users u
      JOIN leaderboard_entries e ON u.id = e.user_id
      ${whereClause}
    `
    const countResult = await query<{ total: string }>(countQuery, params)
    const total = parseInt(countResult.rows[0]?.total || '0')

    // Get paginated entries with rank
    const offset = (page - 1) * PAGE_SIZE
    const entriesQuery = `
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
      ${whereClause}
      ORDER BY e.total_tokens DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `
    params.push(PAGE_SIZE, offset)

    const entriesResult = await query<LeaderboardEntry>(entriesQuery, params)

    const response: LeaderboardResponse = {
      entries: entriesResult.rows.map(row => ({
        ...row,
        totalCost: parseFloat(String(row.totalCost)),
        rank: parseInt(String(row.rank))
      })),
      total,
      page,
      pageSize: PAGE_SIZE
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('[Leaderboard] Error fetching leaderboard:', error)
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard' },
      { status: 500 }
    )
  }
}
