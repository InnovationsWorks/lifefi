"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  CreditCard,
  FileText,
  Bell,
  BarChart3,
  Shield,
  Zap,
  ChevronRight,
  Check,
  Star,
  TrendingUp,
  Wallet,
  ArrowRight,
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: "easeOut" as const },
  }),
};

const features = [
  {
    icon: CreditCard,
    title: "Track Cards",
    description:
      "Visualize all your credit cards in one gorgeous view. Monitor balances, limits, utilization, and due dates at a glance.",
    color: "#4F8EF7",
  },
  {
    icon: FileText,
    title: "Pay Bills",
    description:
      "Never miss a payment. LifeFi tracks every recurring bill and sends smart reminders before due dates hit.",
    color: "#D4AF37",
  },
  {
    icon: Bell,
    title: "Get Alerts",
    description:
      "Real-time notifications for unusual spending, upcoming due dates, and financial health score changes.",
    color: "#4F8EF7",
  },
  {
    icon: BarChart3,
    title: "See Everything",
    description:
      "Beautiful charts showing spending by category, monthly trends, and utility costs — your full financial picture.",
    color: "#D4AF37",
  },
];

const steps = [
  {
    number: "01",
    title: "Connect Your Accounts",
    description:
      "Securely link your credit cards, bank accounts, and recurring bills in minutes.",
  },
  {
    number: "02",
    title: "Get Your Health Score",
    description:
      "Receive your personalized Financial Health Score and actionable insights to improve it.",
  },
  {
    number: "03",
    title: "Stay in Control",
    description:
      "Set payment reminders, track spending, and make smarter financial decisions effortlessly.",
  },
];

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "",
    description: "Perfect for getting started",
    features: [
      "Up to 2 credit cards",
      "5 recurring bills",
      "Basic spending chart",
      "Email alerts",
      "Financial Health Score",
    ],
    cta: "Get Started Free",
    href: "/signup",
    highlight: false,
  },
  {
    name: "Premium",
    price: "$4.99",
    period: "/month",
    description: "For serious financial management",
    features: [
      "Unlimited credit cards",
      "Unlimited bills & utilities",
      "Advanced analytics",
      "Push + SMS alerts",
      "Bill pay reminders",
      "Export to CSV/PDF",
      "Priority support",
    ],
    cta: "Start Premium",
    href: "/signup?plan=premium",
    highlight: true,
  },
  {
    name: "BizFi Bundle",
    price: "$12.99",
    period: "/month",
    description: "For entrepreneurs & freelancers",
    features: [
      "Everything in Premium",
      "Business expense tracking",
      "Tax category tagging",
      "Multi-currency support",
      "Team member access",
      "API access",
      "Dedicated account manager",
    ],
    cta: "Start BizFi",
    href: "/signup?plan=bizfi",
    highlight: false,
  },
];

const stats = [
  { value: "50K+", label: "Active Users" },
  { value: "$2.3B", label: "Tracked Monthly" },
  { value: "99.9%", label: "Uptime" },
  { value: "4.9★", label: "App Rating" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#4F8EF7] to-[#D4AF37] flex items-center justify-center">
              <Wallet className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-bold text-xl text-[#E8E8E8]">
              LifeFi
            </span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-[#9ca3af]">
            <a href="#features" className="hover:text-[#E8E8E8] transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-[#E8E8E8] transition-colors">How It Works</a>
            <a href="#pricing" className="hover:text-[#E8E8E8] transition-colors">Pricing</a>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm text-[#9ca3af] hover:text-[#E8E8E8] transition-colors px-4 py-2"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="btn-primary text-sm py-2 px-5"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-24 px-6">
        <div className="absolute inset-0 bg-gradient-hero pointer-events-none" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#4F8EF7] opacity-5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-[#D4AF37] opacity-5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={0}
            className="inline-flex items-center gap-2 glass px-4 py-2 text-sm text-[#D4AF37] mb-8"
            style={{ borderRadius: "100px", border: "1px solid rgba(212,175,55,0.25)" }}
          >
            <Star className="w-3.5 h-3.5 fill-[#D4AF37]" />
            Trusted by 50,000+ users worldwide
          </motion.div>

          <motion.h1
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={1}
            className="font-display text-5xl md:text-7xl font-bold text-[#E8E8E8] leading-tight mb-6"
          >
            Your Financial Life,
            <br />
            <span className="text-gradient-blue">Finally in Order</span>
          </motion.h1>

          <motion.p
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={2}
            className="text-[#9ca3af] text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            LifeFi brings all your credit cards, bills, and utilities into one
            stunning dashboard. Track spending, never miss payments, and take
            control of your financial future.
          </motion.p>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={3}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link href="/signup" className="btn-gold text-base px-8 py-3.5">
              Start for Free
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/login"
              className="text-[#E8E8E8] text-base px-8 py-3.5 rounded-xl border border-white/10 hover:border-white/20 transition-colors"
            >
              Sign In
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={4}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20 max-w-3xl mx-auto"
          >
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="font-display text-3xl font-bold text-gradient-gold">
                  {stat.value}
                </div>
                <div className="text-[#9ca3af] text-sm mt-1">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Dashboard Preview */}
        <motion.div
          initial={{ opacity: 0, y: 60, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
          className="max-w-5xl mx-auto mt-16 relative"
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
              <div className="glass-gold p-4 col-span-1">
                <div className="text-xs text-[#9ca3af] mb-1">Health Score</div>
                <div className="font-display text-3xl font-bold text-gradient-gold">87</div>
                <div className="text-xs text-[#22c55e] mt-1">↑ +3 this month</div>
              </div>
              <div className="glass p-4 col-span-1">
                <div className="text-xs text-[#9ca3af] mb-1">Total Balance</div>
                <div className="font-display text-2xl font-bold text-[#E8E8E8]">$12,430</div>
                <div className="text-xs text-[#9ca3af] mt-1">Across 4 cards</div>
              </div>
              <div className="glass p-4 col-span-1">
                <div className="text-xs text-[#9ca3af] mb-1">Bills Due</div>
                <div className="font-display text-2xl font-bold text-[#4F8EF7]">3</div>
                <div className="text-xs text-[#f59e0b] mt-1">Next: 3 days</div>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-4 gap-3">
              {["Chase Sapphire", "Amex Gold", "Citi Premier", "Discover"].map((card, i) => (
                <div key={card} className="glass p-3">
                  <div className="text-xs text-[#9ca3af] truncate">{card}</div>
                  <div className="text-sm font-semibold text-[#E8E8E8] mt-1">
                    ${(1200 + i * 834).toLocaleString()}
                  </div>
                  <div className="mt-2 h-1.5 rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#4F8EF7] to-[#D4AF37]"
                      style={{ width: `${25 + i * 15}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="text-center mb-16"
          >
            <h2 className="font-display text-4xl md:text-5xl font-bold text-[#E8E8E8] mb-4">
              Everything You Need,{" "}
              <span className="text-gradient-blue">Nothing You Don&apos;t</span>
            </h2>
            <p className="text-[#9ca3af] text-lg max-w-2xl mx-auto">
              LifeFi gives you a complete picture of your financial life in a
              single, beautiful interface.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                custom={i}
                className="glass p-8 group hover:border-[#4F8EF7]/20 transition-all duration-300"
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                  style={{ background: `${feature.color}15`, border: `1px solid ${feature.color}25` }}
                >
                  <feature.icon
                    className="w-6 h-6"
                    style={{ color: feature.color }}
                  />
                </div>
                <h3 className="font-display text-xl font-bold text-[#E8E8E8] mb-3">
                  {feature.title}
                </h3>
                <p className="text-[#9ca3af] leading-relaxed">{feature.description}</p>
                <div className="mt-5 flex items-center gap-2 text-sm font-medium text-[#4F8EF7] group-hover:gap-3 transition-all">
                  Learn more <ChevronRight className="w-4 h-4" />
                </div>
              </motion.div>
            ))}
          </div>

          {/* Extra feature highlights */}
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Shield, label: "Bank-grade Security" },
              { icon: Zap, label: "Real-time Sync" },
              { icon: TrendingUp, label: "Smart Insights" },
              { icon: Bell, label: "Instant Alerts" },
            ].map((item, i) => (
              <motion.div
                key={item.label}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                custom={i}
                className="glass p-4 flex items-center gap-3"
              >
                <item.icon className="w-5 h-5 text-[#4F8EF7] shrink-0" />
                <span className="text-sm text-[#E8E8E8] font-medium">{item.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="text-center mb-16"
          >
            <h2 className="font-display text-4xl md:text-5xl font-bold text-[#E8E8E8] mb-4">
              Up and Running in{" "}
              <span className="text-gradient-gold">3 Minutes</span>
            </h2>
            <p className="text-[#9ca3af] text-lg">
              No complicated setup. No financial jargon. Just clarity.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-12 left-[calc(16.67%+2rem)] right-[calc(16.67%+2rem)] h-px bg-gradient-to-r from-transparent via-[#4F8EF7]/30 to-transparent" />
            {steps.map((step, i) => (
              <motion.div
                key={step.number}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                custom={i}
                className="text-center relative"
              >
                <div className="w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-6 glass-gold">
                  <span className="font-display text-3xl font-bold text-gradient-gold">
                    {step.number}
                  </span>
                </div>
                <h3 className="font-display text-xl font-bold text-[#E8E8E8] mb-3">
                  {step.title}
                </h3>
                <p className="text-[#9ca3af] leading-relaxed">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="text-center mb-16"
          >
            <h2 className="font-display text-4xl md:text-5xl font-bold text-[#E8E8E8] mb-4">
              Simple, Transparent{" "}
              <span className="text-gradient-blue">Pricing</span>
            </h2>
            <p className="text-[#9ca3af] text-lg">
              Start free. Upgrade when you&apos;re ready.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {plans.map((plan, i) => (
              <motion.div
                key={plan.name}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                custom={i}
                className={`relative flex flex-col ${
                  plan.highlight ? "glass-gold scale-105 shadow-2xl shadow-[#D4AF37]/10" : "glass"
                } p-8`}
              >
                {plan.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#D4AF37] to-[#F5D76E] text-[#0a0a0f] text-xs font-bold px-4 py-1 rounded-full">
                    MOST POPULAR
                  </div>
                )}
                <div>
                  <h3 className="font-display text-2xl font-bold text-[#E8E8E8] mb-1">
                    {plan.name}
                  </h3>
                  <p className="text-[#9ca3af] text-sm mb-6">{plan.description}</p>
                  <div className="flex items-baseline gap-1 mb-8">
                    <span className="font-display text-5xl font-bold text-[#E8E8E8]">
                      {plan.price}
                    </span>
                    <span className="text-[#9ca3af] text-sm">{plan.period}</span>
                  </div>
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-3 text-sm">
                        <Check
                          className="w-4 h-4 shrink-0"
                          style={{ color: plan.highlight ? "#D4AF37" : "#4F8EF7" }}
                        />
                        <span className="text-[#E8E8E8]">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <Link
                  href={plan.href}
                  className={`mt-auto text-center py-3 rounded-xl font-semibold text-sm transition-all ${
                    plan.highlight
                      ? "btn-gold"
                      : "border border-white/10 text-[#E8E8E8] hover:border-[#4F8EF7]/40 hover:text-[#4F8EF7]"
                  }`}
                >
                  {plan.cta}
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-24 px-6">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          className="max-w-4xl mx-auto glass-gold p-12 text-center"
        >
          <h2 className="font-display text-4xl md:text-5xl font-bold text-[#E8E8E8] mb-4">
            Take Control of Your{" "}
            <span className="text-gradient-gold">Financial Future</span>
          </h2>
          <p className="text-[#9ca3af] text-lg mb-8 max-w-xl mx-auto">
            Join 50,000+ people who have transformed their relationship with money
            using LifeFi.
          </p>
          <Link href="/signup" className="btn-gold text-base px-10 py-4 inline-flex">
            Get Started — It&apos;s Free
            <ArrowRight className="w-5 h-5" />
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#4F8EF7] to-[#D4AF37] flex items-center justify-center">
              <Wallet className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-bold text-lg text-[#E8E8E8]">LifeFi</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-[#9ca3af]">
            <a href="#" className="hover:text-[#E8E8E8] transition-colors">Privacy</a>
            <a href="#" className="hover:text-[#E8E8E8] transition-colors">Terms</a>
            <a href="#" className="hover:text-[#E8E8E8] transition-colors">Support</a>
          </div>
          <div className="text-sm text-[#9ca3af]">
            © 2026 LifeFi. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
