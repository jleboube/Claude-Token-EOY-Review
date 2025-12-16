'use client'

import { useState } from 'react'
import { UsageData } from '@/types'
import { Trophy, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'

interface LeaderboardOptInProps {
  usageData: UsageData
  isXConnected: boolean
  onOptInComplete?: (rank: number) => void
}

export function LeaderboardOptIn({ usageData, isXConnected, onOptInComplete }: LeaderboardOptInProps) {
  const [consent, setConsent] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<{ rank: number; message: string } | null>(null)

  const handleOptIn = async () => {
    if (!consent) {
      setError('Please check the consent box to join the leaderboard')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/leaderboard/opt-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usageData, consent: true })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to join leaderboard')
      }

      setResult({ rank: data.rank, message: data.message })
      onOptInComplete?.(data.rank)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to join leaderboard')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isXConnected) {
    return (
      <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-gray-100 rounded-lg">
            <Trophy className="w-6 h-6 text-gray-400" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">Join the Leaderboard</h3>
            <p className="text-gray-600 text-sm">
              Connect with X to join the public leaderboard and see how your Claude usage compares to others.
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (result) {
    return (
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-6 border border-amber-200">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-amber-100 rounded-lg">
            <CheckCircle className="w-6 h-6 text-amber-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-1">
              You&apos;re on the leaderboard!
            </h3>
            <p className="text-amber-700 font-medium text-lg mb-2">
              {result.message}
            </p>
            <a
              href="/leaderboard"
              className="inline-flex items-center gap-2 text-claude-orange hover:underline text-sm"
            >
              <Trophy className="w-4 h-4" />
              View full leaderboard
            </a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-6 border border-purple-200">
      <div className="flex items-start gap-4">
        <div className="p-3 bg-purple-100 rounded-lg">
          <Trophy className="w-6 h-6 text-purple-600" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 mb-1">Join the Leaderboard</h3>
          <p className="text-gray-600 text-sm mb-4">
            Share your Claude usage stats publicly and see how you rank against other power users.
          </p>

          <label className="flex items-start gap-3 cursor-pointer mb-4">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => {
                setConsent(e.target.checked)
                setError(null)
              }}
              className="mt-1 w-4 h-4 rounded border-gray-300 text-claude-orange focus:ring-claude-orange"
            />
            <span className="text-sm text-gray-600">
              I consent to having my X username and Claude token usage displayed publicly on the leaderboard.
              This action is permanent and cannot be undone.{' '}
              <a href="/privacy" className="text-claude-orange hover:underline">
                Privacy Policy
              </a>
            </span>
          </label>

          {error && (
            <div className="flex items-center gap-2 text-red-600 text-sm mb-4">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          <button
            onClick={handleOptIn}
            disabled={!consent || isLoading}
            className="px-6 py-2 bg-claude-orange text-white rounded-lg hover:bg-claude-orange/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Joining...
              </>
            ) : (
              <>
                <Trophy className="w-4 h-4" />
                Join Leaderboard
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
