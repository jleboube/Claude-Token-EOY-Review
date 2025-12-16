// AI Provider types
export type AIProvider = 'claude'

// Data source for how usage was retrieved
export type DataSource = 'admin-api' | 'local-files'

export interface UsageData {
  provider: AIProvider
  dataSource: DataSource
  totalInputTokens: number
  totalOutputTokens: number
  totalTokens: number
  totalCost: number
  modelBreakdown: ModelUsage[]
  monthlyBreakdown: MonthlyUsage[]
  // Additional metadata
  dataSourceLabel: string // Human-readable description of the data source
  year: number
}

export interface ModelUsage {
  model: string
  inputTokens: number
  outputTokens: number
  totalTokens: number
  cost: number
}

export interface MonthlyUsage {
  month: string
  inputTokens: number
  outputTokens: number
  totalTokens: number
  cost: number
}

export interface XCredentials {
  apiKey: string
  apiSecret: string
  accessToken: string
  accessTokenSecret: string
}

export interface ClaudeCredentials {
  adminApiKey: string
}

export interface PostPreview {
  message: string
  imageUrl?: string
  usage: UsageData
}

export interface AppState {
  step: 'credentials' | 'loading' | 'preview' | 'posting' | 'success' | 'error'
  claudeCredentials: ClaudeCredentials | null
  xCredentials: XCredentials | null
  usageData: UsageData | null
  postPreview: PostPreview | null
  error: string | null
  postUrl: string | null
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

// Leaderboard types
export interface LeaderboardUser {
  id: number
  xUsername: string
  xUserId?: string
  displayName?: string
  optedInAt: string
}

export interface LeaderboardEntry {
  id: number
  userId: number
  year: number
  month?: number
  totalTokens: number
  totalInputTokens: number
  totalOutputTokens: number
  totalCost: number
  submittedAt: string
  // Joined fields
  xUsername: string
  displayName?: string
  rank?: number
}

export interface LeaderboardResponse {
  entries: LeaderboardEntry[]
  total: number
  page: number
  pageSize: number
}

export type LeaderboardView = '2025' | 'all-time' | 'monthly'
