'use client'

import { CheckCircle, ExternalLink, RefreshCw, Share2, Copy } from 'lucide-react'
import { useState } from 'react'
import { PROVIDER, CONFIG } from '@/lib/provider-config'

interface SuccessScreenProps {
  postUrl: string
  onReset: () => void
}

const isClaude = PROVIDER === 'claude'

export function SuccessScreen({ postUrl, onReset }: SuccessScreenProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(postUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <div className="text-center py-12">
      {/* Success Animation */}
      <div className="relative inline-block mb-8">
        <div className="absolute inset-0 rounded-full bg-green-500 blur-2xl opacity-20 animate-pulse-slow" />
        <div className="relative glass rounded-full p-6">
          <CheckCircle className="w-20 h-20 text-green-500" />
        </div>
      </div>

      {/* Success Message */}
      <h2 className="text-3xl font-bold mb-4">
        <span className={isClaude ? 'gradient-text' : 'gradient-text-openai'}>Posted Successfully!</span>
      </h2>
      <p className="text-xl text-gray-600 mb-8">
        Your {CONFIG.name} usage stats are now live on X!
      </p>

      {/* Post Link */}
      <div className="glass rounded-2xl p-6 max-w-md mx-auto mb-8">
        <p className="text-sm text-gray-500 mb-3">Your post is live at:</p>
        <div className="flex items-center gap-2 p-3 bg-white rounded-lg border border-gray-200">
          <span className="flex-1 text-sm text-gray-700 truncate">{postUrl}</span>
          <button
            onClick={handleCopy}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            title="Copy link"
          >
            <Copy className={`w-4 h-4 ${copied ? 'text-green-500' : ''}`} />
          </button>
        </div>
        {copied && (
          <p className="text-sm text-green-500 mt-2">Link copied!</p>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
        <a
          href={postUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 btn-x px-6 py-3 rounded-full font-semibold"
        >
          <ExternalLink className="w-5 h-5" />
          View on X
        </a>
        <button
          onClick={onReset}
          className="flex items-center justify-center gap-2 px-6 py-3 rounded-full font-semibold border border-gray-300 text-gray-700 hover:bg-gray-50 transition-all"
        >
          <RefreshCw className="w-5 h-5" />
          Start Over
        </button>
      </div>

      {/* Share CTA */}
      <div className="mt-12 glass rounded-2xl p-6 max-w-lg mx-auto">
        <div className="flex items-center justify-center gap-2 mb-3">
          <Share2 className={`w-5 h-5 ${isClaude ? 'text-claude-orange' : 'text-openai-green'}`} />
          <span className="font-semibold text-gray-800">Spread the word!</span>
        </div>
        <p className="text-sm text-gray-600">
          Share {CONFIG.fullName} with your friends so they can share their {CONFIG.name} journey too!
        </p>
      </div>

      {/* Confetti Effect (CSS-based) */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-3 h-3 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `-20px`,
              backgroundColor: ['#D97706', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6'][i % 5],
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`,
              opacity: 0.7,
            }}
          />
        ))}
      </div>
    </div>
  )
}
