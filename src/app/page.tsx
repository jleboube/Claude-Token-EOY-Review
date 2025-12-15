'use client'

import { Suspense, useState, useEffect } from 'react'
import { HomeContent } from '@/components/HomeContent'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import LandingPage from './landing/page'

const VISITED_COOKIE = 'claude-token-share-visited'

function getCookie(name: string): string | null {
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null
  return null
}

function setCookie(name: string, value: string, days: number) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString()
  document.cookie = `${name}=${value}; expires=${expires}; path=/; SameSite=Lax`
}

export default function Home() {
  const [showLanding, setShowLanding] = useState<boolean | null>(null)

  useEffect(() => {
    // Check if user has visited before
    const hasVisited = getCookie(VISITED_COOKIE)
    setShowLanding(!hasVisited)
  }, [])

  const handleGetStarted = () => {
    // Set cookie to remember they've seen the landing page (expires in 365 days)
    setCookie(VISITED_COOKIE, 'true', 365)
    setShowLanding(false)
  }

  // Show loading spinner until we determine the correct page
  if (showLanding === null) {
    return <LoadingSpinner message="Loading..." />
  }

  // First-time visitors see the landing page
  if (showLanding) {
    return <LandingPage onGetStarted={handleGetStarted} />
  }

  // Returning visitors see the app
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-claude-cream via-white to-orange-50">
      <Header />
      <div className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        <Suspense fallback={<LoadingSpinner message="Loading..." />}>
          <HomeContent />
        </Suspense>
      </div>
      <Footer />
    </div>
  )
}
