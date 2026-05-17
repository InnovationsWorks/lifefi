"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Check, X, Zap, Crown, Briefcase, Wallet, ArrowLeft, Star,
} from "lucide-react";
import Link from "next/link";

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
  features: PlanFeature[];
  cta: string;
}

const PLANS: Plan[] = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    period: "forever",
    tagline: "Get started with the basics",
    icon: Wallet,
    color: "#9ca3af",
    features: [
      { text: "Up to 5 bills tracked",       included: true  },
      { text: "Up to 2 credit cards",         included: true  },
      { text: "Basic spending overview",       included: true  },
      { text: "Due-date reminders",           included: true  },
      { text: "Unlimited bills & cards",      included: false },
      { text: "Voice input (AI add bills)",   included: false },
      { text: "Smart alerts & insights",      included: false },
      { text: "Camera bill scanning",         included: false },
      { text: "Financial health score",       included: false },
      { text: "Business expense tracking",    included: false },
    ],
    cta: "Current Plan",
  },
  {
    id: "premium",
    name: "Premium",
    price: "$4.99",
    period: "/ month",
    tagline: "Everything you need to stay on top of finances",
    icon: Crown,
    color: GOLD,
    badge: "Most Popular",
    features: [
      { text: "Unlimited bills & cards",      included: true  },
      { text: "Voice input (AI add bills)",   included: true  },
      { text: "Smart alerts & insights",      included: true  },
      { text: "Camera bill scanning",         included: true  },
      { text: "Financial health score",       included: true  },
      { text: "Bank account sync (Plaid)",    included: true  },
      { text: "Spending analytics + charts",  included: true  },
      { text: "Priority support",             included: true  },
      { text: "Business expense tracking",    included: false },
      { text: "Team/employee accounts",       included: false },
    ],
    cta: "Upgrade to Premium",
  },
  {
    id: "bizfi",
    name: "BizFi Bundle",
    price: "$12.99",
    period: "/ month",
    tagline: "Full financial control for entrepreneurs & small biz",
    icon: Briefcase,
    color: BLUE,
    features: [
      { text: "Everything in Premium",        included: true  },
      { text: "Business expense tracking",    included: true  },
      { text: "Team/employee accounts",       included: true  },
      { text: "Invoice & payment tracking",   included: true  },
      { text: "Profit & loss summaries",      included: true  },
      { text: "Tax category tagging",         included: true  },
      { text: "Multi-bank business sync",     included: true  },
      { text: "CSV / PDF export",             included: true  },
      { text: "Dedicated account manager",    included: true  },
      { text: "White-glove onboarding",       included: true  },
    ],
    cta: "Get BizFi Bundle",
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

  const handleCheckout = async (planId: string) => {
    if (planId === 'free') return;
    setLoading(true);
    const PRICE_IDS: Record<string, string> = {
      premium: process.env.NEXT_PUBLIC_STRIPE_PREMIUM_PRICE_ID ?? '',
      bizfi: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID ?? '',
    };
    const priceId = PRICE_IDS[planId];
    if (!priceId) { setLoading(false); return; }
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch (e) {
      console.error(e);
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
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/10 mb-5">
            <Star className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span className="text-xs font-medium text-[#D4AF37]">Simple, transparent pricing</span>
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-[#E8E8E8] mb-4">
            Choose your plan
          </h1>
          <p className="text-[#9ca3af] text-lg max-w-xl mx-auto">
            Start free, upgrade when you&apos;re ready. No hidden fees, cancel anytime.
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

      {/* Plans grid */}
      <div className="max-w-5xl mx-auto px-4 pb-20">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid md:grid-cols-3 gap-6"
        >
          {PLANS.map((plan) => {
            const isPremium = plan.id === "premium";
            const isSelected = selected === plan.id;

            const displayPrice = billing === "annual" && plan.price !== "$0"
              ? `$${(parseFloat(plan.price.replace("$", "")) * 0.8).toFixed(2)}`
              : plan.price;

            return (
              <motion.div
                key={plan.id}
                variants={cardVariant}
                className={`relative flex flex-col rounded-3xl border transition-all duration-300 ${
                  isPremium
                    ? "border-[#D4AF37]/40 bg-[#D4AF37]/[0.04]"
                    : "border-white/10 bg-white/[0.03]"
                } ${isSelected ? "ring-2 ring-[#D4AF37]" : ""}`}
              >
                {/* Popular badge */}
                {plan.badge && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <div className="px-3 py-1 rounded-full text-xs font-bold"
                      style={{ background: "linear-gradient(135deg, #D4AF37, #b8962e)", color: "#0a0a0f" }}>
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
                  <div className="mb-2">
                    <span className="font-display text-4xl font-bold text-[#E8E8E8]">{displayPrice}</span>
                    {plan.period !== "forever" && (
                      <span className="text-[#9ca3af] text-sm ml-1">{plan.period}</span>
                    )}
                    {plan.price === "$0" && (
                      <span className="text-[#9ca3af] text-sm ml-1">forever</span>
                    )}
                  </div>
                  <div className="text-xs text-[#9ca3af] mb-6 leading-relaxed">{plan.tagline}</div>

                  {/* CTA */}
                  <button
                    onClick={() => { setSelected(plan.id); handleCheckout(plan.id); }}
                    className={`w-full py-3 rounded-xl font-semibold text-sm mb-6 transition-all ${
                      plan.id === "free"
                        ? "border border-white/15 text-[#9ca3af] cursor-default"
                        : isPremium
                        ? "text-[#0a0a0f]"
                        : "border border-[#4F8EF7]/40 text-[#4F8EF7] hover:bg-[#4F8EF7]/10"
                    }`}
                    style={
                      isPremium
                        ? { background: "linear-gradient(135deg, #D4AF37, #b8962e)" }
                        : undefined
                    }
                    disabled={plan.id === "free" || loading}
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
              Continue with Free plan →
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
