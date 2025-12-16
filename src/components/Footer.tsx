'use client'

import Link from 'next/link'
import { Heart } from 'lucide-react'
import { PROVIDER, CONFIG } from '@/lib/provider-config'

const isClaude = PROVIDER === 'claude'

export function Footer() {
  return (
    <footer className="py-8 px-4 border-t border-gray-200">
      <div className="container mx-auto max-w-4xl text-center text-gray-600 text-sm">
        <p className="flex items-center justify-center gap-1">
          Made with <Heart className="w-4 h-4 text-red-500 fill-red-500" /> for the AI community
        </p>
        <p className="mt-2">
          Your API keys are never stored and your data is never uploaded.
        </p>

        {/* Disclaimer */}
        <p className="mt-4 text-xs text-gray-500 max-w-xl mx-auto">
          {CONFIG.fullName} is not affiliated with, endorsed by, or sponsored by {CONFIG.companyName} or X Corp.
          All product names, logos, and brands are property of their respective owners.
        </p>

        {/* Links */}
        <div className="mt-6 flex items-center justify-center gap-4 flex-wrap">
          <span>© Joe LeBoube 2025</span>
          <span className="hidden sm:inline">•</span>
          <Link
            href="/leaderboard"
            className={`hover:underline ${isClaude ? 'text-claude-orange' : 'text-openai-green'}`}
          >
            Leaderboard
          </Link>
          <span className="hidden sm:inline">•</span>
          <Link
            href="/privacy"
            className={`hover:underline ${isClaude ? 'text-claude-orange' : 'text-openai-green'}`}
          >
            Privacy Policy
          </Link>
          <span className="hidden sm:inline">•</span>
          <Link
            href="/terms"
            className={`hover:underline ${isClaude ? 'text-claude-orange' : 'text-openai-green'}`}
          >
            Terms of Service
          </Link>
        </div>

        {/* External Links */}
        <div className="mt-4 flex items-center justify-center gap-4 text-xs text-gray-400">
          <a
            href={CONFIG.companyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`transition-colors ${isClaude ? 'hover:text-claude-orange' : 'hover:text-openai-green'}`}
          >
            {CONFIG.companyName}
          </a>
          <span>•</span>
          <a
            href="https://x.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-x-black transition-colors"
          >
            X (Twitter)
          </a>
        </div>
      </div>
    </footer>
  )
}
