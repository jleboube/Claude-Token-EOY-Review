import Link from 'next/link'
import { ArrowLeft, FileText, AlertTriangle, CheckCircle, XCircle } from 'lucide-react'
import { PROVIDER, CONFIG } from '@/lib/provider-config'

const isClaude = PROVIDER === 'claude'

export const metadata = {
  title: `Terms of Service | ${CONFIG.fullName}`,
  description: `Terms of Service for ${CONFIG.fullName}`,
}

export default function TermsPage() {
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
              <FileText className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800">Terms of Service</h1>
          </div>

          <p className="text-gray-600 mb-8">
            Last updated: December 14, 2025
          </p>

          <div className="space-y-8">
            {/* Acceptance */}
            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">1. Acceptance of Terms</h2>
              <p className="text-gray-600">
                By accessing or using {CONFIG.fullName} (&quot;the Service&quot;), you agree to be bound by these
                Terms of Service. If you do not agree to these terms, please do not use the Service.
              </p>
            </section>

            {/* Description */}
            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">2. Description of Service</h2>
              <p className="text-gray-600">
                {CONFIG.fullName} is a free tool that allows users to:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1 text-gray-600">
                <li>View their AI token usage statistics from various providers</li>
                <li>Share their usage statistics on X (Twitter)</li>
                <li>Export their usage data for personal use</li>
              </ul>
            </section>

            {/* No Data Storage */}
            <section className="bg-green-50 rounded-xl p-6 border border-green-200">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <h2 className="text-xl font-semibold text-green-800 mb-2">3. Data Handling</h2>
                  <p className="text-green-700 mb-3">
                    <strong>We do not store any user data.</strong> Specifically:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-green-700">
                    <li>Your API keys are used only for the immediate request and are never saved</li>
                    <li>Local files are read in your browser and are never uploaded</li>
                    <li>Usage statistics are processed in memory and discarded after your session</li>
                    <li>OAuth tokens are stored only in your browser session</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* User Responsibilities */}
            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">4. User Responsibilities</h2>
              <p className="text-gray-600 mb-3">By using this Service, you agree to:</p>
              <ul className="list-disc list-inside space-y-2 text-gray-600">
                <li>Only use API keys that you own or have authorization to use</li>
                <li>Only access local files that belong to you</li>
                <li>Not attempt to circumvent any security measures</li>
                <li>Not use the Service for any illegal or unauthorized purpose</li>
                <li>Comply with all applicable laws and regulations</li>
                <li>Comply with the terms of service of Anthropic, OpenAI, and X (Twitter)</li>
              </ul>
            </section>

            {/* Disclaimer */}
            <section className="bg-amber-50 rounded-xl p-6 border border-amber-200">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" />
                <div>
                  <h2 className="text-xl font-semibold text-amber-800 mb-2">5. Disclaimers</h2>
                  <div className="space-y-3 text-amber-700">
                    <p>
                      <strong>Non-Affiliation:</strong> {CONFIG.fullName} is an independent project and is
                      NOT affiliated with, endorsed by, or sponsored by {CONFIG.companyName} or X Corp (Twitter).
                      All product names, logos, and brands are property of their respective owners.
                    </p>
                    <p>
                      <strong>As-Is Basis:</strong> The Service is provided &quot;as is&quot; and &quot;as available&quot;
                      without warranties of any kind, either express or implied, including but not limited
                      to implied warranties of merchantability, fitness for a particular purpose, or
                      non-infringement.
                    </p>
                    <p>
                      <strong>Accuracy:</strong> While we strive to provide accurate token usage calculations,
                      we do not guarantee the accuracy of any data displayed. Official usage data should be
                      verified through your AI provider&apos;s official dashboard.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Limitation of Liability */}
            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">6. Limitation of Liability</h2>
              <p className="text-gray-600">
                To the maximum extent permitted by law, in no event shall {CONFIG.fullName}, its creator,
                or contributors be liable for any indirect, incidental, special, consequential, or
                punitive damages, including without limitation, loss of profits, data, use, goodwill,
                or other intangible losses, resulting from:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1 text-gray-600">
                <li>Your use or inability to use the Service</li>
                <li>Any unauthorized access to or use of your data</li>
                <li>Any interruption or cessation of the Service</li>
                <li>Any errors or omissions in the Service</li>
              </ul>
            </section>

            {/* What We Don't Do */}
            <section>
              <div className="flex items-start gap-3">
                <XCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-1" />
                <div>
                  <h2 className="text-xl font-semibold text-gray-800 mb-3">7. What We Don&apos;t Do</h2>
                  <ul className="list-disc list-inside space-y-2 text-gray-600">
                    <li>We do not sell, share, or monetize any user data</li>
                    <li>We do not track users across websites</li>
                    <li>We do not display advertisements</li>
                    <li>We do not store API keys, tokens, or credentials</li>
                    <li>We do not access your AI provider accounts beyond retrieving usage data</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Modifications */}
            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">8. Modifications to Service</h2>
              <p className="text-gray-600">
                We reserve the right to modify, suspend, or discontinue the Service at any time without
                notice. We shall not be liable to you or any third party for any modification, suspension,
                or discontinuation of the Service.
              </p>
            </section>

            {/* Changes to Terms */}
            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">9. Changes to Terms</h2>
              <p className="text-gray-600">
                We may update these Terms of Service from time to time. Any changes will be posted on
                this page with an updated revision date. Your continued use of the Service after any
                changes constitutes acceptance of the new terms.
              </p>
            </section>

            {/* Contact */}
            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">10. Contact</h2>
              <p className="text-gray-600">
                If you have any questions about these Terms of Service, please contact Joe LeBoube.
              </p>
            </section>
          </div>
        </div>
      </div>
    </main>
  )
}
