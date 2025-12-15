'use client'

import { Loader2 } from 'lucide-react'
import { PROVIDER } from '@/lib/provider-config'

interface LoadingSpinnerProps {
  message?: string
}

const isClaude = PROVIDER === 'claude'

export function LoadingSpinner({ message = 'Loading...' }: LoadingSpinnerProps) {
  return (
    <div className="text-center py-20">
      <div className="relative inline-block">
        {/* Outer glow */}
        <div className={`absolute inset-0 rounded-full blur-xl opacity-30 animate-pulse-slow ${
          isClaude
            ? 'bg-gradient-to-r from-claude-orange to-yellow-500'
            : 'bg-gradient-to-r from-openai-green to-emerald-400'
        }`} />

        {/* Spinner container */}
        <div className="relative glass rounded-full p-8">
          <Loader2 className={`w-16 h-16 animate-spin ${isClaude ? 'text-claude-orange' : 'text-openai-green'}`} />
        </div>
      </div>

      <p className="mt-6 text-xl text-gray-600 animate-pulse">{message}</p>

      <div className="mt-4 flex justify-center gap-1">
        <span className={`w-2 h-2 rounded-full animate-bounce ${isClaude ? 'bg-claude-orange' : 'bg-openai-green'}`} style={{ animationDelay: '0ms' }} />
        <span className={`w-2 h-2 rounded-full animate-bounce ${isClaude ? 'bg-claude-orange' : 'bg-openai-green'}`} style={{ animationDelay: '150ms' }} />
        <span className={`w-2 h-2 rounded-full animate-bounce ${isClaude ? 'bg-claude-orange' : 'bg-openai-green'}`} style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  )
}
