'use client'

import { useState } from 'react'
import { LeaderboardEntry, LeaderboardView } from '@/types'
import { Trophy, Medal, Award, ExternalLink, Search, ChevronLeft, ChevronRight } from 'lucide-react'

interface LeaderboardTableProps {
  entries: LeaderboardEntry[]
  total: number
  page: number
  pageSize: number
  view: LeaderboardView
  onPageChange: (page: number) => void
  onSearch: (query: string) => void
  searchQuery: string
  isLoading?: boolean
}

function formatNumber(num: number): string {
  if (num >= 1_000_000_000) {
    return (num / 1_000_000_000).toFixed(2) + 'B'
  }
  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(2) + 'M'
  }
  if (num >= 1_000) {
    return (num / 1_000).toFixed(1) + 'K'
  }
  return num.toLocaleString()
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) {
    return (
      <div className="flex items-center gap-1">
        <Trophy className="w-5 h-5 text-yellow-500" />
        <span className="font-bold text-yellow-600">1</span>
      </div>
    )
  }
  if (rank === 2) {
    return (
      <div className="flex items-center gap-1">
        <Medal className="w-5 h-5 text-gray-400" />
        <span className="font-bold text-gray-500">2</span>
      </div>
    )
  }
  if (rank === 3) {
    return (
      <div className="flex items-center gap-1">
        <Award className="w-5 h-5 text-amber-600" />
        <span className="font-bold text-amber-700">3</span>
      </div>
    )
  }
  return <span className="text-gray-600 font-medium">{rank}</span>
}

export function LeaderboardTable({
  entries,
  total,
  page,
  pageSize,
  onPageChange,
  onSearch,
  searchQuery,
  isLoading
}: LeaderboardTableProps) {
  const [localSearch, setLocalSearch] = useState(searchQuery)
  const totalPages = Math.ceil(total / pageSize)

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch(localSearch)
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Search Bar */}
      <div className="p-4 border-b border-gray-100">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by username..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-claude-orange focus:border-transparent outline-none"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-claude-orange text-white rounded-lg hover:bg-claude-orange/90 transition-colors"
          >
            Search
          </button>
        </form>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Rank
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Total Tokens
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                Input
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                Output
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">
                Joined
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                  Loading...
                </td>
              </tr>
            ) : entries.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                  {searchQuery ? 'No users found matching your search' : 'No entries yet. Be the first to join!'}
                </td>
              </tr>
            ) : (
              entries.map((entry) => (
                <tr
                  key={entry.id}
                  className={`hover:bg-gray-50 transition-colors ${
                    entry.rank && entry.rank <= 3 ? 'bg-gradient-to-r from-amber-50/50 to-transparent' : ''
                  }`}
                >
                  <td className="px-4 py-4">
                    <RankBadge rank={entry.rank || 0} />
                  </td>
                  <td className="px-4 py-4">
                    <a
                      href={`https://x.com/${entry.xUsername}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-gray-900 hover:text-claude-orange transition-colors"
                    >
                      <span className="font-medium">@{entry.xUsername}</span>
                      <ExternalLink className="w-3 h-3 opacity-50" />
                    </a>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <span className="font-bold text-claude-orange">
                      {formatNumber(entry.totalTokens)}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right text-gray-600 hidden sm:table-cell">
                    {formatNumber(entry.totalInputTokens)}
                  </td>
                  <td className="px-4 py-4 text-right text-gray-600 hidden sm:table-cell">
                    {formatNumber(entry.totalOutputTokens)}
                  </td>
                  <td className="px-4 py-4 text-right text-gray-500 text-sm hidden md:table-cell">
                    {formatDate(entry.submittedAt)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Showing {((page - 1) * pageSize) + 1} - {Math.min(page * pageSize, total)} of {total}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange(page - 1)}
              disabled={page === 1}
              className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-sm text-gray-600">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => onPageChange(page + 1)}
              disabled={page === totalPages}
              className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
