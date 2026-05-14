"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wallet, CreditCard, FileText, Zap, Bell, ChevronRight, Check, X } from "lucide-react";
import { PlaidLink } from "@/components/plaid/PlaidLink";
import type { ConnectedBank } from "@/lib/types";

const STEPS = [
  {
    icon: Wallet,
    color: "#D4AF37",
    title: "Welcome to LifeFi",
    subtitle: "Your luxury financial command center",
    body: "LifeFi gives you a single, beautiful view of every bill, card, and utility — so you never miss a payment or overspend again.",
    cta: "Let's get started",
  },
  {
    icon: CreditCard,
    color: "#4F8EF7",
    title: "Connect Your Bank",
    subtitle: "Live balances in one tap",
    body: "Securely link your bank via Plaid to see real balances and transactions. Read-only, 256-bit encrypted, trusted by millions.",
    cta: "Connect Later",
    plaid: true,
  },
  {
    icon: FileText,
    color: "#22c55e",
    title: "Manage Your Bills",
    subtitle: "Never miss a due date again",
    body: "Add recurring bills and subscriptions. Mark them paid with one tap, and watch your financial health score climb.",
    cta: "Nice",
  },
  {
    icon: Zap,
    color: "#f59e0b",
    title: "Monitor Utilities",
    subtitle: "Spot trends before they hurt",
    body: "Track electricity, water, gas, and internet. See month-over-month trends and get alerts when costs spike unexpectedly.",
    cta: "Perfect",
  },
  {
    icon: Bell,
    color: "#8b5cf6",
    title: "Smart Alerts",
    subtitle: "Your money, always on your mind",
    body: "LifeFi sends intelligent alerts about upcoming payments, unusual spending, and tips to improve your financial health score.",
    cta: "Take me to my dashboard",
  },
];

const STORAGE_KEY = "lifefi_onboarding_done";

export function OnboardingFlow() {
  const [step, setStep]             = useState(0);
  const [visible, setVisible]       = useState(false);
  const [exiting, setExiting]       = useState(false);
  const [bankConnected, setBankConnected] = useState(false);

  useEffect(() => {
    const done = typeof window !== "undefined" && localStorage.getItem(STORAGE_KEY);
    if (!done) setVisible(true);
  }, []);

  function handleBankConnected(_bank: ConnectedBank) { // eslint-disable-line @typescript-eslint/no-unused-vars
    setBankConnected(true);
    setTimeout(() => next(), 800);
  }

  function finish() {
    setExiting(true);
    setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, "1");
      setVisible(false);
      setExiting(false);
    }, 400);
  }

  function next() {
    if (step < STEPS.length - 1) setStep(step + 1);
    else finish();
  }

  if (!visible) return null;

  const s = STEPS[step];
  const Icon = s.icon;

  return (
    <AnimatePresence>
      {!exiting && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[500] flex items-center justify-center p-4"
          style={{ background: "rgba(10,10,15,0.92)", backdropFilter: "blur(12px)" }}
        >
          <motion.div
            initial={{ scale: 0.92, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 20 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            className="glass-gold w-full max-w-sm rounded-3xl p-8 relative"
          >
            {/* Close */}
            <button
              onClick={finish}
              className="absolute top-4 right-4 text-[#9ca3af] hover:text-[#E8E8E8] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Step dots */}
            <div className="flex gap-1.5 justify-center mb-8">
              {STEPS.map((_, i) => (
                <motion.div
                  key={i}
                  animate={{
                    width: i === step ? 24 : 8,
                    background: i === step ? s.color : i < step ? "#22c55e" : "rgba(255,255,255,0.2)",
                  }}
                  transition={{ duration: 0.3 }}
                  className="h-2 rounded-full"
                />
              ))}
            </div>

            {/* Icon */}
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, scale: 0.6, rotate: -10 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                exit={{ opacity: 0, scale: 0.6, rotate: 10 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6"
                style={{ background: `${s.color}20`, border: `1px solid ${s.color}30` }}
              >
                <Icon className="w-9 h-9" style={{ color: s.color }} />
              </motion.div>
            </AnimatePresence>

            {/* Text */}
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.28 }}
                className="text-center mb-8"
              >
                <div className="text-xs font-medium mb-1" style={{ color: s.color }}>{s.subtitle}</div>
                <h2 className="font-display text-2xl font-bold text-[#E8E8E8] mb-3">{s.title}</h2>
                <p className="text-sm text-[#9ca3af] leading-relaxed">{s.body}</p>
              </motion.div>
            </AnimatePresence>

            {/* Plaid button for step 1 */}
            {(s as typeof STEPS[0] & { plaid?: boolean }).plaid && !bankConnected && (
              <div className="mb-3">
                <PlaidLink compact onConnected={handleBankConnected} />
              </div>
            )}

            {bankConnected && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center justify-center gap-2 py-3 rounded-xl bg-[#22c55e]/15 border border-[#22c55e]/30 text-[#22c55e] text-sm font-semibold mb-3"
              >
                <Check className="w-4 h-4" />
                Bank connected!
              </motion.div>
            )}

            {/* CTA */}
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={next}
              className="btn-gold w-full justify-center gap-2"
            >
              {step === STEPS.length - 1 ? <Check className="w-4 h-4" /> : null}
              {s.cta}
              {step < STEPS.length - 1 ? <ChevronRight className="w-4 h-4" /> : null}
            </motion.button>

            {/* Skip link */}
            {step < STEPS.length - 1 && (
              <button onClick={finish} className="w-full text-center text-xs text-[#9ca3af] hover:text-[#E8E8E8] mt-4 transition-colors">
                Skip tour
              </button>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
