"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import {
  LayoutDashboard, CreditCard, FileText, Zap, Bell, Settings, LogOut,
  TrendingUp, TrendingDown, CheckCircle2, Clock, AlertTriangle, Wallet,
  Menu, X, ChevronRight, Calendar, Droplets, Flame, Wifi, Lightbulb, Building2,
  Mic, Camera, Crown, Star, Sparkles,
} from "lucide-react";

import { CameraScanner } from "@/components/camera/CameraScanner";
import confetti from "canvas-confetti";

import Link from "next/link";
import { CountUp } from "@/components/ui/CountUp";
import { AnimatedSection, staggerItem } from "@/components/ui/AnimatedSection";
import { MotionButton } from "@/components/ui/MotionButton";
import { HealthScore } from "@/components/ui/HealthScore";
import { CardCarousel } from "@/components/ui/CardCarousel";
import { SpendingRing } from "@/components/ui/SpendingRing";
import { DebtTracker } from "@/components/ui/DebtTracker";
import { PaySuccessOverlay } from "@/components/ui/PaySuccessOverlay";
import { PaymentMethodModal } from "@/components/ui/PaymentMethodModal";
import { useApp } from "@/contexts/AppContext";
import { useToast } from "@/contexts/ToastContext";

// ── Static chart data ──────────────────────────────────────────────────────

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
  { id: "overview",  label: "Overview",  icon: LayoutDashboard, link: null  },
  { id: "cards",     label: "Cards",     icon: CreditCard,      link: null  },
  { id: "bills",     label: "Bills",     icon: FileText,        link: null  },
  { id: "utilities", label: "Utilities", icon: Zap,             link: null  },
  { id: "calendar",  label: "Calendar",  icon: Calendar,        link: null  },
  { id: "banks",     label: "Banks",     icon: Building2,       link: null  },
  { id: "alerts",    label: "Alerts",    icon: Bell,            link: null  },
  { id: "upgrade",   label: "Upgrade",   icon: Star,            link: "/pricing" },
  { id: "settings",  label: "Settings",  icon: Settings,        link: null  },
];

const statusConfig = {
  paid:     { label: "Paid",     color: "#22c55e", icon: CheckCircle2  },
  unpaid:   { label: "Unpaid",   color: "#9ca3af", icon: Clock         },
  due_soon: { label: "Due Soon", color: "#f59e0b", icon: AlertTriangle },
  overdue:  { label: "Overdue",  color: "#ef4444", icon: AlertTriangle },
};

const UTIL_ICONS: Record<string, typeof Lightbulb> = {
  electric: Lightbulb,
  water:    Droplets,
  gas:      Flame,
  internet: Wifi,
  phone:    Wifi,
  other:    Zap,
};

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

// ── Financial Calendar ─────────────────────────────────────────────────────

function FinancialCalendar() {
  const { bills, cards } = useApp();
  const [month] = useState(new Date(2026, 4)); // May 2026

  const year  = month.getFullYear();
  const mon   = month.getMonth();
  const firstDay = new Date(year, mon, 1).getDay();
  const daysInMonth = new Date(year, mon + 1, 0).getDate();
  const today = 13; // fixed for demo

  // Build event map: day -> events
  const events: Record<number, { name: string; amount: number; color: string; type: string }[]> = {};

  bills.forEach((b) => {
    const day = b.dueDay;
    if (!day) return;
    if (!events[day]) events[day] = [];
    const cfg = statusConfig[b.status];
    events[day].push({ name: b.name, amount: b.amount, color: cfg.color, type: "bill" });
  });

  cards.forEach((c) => {
    const day = c.dueDay;
    if (!day) return;
    if (!events[day]) events[day] = [];
    events[day].push({ name: c.name, amount: c.balance, color: c.color, type: "card" });
  });

  const blanks = Array.from({ length: firstDay });
  const days   = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const monthName = month.toLocaleString("default", { month: "long", year: "numeric" });

  return (
    <div className="glass p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-[#4F8EF7]" />
          <h2 className="font-semibold text-[#E8E8E8]">Financial Calendar</h2>
        </div>
        <span className="text-xs text-[#9ca3af]">{monthName}</span>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map((d) => (
          <div key={d} className="text-center text-xs text-[#9ca3af] py-1 font-medium">{d}</div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {blanks.map((_, i) => <div key={`b${i}`} />)}
        {days.map((day) => {
          const dayEvents = events[day] || [];
          const isToday   = day === today;
          return (
            <motion.div
              key={day}
              whileHover={{ scale: 1.04 }}
              className={`relative min-h-[52px] rounded-xl p-1.5 cursor-default transition-colors ${
                isToday
                  ? "bg-[#D4AF37]/15 border border-[#D4AF37]/40"
                  : dayEvents.length > 0
                  ? "bg-white/[0.04] border border-white/08 hover:bg-white/[0.07]"
                  : "hover:bg-white/[0.03]"
              }`}
            >
              <div className={`text-xs font-medium mb-1 ${isToday ? "text-[#D4AF37]" : "text-[#9ca3af]"}`}>
                {day}
              </div>
              {dayEvents.slice(0, 2).map((ev, i) => (
                <div key={i} className="truncate text-[9px] font-medium rounded px-1 py-0.5 mb-0.5"
                  style={{ background: `${ev.color}25`, color: ev.color }}>
                  {ev.name}
                </div>
              ))}
              {dayEvents.length > 2 && (
                <div className="text-[9px] text-[#9ca3af]">+{dayEvents.length - 2} more</div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-5 pt-4 border-t border-white/08 flex flex-wrap gap-4">
        {[
          { label: "Paid",     color: "#22c55e" },
          { label: "Due Soon", color: "#f59e0b" },
          { label: "Unpaid",   color: "#9ca3af" },
          { label: "Card Due", color: "#4F8EF7" },
        ].map((l) => (
          <div key={l.label} className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ background: l.color }} />
            <span className="text-xs text-[#9ca3af]">{l.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Smart Alerts Panel ─────────────────────────────────────────────────────

function SmartAlertsPanel() {
  const { bills, cards, utilities } = useApp();
  const { addToast } = useToast();

  const alerts = [
    ...bills.filter((b) => b.status === "due_soon").map((b) => ({
      id: b.id,
      type: "warning" as const,
      icon: AlertTriangle,
      color: "#f59e0b",
      title: `${b.name} due soon`,
      body: `$${b.amount.toFixed(2)} due on ${b.dueDate}`,
    })),
    ...cards.filter((c) => c.utilization > 40).map((c) => ({
      id: c.id,
      type: "warning" as const,
      icon: CreditCard,
      color: "#ef4444",
      title: `High utilization on ${c.name.split(" ").slice(0,2).join(" ")}`,
      body: `${c.utilization}% utilization may affect your credit score.`,
    })),
    ...utilities.filter((u) => u.trend > 10).map((u) => ({
      id: u.id,
      type: "info" as const,
      icon: TrendingUp,
      color: "#4F8EF7",
      title: `${u.name} bill up ${u.trend}%`,
      body: `Your ${u.name.toLowerCase()} bill is trending higher this month.`,
    })),
    {
      id: "tip1",
      type: "tip" as const,
      icon: Lightbulb,
      color: "#D4AF37",
      title: "Financial Tip",
      body: "Keeping utilization below 30% across all cards boosts your score significantly.",
    },
  ];

  return (
    <div className="glass p-6">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-[#4F8EF7]" />
          <h2 className="font-semibold text-[#E8E8E8]">Smart Alerts</h2>
        </div>
        <span className="text-xs text-[#9ca3af]">{alerts.length} active</span>
      </div>

      <div className="space-y-3">
        {alerts.map((a) => (
          <motion.div
            key={a.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-start gap-3 p-4 rounded-xl border transition-colors hover:bg-white/[0.04]"
            style={{ borderColor: `${a.color}25`, background: `${a.color}08` }}
          >
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: `${a.color}20` }}>
              <a.icon className="w-4 h-4" style={{ color: a.color }} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-[#E8E8E8] mb-0.5">{a.title}</div>
              <div className="text-xs text-[#9ca3af] leading-relaxed">{a.body}</div>
            </div>
            <button
              onClick={() => addToast({ type: a.type, title: a.title, message: a.body })}
              className="text-xs text-[#9ca3af] hover:text-[#E8E8E8] transition-colors shrink-0 mt-0.5"
            >
              <Bell className="w-3 h-3" />
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ── Dashboard ──────────────────────────────────────────────────────────────

function UpgradeModal({ onClose }: { onClose: () => void }) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[150] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 28 }}
          className="glass-gold w-full max-w-sm p-7 rounded-3xl text-center"
        >
          <div className="w-14 h-14 rounded-2xl bg-[#D4AF37]/20 flex items-center justify-center mx-auto mb-4">
            <Crown className="w-7 h-7 text-[#D4AF37]" />
          </div>
          <h3 className="font-display text-xl font-bold text-[#E8E8E8] mb-2">LifeFi Personal Feature</h3>
          <p className="text-sm text-[#9ca3af] mb-6 leading-relaxed">
            This feature is available on the LifeFi Personal plan ($4.99/mo). Upgrade for unlimited bills, voice input, camera scanning, and smart insights.
          </p>
          <div className="space-y-2">
            <Link href="/pricing">
              <button
                onClick={onClose}
                className="w-full py-3 rounded-xl font-semibold text-sm"
                style={{ background: "linear-gradient(135deg, #D4AF37, #b8962e)", color: "#0a0a0f" }}
              >
                <Star className="w-4 h-4 inline mr-1.5 -mt-0.5" />
                View Pricing Plans
              </button>
            </Link>
            <button
              onClick={onClose}
              className="w-full py-2 rounded-xl text-sm text-[#9ca3af] hover:text-[#E8E8E8] transition-colors border border-white/10"
            >
              Maybe Later
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default function DashboardPage() {
  const { bills, cards, utilities, connectedBanks, payBill, addBill, addCard, addUtility, userName } = useApp();
  const [activeNav, setActiveNav]     = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [payOverlay, setPayOverlay]   = useState<{ name: string; amount: number; method?: string } | null>(null);
  const [pendingBill, setPendingBill] = useState<typeof bills[0] | null>(null);
  const [cameraMode, setCameraMode]   = useState<"bill" | "card" | "utility" | null>(null);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [isPremium]                   = useState(true);  // demo: toggle to false to see free UX
  const [showBanner, setShowBanner]   = useState(true);

  const dueSoonCount  = bills.filter((b) => b.status === "due_soon").length;
  const notifications = dueSoonCount + cards.filter((c) => c.utilization > 40).length;

  const totalBalance  = cards.reduce((s, c) => s + c.balance, 0);
  const totalLimit    = cards.reduce((s, c) => s + c.limit, 0);
  const overallUtil   = totalLimit > 0 ? Math.round((totalBalance / totalLimit) * 100) : 0;
  const unpaidCount   = bills.filter((b) => b.status !== "paid").length;
  const upcomingBills = bills.filter((b) => b.status !== "paid").slice(0, 4);

  function handleCameraConfirm(result: { name: string; amount: number; dueDay: number; category: string; last4?: string; expiry?: string }) {
    const day = result.dueDay;
    const dueDateStr = `Due ${day}${["th","st","nd","rd"][((day%100)-20)%10]||["th","st","nd","rd"][day%100]||"th"}`;
    if (cameraMode === "card") {
      addCard({ name: result.name, last4: result.last4 ?? "0000", balance: 0, limit: result.amount, dueDate: dueDateStr, dueDay: day, color: "#4F8EF7", utilization: 0 });
    } else if (cameraMode === "utility") {
      addUtility({ name: result.name, amount: result.amount, trend: 0, color: "#f59e0b", category: "other" });
    } else {
      addBill({ name: result.name, amount: result.amount, dueDate: dueDateStr, dueDay: day, status: "unpaid", category: result.category, frequency: "monthly" });
    }
    setCameraMode(null);
  }

  const fireConfetti = useCallback(() => {
    const opts = { particleCount: 120, spread: 80, origin: { y: 0.55 } };
    confetti({ ...opts, colors: ["#4F8EF7", "#D4AF37", "#22c55e", "#fff"] });
    setTimeout(() => confetti({ ...opts, angle: 70,  origin: { x: 0, y: 0.55 } }), 150);
    setTimeout(() => confetti({ ...opts, angle: 110, origin: { x: 1, y: 0.55 } }), 300);
  }, []);

  function handlePay(bill: typeof bills[0]) {
    setPendingBill(bill);
  }

  function handlePayWithMethod(method: string) {
    if (!pendingBill) return;
    payBill(pendingBill.id);
    setPayOverlay({ name: pendingBill.name, amount: pendingBill.amount, method });
    fireConfetti();
    setPendingBill(null);
  }

  const carouselCards = cards.map((c) => ({
    id: c.id, name: c.name, last4: c.last4, balance: c.balance,
    limit: c.limit, dueDate: c.dueDate, color: c.color, utilization: c.utilization,
  }));

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

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item, i) => {
            const active = activeNav === item.id;
            return (
              <motion.div key={item.id} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + i * 0.06, duration: 0.4 }} className="relative">
                <AnimatePresence>
                  {active && (
                    <motion.div layoutId="nav-border"
                      initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} exit={{ scaleY: 0 }}
                      className="absolute left-0 top-1 bottom-1 w-0.5 rounded-full bg-gradient-to-b from-[#D4AF37] to-[#4F8EF7]" />
                  )}
                </AnimatePresence>
                {item.link ? (
                  <Link href={item.link} className="block">
                    <motion.div
                      whileHover={{ backgroundColor: "rgba(212,175,55,0.08)" }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => setSidebarOpen(false)}
                      className="w-full flex items-center gap-3 pl-4 pr-3 py-3 rounded-xl text-sm font-medium transition-colors text-[#D4AF37] border border-[#D4AF37]/20 bg-[#D4AF37]/[0.06]"
                    >
                      <item.icon className="w-4 h-4 shrink-0" />
                      {isPremium ? "My Plan" : item.label}
                      <span className="ml-auto text-[10px] font-bold bg-[#D4AF37] text-[#0a0a0f] px-1.5 py-0.5 rounded-full">
                        {isPremium ? "PERSONAL" : "FREE"}
                      </span>
                    </motion.div>
                  </Link>
                ) : (
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
                    {item.id === "alerts" && notifications > 0 && (
                      <span className="ml-auto w-5 h-5 rounded-full bg-[#ef4444] text-white text-xs flex items-center justify-center font-bold">
                        {notifications}
                      </span>
                    )}
                  </motion.button>
                )}
              </motion.div>
            );
          })}
        </nav>

        {/* User + Plan Card */}
        <div className="p-4 border-t border-white/5 space-y-3">
          {/* User row */}
          <div className="flex items-center gap-3 px-2">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#4F8EF7] to-[#D4AF37] flex items-center justify-center text-white text-sm font-bold shrink-0">
              JD
            </div>
            <div className="min-w-0">
              <div className="text-sm font-medium text-[#E8E8E8] truncate">{ userName || "My Account" }</div>
              <div className={`text-xs font-medium ${isPremium ? "text-[#D4AF37]" : "text-[#9ca3af]"}`}>
                {isPremium ? "LifeFi Personal" : "Free Plan"}
              </div>
            </div>
          </div>

          {/* Plan card */}
          <div className={`rounded-2xl p-3 border ${isPremium ? "border-[#D4AF37]/30 bg-[#D4AF37]/[0.06]" : "border-white/10 bg-white/[0.04]"}`}>
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${isPremium ? "bg-[#D4AF37]/20" : "bg-white/10"}`}>
                <Crown className={`w-3.5 h-3.5 ${isPremium ? "text-[#D4AF37]" : "text-[#9ca3af]"}`} />
              </div>
              <div>
                <div className={`text-xs font-bold ${isPremium ? "text-[#D4AF37]" : "text-[#E8E8E8]"}`}>
                  {isPremium ? "LifeFi Personal" : "Free Plan"}
                </div>
                {isPremium && <div className="text-[10px] text-[#9ca3af]">$4.99/mo</div>}
              </div>
            </div>
            <Link href="/pricing">
              <button className={`w-full py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                isPremium
                  ? "border border-white/10 text-[#9ca3af] hover:text-[#E8E8E8]"
                  : "text-[#0a0a0f]"
              }`}
                style={!isPremium ? { background: "linear-gradient(135deg, #D4AF37, #b8962e)" } : undefined}
              >
                {isPremium ? "Manage Plan" : "⭐ Upgrade to Premium"}
              </button>
            </Link>
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
                <h1 className="font-display text-xl font-bold text-[#E8E8E8]">{ `Good morning, ${ userName?.split(" ")[0] || "there" } 👋` }</h1>
                <p className="text-xs text-[#9ca3af]">Tuesday, May 13, 2026</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              {/* BIG CAMERA BUTTON */}
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => isPremium ? setCameraMode("card") : setShowUpgrade(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm"
                style={{
                  background: "linear-gradient(135deg, #D4AF37, #b8962e)",
                  color: "#0a0a0f",
                  boxShadow: "0 0 18px rgba(212,175,55,0.40)",
                }}
              >
                <Camera className="w-4 h-4" />
                <span className="hidden sm:inline">📷 Add a Card</span>
                <span className="sm:hidden">📷</span>
              </motion.button>
              <Link href="/pricing" className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#D4AF37]/30 hover:bg-[#D4AF37]/10 transition-colors">
                <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span className="text-xs font-semibold text-[#D4AF37]">Plans</span>
              </Link>
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

          {/* ── Calendar view ─────────────────────────────────────────── */}
          {activeNav === "calendar" && (
            <AnimatedSection>
              <FinancialCalendar />
            </AnimatedSection>
          )}

          {/* ── Alerts view ───────────────────────────────────────────── */}
          {activeNav === "alerts" && (
            <AnimatedSection>
              <SmartAlertsPanel />
            </AnimatedSection>
          )}

          {/* ── Overview ──────────────────────────────────────────────── */}
          {activeNav === "overview" && (
            <>
              {/* ── Upgrade banner (free users only) ──────────────────── */}
              {!isPremium && showBanner && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="relative flex items-center justify-between gap-4 px-5 py-3.5 rounded-2xl overflow-hidden"
                  style={{ background: "linear-gradient(135deg, #D4AF37 0%, #b8962e 50%, #8a6d1c 100%)" }}
                >
                  <div className="flex items-center gap-3">
                    <Star className="w-5 h-5 text-[#0a0a0f] shrink-0" />
                    <div>
                      <div className="text-sm font-bold text-[#0a0a0f]">Upgrade to LifeFi Personal</div>
                      <div className="text-xs text-[#0a0a0f]/70">Connect your bank, use voice &amp; camera features — $4.99/mo</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Link href="/pricing">
                      <button className="px-4 py-1.5 rounded-xl text-xs font-bold bg-[#0a0a0f] text-[#D4AF37] hover:bg-[#0a0a0f]/80 transition-colors whitespace-nowrap">
                        Upgrade Now
                      </button>
                    </Link>
                    <button onClick={() => setShowBanner(false)} className="text-[#0a0a0f]/60 hover:text-[#0a0a0f] transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* ── Take a Picture hero card ───────────────────────────── */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.05 }}
                className="relative rounded-3xl overflow-hidden border border-[#D4AF37]/40 p-6"
                style={{ background: "linear-gradient(135deg, rgba(212,175,55,0.08) 0%, rgba(79,142,247,0.05) 100%)" }}
              >
                {/* Pulse glow */}
                <motion.div
                  animate={{ scale: [1, 1.15, 1], opacity: [0.15, 0.35, 0.15] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute inset-0 rounded-3xl"
                  style={{ background: "radial-gradient(circle at 50% 40%, #D4AF37 0%, transparent 65%)", pointerEvents: "none" }}
                />

                <div className="relative z-10">
                  {/* Icon */}
                  <div className="flex justify-center mb-3">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
                      style={{ background: "linear-gradient(135deg, #D4AF37, #b8962e)" }}>
                      <Camera className="w-8 h-8 text-[#0a0a0f]" />
                    </div>
                  </div>

                  {/* Text */}
                  <div className="text-center mb-5">
                    <h2 className="font-display text-xl font-bold text-[#E8E8E8] mb-1">📷 Take a Picture to Add</h2>
                    <p className="text-sm text-[#9ca3af]">Snap a credit card, bill, or utility statement</p>
                  </div>

                  {/* Pill buttons */}
                  <div className="flex gap-3 justify-center flex-wrap">
                    {[
                      { label: "💳 Credit Card", mode: "card"    as const, color: "#4F8EF7" },
                      { label: "🧾 Bill",         mode: "bill"    as const, color: "#D4AF37" },
                      { label: "⚡ Utility",      mode: "utility" as const, color: "#f59e0b" },
                    ].map(({ label, mode, color }) => (
                      <motion.button
                        key={mode}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => isPremium ? setCameraMode(mode) : setShowUpgrade(true)}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold border transition-all"
                        style={{ borderColor: `${color}50`, background: `${color}15`, color }}
                      >
                        {label}
                      </motion.button>
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* KPI Row */}
              <motion.div variants={staggerContainer} initial="hidden" animate="visible"
                className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: "Total Balance",  value: totalBalance,  prefix: "$", sub: `Across ${cards.length} card${cards.length !== 1 ? "s" : ""}`, trend: "neutral", trendVal: "—" },
                  { label: "Credit Used",    value: overallUtil,   suffix: "%", sub: `$${totalBalance.toLocaleString()} of limit`,                   trend: "neutral", trendVal: "utilization" },
                  { label: "Bills Due",      value: unpaidCount,   prefix: "",  sub: "This month",                                                   trend: "neutral", trendVal: `${bills.filter(b=>b.status==="paid").length} paid` },
                  { label: "Monthly Spend",  value: 0,             prefix: "$", sub: "No data yet",                                                  trend: "neutral", trendVal: "—" },
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

              {/* Connected Accounts */}
              <AnimatedSection className="glass p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-[#D4AF37]" />
                    <h2 className="font-semibold text-[#E8E8E8]">Your Connected Accounts</h2>
                  </div>
                  <Link href="/connect">
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold"
                      style={{ background: "linear-gradient(135deg, #D4AF37, #b8962e)", color: "#0a0a0f" }}
                    >
                      {connectedBanks.length > 0 ? "Manage" : "+ Connect Bank"}
                    </motion.button>
                  </Link>
                </div>

                {connectedBanks.length === 0 ? (
                  <div className="flex flex-col sm:flex-row items-center gap-5 py-2">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-[#E8E8E8] mb-1">Connect your bank account</div>
                      <div className="text-xs text-[#9ca3af] leading-relaxed">
                        See real balances and transactions from 12,000+ banks. Powered by Plaid — bank-level security, read-only access.
                      </div>
                    </div>
                    <Link href="/connect" className="shrink-0">
                      <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm"
                        style={{ background: "linear-gradient(135deg, #D4AF37, #b8962e)", color: "#0a0a0f" }}
                      >
                        <Building2 className="w-4 h-4" />
                        Connect Bank
                      </motion.button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {connectedBanks.map((bank) => {
                      const totalBal = bank.accounts.reduce((s, a) => s + (a.current_balance ?? 0), 0);
                      return (
                        <div key={bank.institutionId}
                          className="flex items-center justify-between p-3 rounded-xl bg-white/[0.04]">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-[#22c55e]/20 flex items-center justify-center">
                              <CheckCircle2 className="w-4 h-4 text-[#22c55e]" />
                            </div>
                            <div>
                              <div className="text-sm font-medium text-[#E8E8E8]">{bank.institutionName}</div>
                              <div className="text-xs text-[#9ca3af]">{bank.accounts.length} account{bank.accounts.length !== 1 ? "s" : ""}</div>
                            </div>
                          </div>
                          <div className="text-sm font-bold text-[#E8E8E8]">
                            ${Math.abs(totalBal).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </div>
                        </div>
                      );
                    })}
                    <Link href="/connect" className="block">
                      <div className="text-xs text-center text-[#D4AF37] hover:text-[#b8962e] transition-colors py-1">
                        + Connect another bank
                      </div>
                    </Link>
                  </div>
                )}
              </AnimatedSection>

              {/* Health Score + Upcoming */}
              <div className="grid lg:grid-cols-3 gap-6">
                <AnimatedSection className="glass-gold p-6 flex flex-col items-center text-center">
                  <div className="text-sm font-medium text-[#D4AF37] mb-4">Financial Health Score</div>
                  <HealthScore score={87} />
                  <div className="w-full mt-5 space-y-2 text-left">
                    {[
                      { label: "Payment History", val: 95, color: "#22c55e" },
                      { label: "Utilization",      val: overallUtil, color: "#4F8EF7" },
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

                {/* Upcoming bills */}
                <AnimatedSection className="glass p-6 lg:col-span-2">
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-[#4F8EF7]" />
                      <h2 className="font-semibold text-[#E8E8E8]">Upcoming Payments</h2>
                    </div>
                    <MotionButton variant="ghost" onClick={() => setActiveNav("calendar")}
                      className="text-xs text-[#4F8EF7] border-0 py-1 px-2 flex items-center gap-1">
                      View Calendar <ChevronRight className="w-3 h-3" />
                    </MotionButton>
                  </div>
                  <motion.div variants={staggerContainer} initial="hidden" whileInView="visible"
                    viewport={{ once: true }} className="space-y-3">
                    {upcomingBills.map((bill) => {
                      const cfg = statusConfig[bill.status as keyof typeof statusConfig];
                      return (
                        <motion.div key={bill.id} variants={staggerItem} layout
                          className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] transition-colors">
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

              {/* Card Carousel */}
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
                <CardCarousel cards={carouselCards} />
              </AnimatedSection>

              {/* Spending Ring + Bar Chart + Bills */}
              <div className="grid lg:grid-cols-2 gap-6">
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
                        <YAxis tick={{ fill: "#9ca3af", fontSize: 10 }} axisLine={false} tickLine={false}
                          tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
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
                  <motion.div variants={staggerContainer} initial="hidden" whileInView="visible"
                    viewport={{ once: true }} className="space-y-1 max-h-[400px] overflow-y-auto pr-1">
                    {bills.map((bill) => {
                      const cfg = statusConfig[bill.status as keyof typeof statusConfig];
                      return (
                        <motion.div key={bill.id} variants={staggerItem} layout
                          animate={bill.status === "paid" ? { opacity: 0.55 } : { opacity: 1 }}
                          className="flex items-center justify-between p-3 rounded-xl hover:bg-white/[0.04] transition-colors group">
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
                            {bill.status !== "paid" ? (
                              <MotionButton variant="pay" className="opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => handlePay(bill)}>Pay</MotionButton>
                            ) : (
                              <CheckCircle2 className="w-4 h-4 text-[#22c55e] shrink-0" />
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                  </motion.div>
                </AnimatedSection>
              </div>

              {/* Utilities */}
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
                <motion.div variants={staggerContainer} initial="hidden" whileInView="visible"
                  viewport={{ once: true }} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {utilities.map((util) => {
                    const UtilIcon = UTIL_ICONS[util.category] ?? Zap;
                    return (
                      <motion.div key={util.id} variants={staggerItem} className="p-4 rounded-2xl border"
                        style={{ background: `${util.color}08`, borderColor: `${util.color}20` }}>
                        <div className="flex items-center justify-between mb-3">
                          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${util.color}20` }}>
                            <UtilIcon className="w-4 h-4" style={{ color: util.color }} />
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
                    );
                  })}
                </motion.div>
              </AnimatedSection>

              {/* Debt Payoff Tracker */}
              <AnimatedSection className="glass p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <TrendingDown className="w-4 h-4 text-[#4F8EF7]" />
                    <h2 className="font-semibold text-[#E8E8E8]">Debt Payoff Tracker</h2>
                  </div>
                  <span className="text-xs text-[#9ca3af]">
                    Total owed: $<CountUp to={totalBalance} duration={1.3} />
                  </span>
                </div>
                <DebtTracker
                  items={cards.map((c) => ({
                    id: c.id, name: c.name, balance: c.balance, limit: c.limit, color: c.color,
                  }))}
                />
              </AnimatedSection>
            </>
          )}

          {/* ── Cards view ────────────────────────────────────────────── */}
          {activeNav === "cards" && (
            <AnimatedSection className="space-y-4">
              {/* Camera scan button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => isPremium ? setCameraMode("card") : setShowUpgrade(true)}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl font-semibold text-sm"
                style={{ background: "linear-gradient(135deg, #D4AF37, #b8962e)", color: "#0a0a0f" }}
              >
                <Camera className="w-4 h-4" />
                📷 Scan Credit Card to Add
              </motion.button>

              <div className="glass p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-[#4F8EF7]" />
                    <h2 className="font-semibold text-[#E8E8E8]">All Cards</h2>
                  </div>
                </div>
                <CardCarousel cards={carouselCards} />
                <div className="mt-6">
                  <DebtTracker
                    items={cards.map((c) => ({
                      id: c.id, name: c.name, balance: c.balance, limit: c.limit, color: c.color,
                    }))}
                  />
                </div>
              </div>
            </AnimatedSection>
          )}

          {/* ── Bills view ────────────────────────────────────────────── */}
          {activeNav === "bills" && (
            <AnimatedSection className="space-y-4">
              {/* Voice + Camera row */}
              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => isPremium ? window.dispatchEvent(new Event("lifefi:startVoice")) : setShowUpgrade(true)}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-semibold text-sm"
                  style={{ background: "linear-gradient(135deg, #D4AF37, #b8962e)", color: "#0a0a0f" }}
                >
                  <Mic className="w-4 h-4" />
                  Add Bills by Voice
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => isPremium ? setCameraMode("bill") : setShowUpgrade(true)}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-bold text-sm"
                  style={{ background: "linear-gradient(135deg, #4F8EF7, #3a6fd8)", color: "#fff" }}
                >
                  <Camera className="w-4 h-4" />
                  📷 Scan a Bill
                </motion.button>
              </div>

              <div className="glass p-6">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#4F8EF7]" />
                  <h2 className="font-semibold text-[#E8E8E8]">All Bills</h2>
                </div>
                <span className="text-xs text-[#9ca3af]">
                  {bills.filter(b => b.status === "paid").length}/{bills.length} paid
                </span>
              </div>
              <div className="space-y-2">
                {bills.map((bill) => {
                  const cfg = statusConfig[bill.status as keyof typeof statusConfig];
                  return (
                    <motion.div key={bill.id} layout
                      animate={bill.status === "paid" ? { opacity: 0.55 } : { opacity: 1 }}
                      className="flex items-center justify-between p-3 rounded-xl hover:bg-white/[0.04] transition-colors group">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0"
                          style={{ background: `${cfg.color}15`, color: cfg.color }}>
                          {bill.name[0]}
                        </div>
                        <div>
                          <div className={`text-sm font-medium ${bill.status === "paid" ? "line-through text-[#9ca3af]" : "text-[#E8E8E8]"}`}>
                            {bill.name}
                          </div>
                          <div className="text-xs text-[#9ca3af]">{bill.category} · {bill.dueDate} · {bill.frequency}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="hidden sm:flex items-center gap-1 text-xs px-2 py-1 rounded-lg"
                          style={{ color: cfg.color, background: `${cfg.color}15` }}>
                          <cfg.icon className="w-3 h-3" />
                          {cfg.label}
                        </div>
                        <span className="text-sm font-semibold text-[#E8E8E8]">${bill.amount.toFixed(2)}</span>
                        {bill.status !== "paid" ? (
                          <MotionButton variant="pay" className="opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => handlePay(bill)}>Pay</MotionButton>
                        ) : (
                          <CheckCircle2 className="w-4 h-4 text-[#22c55e] shrink-0" />
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
              </div>
            </AnimatedSection>
          )}

          {/* ── Utilities view ────────────────────────────────────────── */}
          {activeNav === "utilities" && (
            <AnimatedSection className="glass p-6">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-[#4F8EF7]" />
                  <h2 className="font-semibold text-[#E8E8E8]">All Utilities</h2>
                </div>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {utilities.map((util) => {
                  const UtilIcon = UTIL_ICONS[util.category] ?? Zap;
                  return (
                    <div key={util.id} className="p-5 rounded-2xl border"
                      style={{ background: `${util.color}08`, borderColor: `${util.color}20` }}>
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${util.color}20` }}>
                          <UtilIcon className="w-5 h-5" style={{ color: util.color }} />
                        </div>
                        <div className="text-sm flex items-center gap-1"
                          style={{ color: util.trend > 0 ? "#ef4444" : util.trend < 0 ? "#22c55e" : "#9ca3af" }}>
                          {util.trend > 0 ? <TrendingUp className="w-3.5 h-3.5" /> : util.trend < 0 ? <TrendingDown className="w-3.5 h-3.5" /> : null}
                          {util.trend !== 0 ? `${Math.abs(util.trend)}% vs last month` : "No change"}
                        </div>
                      </div>
                      <div className="text-[#9ca3af] text-sm mb-1">{util.name}</div>
                      <div className="font-display text-3xl font-bold text-[#E8E8E8]">
                        $<CountUp to={util.amount} decimals={util.amount % 1 !== 0 ? 2 : 0} duration={1.2} />
                      </div>
                      <div className="text-xs text-[#9ca3af] mt-1">this month</div>
                    </div>
                  );
                })}
              </div>
            </AnimatedSection>
          )}

          {/* ── Banks view ────────────────────────────────────────────── */}
          {activeNav === "banks" && (
            <AnimatedSection>
              <div className="glass p-6 rounded-3xl space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-[#D4AF37]" />
                    <h2 className="font-semibold text-[#E8E8E8]">Connected Bank Accounts</h2>
                  </div>
                  <span className="text-xs text-[#9ca3af]">
                    {connectedBanks.reduce((s, b) => s + b.accounts.length, 0)} account{connectedBanks.reduce((s, b) => s + b.accounts.length, 0) !== 1 ? "s" : ""}
                  </span>
                </div>

                {connectedBanks.length === 0 && (
                  <div className="text-center py-8 space-y-4">
                    <div className="w-16 h-16 rounded-3xl bg-[#D4AF37]/20 flex items-center justify-center mx-auto">
                      <Building2 className="w-7 h-7 text-[#D4AF37]" />
                    </div>
                    <div>
                      <div className="font-semibold text-[#E8E8E8] mb-1">No banks connected yet</div>
                      <div className="text-sm text-[#9ca3af]">Connect your bank to see real balances and transactions.</div>
                    </div>
                    <Link href="/connect">
                      <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm"
                        style={{ background: "linear-gradient(135deg, #D4AF37, #b8962e)", color: "#0a0a0f" }}
                      >
                        <Building2 className="w-4 h-4" />
                        + Connect Bank
                      </motion.button>
                    </Link>
                  </div>
                )}

                {connectedBanks.length > 0 && (
                  <div className="pt-2 border-t border-white/08">
                    <div className="text-xs text-[#9ca3af] mb-3">All Accounts</div>
                    <div className="space-y-2">
                      {connectedBanks.flatMap((bank) =>
                        bank.accounts.map((acc) => {
                          const bal = acc.current_balance ?? acc.available_balance;
                          return (
                            <div key={acc.account_id}
                              className="flex items-center justify-between p-3 rounded-xl bg-white/[0.04]">
                              <div className="flex items-center gap-3">
                                <div className="w-7 h-7 rounded-lg bg-[#4F8EF7]/20 flex items-center justify-center">
                                  <CreditCard className="w-3.5 h-3.5 text-[#4F8EF7]" />
                                </div>
                                <div>
                                  <div className="text-sm font-medium text-[#E8E8E8]">{acc.name}</div>
                                  <div className="text-xs text-[#9ca3af]">
                                    {bank.institutionName}{acc.mask ? ` ····${acc.mask}` : ""}
                                  </div>
                                </div>
                              </div>
                              <div className="text-sm font-bold text-[#E8E8E8]">
                                {bal !== null
                                  ? `$${Math.abs(bal).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                                  : "—"}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}
              </div>
            </AnimatedSection>
          )}

          {/* ── Settings placeholder ──────────────────────────────────── */}
          {activeNav === "settings" && (
            <AnimatedSection className="glass p-8 text-center">
              <Settings className="w-12 h-12 text-[#9ca3af] mx-auto mb-4" />
              <h2 className="font-display text-xl font-bold text-[#E8E8E8] mb-2">Settings</h2>
              <p className="text-[#9ca3af] text-sm">Preferences and account settings coming soon.</p>
            </AnimatedSection>
          )}

        </main>
      </div>

      {/* ── Payment Method Picker ────────────────────────────────────────── */}
      <PaymentMethodModal
        visible={pendingBill !== null}
        billName={pendingBill?.name ?? ""}
        amount={pendingBill?.amount ?? 0}
        onSelect={handlePayWithMethod}
        onClose={() => setPendingBill(null)}
      />

      {/* ── Pay Success Overlay ──────────────────────────────────────────── */}
      <PaySuccessOverlay
        visible={payOverlay !== null}
        billName={payOverlay?.name ?? ""}
        amount={payOverlay?.amount ?? 0}
        method={payOverlay?.method}
        onDone={() => setPayOverlay(null)}
      />

      {/* ── Camera Scanner ───────────────────────────────────────────────── */}
      {cameraMode && (
        <CameraScanner
          mode={cameraMode}
          onConfirm={handleCameraConfirm}
          onClose={() => setCameraMode(null)}
        />
      )}

      {/* ── Upgrade Modal ────────────────────────────────────────────────── */}
      {showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)} />}
    </div>
  );
}
