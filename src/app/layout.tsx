import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'ClaudeTokenShare - Share Your 2025 Claude Usage',
  description: 'Retrieve your Claude Code token usage for 2025 and share it on X (Twitter)!',
  keywords: ['Claude', 'AI', 'Token Usage', 'Anthropic', 'X', 'Twitter', '2025'],
  authors: [{ name: 'ClaudeTokenShare' }],
  openGraph: {
    title: 'ClaudeTokenShare - Share Your 2025 Claude Usage',
    description: 'See how many tokens you used with Claude in 2025 and share it with the world!',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ClaudeTokenShare',
    description: 'Share your 2025 Claude token usage on X!',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <main className="min-h-screen">
          {children}
        </main>
      </body>
    </html>
  )
}
