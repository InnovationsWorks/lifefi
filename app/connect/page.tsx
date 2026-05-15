"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  Shield, Lock, Eye, ChevronLeft, HelpCircle, ChevronDown,
  Building2, CheckCircle2,
} from "lucide-react";
import { useState } from "react";
import { PlaidLink } from "@/components/plaid/PlaidLink";
import { useApp } from "@/contexts/AppContext";

// ── Supported bank logos (text-based) ─────────────────────────────────────

const SUPPORTED_BANKS = [
  { name: "Chase",            color: "#1a56db", abbr: "CH" },
  { name: "Bank of America",  color: "#e31837", abbr: "BA" },
  { name: "Wells Fargo",      color: "#d71e28", abbr: "WF" },
  { name: "Citibank",         color: "#003b6f", abbr: "CI" },
  { name: "Capital One",      color: "#d03027", abbr: "CO" },
  { name: "US Bank",          color: "#1e4db7", abbr: "US" },
  { name: "PNC Bank",         color: "#f47920", abbr: "PN" },
  { name: "TD Bank",          color: "#34a853", abbr: "TD" },
  { name: "Ally",             color: "#8b5cf6", abbr: "AL" },
  { name: "American Express", color: "#D4AF37", abbr: "AX" },
  { name: "Discover",         color: "#f97316", abbr: "DC" },
  { name: "+ 12,000 more",    color: "#9ca3af", abbr: "…"  },
];

// ── Payment apps ───────────────────────────────────────────────────────────

const PAYMENT_APPS = [
  { name: "PayPal",     bg: "#003087", border: undefined },
  { name: "Google Pay", bg: "#ffffff", border: "#dadce0" },
  { name: "Apple Pay",  bg: "#000000", border: undefined },
  { name: "Zelle",      bg: "#6D1ED4", border: undefined },
];

function GoogleGBadge() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

function AppleBadge() {
  return (
    <svg width="13" height="16" viewBox="0 0 814 1000" fill="white" aria-hidden="true">
      <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-57.8-155.5-127.4C46 411.3 55.7 238.6 106.2 168.1c32.8-45.3 84.1-73.9 139.3-73.9 54.9 0 89.5 36.4 163.8 36.4 71.9 0 116.1-36.4 175.3-36.4 54.3 0 103.2 24.2 140.5 67.1zm-197.3-97.9c-5.8-30.8-18.1-72.1-46-104.4-11.2-12.7-38.6-37.4-63.2-52.1-21.6-13-51.6-21-81.6-21-3.8 0-7.6.6-11.3.9 1 24.3 10.3 64.9 39.1 99.6 16 19.3 43 38.6 65.8 49.4 20.8 9.7 55.2 19 97.2 27.6z" />
    </svg>
  );
}

function PayPalBadge() {
  return (
    <span className="flex items-baseline leading-none" aria-hidden="true">
      <span className="font-black text-base" style={{ color: "#009cde" }}>P</span>
      <span className="font-black text-base -ml-[4px]" style={{ color: "#ffffff" }}>P</span>
    </span>
  );
}

// ── FAQ accordion ──────────────────────────────────────────────────────────

const FAQS = [
  {
    q: "Is this safe?",
    a: "We have no access to any of your financial information as everything goes through Plaid.",
  },
  {
    q: "What data does LifeFi access?",
    a: "We never have access and cannot initiate transfers, payments, or any transactions of any kind. Your money is completely secure.",
  },
  {
    q: "Which banks are supported?",
    a: "Plaid supports over 12,000 banks and credit unions in the US, including all major institutions like Chase, Bank of America, Wells Fargo, Citibank, and virtually every community bank and credit union.",
  },
  {
    q: "Can I disconnect my bank?",
    a: "Yes, you can disconnect your bank at any time from your settings. You can also revoke access directly from your bank's website or app.",
  },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-white/08 last:border-0">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between py-4 text-left gap-4 hover:text-[#E8E8E8] transition-colors"
      >
        <span className="text-sm font-medium text-[#E8E8E8]">{q}</span>
        <ChevronDown
          className={`w-4 h-4 text-[#9ca3af] shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="pb-4 text-sm text-[#9ca3af] leading-relaxed"
        >
          {a}
        </motion.div>
      )}
    </div>
  );
}

// ── Security badge ─────────────────────────────────────────────────────────

function SecurityBadge({ icon: Icon, label }: { icon: typeof Shield; label: string }) {
  return (
    <div className="flex flex-col items-center gap-2 px-4 py-3 glass rounded-2xl">
      <div className="w-8 h-8 rounded-full bg-[#22c55e]/20 flex items-center justify-center">
        <Icon className="w-4 h-4 text-[#22c55e]" />
      </div>
      <span className="text-xs text-[#9ca3af] text-center leading-tight">{label}</span>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────

export default function ConnectPage() {
  const { connectedBanks } = useApp();

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-[#0a0a0f]/90 backdrop-blur-md border-b border-white/5 px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center gap-4">
          <Link href="/dashboard" className="text-[#9ca3af] hover:text-[#E8E8E8] transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <span className="font-display text-lg font-bold text-[#E8E8E8]">Connect Your Bank</span>
        </div>
      </header>

      <main className="flex-1 max-w-2xl mx-auto w-full px-6 py-10 space-y-10">

        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <div className="w-20 h-20 rounded-3xl bg-[#D4AF37]/20 border border-[#D4AF37]/30 flex items-center justify-center mx-auto mb-6">
            <Building2 className="w-9 h-9 text-[#D4AF37]" />
          </div>
          <h1 className="font-display text-3xl font-bold text-[#E8E8E8] mb-3">
            Connect Your Bank in Seconds
          </h1>
          <p className="text-[#9ca3af] text-base leading-relaxed max-w-md mx-auto">
            Securely connect 12,000+ banks and credit unions. See real balances, transactions, and insights — all in one place.
          </p>
        </motion.div>

        {/* Security badges */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.5 }}
          className="grid grid-cols-3 gap-3"
        >
          <SecurityBadge icon={Lock}          label="256-bit encryption"   />
          <SecurityBadge icon={Shield}        label="Bank-level security"  />
          <SecurityBadge icon={Eye}           label="Read-only access"     />
        </motion.div>

        {/* Already connected summary */}
        {connectedBanks.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass-gold p-4 rounded-2xl flex items-center gap-3"
          >
            <CheckCircle2 className="w-5 h-5 text-[#22c55e] shrink-0" />
            <div>
              <div className="text-sm font-semibold text-[#E8E8E8]">
                {connectedBanks.length} bank{connectedBanks.length > 1 ? "s" : ""} connected
              </div>
              <div className="text-xs text-[#9ca3af]">
                {connectedBanks.map((b) => b.institutionName).join(", ")}
              </div>
            </div>
          </motion.div>
        )}

        {/* Plaid Link */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.5 }}
          className="glass p-6 rounded-3xl space-y-5"
        >
          <div className="text-center">
            <div className="text-sm text-[#9ca3af] mb-1">Powered by</div>
            <div className="font-display text-xl font-bold text-[#E8E8E8]">Plaid</div>
            <div className="text-xs text-[#9ca3af] mt-1">Trusted by 7,000+ fintech apps</div>
          </div>
          <PlaidLink />
        </motion.div>

        {/* Supported banks */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.5 }}
        >
          <h2 className="font-semibold text-[#E8E8E8] mb-4">Supported Banks</h2>
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
            {SUPPORTED_BANKS.map((bank) => (
              <div key={bank.name}
                className="flex flex-col items-center gap-2 p-3 glass rounded-2xl hover:bg-white/[0.06] transition-colors cursor-default"
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold text-white shrink-0"
                  style={{ background: bank.color }}
                >
                  {bank.abbr}
                </div>
                <span className="text-[10px] text-[#9ca3af] text-center leading-tight line-clamp-2">
                  {bank.name}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Payment Apps */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <h2 className="font-semibold text-[#E8E8E8] mb-4">Linked Payment Apps</h2>
          <div className="grid grid-cols-4 gap-3">
            {PAYMENT_APPS.map((app) => (
              <div key={app.name}
                className="flex flex-col items-center gap-2 p-3 glass rounded-2xl hover:bg-white/[0.06] transition-colors cursor-default"
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                  style={{
                    background: app.bg,
                    border: app.border ? `1px solid ${app.border}` : undefined,
                  }}
                >
                  {app.name === "PayPal"     && <PayPalBadge />}
                  {app.name === "Google Pay" && <GoogleGBadge />}
                  {app.name === "Apple Pay"  && <AppleBadge />}
                  {app.name === "Zelle"      && (
                    <span className="text-white font-black text-base italic leading-none">Z</span>
                  )}
                </div>
                <span className="text-[10px] text-[#9ca3af] text-center leading-tight line-clamp-2">
                  {app.name}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* FAQ */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.5 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <HelpCircle className="w-4 h-4 text-[#4F8EF7]" />
            <h2 className="font-semibold text-[#E8E8E8]">Frequently Asked Questions</h2>
          </div>
          <div className="glass rounded-2xl px-5">
            {FAQS.map((faq) => (
              <FAQItem key={faq.q} q={faq.q} a={faq.a} />
            ))}
          </div>
        </motion.div>

        {/* Plaid attribution */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-xs text-[#9ca3af] pb-6"
        >
          Bank connection powered by{" "}
          <span className="text-[#E8E8E8] font-medium">Plaid Technologies, Inc.</span>
          <br />
          Your credentials are never shared with LifeFi.
        </motion.div>

      </main>
    </div>
  );
}
