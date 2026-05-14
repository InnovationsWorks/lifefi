"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import {
  LayoutDashboard, CreditCard, FileText, Zap, Bell, Settings, LogOut,
  TrendingUp, TrendingDown, CheckCircle2, Clock, AlertTriangle, Wallet,
  Menu, X, ChevronRight, Calendar, Droplets, Flame, Wifi, Lightbulb,
} from "lucide-react";
import confetti from "canvas-confetti";

import { CountUp } from "@/components/ui/CountUp";
import { AnimatedSection, staggerItem } from "@/components/ui/AnimatedSection";
import { MotionButton } from "@/components/ui/MotionButton";
import { HealthScore } from "@/components/ui/HealthScore";
import { CardCarousel } from "@/components/ui/CardCarousel";
import { SpendingRing } from "@/components/ui/SpendingRing";
import { DebtTracker } from "@/components/ui/DebtTracker";
import { PaySuccessOverlay } from "@/components/ui/PaySuccessOverlay";

// ── Data ───────────────────────────────────────────────────────────────────

const cards = [
  { id: 1, name: "Chase Sapphire Preferred", last4: "4521", balance: 3240, limit: 10000, dueDate: "May 18", color: "#1a56db", utilization: 32 },
  { id: 2, name: "Amex Gold Card",           last4: "8834", balance: 1870, limit: 5000,  dueDate: "May 22", color: "#D4AF37", utilization: 37 },
  { id: 3, name: "Citi Premier Card",        last4: "2291", balance: 5410, limit: 12000, dueDate: "May 25", color: "#6366f1", utilization: 45 },
  { id: 4, name: "Discover it Cash Back",    last4: "7743", balance: 890,  limit: 8000,  dueDate: "Jun 2",  color: "#f97316", utilization: 11 },
];

const initialBills = [
  { id: 1, name: "Netflix",         amount: 15.99,  dueDate: "May 15", status: "paid",     category: "Entertainment" },
  { id: 2, name: "Spotify",         amount: 9.99,   dueDate: "May 17", status: "due_soon", category: "Entertainment" },
  { id: 3, name: "Rent",            amount: 2200,   dueDate: "May 20", status: "unpaid",   category: "Housing"       },
  { id: 4, name: "Car Insurance",   amount: 187,    dueDate: "May 21", status: "unpaid",   category: "Insurance"     },
  { id: 5, name: "Gym Membership",  amount: 45,     dueDate: "May 24", status: "unpaid",   category: "Health"        },
  { id: 6, name: "Adobe CC",        amount: 54.99,  dueDate: "May 28", status: "unpaid",   category: "Software"      },
  { id: 7, name: "Amazon Prime",    amount: 14.99,  dueDate: "Jun 1",  status: "paid",     category: "Shopping"      },
];

const utilities = [
  { id: 1, name: "Electric", icon: Lightbulb, amount: 142,   trend: +8,  color: "#f59e0b" },
  { id: 2, name: "Water",    icon: Droplets,  amount: 68,    trend: -3,  color: "#4F8EF7" },
  { id: 3, name: "Gas",      icon: Flame,     amount: 89,    trend: +12, color: "#ef4444" },
  { id: 4, name: "Internet", icon: Wifi,      amount: 79.99, trend: 0,   color: "#8b5cf6" },
];

const spendingData = [
  { month: "Dec", Housing: 2200, Food: 680, Entertainment: 320, Transport: 180, Shopping: 440 },
  { month: "Jan", Housing: 2200, Food: 720, Entertainment: 280, Transport: 210, Shopping: 390 },
  { month: "Feb", Housing: 2200, Food: 650, Entertainment: 410, Transport: 160, Shopping: 520 },
  { month: "Mar", Housing: 2200, Food: 780, Entertainment: 350, Transport: 230, Shopping: 310 },
  { month: "Apr", Housing: 2200, Food: 710, Entertainment: 290, Transport: 200, Shopping: 470 },
  { month: "May", Housing: 2200, Food: 640, Entertainment: 380, Transport: 190, Shopping: 350 },
];

const ringSegments = [
  { label: "Housing",       value: 2200, color: "#4F8EF7" },
  { label: "Food",          value: 640,  color: "#22c55e" },
  { label: "Entertainment", value: 380,  color: "#D4AF37" },
  { label: "Transport",     value: 190,  color: "#8b5cf6" },
  { label: "Shopping",      value: 350,  color: "#f97316" },
];

const navItems = [
  { id: "overview",       label: "Overview",      icon: LayoutDashboard },
  { id: "cards",          label: "Cards",         icon: CreditCard       },
  { id: "bills",          label: "Bills",         icon: FileText         },
  { id: "utilities",      label: "Utilities",     icon: Zap              },
  { id: "notifications",  label: "Notifications", icon: Bell             },
  { id: "settings",       label: "Settings",      icon: Settings         },
];

const statusConfig = {
  paid:     { label: "Paid",     color: "#22c55e", icon: CheckCircle2  },
  unpaid:   { label: "Unpaid",   color: "#9ca3af", icon: Clock         },
  due_soon: { label: "Due Soon", color: "#f59e0b", icon: AlertTriangle },
  overdue:  { label: "Overdue",  color: "#ef4444", icon: AlertTriangle },
};

// ── Stagger container ──────────────────────────────────────────────────────

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};

// ── Custom chart tooltip ───────────────────────────────────────────────────

function CustomTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: { value: number; name: string; color: string }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  const total = payload.reduce((s, p) => s + p.value, 0);
  return (
    <div className="glass p-4 text-sm">
      <div className="font-semibold text-[#E8E8E8] mb-2">{label}</div>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2 text-[#9ca3af] mb-1">
          <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span>{p.name}:</span>
          <span className="text-[#E8E8E8]">${p.value.toLocaleString()}</span>
        </div>
      ))}
      <div className="border-t border-white/10 mt-2 pt-2 text-[#E8E8E8] font-semibold">
        Total: ${total.toLocaleString()}
      </div>
    </div>
  );
}

// ── Dashboard ──────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [activeNav, setActiveNav]     = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [bills, setBills]             = useState(initialBills);
  const [payOverlay, setPayOverlay]   = useState<{ name: string; amount: number } | null>(null);
  const notifications = bills.filter((b) => b.status === "due_soon").length + 1;

  const totalBalance      = cards.reduce((s, c) => s + c.balance, 0);
  const totalLimit        = cards.reduce((s, c) => s + c.limit, 0);
  const overallUtil       = Math.round((totalBalance / totalLimit) * 100);
  const unpaidCount       = bills.filter((b) => b.status !== "paid").length;
  const upcomingBills     = bills.filter((b) => b.status !== "paid").slice(0, 4);

  const fireConfetti = useCallback(() => {
    const opts = { particleCount: 120, spread: 80, origin: { y: 0.55 } };
    confetti({ ...opts, colors: ["#4F8EF7", "#D4AF37", "#22c55e", "#fff"] });
    setTimeout(() => confetti({ ...opts, angle: 70, origin: { x: 0, y: 0.55 } }), 150);
    setTimeout(() => confetti({ ...opts, angle: 110, origin: { x: 1, y: 0.55 } }), 300);
  }, []);

  function handlePay(bill: typeof bills[0]) {
    setBills((prev) => prev.map((b) => b.id === bill.id ? { ...b, status: "paid" } : b));
    setPayOverlay({ name: bill.name, amount: bill.amount });
    fireConfetti();
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex">
      {/* Mobile backdrop */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-30 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* ── Sidebar ──────────────────────────────────────────────────────── */}
      <motion.aside
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        className={[
          "fixed md:static top-0 left-0 h-full z-40 md:z-auto",
          "w-64 flex flex-col bg-[#0d0d14] border-r border-white/5",
          "transition-transform duration-300 ease-in-out",
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        ].join(" ")}
      >
        {/* Logo */}
        <div className="p-6 flex items-center justify-between border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#4F8EF7] to-[#D4AF37] flex items-center justify-center">
              <Wallet className="w-4 h-4 text-white" />
            </div>
            <span className="font-display text-xl font-bold text-[#E8E8E8]">LifeFi</span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden text-[#9ca3af] hover:text-[#E8E8E8]">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item, i) => {
            const active = activeNav === item.id;
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + i * 0.06, duration: 0.4 }}
                className="relative"
              >
                {/* Gold active border */}
                <AnimatePresence>
                  {active && (
                    <motion.div
                      layoutId="nav-border"
                      initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} exit={{ scaleY: 0 }}
                      className="absolute left-0 top-1 bottom-1 w-0.5 rounded-full bg-gradient-to-b from-[#D4AF37] to-[#4F8EF7]"
                    />
                  )}
                </AnimatePresence>

                <motion.button
                  whileHover={{ backgroundColor: "rgba(255,255,255,0.05)" }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => { setActiveNav(item.id); setSidebarOpen(false); }}
                  className={[
                    "w-full flex items-center gap-3 pl-4 pr-3 py-3 rounded-xl text-sm font-medium transition-colors",
                    active
                      ? "bg-[#4F8EF7]/10 text-[#4F8EF7] border border-[#4F8EF7]/20"
                      : "text-[#9ca3af] hover:text-[#E8E8E8]",
                  ].join(" ")}
                >
                  <item.icon className="w-4 h-4 shrink-0" />
                  {item.label}
                  {item.id === "notifications" && notifications > 0 && (
                    <span className="ml-auto w-5 h-5 rounded-full bg-[#ef4444] text-white text-xs flex items-center justify-center font-bold">
                      {notifications}
                    </span>
                  )}
                </motion.button>
              </motion.div>
            );
          })}
        </nav>

        {/* User */}
        <div className="p-4 border-t border-white/5">
          <div className="flex items-center gap-3 px-2 mb-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#4F8EF7] to-[#D4AF37] flex items-center justify-center text-white text-sm font-bold shrink-0">
              JD
            </div>
            <div className="min-w-0">
              <div className="text-sm font-medium text-[#E8E8E8] truncate">Jane Doe</div>
              <div className="text-xs text-[#D4AF37]">Premium</div>
            </div>
          </div>
          <MotionButton variant="ghost" className="w-full flex items-center gap-3 px-4 py-2 text-sm text-[#9ca3af] border-0 rounded-xl justify-start">
            <LogOut className="w-4 h-4" />
            Sign Out
          </MotionButton>
        </div>
      </motion.aside>

      {/* ── Main ──────────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">

        {/* Header */}
        <header className="sticky top-0 z-20 bg-[#0a0a0f]/90 backdrop-blur-md border-b border-white/5 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={() => setSidebarOpen(true)}
                className="md:hidden text-[#9ca3af] hover:text-[#E8E8E8] p-1"
              >
                <Menu className="w-5 h-5" />
              </motion.button>
              <div>
                <h1 className="font-display text-xl font-bold text-[#E8E8E8]">Good morning, Jane 👋</h1>
                <p className="text-xs text-[#9ca3af]">Tuesday, May 13, 2026</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <MotionButton variant="ghost" className="relative p-2 border-white/10 rounded-xl !py-2 !px-2">
                <Bell className="w-4 h-4 text-[#9ca3af]" />
                {notifications > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#ef4444] text-white text-xs flex items-center justify-center font-bold">
                    {notifications}
                  </span>
                )}
              </MotionButton>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#4F8EF7] to-[#D4AF37] flex items-center justify-center text-white text-xs font-bold">
                JD
              </div>
            </div>
          </div>
        </header>

        {/* Body */}
        <main className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* ── KPI Row ─────────────────────────────────────────────────── */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-2 lg:grid-cols-4 gap-4"
          >
            {[
              { label: "Total Balance",  value: totalBalance,  prefix: "$", sub: "Across 4 cards",           trend: "up",   trendVal: "+2.3%" },
              { label: "Credit Used",    value: overallUtil,   suffix: "%", sub: `$${totalBalance.toLocaleString()} of limit`, trend: "neutral", trendVal: "utilization" },
              { label: "Bills Due",      value: unpaidCount,   prefix: "",  sub: "This month",                trend: "down", trendVal: `${bills.filter(b=>b.status==="paid").length} paid` },
              { label: "Monthly Spend",  value: 4360,          prefix: "$", sub: "vs $4,820 last month",      trend: "up",   trendVal: "-9.5%" },
            ].map((kpi) => (
              <motion.div key={kpi.label} variants={staggerItem} className="glass p-5">
                <div className="text-xs text-[#9ca3af] mb-1">{kpi.label}</div>
                <div className="font-display text-2xl font-bold text-[#E8E8E8] mb-1">
                  <CountUp to={kpi.value} prefix={kpi.prefix ?? ""} suffix={kpi.suffix ?? ""} duration={1.3} />
                </div>
                <div className="flex items-center gap-1.5">
                  {kpi.trend === "up"   && <TrendingUp   className="w-3 h-3 text-[#22c55e]" />}
                  {kpi.trend === "down" && <TrendingDown className="w-3 h-3 text-[#f59e0b]" />}
                  <span className="text-xs text-[#9ca3af]">{kpi.trendVal}</span>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* ── Health Score + Upcoming ───────────────────────────────── */}
          <div className="grid lg:grid-cols-3 gap-6">
            <AnimatedSection className="glass-gold p-6 flex flex-col items-center text-center">
              <div className="text-sm font-medium text-[#D4AF37] mb-4">Financial Health Score</div>
              <HealthScore score={87} />
              <div className="w-full mt-5 space-y-2 text-left">
                {[
                  { label: "Payment History", val: 95, color: "#22c55e" },
                  { label: "Utilization",      val: 32, color: "#4F8EF7" },
                  { label: "Account Age",      val: 80, color: "#D4AF37" },
                ].map((item) => (
                  <div key={item.label}>
                    <div className="flex justify-between text-xs text-[#9ca3af] mb-1">
                      <span>{item.label}</span>
                      <span className="font-medium" style={{ color: item.color }}>
                        <CountUp to={item.val} suffix="%" duration={1.4} />
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/10">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${item.val}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
                        className="h-full rounded-full"
                        style={{ background: item.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </AnimatedSection>

            {/* Upcoming */}
            <AnimatedSection className="glass p-6 lg:col-span-2">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#4F8EF7]" />
                  <h2 className="font-semibold text-[#E8E8E8]">Upcoming Payments</h2>
                </div>
                <MotionButton variant="ghost" className="text-xs text-[#4F8EF7] border-0 py-1 px-2 flex items-center gap-1">
                  View All <ChevronRight className="w-3 h-3" />
                </MotionButton>
              </div>
              <motion.div
                variants={staggerContainer}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="space-y-3"
              >
                {upcomingBills.map((bill) => {
                  const cfg = statusConfig[bill.status as keyof typeof statusConfig];
                  return (
                    <motion.div
                      key={bill.id}
                      variants={staggerItem}
                      layout
                      className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold"
                          style={{ background: `${cfg.color}15`, color: cfg.color }}>
                          {bill.name[0]}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-[#E8E8E8]">{bill.name}</div>
                          <div className="text-xs text-[#9ca3af]">{bill.dueDate}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="hidden sm:flex items-center gap-1 text-xs px-2 py-1 rounded-lg"
                          style={{ color: cfg.color, background: `${cfg.color}15` }}>
                          <cfg.icon className="w-3 h-3" />
                          {cfg.label}
                        </div>
                        <span className="text-sm font-semibold text-[#E8E8E8]">${bill.amount.toFixed(2)}</span>
                        <MotionButton variant="pay" onClick={() => handlePay(bill)}>Pay</MotionButton>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            </AnimatedSection>
          </div>

          {/* ── Card Carousel ─────────────────────────────────────────── */}
          <AnimatedSection className="glass p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-[#4F8EF7]" />
                <h2 className="font-semibold text-[#E8E8E8]">Your Cards</h2>
              </div>
              <MotionButton variant="ghost" className="text-xs text-[#4F8EF7] border-0 py-1 px-2">
                + Add Card
              </MotionButton>
            </div>
            <CardCarousel cards={cards} />
          </AnimatedSection>

          {/* ── Spending Ring + Bar Chart ─────────────────────────────── */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Ring + Bar */}
            <AnimatedSection className="glass p-6">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-[#4F8EF7]" />
                  <h2 className="font-semibold text-[#E8E8E8]">Spending Breakdown</h2>
                </div>
                <span className="text-xs text-[#9ca3af]">May 2026</span>
              </div>
              <SpendingRing segments={ringSegments} />
              <div className="mt-6">
                <div className="text-xs text-[#9ca3af] mb-3">6-Month History</div>
                <ResponsiveContainer width="100%" height={160}>
                  <BarChart data={spendingData} barSize={6} barCategoryGap="30%">
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="month" tick={{ fill: "#9ca3af", fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "#9ca3af", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
                    {[
                      { key: "Housing",       color: "#4F8EF7" },
                      { key: "Food",          color: "#22c55e" },
                      { key: "Entertainment", color: "#D4AF37" },
                      { key: "Transport",     color: "#8b5cf6" },
                      { key: "Shopping",      color: "#f97316" },
                    ].map((cat, i, arr) => (
                      <Bar key={cat.key} dataKey={cat.key} stackId="a" fill={cat.color}
                        radius={i === arr.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]} />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </AnimatedSection>

            {/* Bills list */}
            <AnimatedSection className="glass p-6">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#4F8EF7]" />
                  <h2 className="font-semibold text-[#E8E8E8]">Monthly Bills</h2>
                </div>
                <MotionButton variant="ghost" className="text-xs text-[#4F8EF7] border-0 py-1 px-2">
                  + Add Bill
                </MotionButton>
              </div>
              <motion.div
                variants={staggerContainer}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="space-y-1 max-h-[400px] overflow-y-auto pr-1"
              >
                {bills.map((bill) => {
                  const cfg = statusConfig[bill.status as keyof typeof statusConfig];
                  return (
                    <motion.div
                      key={bill.id}
                      variants={staggerItem}
                      layout
                      animate={bill.status === "paid" ? { opacity: 0.55 } : { opacity: 1 }}
                      className="flex items-center justify-between p-3 rounded-xl hover:bg-white/[0.04] transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0"
                          style={{ background: `${cfg.color}15`, color: cfg.color }}>
                          {bill.name[0]}
                        </div>
                        <div>
                          <div className={`text-sm font-medium ${bill.status === "paid" ? "line-through text-[#9ca3af]" : "text-[#E8E8E8]"}`}>
                            {bill.name}
                          </div>
                          <div className="text-xs text-[#9ca3af]">{bill.category} · {bill.dueDate}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs hidden sm:block" style={{ color: cfg.color }}>{cfg.label}</span>
                        <span className="text-sm font-semibold text-[#E8E8E8]">${bill.amount.toFixed(2)}</span>
                        {bill.status !== "paid" && (
                          <MotionButton
                            variant="pay"
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => handlePay(bill)}
                          >
                            Pay
                          </MotionButton>
                        )}
                        {bill.status === "paid" && (
                          <CheckCircle2 className="w-4 h-4 text-[#22c55e] shrink-0" />
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            </AnimatedSection>
          </div>

          {/* ── Utilities ────────────────────────────────────────────── */}
          <AnimatedSection className="glass p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-[#4F8EF7]" />
                <h2 className="font-semibold text-[#E8E8E8]">Utilities This Month</h2>
              </div>
              <span className="text-xs text-[#9ca3af]">
                Total: $<CountUp to={utilities.reduce((s, u) => s + u.amount, 0)} decimals={2} duration={1.3} />
              </span>
            </div>
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4"
            >
              {utilities.map((util) => (
                <motion.div
                  key={util.id}
                  variants={staggerItem}
                  className="p-4 rounded-2xl border"
                  style={{ background: `${util.color}08`, borderColor: `${util.color}20` }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${util.color}20` }}>
                      <util.icon className="w-4 h-4" style={{ color: util.color }} />
                    </div>
                    <div className="text-xs flex items-center gap-0.5"
                      style={{ color: util.trend > 0 ? "#ef4444" : util.trend < 0 ? "#22c55e" : "#9ca3af" }}>
                      {util.trend > 0 ? <TrendingUp className="w-3 h-3" /> : util.trend < 0 ? <TrendingDown className="w-3 h-3" /> : null}
                      {util.trend !== 0 ? `${Math.abs(util.trend)}%` : "Stable"}
                    </div>
                  </div>
                  <div className="text-[#9ca3af] text-xs mb-0.5">{util.name}</div>
                  <div className="font-display text-2xl font-bold text-[#E8E8E8]">
                    $<CountUp to={util.amount} decimals={util.amount % 1 !== 0 ? 2 : 0} duration={1.2} />
                  </div>
                  <div className="text-xs text-[#9ca3af] mt-0.5">this month</div>
                </motion.div>
              ))}
            </motion.div>
          </AnimatedSection>

          {/* ── Debt Payoff Tracker ───────────────────────────────────── */}
          <AnimatedSection className="glass p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-[#4F8EF7]" />
                <h2 className="font-semibold text-[#E8E8E8]">Debt Payoff Tracker</h2>
              </div>
              <span className="text-xs text-[#9ca3af]">
                Total owed: $<CountUp to={cards.reduce((s, c) => s + c.balance, 0)} duration={1.3} />
              </span>
            </div>
            <DebtTracker
              items={cards.map((c) => ({
                id: c.id,
                name: c.name,
                balance: c.balance,
                limit: c.limit,
                color: c.color,
              }))}
            />
          </AnimatedSection>

        </main>
      </div>

      {/* ── Pay Success Overlay ──────────────────────────────────────────── */}
      <PaySuccessOverlay
        visible={payOverlay !== null}
        billName={payOverlay?.name ?? ""}
        amount={payOverlay?.amount ?? 0}
        onDone={() => setPayOverlay(null)}
      />
    </div>
  );
}
