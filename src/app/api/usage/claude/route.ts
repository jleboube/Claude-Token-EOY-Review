import { NextRequest, NextResponse } from 'next/server'
import type { UsageData, ModelUsage, MonthlyUsage } from '@/types'

interface AnthropicUsageResponse {
  data: Array<{
    date: string
    model: string
    input_tokens: number
    output_tokens: number
    cache_read_input_tokens?: number
    cache_creation_input_tokens?: number
    cost_usd?: number
  }>
  has_more: boolean
  next_page?: string
}

const MODEL_PRICING: Record<string, { input: number; output: number }> = {
  'claude-3-5-sonnet-20241022': { input: 3.00, output: 15.00 },
  'claude-3-5-sonnet-20240620': { input: 3.00, output: 15.00 },
  'claude-3-5-haiku-20241022': { input: 0.80, output: 4.00 },
  'claude-3-opus-20240229': { input: 15.00, output: 75.00 },
  'claude-3-sonnet-20240229': { input: 3.00, output: 15.00 },
  'claude-3-haiku-20240307': { input: 0.25, output: 1.25 },
  'claude-2.1': { input: 8.00, output: 24.00 },
  'claude-2.0': { input: 8.00, output: 24.00 },
  'claude-instant-1.2': { input: 0.80, output: 2.40 },
}

function calculateCost(model: string, inputTokens: number, outputTokens: number): number {
  const pricing = MODEL_PRICING[model] || { input: 3.00, output: 15.00 }
  return (inputTokens / 1_000_000 * pricing.input) + (outputTokens / 1_000_000 * pricing.output)
}

function getMonthName(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleString('en-US', { month: 'short' })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { adminApiKey } = body

    if (!adminApiKey) {
      return NextResponse.json(
        { success: false, error: 'Admin API key is required' },
        { status: 400 }
      )
    }

    // Validate API key format
    if (!adminApiKey.startsWith('sk-ant-admin-')) {
      return NextResponse.json(
        { success: false, error: 'Invalid API key format. Admin API key should start with sk-ant-admin-' },
        { status: 400 }
      )
    }

    // Fetch usage data from Anthropic API
    const startDate = '2025-01-01'
    const endDate = '2025-12-31'

    let allData: AnthropicUsageResponse['data'] = []
    let hasMore = true
    let nextPage: string | undefined

    while (hasMore) {
      const url = new URL('https://api.anthropic.com/v1/organizations/usage')
      url.searchParams.set('start_date', startDate)
      url.searchParams.set('end_date', endDate)
      url.searchParams.set('limit', '1000')
      if (nextPage) {
        url.searchParams.set('page', nextPage)
      }

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'x-api-key': adminApiKey,
          'anthropic-version': '2023-06-01',
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const errorMessage = errorData.error?.message || `API error: ${response.status}`

        if (response.status === 401) {
          return NextResponse.json(
            { success: false, error: 'Invalid API key. Please check your Admin API key.' },
            { status: 401 }
          )
        }

        if (response.status === 403) {
          return NextResponse.json(
            { success: false, error: 'Access denied. Make sure you are using an Admin API key with usage access.' },
            { status: 403 }
          )
        }

        return NextResponse.json(
          { success: false, error: errorMessage },
          { status: response.status }
        )
      }

      const data: AnthropicUsageResponse = await response.json()
      allData = [...allData, ...data.data]
      hasMore = data.has_more
      nextPage = data.next_page
    }

    // Process the data
    let totalInputTokens = 0
    let totalOutputTokens = 0
    let totalCost = 0

    const modelMap = new Map<string, ModelUsage>()
    const monthlyMap = new Map<string, MonthlyUsage>()

    for (const entry of allData) {
      const inputTokens = entry.input_tokens + (entry.cache_read_input_tokens || 0) + (entry.cache_creation_input_tokens || 0)
      const outputTokens = entry.output_tokens
      const cost = entry.cost_usd || calculateCost(entry.model, inputTokens, outputTokens)

      totalInputTokens += inputTokens
      totalOutputTokens += outputTokens
      totalCost += cost

      // Model breakdown
      const existing = modelMap.get(entry.model)
      if (existing) {
        existing.inputTokens += inputTokens
        existing.outputTokens += outputTokens
        existing.totalTokens += inputTokens + outputTokens
        existing.cost += cost
      } else {
        modelMap.set(entry.model, {
          model: entry.model,
          inputTokens,
          outputTokens,
          totalTokens: inputTokens + outputTokens,
          cost,
        })
      }

      // Monthly breakdown
      const month = getMonthName(entry.date)
      const monthData = monthlyMap.get(month)
      if (monthData) {
        monthData.inputTokens += inputTokens
        monthData.outputTokens += outputTokens
        monthData.totalTokens += inputTokens + outputTokens
        monthData.cost += cost
      } else {
        monthlyMap.set(month, {
          month,
          inputTokens,
          outputTokens,
          totalTokens: inputTokens + outputTokens,
          cost,
        })
      }
    }

    // Sort model breakdown by total tokens (descending)
    const modelBreakdown = Array.from(modelMap.values()).sort((a, b) => b.totalTokens - a.totalTokens)

    // Sort monthly breakdown by month order
    const monthOrder = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const monthlyBreakdown = monthOrder
      .filter(month => monthlyMap.has(month))
      .map(month => monthlyMap.get(month)!)

    const usageData: UsageData = {
      provider: 'claude',
      dataSource: 'admin-api',
      dataSourceLabel: 'Claude API (Admin Key)',
      year: 2025,
      totalInputTokens,
      totalOutputTokens,
      totalTokens: totalInputTokens + totalOutputTokens,
      totalCost,
      modelBreakdown,
      monthlyBreakdown,
    }

    return NextResponse.json({ success: true, data: usageData })
  } catch (error) {
    console.error('Error fetching usage data:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch usage data. Please try again.' },
      { status: 500 }
    )
  }
}
