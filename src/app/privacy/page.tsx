import Link from 'next/link'
import { ArrowLeft, Shield, Eye, Database, Lock } from 'lucide-react'
import { PROVIDER, CONFIG } from '@/lib/provider-config'

const isClaude = PROVIDER === 'claude'

export const metadata = {
  title: `Privacy Policy | ${CONFIG.fullName}`,
  description: `Privacy Policy for ${CONFIG.fullName} - Learn how we protect your data`,
}

export default function PrivacyPage() {
  return (
    <main className="min-h-screen py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <Link
          href="/"
          className={`inline-flex items-center gap-2 text-gray-600 mb-8 transition-colors ${
            isClaude ? 'hover:text-claude-orange' : 'hover:text-openai-green'
          }`}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <div className="glass rounded-2xl p-8 md:p-12">
          <div className="flex items-center gap-3 mb-6">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              isClaude
                ? 'bg-gradient-to-br from-claude-orange to-yellow-500'
                : 'bg-gradient-to-br from-openai-green to-emerald-400'
            }`}>
              <Shield className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800">Privacy Policy</h1>
          </div>

          <p className="text-gray-600 mb-8">
            Last updated: December 14, 2025
          </p>

          <div className="space-y-8">
            {/* Introduction */}
            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">Introduction</h2>
              <p className="text-gray-600">
                {CONFIG.fullName} (&quot;we&quot;, &quot;our&quot;, or &quot;the service&quot;) is committed to protecting your privacy.
                This Privacy Policy explains how we handle your information when you use our service to view and share
                your AI token usage statistics.
              </p>
            </section>

            {/* No Data Storage */}
            <section className="bg-green-50 rounded-xl p-6 border border-green-200">
              <div className="flex items-start gap-3">
                <Database className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <h2 className="text-xl font-semibold text-green-800 mb-2">We Do Not Store Your Data</h2>
                  <p className="text-green-700">
                    <strong>We do not store, save, or retain any of your data.</strong> This includes:
                  </p>
                  <ul className="list-disc list-inside mt-2 space-y-1 text-green-700">
                    <li>API keys you provide</li>
                    <li>Token usage statistics</li>
                    <li>Local files you grant access to</li>
                    <li>Personal information from your X (Twitter) account</li>
                    <li>Any other data processed through our service</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* How We Process Data */}
            <section>
              <div className="flex items-start gap-3">
                <Eye className={`w-6 h-6 flex-shrink-0 mt-1 ${isClaude ? 'text-claude-orange' : 'text-openai-green'}`} />
                <div>
                  <h2 className="text-xl font-semibold text-gray-800 mb-3">How We Process Data</h2>
                  <div className="space-y-4 text-gray-600">
                    <div>
                      <h3 className="font-medium text-gray-700">Local File Access</h3>
                      <p>
                        When you choose to load data from your local Claude folder, we use the browser&apos;s
                        File System Access API. Your files are read directly in your browser and are never
                        uploaded to any server. All processing happens locally on your device.
                      </p>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-700">API Key Usage</h3>
                      <p>
                        When you provide an Admin API key, it is used solely to make a request to the
                        respective AI provider&apos;s API (Anthropic or OpenAI) to retrieve your usage data.
                        The key is transmitted securely and is not stored anywhere.
                      </p>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-700">X (Twitter) Authentication</h3>
                      <p>
                        We use OAuth 2.0 to authenticate with X. This allows you to post directly to your
                        account without sharing your X password with us. OAuth tokens are stored only in
                        your browser session and are cleared when you close your browser.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Security */}
            <section>
              <div className="flex items-start gap-3">
                <Lock className={`w-6 h-6 flex-shrink-0 mt-1 ${isClaude ? 'text-claude-orange' : 'text-openai-green'}`} />
                <div>
                  <h2 className="text-xl font-semibold text-gray-800 mb-3">Security Measures</h2>
                  <ul className="list-disc list-inside space-y-2 text-gray-600">
                    <li>All communications are encrypted using HTTPS/TLS</li>
                    <li>API keys are never logged or persisted</li>
                    <li>Local file processing happens entirely in your browser</li>
                    <li>OAuth tokens are session-based and automatically expire</li>
                    <li>We do not use tracking cookies or analytics that collect personal data</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Third-Party Services */}
            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">Third-Party Services</h2>
              <p className="text-gray-600 mb-3">
                Our service interacts with the following third-party services:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-600">
                <li><strong>Anthropic API:</strong> To retrieve Claude usage data (when using Admin API key)</li>
                <li><strong>OpenAI API:</strong> To retrieve OpenAI usage data (future feature)</li>
                <li><strong>X (Twitter) API:</strong> To post your usage statistics to your X account</li>
              </ul>
              <p className="text-gray-600 mt-3">
                Each of these services has their own privacy policies that govern their handling of your data.
              </p>
            </section>

            {/* Non-Affiliation */}
            <section className="bg-amber-50 rounded-xl p-6 border border-amber-200">
              <h2 className="text-xl font-semibold text-amber-800 mb-2">Disclaimer</h2>
              <p className="text-amber-700">
                {CONFIG.fullName} is an independent project and is <strong>not affiliated with, endorsed by,
                or sponsored by {CONFIG.companyName} or X Corp (Twitter)</strong>.
                All product names, logos, and brands are property of their respective owners.
              </p>
            </section>

            {/* Contact */}
            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">Contact</h2>
              <p className="text-gray-600">
                If you have any questions about this Privacy Policy, please contact Joe LeBoube.
              </p>
            </section>

            {/* Changes */}
            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">Changes to This Policy</h2>
              <p className="text-gray-600">
                We may update this Privacy Policy from time to time. Any changes will be posted on this page
                with an updated revision date.
              </p>
            </section>
          </div>
        </div>
      </div>
    </main>
  )
}
