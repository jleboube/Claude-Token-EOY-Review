'use client'

import { Sparkles, Zap } from 'lucide-react'
import { CONFIG, PROVIDER } from '@/lib/provider-config'

export function Header() {
  const isClaude = PROVIDER === 'claude'

  return (
    <header className="py-6 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="flex items-center justify-center gap-3">
          {isClaude ? (
            <Sparkles className="w-8 h-8 text-claude-orange" />
          ) : (
            <Zap className="w-8 h-8 text-openai-green" />
          )}
          <h1 className="text-2xl font-bold">
            <span className={isClaude ? 'gradient-text' : 'gradient-text-openai'}>
              {CONFIG.fullName}
            </span>
          </h1>
        </div>
        <p className="text-center text-gray-600 mt-2">
          Share your 2025 {CONFIG.name} usage with the world!
        </p>
      </div>
    </header>
  )
}
