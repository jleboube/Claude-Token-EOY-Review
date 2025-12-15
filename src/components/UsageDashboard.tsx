'use client'

import { ArrowRight, ArrowLeft, Download, DollarSign, MessageSquare, BarChart3, Database, Cloud, Sparkles } from 'lucide-react'
import type { UsageData } from '@/types'

interface UsageDashboardProps {
  usageData: UsageData
  onProceed: () => void
  onBack: () => void
}

function formatNumber(num: number): string {
  if (num >= 1_000_000_000) {
    return (num / 1_000_000_000).toFixed(2) + 'B'
  }
  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(2) + 'M'
  }
  if (num >= 1_000) {
    return (num / 1_000).toFixed(2) + 'K'
  }
  return num.toLocaleString()
}

function formatCurrency(num: number): string {
  return '$' + num.toFixed(2)
}

export function UsageDashboard({ usageData, onProceed, onBack }: UsageDashboardProps) {
  const handleExport = () => {
    const data = JSON.stringify(usageData, null, 2)
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    const source = usageData.dataSource === 'local-files' ? 'local' : 'api'
    a.download = `claude-usage-2025-${source}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-2">
          <span className="gradient-text">Your 2025 Claude Stats</span>
        </h2>
        <p className="text-gray-600">Here's your AI journey this year!</p>

        {/* Data Source Badge */}
        <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full">
          {usageData.dataSource === 'local-files' ? (
            <Database className="w-4 h-4 text-claude-orange" />
          ) : (
            <Cloud className="w-4 h-4 text-blue-500" />
          )}
          <span className="text-sm text-gray-600">{usageData.dataSourceLabel}</span>
        </div>
      </div>

      {/* Main Stats Card */}
      <div className="share-card text-white">
        <div className="absolute top-4 right-4 opacity-20">
          <Sparkles className="w-32 h-32" />
        </div>

        <div className="relative z-10">
          <div className="text-center mb-8">
            <p className="text-gray-400 text-sm uppercase tracking-wider mb-2">Total Tokens Used in 2025</p>
            <p className="text-6xl font-bold animate-count-up gradient-text">
              {formatNumber(usageData.totalTokens)}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="glass rounded-xl p-4 bg-white/5">
              <MessageSquare className="w-6 h-6 mx-auto mb-2 text-blue-400" />
              <p className="text-2xl font-bold">{formatNumber(usageData.totalInputTokens)}</p>
              <p className="text-xs text-gray-400">Input Tokens</p>
            </div>
            <div className="glass rounded-xl p-4 bg-white/5">
              <BarChart3 className="w-6 h-6 mx-auto mb-2 text-green-400" />
              <p className="text-2xl font-bold">{formatNumber(usageData.totalOutputTokens)}</p>
              <p className="text-xs text-gray-400">Output Tokens</p>
            </div>
            <div className="glass rounded-xl p-4 bg-white/5">
              <DollarSign className="w-6 h-6 mx-auto mb-2 text-yellow-400" />
              <p className="text-2xl font-bold">{formatCurrency(usageData.totalCost)}</p>
              <p className="text-xs text-gray-400">Total Cost</p>
            </div>
          </div>
        </div>
      </div>

      {/* Model Breakdown */}
      {usageData.modelBreakdown.length > 0 && (
        <div className="glass rounded-2xl p-6">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-claude-orange" />
            Model Breakdown
          </h3>
          <div className="space-y-3">
            {usageData.modelBreakdown.map((model, index) => {
              const percentage = (model.totalTokens / usageData.totalTokens) * 100
              return (
                <div key={index}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-gray-700">{model.model}</span>
                    <span className="text-gray-500">{formatNumber(model.totalTokens)} ({percentage.toFixed(1)}%)</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-1000 bg-gradient-to-r from-claude-orange to-yellow-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Monthly Breakdown */}
      {usageData.monthlyBreakdown.length > 0 && (
        <div className="glass rounded-2xl p-6">
          <h3 className="font-semibold text-gray-800 mb-4">Monthly Usage</h3>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {usageData.monthlyBreakdown.map((month, index) => {
              const maxTokens = Math.max(...usageData.monthlyBreakdown.map(m => m.totalTokens))
              const height = maxTokens > 0 ? (month.totalTokens / maxTokens) * 100 : 0
              return (
                <div key={index} className="text-center">
                  <div className="h-20 flex items-end justify-center mb-2">
                    <div
                      className="w-8 rounded-t transition-all duration-500 bg-gradient-to-t from-claude-orange to-yellow-400"
                      style={{ height: `${Math.max(height, 5)}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500">{month.month}</p>
                  <p className="text-xs font-medium">{formatNumber(month.totalTokens)}</p>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button
          onClick={onBack}
          className="flex items-center justify-center gap-2 px-6 py-3 rounded-full font-semibold border border-gray-300 text-gray-700 hover:bg-gray-50 transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>
        <button
          onClick={handleExport}
          className="flex items-center justify-center gap-2 px-6 py-3 rounded-full font-semibold border border-gray-300 text-gray-700 hover:bg-gray-50 transition-all"
        >
          <Download className="w-5 h-5" />
          Export JSON
        </button>
        <button
          onClick={onProceed}
          className="flex items-center justify-center gap-2 btn-claude px-8 py-3 rounded-full font-semibold"
        >
          Share on X
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}
