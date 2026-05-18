import Link from "next/link";
import { Wallet } from "lucide-react";

export const metadata = {
  title: "Terms & Privacy — LifeFi",
  description: "LifeFi Terms of Service and Privacy Policy",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Nav */}
      <nav className="border-b border-white/5 px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#4F8EF7] to-[#D4AF37] flex items-center justify-center">
              <Wallet className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg text-[#E8E8E8]">LifeFi</span>
          </Link>
          <Link href="/login" className="text-sm text-[#9ca3af] hover:text-[#E8E8E8] transition-colors">
            Sign In
          </Link>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-16 space-y-16">
        {/* Terms of Service */}
        <section id="terms">
          <h1 className="text-3xl font-bold text-[#E8E8E8] mb-2">Terms of Service</h1>
          <p className="text-sm text-[#9ca3af] mb-8">Last updated: May 2026</p>

          <div className="space-y-8 text-[#9ca3af] leading-relaxed">
            <div>
              <h2 className="text-lg font-semibold text-[#E8E8E8] mb-3">1. Acceptance of Terms</h2>
              <p>
                By accessing or using LifeFi (&quot;Service&quot;), you agree to be bound by these Terms of
                Service. If you do not agree to these terms, do not use the Service.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-[#E8E8E8] mb-3">2. Description of Service</h2>
              <p>
                LifeFi is a personal financial management application that helps you track credit
                cards, bills, utilities, and bank accounts in one place. The Service is provided for
                personal, non-commercial use.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-[#E8E8E8] mb-3">3. User Accounts</h2>
              <p>
                You must create an account to use most features of LifeFi. You are responsible for
                maintaining the confidentiality of your account credentials and for all activity
                that occurs under your account. You must provide accurate and complete information
                when creating your account.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-[#E8E8E8] mb-3">4. Subscriptions and Billing</h2>
              <p>
                Paid plans are billed on a monthly basis. You may cancel at any time. Cancellation
                takes effect at the end of your current billing period. We do not offer refunds for
                partial months of service. Prices may change with 30 days&apos; notice.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-[#E8E8E8] mb-3">5. Financial Data</h2>
              <p>
                LifeFi connects to your financial accounts through Plaid, a secure third-party
                service. We have read-only access to your account information and cannot initiate
                transactions or move money. Your financial credentials are never shared with or
                stored by LifeFi.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-[#E8E8E8] mb-3">6. Acceptable Use</h2>
              <p>
                You agree not to misuse the Service, attempt to access accounts you do not own, or
                use the Service for any unlawful purpose. We reserve the right to suspend or
                terminate accounts that violate these terms.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-[#E8E8E8] mb-3">7. Limitation of Liability</h2>
              <p>
                LifeFi provides financial tracking tools for informational purposes only. Nothing in
                the Service constitutes financial advice. LifeFi is not liable for any financial
                decisions made based on information provided by the Service. The Service is provided
                &quot;as is&quot; without warranties of any kind.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-[#E8E8E8] mb-3">8. Changes to Terms</h2>
              <p>
                We may update these Terms from time to time. We will notify you of significant
                changes via email. Continued use of the Service after changes constitutes acceptance
                of the new Terms.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-[#E8E8E8] mb-3">9. Contact</h2>
              <p>
                For questions about these Terms, contact us at{" "}
                <a href="mailto:support@lifefi.ai" className="text-[#4F8EF7] hover:underline">
                  support@lifefi.ai
                </a>
              </p>
            </div>
          </div>
        </section>

        {/* Privacy Policy */}
        <section id="privacy">
          <h1 className="text-3xl font-bold text-[#E8E8E8] mb-2">Privacy Policy</h1>
          <p className="text-sm text-[#9ca3af] mb-8">Last updated: May 2026</p>

          <div className="space-y-8 text-[#9ca3af] leading-relaxed">
            <div>
              <h2 className="text-lg font-semibold text-[#E8E8E8] mb-3">1. Information We Collect</h2>
              <p>
                We collect information you provide directly (name, email, financial data you add
                manually) and information obtained through Plaid (account balances, transaction
                history). We also collect usage data to improve the Service.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-[#E8E8E8] mb-3">2. How We Use Your Information</h2>
              <p>
                We use your information to provide and improve the Service, send important account
                notifications, process payments, and display your financial data in your dashboard.
                We do not sell your personal information to third parties.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-[#E8E8E8] mb-3">3. Data Security</h2>
              <p>
                We use industry-standard encryption (TLS/SSL) for all data in transit and at rest.
                Financial account connections are managed by Plaid using bank-level security. We
                never store your bank passwords or credentials.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-[#E8E8E8] mb-3">4. Data Sharing</h2>
              <p>
                We share data only with service providers necessary to operate LifeFi: Supabase
                (database), Plaid (bank connections), and Stripe (payment processing). These
                providers are bound by their own privacy policies and data processing agreements.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-[#E8E8E8] mb-3">5. Your Rights</h2>
              <p>
                You can access, update, or delete your account data at any time from your settings.
                To permanently delete your account and all associated data, contact us at{" "}
                <a href="mailto:support@lifefi.ai" className="text-[#4F8EF7] hover:underline">
                  support@lifefi.ai
                </a>
                .
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-[#E8E8E8] mb-3">6. Cookies</h2>
              <p>
                We use cookies to maintain your login session and improve the Service. Essential
                cookies are required for the Service to function. You can disable non-essential
                cookies in your browser settings.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-[#E8E8E8] mb-3">7. Contact</h2>
              <p>
                For privacy-related questions or data requests, contact us at{" "}
                <a href="mailto:privacy@lifefi.ai" className="text-[#4F8EF7] hover:underline">
                  privacy@lifefi.ai
                </a>
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 px-6 mt-16">
        <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-[#9ca3af]">
          <span>© 2026 LifeFi. All rights reserved.</span>
          <div className="flex items-center gap-6">
            <Link href="/terms#privacy" className="hover:text-[#E8E8E8] transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-[#E8E8E8] transition-colors">Terms</Link>
            <a href="mailto:support@lifefi.ai" className="hover:text-[#E8E8E8] transition-colors">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
