"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Check, X, Zap, Crown, Briefcase, ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const GOLD = "#D4AF37";
const BLUE = "#4F8EF7";

interface PlanFeature {
  text: string;
  included: boolean;
}

interface Plan {
  id: string;
  name: string;
  price: string;
  period: string;
  tagline: string;
  icon: typeof Zap;
  color: string;
  badge?: string;
  comingSoon?: boolean;
  savings?: string;
  features: PlanFeature[];
  cta: string;
}

const PLANS: Plan[] = [
  {
    id: "personal",
    name: "LifeFi Personal",
    price: "$4.99",
    period: "/ month",
    tagline: "Your personal finances, finally under control",
    icon: Crown,
    color: GOLD,
    badge: "First Month Free",
    features: [
      { text: "Unlimited bills & cards",      included: true  },
      { text: "Voice input (AI add bills)",   included: true  },
      { text: "Smart alerts & insights",      included: true  },
      { text: "Camera bill scanning",         included: true  },
      { text: "Financial health score",       included: true  },
      { text: "Bank account sync (Plaid)",    included: true  },
      { text: "Spending analytics + charts",  included: true  },
      { text: "Business expense tracking",    included: false },
    ],
    cta: "Get Started",
  },
  {
    id: "bizfi",
    name: "LifeFi Business",
    price: "$7.99",
    period: "/ month",
    tagline: "Track, manage, and grow your business finances",
    icon: Briefcase,
    color: BLUE,
    badge: "Coming Soon",
    comingSoon: true,
    features: [
      { text: "Business expense tracking",    included: true  },
      { text: "Invoice & payment tracking",   included: true  },
      { text: "Profit & loss summaries",      included: true  },
      { text: "Tax category tagging",         included: true  },
      { text: "Multi-bank business sync",     included: true  },
      { text: "CSV / PDF export",             included: true  },
      { text: "Personal finance tracking",    included: false },
      { text: "Bank account sync (Plaid)",    included: false },
    ],
    cta: "Coming Soon",
  },
  {
    id: "duo",
    name: "LifeFi Duo",
    price: "$9.99",
    period: "/ month",
    tagline: "Why not have both, in one place, one subscription",
    icon: Zap,
    color: "#8B5CF6",
    badge: "Coming Soon",
    comingSoon: true,
    savings: "Saves $2.99/mo",
    features: [
      { text: "Everything in LifeFi Personal", included: true  },
      { text: "Everything in LifeFi Business",  included: true  },
      { text: "Combined personal + biz view",  included: true  },
      { text: "Multi-bank business sync",      included: true  },
      { text: "CSV / PDF export",              included: true  },
      { text: "Tax category tagging",          included: true  },
      { text: "Profit & loss summaries",       included: true  },
    ],
    cta: "Coming Soon",
  },
];

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.15 } },
};

const cardVariant = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};

export default function PricingPage() {
  const [billing, setBilling] = useState<"monthly" | "annual">("monthly");
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const handleCheckout = async (planId: string) => {
    if (planId === 'bizfi' || planId === 'duo') return;
    setCheckoutError(null);
    setLoading(true);
    const PRICE_IDS: Record<string, string> = {
      personal: process.env.NEXT_PUBLIC_STRIPE_PERSONAL_PRICE_ID ?? '',
      bizfi:    process.env.NEXT_PUBLIC_STRIPE_BIZFI_PRICE_ID    ?? '',
      duo:      process.env.NEXT_PUBLIC_STRIPE_DUO_PRICE_ID      ?? '',
    };
    const priceId = PRICE_IDS[planId];
    if (!priceId || priceId.startsWith('price_YOUR_')) {
      setCheckoutError('Stripe price ID is not configured. Please email support@lifefi.ai');
      setLoading(false);
      return;
    }
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId }),
      });
      if (res.status === 401) {
        // Not logged in — redirect to signup with plan param
        window.location.href = `/signup?plan=${planId}`;
        return;
      }
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setCheckoutError(data.error ?? 'Could not start checkout. Please try again.');
      }
    } catch (e) {
      console.error(e);
      setCheckoutError('Network error. Please check your connection and try again.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Back nav */}
      <div className="max-w-5xl mx-auto px-4 pt-6">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-[#9ca3af] hover:text-[#E8E8E8] transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
      </div>

      {/* Header */}
      <div className="text-center pt-10 pb-12 px-4">
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex justify-center mb-5">
            <Image
              src="/images/logos/LifeFi_Web_512.webp"
              alt="LifeFi"
              width={120}
              height={120}
              style={{ mixBlendMode: "lighten" }}
            />
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-[#E8E8E8] mb-4">
            Choose your plan
          </h1>
          <p className="text-[#9ca3af] text-lg max-w-xl mx-auto">
            Simple pricing, no hidden fees. Cancel anytime.
          </p>
        </motion.div>

        {/* Billing toggle */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
          className="inline-flex items-center mt-8 bg-white/[0.06] rounded-xl p-1 border border-white/10"
        >
          {(["monthly", "annual"] as const).map((b) => (
            <button
              key={b}
              onClick={() => setBilling(b)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
                billing === b
                  ? "bg-[#D4AF37] text-[#0a0a0f]"
                  : "text-[#9ca3af] hover:text-[#E8E8E8]"
              }`}
            >
              {b === "monthly" ? "Monthly" : "Annual"}
              {b === "annual" && (
                <span className={`ml-1.5 text-xs ${billing === "annual" ? "text-[#0a0a0f]/70" : "text-[#22c55e]"}`}>
                  Save 20%
                </span>
              )}
            </button>
          ))}
        </motion.div>
      </div>

      {/* Checkout error */}
      {checkoutError && (
        <div className="max-w-5xl mx-auto px-4 mb-4">
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
            <X className="w-4 h-4 shrink-0" />
            {checkoutError}
          </div>
        </div>
      )}

      {/* Plans grid */}
      <div className="max-w-5xl mx-auto px-4 pb-20">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {PLANS.map((plan) => {
            const isPersonal = plan.id === "personal";
            const isSelected = selected === plan.id;

            const displayPrice = billing === "annual"
              ? `$${(parseFloat(plan.price.replace("$", "")) * 0.8).toFixed(2)}`
              : plan.price;

            return (
              <motion.div
                key={plan.id}
                variants={cardVariant}
                className={`relative flex flex-col rounded-3xl border transition-all duration-300 ${
                  isPersonal
                    ? "border-[#D4AF37]/40 bg-[#D4AF37]/[0.04]"
                    : "border-white/10 bg-white/[0.03]"
                } ${isSelected ? "ring-2 ring-[#D4AF37]" : ""}`}
              >
                {/* Badge */}
                {plan.badge && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <div
                      className="px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap"
                      style={
                        plan.badge === "Coming Soon"
                          ? { background: "#374151", color: "#9ca3af" }
                          : { background: "linear-gradient(135deg, #D4AF37, #b8962e)", color: "#0a0a0f" }
                      }
                    >
                      {plan.badge}
                    </div>
                  </div>
                )}

                <div className="p-7 flex flex-col flex-1">
                  {/* Icon + name */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
                      style={{ background: `${plan.color}20` }}>
                      <plan.icon className="w-5 h-5" style={{ color: plan.color }} />
                    </div>
                    <div className="text-base font-bold text-[#E8E8E8]">{plan.name}</div>
                  </div>

                  {/* Price */}
                  <div className="mb-1">
                    <span className="font-display text-4xl font-bold text-[#E8E8E8]">{displayPrice}</span>
                    <span className="text-[#9ca3af] text-sm ml-1">{plan.period}</span>
                  </div>
                  {plan.savings && (
                    <div className="text-xs font-medium text-[#22c55e] mb-1">{plan.savings}</div>
                  )}
                  <div className="text-xs text-[#9ca3af] mb-6 leading-relaxed">{plan.tagline}</div>

                  {/* CTA */}
                  <button
                    onClick={() => { setSelected(plan.id); handleCheckout(plan.id); }}
                    className={`w-full py-3 rounded-xl font-semibold text-sm mb-6 transition-all ${
                      plan.comingSoon
                        ? "border border-white/10 text-[#6b7280] cursor-not-allowed"
                        : ""
                    }`}
                    style={
                      !plan.comingSoon
                        ? { background: "#C9A84C", color: "#0A1628" }
                        : undefined
                    }
                    disabled={!!plan.comingSoon || loading}
                  >
                    {plan.cta}
                  </button>

                  {/* Features */}
                  <div className="space-y-2.5 flex-1">
                    {plan.features.map((f) => (
                      <div key={f.text} className="flex items-center gap-2.5">
                        <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${
                          f.included ? "bg-[#22c55e]/20" : "bg-white/5"
                        }`}>
                          {f.included
                            ? <Check className="w-2.5 h-2.5 text-[#22c55e]" />
                            : <X className="w-2.5 h-2.5 text-[#6b7280]" />
                          }
                        </div>
                        <span className={`text-xs ${f.included ? "text-[#E8E8E8]" : "text-[#6b7280] line-through"}`}>
                          {f.text}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* FAQ / trust */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-14 text-center text-sm text-[#9ca3af] space-y-2"
        >
          <div>All plans include 256-bit encryption and bank-level security.</div>
          <div>Cancel anytime — no contracts, no surprise fees.</div>
          <div className="pt-4">
            <Link href="/dashboard" className="text-[#D4AF37] hover:text-[#b8962e] transition-colors underline underline-offset-2">
              Back to Dashboard →
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 px-6 mt-4">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#4a5568]">
          <span>© 2026 LifeFi. All rights reserved.</span>
          <div className="flex items-center gap-6">
            <Link href="/terms" className="hover:text-[#9ca3af] transition-colors">Terms</Link>
            <Link href="/terms#privacy" className="hover:text-[#9ca3af] transition-colors">Privacy</Link>
            <a href="mailto:support@lifefi.ai" className="hover:text-[#9ca3af] transition-colors">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
