'use client'

import { Sparkles, Zap, Trophy } from 'lucide-react'
import { CONFIG, PROVIDER } from '@/lib/provider-config'
import Link from 'next/link'

export function Header() {
  const isClaude = PROVIDER === 'claude'

  return (
    <header className="py-6 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
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
          </Link>
          <Link
            href="/leaderboard"
            className="flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-800 rounded-lg hover:bg-amber-200 transition-colors text-sm font-medium"
          >
            <Trophy className="w-4 h-4" />
            <span className="hidden sm:inline">Leaderboard</span>
          </Link>
        </div>
        <p className="text-center text-gray-600 mt-2">
          Share your 2025 {CONFIG.name} usage with the world!
        </p>
      </div>
    </header>
  )
}
