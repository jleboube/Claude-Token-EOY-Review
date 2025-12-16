'use client'

import { useState, useEffect, useCallback } from 'react'
import { LeaderboardTable } from '@/components/LeaderboardTable'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { LeaderboardEntry, LeaderboardView, LeaderboardResponse } from '@/types'
import { Trophy, Users, TrendingUp } from 'lucide-react'

const VIEW_TABS: { id: LeaderboardView; label: string }[] = [
  { id: '2025', label: '2025' },
  { id: 'all-time', label: 'All Time' },
  { id: 'monthly', label: 'Monthly' }
]

export default function LeaderboardPage() {
  const [view, setView] = useState<LeaderboardView>('2025')
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(25)
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  const fetchLeaderboard = useCallback(async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        view,
        page: page.toString(),
        ...(searchQuery && { search: searchQuery })
      })

      const response = await fetch(`/api/leaderboard?${params}`)
      const data: LeaderboardResponse = await response.json()

      setEntries(data.entries)
      setTotal(data.total)
      setPageSize(data.pageSize)
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error)
    } finally {
      setIsLoading(false)
    }
  }, [view, page, searchQuery])

  useEffect(() => {
    fetchLeaderboard()
  }, [fetchLeaderboard])

  const handleViewChange = (newView: LeaderboardView) => {
    setView(newView)
    setPage(1)
    setSearchQuery('')
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    setPage(1)
  }

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-claude-cream via-white to-orange-50">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8 max-w-6xl">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-800 rounded-full text-sm font-medium mb-4">
            <Trophy className="w-4 h-4" />
            Community Leaderboard
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Claude Token Leaderboard
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            See who&apos;s pushing the limits of AI. Join the community of Claude power users
            and compare your token usage with others.
          </p>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{total}</p>
                <p className="text-sm text-gray-500">Participants</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {entries[0]?.totalTokens
                    ? (entries[0].totalTokens / 1_000_000).toFixed(1) + 'M'
                    : '0'}
                </p>
                <p className="text-sm text-gray-500">Top Score</p>
              </div>
            </div>
          </div>
          <div className="hidden md:block bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-lg">
                <Trophy className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {entries[0]?.xUsername ? `@${entries[0].xUsername}` : '-'}
                </p>
                <p className="text-sm text-gray-500">Current Leader</p>
              </div>
            </div>
          </div>
        </div>

        {/* View Tabs */}
        <div className="flex gap-2 mb-6">
          {VIEW_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleViewChange(tab.id)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                view === tab.id
                  ? 'bg-claude-orange text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Leaderboard Table */}
        <LeaderboardTable
          entries={entries}
          total={total}
          page={page}
          pageSize={pageSize}
          view={view}
          onPageChange={handlePageChange}
          onSearch={handleSearch}
          searchQuery={searchQuery}
          isLoading={isLoading}
        />

        {/* CTA */}
        <div className="mt-8 bg-gradient-to-r from-claude-orange to-amber-500 rounded-xl p-6 text-center text-white">
          <h2 className="text-xl font-bold mb-2">Want to join the leaderboard?</h2>
          <p className="text-amber-100 mb-4">
            Check your Claude usage and opt-in to appear on this leaderboard.
          </p>
          <a
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-claude-orange rounded-lg font-medium hover:bg-amber-50 transition-colors"
          >
            <Trophy className="w-5 h-5" />
            Check My Usage
          </a>
        </div>
      </main>

      <Footer />
    </div>
  )
}
