'use client'

import { useState, useEffect } from 'react'
import { Eye, EyeOff, Key, Shield, AlertTriangle, ChevronDown, ChevronUp, CheckCircle, Loader2, FolderOpen } from 'lucide-react'
import type { ClaudeCredentials, XCredentials, UsageData } from '@/types'
import { isFileSystemAccessSupported, selectClaudeDirectory, parseClaudeLocalData } from '@/lib/claude-local-parser'
import { CONFIG } from '@/lib/provider-config'

type DataSource = 'api' | 'local'

interface CredentialsFormProps {
  onSubmit: (credentials: ClaudeCredentials, x: XCredentials | null, useOAuth: boolean) => void
  onLocalDataLoaded: (usageData: UsageData) => void
  xConnected?: boolean
  xUsername?: string | null
}

export function CredentialsForm({ onSubmit, onLocalDataLoaded, xConnected = false, xUsername = null }: CredentialsFormProps) {
  const [dataSource, setDataSource] = useState<DataSource>('api')
  const [localFileSupported, setLocalFileSupported] = useState(false)
  const [isLoadingLocal, setIsLoadingLocal] = useState(false)
  const [localProgress, setLocalProgress] = useState<string>('')
  const [localError, setLocalError] = useState<string | null>(null)

  // API Key state
  const [apiKey, setApiKey] = useState('')

  // X credentials state
  const [xApiKey, setXApiKey] = useState('')
  const [xApiSecret, setXApiSecret] = useState('')
  const [xAccessToken, setXAccessToken] = useState('')
  const [xAccessTokenSecret, setXAccessTokenSecret] = useState('')
  const [showKeys, setShowKeys] = useState(false)
  const [showHelp, setShowHelp] = useState(false)
  const [useManualX, setUseManualX] = useState(false)
  const [isConnectingX, setIsConnectingX] = useState(false)

  // Check if File System Access API is supported
  useEffect(() => {
    setLocalFileSupported(isFileSystemAccessSupported())
  }, [])

  const handleLoadLocalData = async () => {
    setIsLoadingLocal(true)
    setLocalError(null)
    setLocalProgress('Requesting folder access...')

    try {
      const dirHandle = await selectClaudeDirectory()
      const usageData = await parseClaudeLocalData(dirHandle, setLocalProgress)
      onLocalDataLoaded(usageData)
    } catch (error) {
      setLocalError(error instanceof Error ? error.message : 'Failed to load local data')
    } finally {
      setIsLoadingLocal(false)
      setLocalProgress('')
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const credentials: ClaudeCredentials = { adminApiKey: apiKey }

    if (xConnected) {
      onSubmit(credentials, null, true)
    } else if (useManualX) {
      const xCredentials: XCredentials = {
        apiKey: xApiKey,
        apiSecret: xApiSecret,
        accessToken: xAccessToken,
        accessTokenSecret: xAccessTokenSecret,
      }
      onSubmit(credentials, xCredentials, false)
    }
  }

  const handleConnectX = () => {
    setIsConnectingX(true)
    window.location.href = '/api/auth/x'
  }

  const isValidWithOAuth = apiKey && xConnected
  const isValidWithManual = apiKey && useManualX && xApiKey && xApiSecret && xAccessToken && xAccessTokenSecret
  const isValid = isValidWithOAuth || isValidWithManual

  // Button class
  const btnClass = 'btn-claude'
  const gradientClass = 'bg-gradient-to-br from-claude-orange to-yellow-500'
  const textGradientClass = 'gradient-text'
  const accentColorClass = 'text-claude-orange'

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center py-8">
        <h2 className="text-4xl font-bold mb-4">
          <span className={textGradientClass}>{CONFIG.tagline}</span>
        </h2>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          {CONFIG.description}
        </p>
      </div>

      {/* Security Notice */}
      <div className="glass rounded-xl p-4 flex items-start gap-3 max-w-2xl mx-auto">
        <Shield className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-gray-600">
          <strong className="text-gray-800">Your data is safe.</strong> We never store your API keys or upload your local files.
          Everything stays in your browser.
        </div>
      </div>

      {/* Data Source Toggle */}
      {localFileSupported && (
        <div className="max-w-2xl mx-auto">
          <p className="text-center text-sm text-gray-600 mb-3">Choose how to retrieve your token usage:</p>
          <div className="glass rounded-2xl p-2 flex gap-2">
            <button
              type="button"
              onClick={() => setDataSource('local')}
              className={`flex-1 flex flex-col items-center justify-center gap-1 py-4 px-4 rounded-xl font-medium transition-all ${
                dataSource === 'local'
                  ? `${gradientClass} text-white shadow-lg`
                  : 'text-gray-600 hover:bg-white/50'
              }`}
            >
              <FolderOpen className="w-5 h-5" />
              <span>Claude Code</span>
              <span className={`text-xs ${dataSource === 'local' ? 'text-white/80' : 'text-gray-400'}`}>Local Files</span>
            </button>
            <button
              type="button"
              onClick={() => setDataSource('api')}
              className={`flex-1 flex flex-col items-center justify-center gap-1 py-4 px-4 rounded-xl font-medium transition-all ${
                dataSource === 'api'
                  ? `${gradientClass} text-white shadow-lg`
                  : 'text-gray-600 hover:bg-white/50'
              }`}
            >
              <Key className="w-5 h-5" />
              <span>Claude API</span>
              <span className={`text-xs ${dataSource === 'api' ? 'text-white/80' : 'text-gray-400'}`}>Admin Key</span>
            </button>
          </div>
          <p className="text-center text-xs text-gray-500 mt-2">
            {dataSource === 'local'
              ? 'Best for Claude Code users - reads usage data from your local ~/.claude folder'
              : 'Best for API users - retrieves usage from Anthropic console using Admin API key'}
          </p>
        </div>
      )}

      {/* Local Data Option */}
      {dataSource === 'local' && localFileSupported && (
        <div className="max-w-2xl mx-auto space-y-6">
          {/* X Connection for Local Flow */}
          <div className="glass rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-full bg-x-black flex items-center justify-center">
                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Step 1: Connect to X (Twitter)</h3>
                <p className="text-sm text-gray-500">Required for posting your stats</p>
              </div>
            </div>

            {xConnected ? (
              <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <div>
                  <p className="font-medium text-green-800">Connected to X</p>
                  {xUsername && <p className="text-sm text-green-600">@{xUsername}</p>}
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleConnectX}
                disabled={isConnectingX}
                className="w-full flex items-center justify-center gap-3 btn-x px-6 py-4 rounded-xl font-semibold text-lg"
              >
                {isConnectingX ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                )}
                Connect with X
              </button>
            )}
          </div>

          {/* Load Local Data */}
          <div className="glass rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className={`w-10 h-10 rounded-full ${gradientClass} flex items-center justify-center`}>
                <FolderOpen className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Step 2: Load Your Claude Data</h3>
                <p className="text-sm text-gray-500">Read your token usage directly from your computer</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-blue-50 rounded-lg p-4 text-sm text-blue-800">
                <p className="font-medium mb-2">How it works:</p>
                <ol className="list-decimal list-inside space-y-1 text-blue-700">
                  <li>Click the button below to open a folder picker</li>
                  <li>Navigate to your <code className="bg-blue-100 px-1 rounded">{CONFIG.localFilesPath}</code> folder</li>
                  <li>Grant read access when prompted</li>
                  <li>We&apos;ll parse your conversation files locally (nothing is uploaded)</li>
                </ol>
              </div>

              {localError && (
                <div className="bg-red-50 rounded-lg p-4 text-sm text-red-800">
                  {localError}
                </div>
              )}

              {isLoadingLocal && localProgress && (
                <div className="bg-amber-50 rounded-lg p-4 text-sm text-amber-800 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {localProgress}
                </div>
              )}

              <button
                type="button"
                onClick={handleLoadLocalData}
                disabled={isLoadingLocal || !xConnected}
                className={`w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-semibold text-lg ${
                  xConnected
                    ? btnClass
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                {isLoadingLocal ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <FolderOpen className="w-5 h-5" />
                )}
                {isLoadingLocal ? 'Loading...' : 'Select Claude Data Folder'}
              </button>

              {!xConnected && (
                <p className="text-center text-xs text-amber-600">
                  Connect to X first to enable this button
                </p>
              )}

              <p className="text-center text-xs text-gray-500">
                Works with Chrome and Edge browsers. Your files never leave your computer.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Form - API mode */}
      {dataSource === 'api' && (
      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6">
        {/* API Key */}
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className={`w-10 h-10 rounded-full ${gradientClass} flex items-center justify-center`}>
              <Key className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">
                Claude Admin API Key
              </h3>
              <p className="text-sm text-gray-500">Required for usage data access</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="relative">
              <input
                type={showKeys ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder={CONFIG.apiKeyPlaceholder}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-white/50 pr-12"
              />
              <button
                type="button"
                onClick={() => setShowKeys(!showKeys)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showKeys ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* X Connection */}
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-full bg-x-black flex items-center justify-center">
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">Connect to X (Twitter)</h3>
              <p className="text-sm text-gray-500">Required for posting your stats</p>
            </div>
          </div>

          {xConnected ? (
            <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <div>
                <p className="font-medium text-green-800">Connected to X</p>
                {xUsername && <p className="text-sm text-green-600">@{xUsername}</p>}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <button
                type="button"
                onClick={handleConnectX}
                disabled={isConnectingX}
                className="w-full flex items-center justify-center gap-3 btn-x px-6 py-4 rounded-xl font-semibold text-lg"
              >
                {isConnectingX ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                )}
                Connect with X
              </button>

              <p className="text-center text-sm text-gray-500">— or —</p>

              <button
                type="button"
                onClick={() => setUseManualX(!useManualX)}
                className="w-full text-sm text-gray-600 hover:text-gray-800 underline"
              >
                {useManualX ? 'Hide manual credentials' : 'Enter API credentials manually'}
              </button>

              {useManualX && (
                <div className="space-y-4 pt-4 border-t border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">API Key</label>
                      <input
                        type={showKeys ? 'text' : 'password'}
                        value={xApiKey}
                        onChange={(e) => setXApiKey(e.target.value)}
                        placeholder="API Key"
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-white/50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">API Secret</label>
                      <input
                        type={showKeys ? 'text' : 'password'}
                        value={xApiSecret}
                        onChange={(e) => setXApiSecret(e.target.value)}
                        placeholder="API Secret"
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-white/50"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Access Token</label>
                      <input
                        type={showKeys ? 'text' : 'password'}
                        value={xAccessToken}
                        onChange={(e) => setXAccessToken(e.target.value)}
                        placeholder="Access Token"
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-white/50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Access Token Secret</label>
                      <input
                        type={showKeys ? 'text' : 'password'}
                        value={xAccessTokenSecret}
                        onChange={(e) => setXAccessTokenSecret(e.target.value)}
                        placeholder="Access Token Secret"
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-white/50"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Help Section */}
        <div className="glass rounded-xl">
          <button
            type="button"
            onClick={() => setShowHelp(!showHelp)}
            className="w-full p-4 flex items-center justify-between text-left"
          >
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <span className="font-medium text-gray-800">Where do I find these keys?</span>
            </div>
            {showHelp ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
          </button>

          {showHelp && (
            <div className="px-4 pb-4 space-y-4 text-sm text-gray-600">
              <div>
                <strong className="text-gray-800">Claude Admin API Key:</strong>
                <ol className="list-decimal list-inside mt-1 space-y-1">
                  <li>Go to <a href={CONFIG.apiKeysUrl} target="_blank" rel="noopener noreferrer" className={`${accentColorClass} hover:underline`}>{CONFIG.apiKeysUrl.replace('https://', '')}</a></li>
                  <li>Navigate to Settings → API Keys</li>
                  <li>Create or copy your Admin API Key (starts with {CONFIG.apiKeyPrefix})</li>
                </ol>
              </div>
              {useManualX && (
                <div>
                  <strong className="text-gray-800">X API Credentials (Manual):</strong>
                  <ol className="list-decimal list-inside mt-1 space-y-1">
                    <li>Go to <a href="https://developer.x.com" target="_blank" rel="noopener noreferrer" className="text-x-black hover:underline">developer.x.com</a></li>
                    <li>Create a new app or use existing one</li>
                    <li>Go to your app&apos;s &quot;Keys and tokens&quot; section</li>
                    <li>Generate API Key, API Secret, Access Token, and Access Token Secret</li>
                    <li>Make sure your app has Read and Write permissions</li>
                  </ol>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!isValid}
          className={`w-full py-4 rounded-full font-semibold text-lg transition-all ${
            isValid
              ? `${btnClass} cursor-pointer`
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          Get My Token Usage
        </button>
      </form>
      )}
    </div>
  )
}
