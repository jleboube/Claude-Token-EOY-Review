'use client'

import { useState, useRef, useCallback } from 'react'
import { ArrowLeft, Edit3, Sparkles, Loader2 } from 'lucide-react'
import html2canvas from 'html2canvas'
import { CONFIG } from '@/lib/provider-config'
import type { UsageData } from '@/types'

interface PostPreviewProps {
  usageData: UsageData
  onPost: (message: string, imageBase64?: string) => void
  onBack: () => void
  customMessage: string
  onMessageChange: (message: string) => void
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

// Templates for Claude Code (local files)
const CLAUDE_CODE_TEMPLATES = [
  "I used {tokens} tokens with Claude Code in 2025! 🤖✨ #ClaudeCode #AI2025",
  "My 2025 coding journey: {tokens} tokens with @AnthropicAI's Claude Code! 🚀 #DevLife",
  "{tokens} tokens of AI-assisted coding in 2025! Thanks Claude Code! 🙌 #ClaudeCode",
  "2025 wrapped: {tokens} tokens worth of pair programming with Claude Code! 🎉 #AIStats",
]

// Templates for Claude API (admin key)
const CLAUDE_API_TEMPLATES = [
  "I used {tokens} tokens with Claude in 2025! 🤖✨ #ClaudeAI #AI2025",
  "My 2025 AI journey: {tokens} tokens with @AnthropicAI's Claude! 🚀 #YearInAI",
  "{tokens} tokens later... Thanks Claude for being my AI companion in 2025! 🙌 #ClaudeAI",
  "2025 wrapped: {tokens} conversations worth of tokens with Claude! 🎉 #AIStats",
]

function getTemplates(usageData: UsageData): string[] {
  if (usageData.dataSource === 'local-files') {
    return CLAUDE_CODE_TEMPLATES
  }
  return CLAUDE_API_TEMPLATES
}

function getProviderLabel(usageData: UsageData): string {
  if (usageData.dataSource === 'local-files') {
    return 'Claude Code'
  }
  return 'Claude'
}

export function PostPreview({ usageData, onPost, onBack, customMessage, onMessageChange }: PostPreviewProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState(0)
  const [isCapturing, setIsCapturing] = useState(false)
  const shareCardRef = useRef<HTMLDivElement>(null)

  const templates = getTemplates(usageData)
  const providerLabel = getProviderLabel(usageData)

  const getFormattedMessage = (template: string) => {
    return template.replace('{tokens}', formatNumber(usageData.totalTokens))
  }

  const currentMessage = customMessage || getFormattedMessage(templates[selectedTemplate])

  const getShareUrl = () => {
    // Always link to the main app for sharing
    return 'https://claude-tokens.technojoe.dev'
  }

  const fullPost = `${currentMessage}

📊 Check your usage: ${getShareUrl()}`

  const charCount = fullPost.length
  const maxChars = 280

  const handlePost = useCallback(async () => {
    if (!shareCardRef.current) {
      onPost(fullPost)
      return
    }

    setIsCapturing(true)

    try {
      // Capture the share card as an image
      const canvas = await html2canvas(shareCardRef.current, {
        backgroundColor: '#1a1a2e',
        scale: 2, // Higher resolution
        logging: false,
        useCORS: true,
      })

      // Convert to base64
      const imageBase64 = canvas.toDataURL('image/png')

      onPost(fullPost, imageBase64)
    } catch (error) {
      console.error('Error capturing card:', error)
      // Fall back to posting without image
      onPost(fullPost)
    } finally {
      setIsCapturing(false)
    }
  }, [fullPost, onPost])

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-2">
          <span className="gradient-text">Preview Your Post</span>
        </h2>
        <p className="text-gray-600">Customize your message before sharing on X</p>
      </div>

      {/* Share Card Preview */}
      <div className="max-w-lg mx-auto">
        <div ref={shareCardRef} className="share-card text-white">
          <div className="absolute top-4 right-4 opacity-10">
            <Sparkles className="w-24 h-24" />
          </div>

          <div className="relative z-10 text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Sparkles className="w-6 h-6 text-claude-orange" />
              <span className="text-sm font-semibold text-gray-400 uppercase tracking-wider">2025 {providerLabel} Usage</span>
            </div>

            <p className="text-5xl font-bold mb-2 gradient-text">
              {formatNumber(usageData.totalTokens)}
            </p>
            <p className="text-gray-400 mb-6">Total Tokens</p>

            <div className="flex justify-center gap-6 text-sm">
              <div>
                <p className="text-2xl font-bold text-blue-400">{formatNumber(usageData.totalInputTokens)}</p>
                <p className="text-gray-500">Input</p>
              </div>
              <div className="w-px bg-gray-700" />
              <div>
                <p className="text-2xl font-bold text-green-400">{formatNumber(usageData.totalOutputTokens)}</p>
                <p className="text-gray-500">Output</p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-700">
              <p className="text-xs text-gray-500">
                Powered by Claude Token Share • anthropic.com
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Message Editor */}
      <div className="glass rounded-2xl p-6 max-w-lg mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-800 flex items-center gap-2">
            <Edit3 className="w-5 h-5 text-claude-orange" />
            Your Message
          </h3>
          <span className={`text-sm ${charCount > maxChars ? 'text-red-500 font-bold' : 'text-gray-500'}`}>
            {charCount}/{maxChars}
          </span>
        </div>

        {/* Template Selector */}
        {!customMessage && (
          <div className="mb-4">
            <p className="text-sm text-gray-500 mb-2">Choose a template:</p>
            <div className="flex flex-wrap gap-2">
              {templates.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedTemplate(index)}
                  className={`px-3 py-1 rounded-full text-sm transition-all ${
                    selectedTemplate === index
                      ? 'bg-claude-orange text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Template {index + 1}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Message Preview/Editor */}
        <div className="relative">
          {isEditing ? (
            <textarea
              value={customMessage || getFormattedMessage(templates[selectedTemplate])}
              onChange={(e) => onMessageChange(e.target.value)}
              onBlur={() => setIsEditing(false)}
              autoFocus
              rows={4}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-white resize-none focus:ring-2 focus:border-transparent focus:ring-claude-orange"
              placeholder="Write your custom message..."
            />
          ) : (
            <div
              onClick={() => setIsEditing(true)}
              className="px-4 py-3 border border-gray-200 rounded-lg bg-white/50 cursor-text min-h-[100px] transition-colors hover:border-claude-orange"
            >
              <p className="text-gray-800 whitespace-pre-wrap">{currentMessage}</p>
            </div>
          )}
        </div>

        {customMessage && (
          <button
            onClick={() => onMessageChange('')}
            className="mt-2 text-sm hover:underline text-claude-orange"
          >
            Reset to template
          </button>
        )}

        {/* Full Post Preview */}
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-500 mb-2">Full post preview:</p>
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{fullPost}</p>
        </div>
      </div>

      {/* X Post Preview */}
      <div className="max-w-lg mx-auto">
        <div className="glass rounded-2xl p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-300 flex-shrink-0" />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-gray-800">Your Name</span>
                <span className="text-gray-500">@yourhandle</span>
              </div>
              <p className="mt-2 text-gray-800 whitespace-pre-wrap text-sm">{fullPost}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-lg mx-auto">
        <button
          onClick={onBack}
          className="flex items-center justify-center gap-2 px-6 py-3 rounded-full font-semibold border border-gray-300 text-gray-700 hover:bg-gray-50 transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Stats
        </button>
        <button
          onClick={handlePost}
          disabled={charCount > maxChars || isCapturing}
          className={`flex items-center justify-center gap-2 px-8 py-3 rounded-full font-semibold transition-all ${
            charCount > maxChars || isCapturing
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'btn-x'
          }`}
        >
          {isCapturing ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Preparing...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              Post to X
            </>
          )}
        </button>
      </div>
    </div>
  )
}
