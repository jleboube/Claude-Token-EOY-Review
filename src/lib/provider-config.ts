/**
 * Provider Configuration System
 *
 * This module provides environment-based configuration for Claude Token Share.
 * The provider is determined by the NEXT_PUBLIC_PROVIDER environment variable.
 */

export type Provider = 'claude' | 'landing'

export interface ProviderConfig {
  // Basic info
  id: Provider
  name: string
  fullName: string
  tagline: string
  description: string

  // Branding
  primaryColor: string
  primaryColorHover: string
  gradientFrom: string
  gradientTo: string
  accentColor: string

  // URLs
  consoleUrl: string
  docsUrl: string
  apiKeysUrl: string
  appUrl: string

  // API
  usageEndpoint: string
  apiKeyPrefix: string
  apiKeyPlaceholder: string

  // Features
  supportsLocalFiles: boolean
  localFilesPath: string | null

  // X Post templates
  templates: string[]
  hashtags: string[]

  // Company info
  companyName: string
  companyUrl: string
}

const claudeConfig: ProviderConfig = {
  id: 'claude',
  name: 'Claude',
  fullName: 'Claude Token Share',
  tagline: 'Share Your 2025 Claude Journey',
  description: 'Discover how many tokens you used with Claude this year and share your AI adventure with the world!',

  primaryColor: 'claude-orange',
  primaryColorHover: 'amber-600',
  gradientFrom: 'from-claude-orange',
  gradientTo: 'to-yellow-500',
  accentColor: 'amber-500',

  consoleUrl: 'https://console.anthropic.com',
  docsUrl: 'https://docs.anthropic.com',
  apiKeysUrl: 'https://console.anthropic.com/settings/keys',
  appUrl: process.env.NEXT_PUBLIC_APP_URL || 'https://claude-tokens.technojoe.dev',

  usageEndpoint: '/api/usage/claude',
  apiKeyPrefix: 'sk-ant-admin-',
  apiKeyPlaceholder: 'sk-ant-admin-...',

  supportsLocalFiles: true,
  localFilesPath: '~/.claude',

  templates: [
    "I used {tokens} tokens with Claude in 2025! #ClaudeAI #AI2025",
    "My 2025 AI journey: {tokens} tokens with @AnthropicAI's Claude! #YearInAI",
    "{tokens} tokens later... Thanks Claude for being my AI companion in 2025! #ClaudeAI",
    "2025 wrapped: {tokens} tokens of conversations with Claude! #AIStats",
  ],
  hashtags: ['#ClaudeAI', '#Anthropic', '#AI2025'],

  companyName: 'Anthropic',
  companyUrl: 'https://anthropic.com',
}

const landingConfig: ProviderConfig = {
  id: 'landing',
  name: 'Claude Token Share',
  fullName: 'Claude Token Share',
  tagline: 'Share Your 2025 Claude Coding Journey',
  description: 'Discover how many tokens you used with Claude this year and share your AI adventure with the world!',

  primaryColor: 'amber-500',
  primaryColorHover: 'amber-600',
  gradientFrom: 'from-amber-500',
  gradientTo: 'to-orange-500',
  accentColor: 'amber-500',

  consoleUrl: 'https://tokens.technojoe.dev',
  docsUrl: 'https://tokens.technojoe.dev',
  apiKeysUrl: 'https://tokens.technojoe.dev',
  appUrl: process.env.NEXT_PUBLIC_APP_URL || 'https://tokens.technojoe.dev',

  usageEndpoint: '',
  apiKeyPrefix: '',
  apiKeyPlaceholder: '',

  supportsLocalFiles: false,
  localFilesPath: null,

  templates: [],
  hashtags: ['#ClaudeTokenShare', '#AI2025'],

  companyName: 'Claude Token Share',
  companyUrl: 'https://tokens.technojoe.dev',
}

// Determine provider from environment variable
function getProviderFromEnv(): Provider {
  const envProvider = process.env.NEXT_PUBLIC_PROVIDER
  if (envProvider === 'landing') return 'landing'
  return 'claude' // Default to claude
}

export const PROVIDER: Provider = getProviderFromEnv()

function getConfig(): ProviderConfig {
  switch (PROVIDER) {
    case 'landing':
      return landingConfig
    default:
      return claudeConfig
  }
}

export const CONFIG: ProviderConfig = getConfig()

// Export individual configs for cases where we need both
export const PROVIDERS = {
  claude: claudeConfig,
  landing: landingConfig,
} as const

// Helper to check current provider
export const isClaude = () => PROVIDER === 'claude'
export const isLanding = () => PROVIDER === 'landing'

// Get provider-specific CSS classes
export function getProviderClasses() {
  return {
    button: 'bg-gradient-to-r from-claude-orange to-yellow-500 hover:from-amber-600 hover:to-yellow-600',
    buttonSolid: 'bg-claude-orange hover:bg-amber-600',
    text: 'text-claude-orange',
    textHover: 'hover:text-claude-orange',
    gradient: 'bg-gradient-to-r from-claude-orange to-yellow-500',
    gradientText: 'bg-gradient-to-r from-claude-orange to-yellow-500 bg-clip-text text-transparent',
    border: 'border-claude-orange',
    ring: 'ring-claude-orange',
    focusRing: 'focus:ring-claude-orange focus:border-claude-orange',
  }
}
