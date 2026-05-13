"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  LayoutDashboard,
  CreditCard,
  FileText,
  Zap,
  Bell,
  Settings,
  LogOut,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Wallet,
  Menu,
  X,
  ChevronRight,
  Calendar,
  Droplets,
  Flame,
  Wifi,
  Lightbulb,
} from "lucide-react";

// ── Mock Data ──────────────────────────────────────────────────────────────

const cards = [
  { id: 1, name: "Chase Sapphire Preferred", last4: "4521", balance: 3240, limit: 10000, dueDate: "May 18", color: "#1a56db", utilization: 32 },
  { id: 2, name: "Amex Gold Card", last4: "8834", balance: 1870, limit: 5000, dueDate: "May 22", color: "#D4AF37", utilization: 37 },
  { id: 3, name: "Citi Premier Card", last4: "2291", balance: 5410, limit: 12000, dueDate: "May 25", color: "#6366f1", utilization: 45 },
  { id: 4, name: "Discover it Cash Back", last4: "7743", balance: 890, limit: 8000, dueDate: "Jun 2", color: "#f97316", utilization: 11 },
];

const bills = [
  { id: 1, name: "Netflix", amount: 15.99, dueDate: "May 15", status: "paid", category: "Entertainment" },
  { id: 2, name: "Spotify", amount: 9.99, dueDate: "May 17", status: "due_soon", category: "Entertainment" },
  { id: 3, name: "Rent", amount: 2200, dueDate: "May 20", status: "unpaid", category: "Housing" },
  { id: 4, name: "Car Insurance", amount: 187, dueDate: "May 21", status: "unpaid", category: "Insurance" },
  { id: 5, name: "Gym Membership", amount: 45, dueDate: "May 24", status: "unpaid", category: "Health" },
  { id: 6, name: "Adobe CC", amount: 54.99, dueDate: "May 28", status: "unpaid", category: "Software" },
  { id: 7, name: "Amazon Prime", amount: 14.99, dueDate: "Jun 1", status: "paid", category: "Shopping" },
];

const utilities = [
  { id: 1, name: "Electric", icon: Lightbulb, amount: 142, trend: +8, color: "#f59e0b" },
  { id: 2, name: "Water", icon: Droplets, amount: 68, trend: -3, color: "#4F8EF7" },
  { id: 3, name: "Gas", icon: Flame, amount: 89, trend: +12, color: "#ef4444" },
  { id: 4, name: "Internet", icon: Wifi, amount: 79.99, trend: 0, color: "#8b5cf6" },
];

const spendingData = [
  { month: "Dec", Housing: 2200, Food: 680, Entertainment: 320, Transport: 180, Shopping: 440 },
  { month: "Jan", Housing: 2200, Food: 720, Entertainment: 280, Transport: 210, Shopping: 390 },
  { month: "Feb", Housing: 2200, Food: 650, Entertainment: 410, Transport: 160, Shopping: 520 },
  { month: "Mar", Housing: 2200, Food: 780, Entertainment: 350, Transport: 230, Shopping: 310 },
  { month: "Apr", Housing: 2200, Food: 710, Entertainment: 290, Transport: 200, Shopping: 470 },
  { month: "May", Housing: 2200, Food: 640, Entertainment: 380, Transport: 190, Shopping: 350 },
];

const navItems = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "cards", label: "Cards", icon: CreditCard },
  { id: "bills", label: "Bills", icon: FileText },
  { id: "utilities", label: "Utilities", icon: Zap },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "settings", label: "Settings", icon: Settings },
];

const statusConfig = {
  paid: { label: "Paid", color: "#22c55e", icon: CheckCircle2 },
  unpaid: { label: "Unpaid", color: "#9ca3af", icon: Clock },
  due_soon: { label: "Due Soon", color: "#f59e0b", icon: AlertTriangle },
  overdue: { label: "Overdue", color: "#ef4444", icon: AlertTriangle },
};

// ── Circular Progress ──────────────────────────────────────────────────────

function CircularProgress({ score }: { score: number }) {
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const [displayed, setDisplayed] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      let start = 0;
      const step = () => {
        start += 2;
        setDisplayed(Math.min(start, score));
        if (start < score) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }, 400);
    return () => clearTimeout(timer);
  }, [score]);

  const offset = circumference - (displayed / 100) * circumference;
  const color = displayed >= 80 ? "#22c55e" : displayed >= 60 ? "#f59e0b" : "#ef4444";

  return (
    <div className="relative w-36 h-36 mx-auto">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={radius} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="10" />
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.05s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-4xl font-bold text-[#E8E8E8]">{displayed}</span>
        <span className="text-xs text-[#9ca3af] mt-0.5">/ 100</span>
      </div>
    </div>
  );
}

// ── Credit Card Visual ─────────────────────────────────────────────────────

function CreditCardVisual({ card }: { card: typeof cards[0] }) {
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -4 }}
      transition={{ duration: 0.2 }}
      className="relative overflow-hidden rounded-2xl p-6 min-h-[180px] flex flex-col justify-between cursor-pointer"
      style={{
        background: `linear-gradient(135deg, ${card.color}cc, ${card.color}55)`,
        border: `1px solid ${card.color}40`,
        backdropFilter: "blur(12px)",
      }}
    >
      <div className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-10 -translate-y-1/2 translate-x-1/2"
        style={{ background: "white" }} />
      <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full opacity-10 translate-y-1/2 -translate-x-1/2"
        style={{ background: "white" }} />

      <div className="relative z-10 flex items-start justify-between">
        <div>
          <div className="text-white/70 text-xs mb-0.5">CREDIT CARD</div>
          <div className="text-white font-semibold text-sm truncate max-w-[160px]">{card.name}</div>
        </div>
        <Wallet className="w-6 h-6 text-white/60" />
      </div>

      <div className="relative z-10">
        <div className="text-white/60 text-xs tracking-widest mb-2">•••• •••• •••• {card.last4}</div>
        <div className="flex items-end justify-between mb-3">
          <div>
            <div className="text-white/60 text-xs">Balance</div>
            <div className="font-display text-2xl font-bold text-white">
              ${card.balance.toLocaleString()}
            </div>
          </div>
          <div className="text-right">
            <div className="text-white/60 text-xs">Due Date</div>
            <div className="text-white text-sm font-medium">{card.dueDate}</div>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between text-xs text-white/60 mb-1">
            <span>Utilization</span>
            <span>{card.utilization}% of ${(card.limit / 1000).toFixed(0)}K</span>
          </div>
          <div className="h-1.5 rounded-full bg-white/20">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${card.utilization}%` }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
              className="h-full rounded-full bg-white"
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ── Custom Tooltip ─────────────────────────────────────────────────────────

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number; name: string; color: string }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  const total = payload.reduce((sum, p) => sum + p.value, 0);
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

// ── Main Dashboard ─────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [activeNav, setActiveNav] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications] = useState(3);
  const sidebarRef = useRef<HTMLDivElement>(null);

  const upcomingBills = bills
    .filter((b) => b.status !== "paid")
    .slice(0, 4);

  const totalBalance = cards.reduce((s, c) => s + c.balance, 0);
  const totalLimit = cards.reduce((s, c) => s + c.limit, 0);
  const overallUtilization = Math.round((totalBalance / totalLimit) * 100);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (sidebarRef.current && !sidebarRef.current.contains(e.target as Node)) {
        setSidebarOpen(false);
      }
    }
    if (sidebarOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [sidebarOpen]);

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex">
      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-30 md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        ref={sidebarRef}
        initial={false}
        animate={{ x: sidebarOpen ? 0 : undefined }}
        className={`
          fixed md:static top-0 left-0 h-full z-40 md:z-auto
          w-64 flex flex-col
          bg-[#0d0d14] border-r border-white/5
          transition-transform duration-300 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        {/* Logo */}
        <div className="p-6 flex items-center justify-between border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#4F8EF7] to-[#D4AF37] flex items-center justify-center">
              <Wallet className="w-4.5 h-4.5 text-white" />
            </div>
            <span className="font-display text-xl font-bold text-[#E8E8E8]">LifeFi</span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden text-[#9ca3af] hover:text-[#E8E8E8]">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const active = activeNav === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { setActiveNav(item.id); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  active
                    ? "bg-[#4F8EF7]/10 text-[#4F8EF7] border border-[#4F8EF7]/20"
                    : "text-[#9ca3af] hover:text-[#E8E8E8] hover:bg-white/5"
                }`}
              >
                <item.icon className="w-4.5 h-4.5 shrink-0" />
                {item.label}
                {item.id === "notifications" && notifications > 0 && (
                  <span className="ml-auto w-5 h-5 rounded-full bg-[#ef4444] text-white text-xs flex items-center justify-center font-bold">
                    {notifications}
                  </span>
                )}
              </button>
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
          <button className="w-full flex items-center gap-3 px-4 py-2 rounded-xl text-sm text-[#9ca3af] hover:text-[#E8E8E8] hover:bg-white/5 transition-all">
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </motion.aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Header */}
        <header className="sticky top-0 z-20 bg-[#0a0a0f]/90 backdrop-blur-md border-b border-white/5 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="md:hidden text-[#9ca3af] hover:text-[#E8E8E8] p-1"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div>
                <h1 className="font-display text-xl font-bold text-[#E8E8E8]">
                  Good morning, Jane 👋
                </h1>
                <p className="text-xs text-[#9ca3af]">Tuesday, May 13, 2026</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="relative p-2 rounded-xl border border-white/10 text-[#9ca3af] hover:text-[#E8E8E8] hover:border-white/20 transition-all">
                <Bell className="w-4 h-4" />
                {notifications > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#ef4444] text-white text-xs flex items-center justify-center font-bold">
                    {notifications}
                  </span>
                )}
              </button>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#4F8EF7] to-[#D4AF37] flex items-center justify-center text-white text-xs font-bold">
                JD
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard body */}
        <main className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* Top KPI row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Total Balance", value: `$${totalBalance.toLocaleString()}`, sub: "Across 4 cards", trend: "up", trendVal: "+2.3%" },
              { label: "Credit Used", value: `${overallUtilization}%`, sub: `$${totalBalance.toLocaleString()} / $${totalLimit.toLocaleString()}`, trend: "neutral", trendVal: "of total limit" },
              { label: "Bills Due", value: "5", sub: "This month", trend: "down", trendVal: "2 paid" },
              { label: "Monthly Spend", value: "$4,360", sub: "vs $4,820 last month", trend: "up", trendVal: "-9.5%" },
            ].map((kpi, i) => (
              <motion.div
                key={kpi.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="glass p-5"
              >
                <div className="text-xs text-[#9ca3af] mb-1">{kpi.label}</div>
                <div className="font-display text-2xl font-bold text-[#E8E8E8] mb-1">{kpi.value}</div>
                <div className="flex items-center gap-1.5">
                  {kpi.trend === "up" ? (
                    <TrendingUp className="w-3 h-3 text-[#22c55e]" />
                  ) : kpi.trend === "down" ? (
                    <TrendingDown className="w-3 h-3 text-[#f59e0b]" />
                  ) : null}
                  <span className="text-xs text-[#9ca3af]">{kpi.trendVal}</span>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Health Score + Upcoming Payments */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Health Score */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15 }}
              className="glass-gold p-6 flex flex-col items-center text-center"
            >
              <div className="text-sm font-medium text-[#D4AF37] mb-4">Financial Health Score</div>
              <CircularProgress score={87} />
              <div className="mt-4">
                <div className="text-[#22c55e] text-sm font-medium">Excellent</div>
                <div className="text-[#9ca3af] text-xs mt-1">↑ +3 points this month</div>
              </div>
              <div className="w-full mt-5 space-y-2 text-left">
                {[
                  { label: "Payment History", val: 95, color: "#22c55e" },
                  { label: "Utilization", val: 32, color: "#4F8EF7" },
                  { label: "Account Age", val: 80, color: "#D4AF37" },
                ].map((item) => (
                  <div key={item.label}>
                    <div className="flex justify-between text-xs text-[#9ca3af] mb-1">
                      <span>{item.label}</span>
                      <span style={{ color: item.color }}>{item.val}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/10">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${item.val}%` }}
                        transition={{ duration: 0.8, delay: 0.5 }}
                        className="h-full rounded-full"
                        style={{ background: item.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Upcoming Payments */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass p-6 lg:col-span-2"
            >
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#4F8EF7]" />
                  <h2 className="font-semibold text-[#E8E8E8]">Upcoming Payments</h2>
                </div>
                <button className="text-xs text-[#4F8EF7] hover:text-[#7EB3FF] flex items-center gap-1">
                  View All <ChevronRight className="w-3 h-3" />
                </button>
              </div>
              <div className="space-y-3">
                {upcomingBills.map((bill, i) => {
                  const config = statusConfig[bill.status as keyof typeof statusConfig];
                  return (
                    <motion.div
                      key={bill.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.25 + i * 0.06 }}
                      className="flex items-center justify-between p-3 rounded-xl bg-white/3 hover:bg-white/6 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold"
                          style={{ background: `${config.color}15`, color: config.color }}
                        >
                          {bill.name[0]}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-[#E8E8E8]">{bill.name}</div>
                          <div className="text-xs text-[#9ca3af]">{bill.dueDate}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div
                          className="hidden sm:flex items-center gap-1 text-xs px-2 py-1 rounded-lg"
                          style={{ color: config.color, background: `${config.color}15` }}
                        >
                          <config.icon className="w-3 h-3" />
                          {config.label}
                        </div>
                        <div className="text-sm font-semibold text-[#E8E8E8]">
                          ${bill.amount.toFixed(2)}
                        </div>
                        {bill.status !== "paid" && (
                          <button className="btn-primary py-1.5 px-3 text-xs">Pay</button>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </div>

          {/* Credit Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="glass p-6"
          >
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-[#4F8EF7]" />
                <h2 className="font-semibold text-[#E8E8E8]">Your Cards</h2>
              </div>
              <button className="text-xs text-[#4F8EF7] hover:text-[#7EB3FF] flex items-center gap-1">
                + Add Card
              </button>
            </div>
            <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
              {cards.map((card) => (
                <CreditCardVisual key={card.id} card={card} />
              ))}
            </div>
          </motion.div>

          {/* Spending Chart + Bills */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Spending Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="glass p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-[#4F8EF7]" />
                  <h2 className="font-semibold text-[#E8E8E8]">Spending by Category</h2>
                </div>
                <span className="text-xs text-[#9ca3af]">Last 6 months</span>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={spendingData} barSize={8} barCategoryGap="30%">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis
                    dataKey="month"
                    tick={{ fill: "#9ca3af", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: "#9ca3af", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
                  {[
                    { key: "Housing", color: "#4F8EF7" },
                    { key: "Food", color: "#22c55e" },
                    { key: "Entertainment", color: "#D4AF37" },
                    { key: "Transport", color: "#8b5cf6" },
                    { key: "Shopping", color: "#f97316" },
                  ].map((cat) => (
                    <Bar key={cat.key} dataKey={cat.key} stackId="a" fill={cat.color} radius={cat.key === "Shopping" ? [4, 4, 0, 0] : [0, 0, 0, 0]} />
                  ))}
                </BarChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-3 mt-4">
                {[
                  { label: "Housing", color: "#4F8EF7" },
                  { label: "Food", color: "#22c55e" },
                  { label: "Entertainment", color: "#D4AF37" },
                  { label: "Transport", color: "#8b5cf6" },
                  { label: "Shopping", color: "#f97316" },
                ].map((cat) => (
                  <div key={cat.label} className="flex items-center gap-1.5 text-xs text-[#9ca3af]">
                    <div className="w-2 h-2 rounded-full" style={{ background: cat.color }} />
                    {cat.label}
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Bills List */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="glass p-6"
            >
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#4F8EF7]" />
                  <h2 className="font-semibold text-[#E8E8E8]">Monthly Bills</h2>
                </div>
                <button className="text-xs text-[#4F8EF7] flex items-center gap-1">
                  + Add Bill
                </button>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {bills.map((bill, i) => {
                  const config = statusConfig[bill.status as keyof typeof statusConfig];
                  return (
                    <motion.div
                      key={bill.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 + i * 0.05 }}
                      className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0"
                          style={{ background: `${config.color}15`, color: config.color }}
                        >
                          {bill.name[0]}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-[#E8E8E8]">{bill.name}</div>
                          <div className="text-xs text-[#9ca3af]">{bill.category} · {bill.dueDate}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span
                          className="text-xs hidden sm:block"
                          style={{ color: config.color }}
                        >
                          {config.label}
                        </span>
                        <span className="text-sm font-semibold text-[#E8E8E8]">
                          ${bill.amount.toFixed(2)}
                        </span>
                        {bill.status !== "paid" && (
                          <button className="opacity-0 group-hover:opacity-100 text-xs text-[#4F8EF7] hover:text-[#7EB3FF] transition-all">
                            Pay
                          </button>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </div>

          {/* Utilities */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass p-6"
          >
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-[#4F8EF7]" />
                <h2 className="font-semibold text-[#E8E8E8]">Utilities This Month</h2>
              </div>
              <span className="text-xs text-[#9ca3af]">
                Total: ${utilities.reduce((s, u) => s + u.amount, 0).toFixed(2)}
              </span>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {utilities.map((util, i) => (
                <motion.div
                  key={util.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.45 + i * 0.07 }}
                  className="p-4 rounded-2xl border"
                  style={{
                    background: `${util.color}08`,
                    borderColor: `${util.color}20`,
                  }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center"
                      style={{ background: `${util.color}20` }}
                    >
                      <util.icon className="w-4.5 h-4.5" style={{ color: util.color }} />
                    </div>
                    <div
                      className="text-xs flex items-center gap-0.5"
                      style={{
                        color: util.trend > 0 ? "#ef4444" : util.trend < 0 ? "#22c55e" : "#9ca3af",
                      }}
                    >
                      {util.trend > 0 ? (
                        <TrendingUp className="w-3 h-3" />
                      ) : util.trend < 0 ? (
                        <TrendingDown className="w-3 h-3" />
                      ) : null}
                      {util.trend !== 0 ? `${Math.abs(util.trend)}%` : "Stable"}
                    </div>
                  </div>
                  <div className="text-[#9ca3af] text-xs mb-0.5">{util.name}</div>
                  <div className="font-display text-2xl font-bold text-[#E8E8E8]">
                    ${util.amount.toFixed(util.amount % 1 === 0 ? 0 : 2)}
                  </div>
                  <div className="text-xs text-[#9ca3af] mt-0.5">this month</div>
                </motion.div>
              ))}
            </div>
          </motion.div>

        </main>
      </div>
    </div>
  );
}
