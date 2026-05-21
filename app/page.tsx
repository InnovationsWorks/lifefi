"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  CreditCard, FileText, Bell, BarChart3, Shield, Zap, ChevronRight,
  Check, Star, TrendingUp, ArrowRight,
} from "lucide-react";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import { MotionButton } from "@/components/ui/MotionButton";

// ── Floating background card data ──────────────────────────────────────────
const floatingCards = [
  { x: "8%",  y: "18%", rotate: -12, label: "Chase Sapphire", amount: "$3,240", color: "#1a56db", delay: 0 },
  { x: "78%", y: "12%", rotate: 8,   label: "Amex Gold",      amount: "$1,870", color: "#D4AF37", delay: 0.3 },
  { x: "5%",  y: "65%", rotate: -6,  label: "Citi Premier",   amount: "$5,410", color: "#6366f1", delay: 0.6 },
  { x: "80%", y: "60%", rotate: 10,  label: "Discover it",    amount: "$890",   color: "#f97316", delay: 0.9 },
];

// ── Star field ─────────────────────────────────────────────────────────────
const stars = Array.from({ length: 60 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  r: Math.random() * 1.5 + 0.4,
  dur: Math.random() * 3 + 2,
  delay: Math.random() * 3,
}));

// ── Feature / pricing data ─────────────────────────────────────────────────
const features = [
  { icon: CreditCard, title: "Track Cards",    description: "Visualize all your credit cards in one gorgeous view. Monitor balances, limits, utilization, and due dates at a glance.",             color: "#4F8EF7" },
  { icon: FileText,   title: "Pay Bills",      description: "Never miss a payment. LifeFi tracks every recurring bill and sends smart reminders before due dates hit.",                           color: "#D4AF37" },
  { icon: Bell,       title: "Get Alerts",     description: "Real-time notifications for unusual spending, upcoming due dates, and financial health score changes.",                               color: "#4F8EF7" },
  { icon: BarChart3,  title: "See Everything", description: "Beautiful charts showing spending by category, monthly trends, and utility costs — your full financial picture.",                   color: "#D4AF37" },
];

const steps = [
  { number: "01", title: "Connect Your Accounts",  description: "Securely link your credit cards, bank accounts, and recurring bills in minutes." },
  { number: "02", title: "Get Your Financial Meter", description: "Receive your personalized LifeFi Financial Meter and actionable insights to improve it." },
  { number: "03", title: "Stay in Control",         description: "Set payment reminders, track spending, and make smarter financial decisions effortlessly." },
];

const plans = [
  {
    name: "LifeFi Personal", price: "$4.99",  period: "/month", description: "Your personal finances, finally under control",
    badge: "First Month Free", comingSoon: false,
    features: ["Unlimited bills & cards", "Voice input (AI add bills)", "Smart alerts & insights", "Camera bill scanning", "Financial health score", "Bank account sync (Plaid)", "Spending analytics + charts"],
    cta: "Get Started", href: "/signup", highlight: true,
  },
  {
    name: "LifeFi Business", price: "$7.99",  period: "/month", description: "Track, manage, and grow your business finances",
    badge: "Coming Soon", comingSoon: true,
    features: ["Business expense tracking", "Invoice & payment tracking", "Profit & loss summaries", "Tax category tagging", "Multi-bank business sync", "CSV / PDF export"],
    cta: "Coming Soon", href: "/pricing", highlight: false,
  },
  {
    name: "LifeFi Duo", price: "$9.99", period: "/month", description: "Why not have both, in one place, one subscription",
    badge: "Coming Soon", comingSoon: true,
    features: ["Everything in LifeFi Personal", "Everything in LifeFi Business", "Combined personal + biz view", "Multi-bank business sync", "CSV / PDF export", "Tax category tagging", "Profit & loss summaries"],
    cta: "Coming Soon", href: "/pricing", highlight: false,
  },
];

const stats = [
  { value: 50,   suffix: "K+", label: "Active Users"    },
  { value: 2.3,  suffix: "B",  label: "Tracked Monthly", prefix: "$" },
  { value: 99.9, suffix: "%",  label: "Uptime"           },
  { value: 4.9,  suffix: "★",  label: "App Rating"       },
];

// ── Component ──────────────────────────────────────────────────────────────
export default function LandingPage() {
  const router = useRouter();
  return (
    <div className="min-h-screen bg-[#0a0a0f] overflow-x-hidden">

      {/* ── Nav ──────────────────────────────────────────────────────────── */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 px-6 py-4 backdrop-blur-md"
        style={{ background: "rgba(10, 10, 15, 0.80)", borderBottom: "1px solid rgba(255,255,255,0.04)" }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Image src="/images/logos/LifeFi_Icon_Only_TRUE.svg" alt="LifeFi" width={36} height={36} />
          <div className="hidden md:flex items-center gap-8 text-sm text-[#9ca3af]">
            <a href="#features"    className="hover:text-[#E8E8E8] transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-[#E8E8E8] transition-colors">How It Works</a>
            <a href="#pricing"     className="hover:text-[#E8E8E8] transition-colors">Pricing</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login"  className="text-sm text-[#9ca3af] hover:text-[#E8E8E8] transition-colors px-4 py-2">Sign In</Link>
            <MotionButton variant="primary" className="text-sm py-2 px-5" onClick={() => router.push("/signup")}>
              Get Started
            </MotionButton>
          </div>
        </div>
      </nav>

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative z-0 pt-16 md:pt-20 pb-24 px-6 overflow-hidden">

        {/* Star field */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
          {stars.map((s) => (
            <motion.circle
              key={s.id}
              cx={`${s.x}%`}
              cy={`${s.y}%`}
              r={s.r}
              fill="white"
              animate={{ opacity: [0.15, 0.7, 0.15] }}
              transition={{ duration: s.dur, repeat: Infinity, delay: s.delay, ease: "easeInOut" }}
            />
          ))}
        </svg>

        {/* Ambient glows */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#4F8EF7] opacity-[0.07] rounded-full blur-3xl pointer-events-none" style={{ zIndex: 0 }} />
        <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-[#D4AF37] opacity-[0.06] rounded-full blur-3xl pointer-events-none" style={{ zIndex: 0 }} />

        {/* Floating glassmorphism cards */}
        {floatingCards.map((card) => (
          <motion.div
            key={card.label}
            className="absolute hidden lg:block glass px-4 py-3 pointer-events-none select-none"
            style={{
              left: card.x,
              top: card.y,
              rotate: card.rotate,
              borderColor: `${card.color}30`,
              zIndex: 1,
              minWidth: 140,
            }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{
              opacity: [0, 0.7, 0.7, 0.7],
              scale: 1,
              y: [0, -12, 0, 12, 0],
            }}
            transition={{
              opacity: { delay: card.delay + 0.8, duration: 0.6 },
              scale:   { delay: card.delay + 0.8, duration: 0.6 },
              y: { delay: card.delay + 1.4, duration: 6 + card.delay, repeat: Infinity, ease: "easeInOut" },
            }}
          >
            <div className="text-xs text-[#9ca3af] mb-0.5">{card.label}</div>
            <div className="font-display text-base font-bold" style={{ color: card.color }}>{card.amount}</div>
            <div className="mt-1.5 h-1 rounded-full bg-white/10">
              <div className="h-full rounded-full w-2/5" style={{ background: card.color }} />
            </div>
          </motion.div>
        ))}

        {/* Hero content */}
        <div className="max-w-5xl mx-auto text-center relative" style={{ zIndex: 2 }}>
          {/* Logo centered above hero text */}
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex justify-center mb-6"
          >
            <Image
              src="/images/logos/LifeFi_Logo_text_SVG.svg"
              alt="LifeFi"
              width={140}
              height={140}
              priority
              style={{ mixBlendMode: "lighten", width: "auto", height: "140px" }}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm text-[#D4AF37] mb-8"
            style={{ background: "rgba(212,175,55,0.08)", border: "1px solid rgba(212,175,55,0.25)", borderRadius: 100 }}
          >
            <Star className="w-3.5 h-3.5 fill-[#D4AF37]" />
            Trusted by 50,000+ users worldwide <span className="opacity-50 font-normal">(illustrative figures)</span>
          </motion.div>

          {/* Shimmer headline */}
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="font-display text-5xl md:text-7xl font-bold leading-tight mb-6"
          >
            Your Financial Life,
            <br />
            <span
              className="relative inline-block"
              style={{
                background: "linear-gradient(90deg, #4F8EF7 0%, #a0c4ff 30%, #D4AF37 55%, #f5d76e 75%, #4F8EF7 100%)",
                backgroundSize: "200% auto",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                animation: "shimmer 4s linear infinite",
              }}
            >
              Finally in Order
            </span>
          </motion.h1>

          {/* Shimmer keyframe */}
          <style>{`
            @keyframes shimmer {
              0%   { background-position: 0% center }
              100% { background-position: 200% center }
            }
          `}</style>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-[#9ca3af] text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            <span style={{ color: "#C9A84C" }}>LifeFi</span> brings all your credit cards, bills, and utilities into one manageable
            dashboard. Track spending, never miss payments, and take control of your
            financial future.{" "}
            <br />
            <span style={{ color: "#8899aa" }}>No access to your bank account.</span>
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <MotionButton variant="gold" className="text-base px-8 py-3.5" onClick={() => router.push("/signup")}>
              Start for Free <ArrowRight className="w-4 h-4" />
            </MotionButton>
            <MotionButton variant="ghost" className="text-base px-8 py-3.5 text-[#E8E8E8]" onClick={() => router.push("/login")}>
              Sign In
            </MotionButton>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20 max-w-3xl mx-auto"
          >
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="font-display text-3xl font-bold text-gradient-gold">
                  {stat.prefix ?? ""}{stat.value}{stat.suffix}
                </div>
                <div className="text-[#9ca3af] text-sm mt-1">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Dashboard preview mockup */}
        <motion.div
          initial={{ opacity: 0, y: 60, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.7, duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="max-w-5xl mx-auto mt-16 relative"
          style={{ zIndex: 2 }}
        >
          <div className="glass p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-[#ef4444]" />
                <div className="w-3 h-3 rounded-full bg-[#f59e0b]" />
                <div className="w-3 h-3 rounded-full bg-[#22c55e]" />
              </div>
              <div className="flex-1 h-6 rounded-md bg-white/5 flex items-center px-3">
                <span className="text-xs text-[#9ca3af]">app.lifefi.io/dashboard</span>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="glass-gold p-4">
                <div className="text-xs text-[#9ca3af] mb-1">Financial Meter</div>
                <div className="font-display text-3xl font-bold text-gradient-gold">87</div>
                <div className="text-xs text-[#22c55e] mt-1">↑ +3 this month</div>
              </div>
              <div className="glass p-4">
                <div className="text-xs text-[#9ca3af] mb-1">Total Balance</div>
                <div className="font-display text-2xl font-bold text-[#E8E8E8]">$12,430</div>
                <div className="text-xs text-[#9ca3af] mt-1">Across 4 cards</div>
              </div>
              <div className="glass p-4">
                <div className="text-xs text-[#9ca3af] mb-1">Bills Due</div>
                <div className="font-display text-2xl font-bold text-[#4F8EF7]">3</div>
                <div className="text-xs text-[#f59e0b] mt-1">Next: 3 days</div>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-4 gap-3">
              {["Chase Sapphire", "Amex Gold", "Citi Premier", "Discover"].map((card, i) => (
                <div key={card} className="glass p-3">
                  <div className="text-xs text-[#9ca3af] truncate">{card}</div>
                  <div className="text-sm font-semibold text-[#E8E8E8] mt-1">${(1200 + i * 834).toLocaleString()}</div>
                  <div className="mt-2 h-1.5 rounded-full bg-white/10">
                    <div className="h-full rounded-full bg-gradient-to-r from-[#4F8EF7] to-[#D4AF37]" style={{ width: `${25 + i * 15}%` }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3 text-center">
              <span className="text-[10px] text-[#4a5568] italic">Sample data for illustration</span>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── Features ──────────────────────────────────────────────────────── */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <AnimatedSection className="text-center mb-16">
            <h2 className="font-display text-4xl md:text-5xl font-bold text-[#E8E8E8] mb-4">
              Everything You Need{" "}
              <span className="text-gradient-blue">at Your Fingertips</span>
            </h2>
            <p className="text-[#9ca3af] text-lg max-w-2xl mx-auto">
              LifeFi gives you a complete picture of your financial life in a single, beautiful interface.
            </p>
          </AnimatedSection>

          <div className="grid md:grid-cols-2 gap-6">
            {features.map((feature) => (
              <AnimatedSection key={feature.title}>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                  className="glass p-8 h-full hover:border-[#4F8EF7]/20 transition-colors duration-300"
                >
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                    style={{ background: `${feature.color}15`, border: `1px solid ${feature.color}25` }}>
                    <feature.icon className="w-6 h-6" style={{ color: feature.color }} />
                  </div>
                  <h3 className="font-display text-xl font-bold text-[#E8E8E8] mb-3">{feature.title}</h3>
                  <p className="text-[#9ca3af] leading-relaxed">{feature.description}</p>
                  <div className="mt-5 flex items-center gap-2 text-sm font-medium text-[#4F8EF7] group">
                    Learn more <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </motion.div>
              </AnimatedSection>
            ))}
          </div>

          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Shield,    label: "Bank-grade Security" },
              { icon: Zap,       label: "Real-time Sync"      },
              { icon: TrendingUp, label: "Smart Insights"     },
              { icon: Bell,      label: "Instant Alerts"      },
            ].map((item) => (
              <AnimatedSection key={item.label}>
                <motion.div whileHover={{ scale: 1.03 }} className="glass p-4 flex items-center gap-3">
                  <item.icon className="w-5 h-5 text-[#4F8EF7] shrink-0" />
                  <span className="text-sm text-[#E8E8E8] font-medium">{item.label}</span>
                </motion.div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ──────────────────────────────────────────────────── */}
      <section id="how-it-works" className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <AnimatedSection className="text-center mb-16">
            <h2 className="font-display text-4xl md:text-5xl font-bold text-[#E8E8E8] mb-4">
              Up and Running in <span className="text-gradient-gold">3 Minutes</span>
            </h2>
            <p className="text-[#9ca3af] text-lg">No complicated setup. No financial jargon. Just clarity.</p>
          </AnimatedSection>

          <div className="grid md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-12 left-[calc(16.67%+2rem)] right-[calc(16.67%+2rem)] h-px bg-gradient-to-r from-transparent via-[#4F8EF7]/30 to-transparent" />
            {steps.map((step) => (
              <AnimatedSection key={step.number} className="text-center">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-6 glass-gold"
                >
                  <span className="font-display text-3xl font-bold text-gradient-gold">{step.number}</span>
                </motion.div>
                <h3 className="font-display text-xl font-bold text-[#E8E8E8] mb-3">{step.title}</h3>
                <p className="text-[#9ca3af] leading-relaxed">{step.description}</p>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ──────────────────────────────────────────────────────── */}
      <section id="pricing" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <AnimatedSection className="text-center mb-16">
            <h2 className="font-display text-4xl md:text-5xl font-bold text-[#E8E8E8] mb-4">
              Simple, Transparent <span className="text-gradient-blue">Pricing</span>
            </h2>
            <p className="text-[#9ca3af] text-lg">Simple pricing, no hidden fees. Cancel anytime.</p>
          </AnimatedSection>

          <div className="grid md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <AnimatedSection key={plan.name}>
                <motion.div
                  whileHover={{ scale: 1.02, y: -4 }}
                  transition={{ duration: 0.2 }}
                  className={`relative flex flex-col h-full ${plan.highlight ? "glass-gold scale-105 shadow-2xl shadow-[#D4AF37]/10" : "glass"} p-8`}
                >
                  {plan.badge && (
                    <div
                      className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-bold px-4 py-1 rounded-full whitespace-nowrap"
                      style={
                        plan.badge === "Coming Soon"
                          ? { background: "#374151", color: "#9ca3af" }
                          : { background: "linear-gradient(135deg, #D4AF37, #b8962e)", color: "#0a0a0f" }
                      }
                    >
                      {plan.badge}
                    </div>
                  )}
                  <div>
                    <h3 className="font-display text-2xl font-bold text-[#E8E8E8] mb-1">{plan.name}</h3>
                    <p className="text-[#9ca3af] text-sm mb-6">{plan.description}</p>
                    <div className="flex items-baseline gap-1 mb-8">
                      <span className="font-display text-5xl font-bold text-[#E8E8E8]">{plan.price}</span>
                      <span className="text-[#9ca3af] text-sm">{plan.period}</span>
                    </div>
                    <ul className="space-y-3 mb-8">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-center gap-3 text-sm">
                          <Check className="w-4 h-4 shrink-0" style={{ color: plan.highlight ? "#D4AF37" : "#4F8EF7" }} />
                          <span className="text-[#E8E8E8]">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="mt-auto">
                    {plan.comingSoon ? (
                      <button
                        disabled
                        className="w-full py-3 rounded-xl text-sm font-semibold border border-white/10 text-[#6b7280] cursor-not-allowed"
                      >
                        {plan.cta}
                      </button>
                    ) : (
                      <MotionButton
                        variant={plan.highlight ? "gold" : "ghost"}
                        className="w-full justify-center py-3 text-sm"
                        onClick={() => router.push(plan.href)}
                      >
                        {plan.cta}
                      </MotionButton>
                    )}
                  </div>
                </motion.div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section className="py-24 px-6">
        <AnimatedSection className="max-w-4xl mx-auto glass-gold p-12 text-center">
          <h2 className="font-display text-4xl md:text-5xl font-bold text-[#E8E8E8] mb-4">
            Take Control of Your <span className="text-gradient-gold">Financial Future</span>
          </h2>
          <p className="text-[#9ca3af] text-lg mb-8 max-w-xl mx-auto">
            Join 50,000+ people who have transformed their relationship with money using LifeFi. <span className="opacity-50 text-sm">(illustrative figures)</span>
          </p>
          <MotionButton variant="gold" className="text-base px-10 py-4" onClick={() => router.push("/signup")}>
            Get Started — It&apos;s Free <ArrowRight className="w-5 h-5" />
          </MotionButton>
        </AnimatedSection>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer className="border-t border-white/5 py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <Image src="/images/logos/LifeFi_Icon_Only_TRUE.svg" alt="LifeFi" width={36} height={36} />
          <div className="flex items-center gap-6 text-sm text-[#9ca3af]">
            <Link href="/terms#privacy" className="hover:text-[#E8E8E8] transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-[#E8E8E8] transition-colors">Terms</Link>
            <a href="mailto:support@lifefi.ai" className="hover:text-[#E8E8E8] transition-colors">Support</a>
          </div>
          <div className="text-sm text-[#9ca3af]">© 2026 LifeFi. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
}
