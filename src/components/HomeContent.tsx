'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { CredentialsForm } from '@/components/CredentialsForm'
import { UsageDashboard } from '@/components/UsageDashboard'
import { PostPreview } from '@/components/PostPreview'
import { SuccessScreen } from '@/components/SuccessScreen'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { LeaderboardOptIn } from '@/components/LeaderboardOptIn'
import { CONFIG } from '@/lib/provider-config'
import type { UsageData, XCredentials, ClaudeCredentials } from '@/types'

type AppStep = 'credentials' | 'loading' | 'dashboard' | 'preview' | 'posting' | 'success' | 'error'

export function HomeContent() {
  const searchParams = useSearchParams()
  const [step, setStep] = useState<AppStep>('credentials')
  const [claudeCredentials, setClaudeCredentials] = useState<ClaudeCredentials | null>(null)
  const [xCredentials, setXCredentials] = useState<XCredentials | null>(null)
  const [useOAuth, setUseOAuth] = useState(false)
  const [usageData, setUsageData] = useState<UsageData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [postUrl, setPostUrl] = useState<string | null>(null)
  const [customMessage, setCustomMessage] = useState<string>('')

  // X OAuth state
  const [xConnected, setXConnected] = useState(false)
  const [xUsername, setXUsername] = useState<string | null>(null)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)

  // Check auth status on mount and after OAuth callback
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await fetch('/api/auth/status')
        const data = await response.json()

        if (data.success) {
          setXConnected(data.data.xConnected)
          setXUsername(data.data.xUsername)
        }
      } catch (err) {
        console.error('Failed to check auth status:', err)
      } finally {
        setIsCheckingAuth(false)
      }
    }

    // Check for OAuth callback params
    const xConnectedParam = searchParams.get('x_connected')
    const usernameParam = searchParams.get('username')
    const errorParam = searchParams.get('error')

    if (errorParam) {
      setError(decodeURIComponent(errorParam))
      // Clear the error from URL
      window.history.replaceState({}, '', window.location.pathname)
    }

    if (xConnectedParam === 'true') {
      setXConnected(true)
      if (usernameParam) {
        setXUsername(decodeURIComponent(usernameParam))
      }
      // Clear the params from URL
      window.history.replaceState({}, '', window.location.pathname)
      setIsCheckingAuth(false)
    } else {
      checkAuthStatus()
    }
  }, [searchParams])

  const handleCredentialsSubmit = async (
    credentials: ClaudeCredentials,
    x: XCredentials | null,
    oauth: boolean
  ) => {
    setClaudeCredentials(credentials)
    setXCredentials(x)
    setUseOAuth(oauth)
    setStep('loading')
    setError(null)

    try {
      const requestBody = { adminApiKey: credentials.adminApiKey }

      const response = await fetch(CONFIG.usageEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch usage data')
      }

      setUsageData(data.data)
      setStep('dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      setStep('error')
    }
  }

  const handleProceedToPreview = () => {
    setStep('preview')
  }

  const handlePostToX = async (message: string, imageBase64?: string) => {
    if (!usageData) return
    if (!useOAuth && !xCredentials) return

    setStep('posting')
    setError(null)

    try {
      const response = await fetch('/api/post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          credentials: useOAuth ? undefined : xCredentials,
          message,
          useOAuth,
          imageBase64,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to post to X')
      }

      setPostUrl(data.data.postUrl)
      setStep('success')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to post to X')
      setStep('error')
    }
  }

  const handleLocalDataLoaded = (data: UsageData) => {
    setUsageData(data)
    setUseOAuth(xConnected) // Use OAuth if connected
    setStep('dashboard')
  }

  const handleReset = () => {
    setStep('credentials')
    setClaudeCredentials(null)
    setXCredentials(null)
    setUsageData(null)
    setError(null)
    setPostUrl(null)
    setCustomMessage('')
    setUseOAuth(false)
  }

  const handleBack = () => {
    if (step === 'preview') {
      setStep('dashboard')
    } else if (step === 'dashboard') {
      setStep('credentials')
    } else if (step === 'error') {
      setStep('credentials')
    }
  }

  if (isCheckingAuth) {
    return <LoadingSpinner message="Checking authentication status..." />
  }

  return (
    <>
      {step === 'credentials' && (
        <CredentialsForm
          onSubmit={handleCredentialsSubmit}
          onLocalDataLoaded={handleLocalDataLoaded}
          xConnected={xConnected}
          xUsername={xUsername}
        />
      )}

      {step === 'loading' && (
        <LoadingSpinner message={`Fetching your ${CONFIG.name} usage data...`} />
      )}

      {step === 'dashboard' && usageData && (
        <>
          <UsageDashboard
            usageData={usageData}
            onProceed={handleProceedToPreview}
            onBack={handleBack}
          />
          <div className="mt-6">
            <LeaderboardOptIn
              usageData={usageData}
              isXConnected={xConnected}
            />
          </div>
        </>
      )}

      {step === 'preview' && usageData && (
        <PostPreview
          usageData={usageData}
          onPost={handlePostToX}
          onBack={handleBack}
          customMessage={customMessage}
          onMessageChange={setCustomMessage}
        />
      )}

      {step === 'posting' && (
        <LoadingSpinner message="Posting to X..." />
      )}

      {step === 'success' && postUrl && (
        <SuccessScreen
          postUrl={postUrl}
          onReset={handleReset}
        />
      )}

      {step === 'error' && (
        <div className="text-center py-16">
          <div className="glass rounded-2xl p-8 max-w-md mx-auto">
            <div className="text-6xl mb-4">😢</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Oops! Something went wrong</h2>
            <p className="text-red-600 mb-6">{error}</p>
            <button
              onClick={handleBack}
              className="btn-claude px-6 py-3 rounded-full font-semibold"
            >
              Try Again
            </button>
          </div>
        </div>
      )}
    </>
  )
}
