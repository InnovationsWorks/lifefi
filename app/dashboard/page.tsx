"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { clearBiometricData } from "@/lib/webauthn";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import {
  LayoutDashboard, CreditCard, FileText, Zap, Bell, Settings, LogOut,
  TrendingUp, TrendingDown, CheckCircle2, Clock, AlertTriangle,
  ChevronRight, Calendar, Droplets, Flame, Wifi, Lightbulb, Building2,
  Mic, Crown, Star, Sparkles, Menu, X,
} from "lucide-react";

import confetti from "canvas-confetti";

import Link from "next/link";
import Image from "next/image";
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
  { id: "settings",  label: "Settings",  icon: Settings,        link: null  },
];

const PLAN_CONFIG = {
  personal: { name: "LifeFi Personal", price: "$4.99/mo", badge: "PERSONAL" },
  bizfi:    { name: "LifeFi Business", price: "$7.99/mo", badge: "BUSINESS" },
  duo:      { name: "LifeFi Duo",      price: "$9.99/mo", badge: "DUO"      },
} as const;
type PlanKey = keyof typeof PLAN_CONFIG;

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
  const now = new Date();
  const [month] = useState(new Date(now.getFullYear(), now.getMonth()));

  const year  = month.getFullYear();
  const mon   = month.getMonth();
  const firstDay = new Date(year, mon, 1).getDay();
  const daysInMonth = new Date(year, mon + 1, 0).getDate();
  const today = now.getDate();

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
  const { bills, cards, utilities, connectedBanks, payBill, userName } = useApp();
  const [activeNav, setActiveNav]     = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [payOverlay, setPayOverlay]   = useState<{ name: string; amount: number; method?: string } | null>(null);
  const [pendingBill, setPendingBill] = useState<typeof bills[0] | null>(null);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [userProfile, setUserProfile] = useState<{ subscription_tier: string; email?: string; full_name?: string } | null>(null);
  const [activating, setActivating]   = useState(false);
  const router = useRouter();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const upgraded = params.get('upgraded') === 'true';
    if (upgraded) setActivating(true);

    const fetchProfile = () =>
      fetch('/api/user/profile')
        .then(r => r.ok ? r.json() : null)
        .then(data => {
          if (data?.profile) {
            setUserProfile(data.profile);
            return data.profile.subscription_tier as string;
          }
          return 'personal';
        })
        .catch(() => 'personal');

    if (upgraded) {
      // Poll until subscription_tier changes from 'personal' to a higher tier (webhook may lag)
      let attempts = 0;
      const poll = async () => {
        const tier = await fetchProfile();
        attempts++;
        if (tier !== 'personal' || attempts >= 10) {
          setActivating(false);
          window.history.replaceState({}, '', '/dashboard');
        } else {
          setTimeout(poll, 2000);
        }
      };
      setTimeout(poll, 1500);
    } else {
      fetchProfile();
    }
  }, []);

  const isPremium   = ['personal', 'bizfi', 'duo'].includes(userProfile?.subscription_tier ?? '');
  const currentPlan = PLAN_CONFIG[userProfile?.subscription_tier as PlanKey] ?? null;
  const planName    = currentPlan?.name  ?? 'Free Plan';
  const planPrice   = currentPlan?.price ?? '';
  const planBadge   = currentPlan?.badge ?? 'FREE';
  const userInitials = (() => {
    const n = userProfile?.full_name?.trim();
    if (n) {
      const p = n.split(' ').filter(Boolean);
      return (p.length >= 2 ? p[0][0] + p[p.length - 1][0] : n.slice(0, 2)).toUpperCase();
    }
    return (userProfile?.email?.[0] ?? '?').toUpperCase();
  })();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    clearBiometricData();
    router.push('/login');
  }

  const dueSoonCount  = bills.filter((b) => b.status === "due_soon").length;
  const notifications = dueSoonCount + cards.filter((c) => c.utilization > 40).length;

  const totalBalance  = cards.reduce((s, c) => s + c.balance, 0);
  const totalLimit    = cards.reduce((s, c) => s + c.limit, 0);
  const overallUtil   = totalLimit > 0 ? Math.round((totalBalance / totalLimit) * 100) : 0;
  const unpaidCount   = bills.filter((b) => b.status !== "paid").length;
  const upcomingBills = bills.filter((b) => b.status !== "paid").slice(0, 4);

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
    <div className="h-screen bg-[#0a0a0f] flex overflow-hidden">

      {/* ── Mobile: fixed logo + hamburger top-left — hidden while sidebar is open ── */}
      <div className={`fixed top-0 left-0 z-[70] md:hidden flex flex-col items-center gap-3 p-3 ${sidebarOpen ? "hidden" : ""}`}>
        <Image src="/images/logos/LifeFi_Icon_Only_TRUE.svg" alt="LifeFi" width={44} height={44} />
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={() => setSidebarOpen(true)}
          className="text-[#9ca3af] hover:text-[#E8E8E8] transition-colors p-1"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </motion.button>
      </div>

      {/* ── Mobile backdrop ───────────────────────────────────────────────── */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-30 bg-black/60 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* ── Sidebar ───────────────────────────────────────────────────────── */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-40 w-64 flex-shrink-0 flex flex-col
        bg-[#0d0d14] border-r border-white/5
        transform transition-transform duration-300 ease-in-out
        md:translate-x-0
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        {/* Logo + close on mobile */}
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-white/5">
          <Image src="/images/logos/LifeFi_Icon_Only_TRUE.svg" alt="LifeFi" width={56} height={56} style={{ mixBlendMode: "lighten" }} />
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden text-[#9ca3af] hover:text-[#E8E8E8] transition-colors p-1"
            aria-label="Close menu"
          >
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
                  <Link href={item.link} className="block" onClick={() => setSidebarOpen(false)}>
                    <motion.div
                      whileHover={{ backgroundColor: "rgba(212,175,55,0.08)" }}
                      whileTap={{ scale: 0.97 }}
                      className="w-full flex items-center justify-start gap-3 pl-4 pr-3 py-3 rounded-xl text-sm font-medium transition-colors text-[#D4AF37] border border-[#D4AF37]/20 bg-[#D4AF37]/[0.06]"
                    >
                      <item.icon className="w-4 h-4 shrink-0" />
                      <span>{isPremium ? "My Plan" : item.label}</span>
                      <span className="ml-auto text-[10px] font-bold bg-[#D4AF37] text-[#0a0a0f] px-1.5 py-0.5 rounded-full">
                        {planBadge}
                      </span>
                    </motion.div>
                  </Link>
                ) : (
                  <motion.button
                    whileHover={{ backgroundColor: "rgba(255,255,255,0.05)" }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => { setActiveNav(item.id); setSidebarOpen(false); }}
                    className={[
                      "w-full flex items-center justify-start gap-3 pl-4 pr-3 py-3 rounded-xl text-sm font-medium transition-colors",
                      active
                        ? "bg-[#4F8EF7]/10 text-[#4F8EF7] border border-[#4F8EF7]/20"
                        : "text-[#9ca3af] hover:text-[#E8E8E8]",
                    ].join(" ")}
                  >
                    <item.icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
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
        <div className="border-t border-white/5">
          {/* Consolidated plan card + sign out */}
          <div className="p-4 space-y-2">
            <div className="rounded-2xl p-3 border border-[#D4AF37]/30 bg-[#D4AF37]/[0.06]">
              {/* 3-col grid: icon | label+price | badge */}
              <div className="grid grid-cols-[16px_1fr_auto] gap-x-2 mb-2.5">
                {/* Row 1 */}
                <Star className="w-3.5 h-3.5 text-[#D4AF37] mt-0.5 shrink-0" />
                <span className="text-xs font-semibold text-[#E8E8E8] leading-tight">My {planName}</span>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-[#D4AF37] text-[#0a0a0f] whitespace-nowrap self-start leading-tight">
                  1st Month Free
                </span>
                {/* Row 2 */}
                <span />
                <span className="text-[10px] text-[#9ca3af] leading-tight">{planPrice || "$4.99/mo"}</span>
                <span />
              </div>
              <Link href="/pricing">
                <button className="w-full py-1.5 rounded-xl text-xs font-semibold border border-white/10 text-[#9ca3af] hover:text-[#E8E8E8] transition-colors">
                  Manage Plan
                </button>
              </Link>
            </div>
            <button onClick={handleSignOut} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-[#9ca3af] hover:text-[#E8E8E8] rounded-xl transition-colors">
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main ──────────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Header — identical layout on mobile and desktop */}
        <header className="sticky top-0 z-20 bg-[#0a0a0f]/90 backdrop-blur-md border-b border-white/5 px-3 md:px-6 py-3 md:py-4">
          <div className="grid grid-cols-3 items-start gap-1">
            {/* Col 1: greeting top-left — pl-16 on mobile clears fixed logo+hamburger */}
            <div className="flex flex-col justify-start pt-1 pl-16 md:pl-0">
              <h1 className="font-display text-sm md:text-base font-bold text-[#E8E8E8] leading-tight">Hello, 👋</h1>
              <p className="font-display text-sm md:text-base font-bold text-[#E8E8E8] leading-tight">{userProfile?.full_name?.split(" ")[0] || userName?.split(" ")[0] || "there"}</p>
              <p className="text-[10px] md:text-xs text-[#9ca3af] mt-2 md:mt-1">{new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p>
            </div>
            {/* Col 2: logo + tagline centered */}
            <div className="flex flex-col items-center">
              <div style={{ animation: "lf-rise 0.8s ease-out both" }}>
                <Image
                  src="/images/logos/LifeFi_Logo_text_SVG.svg"
                  alt="LifeFi"
                  width={160}
                  height={160}
                  style={{ mixBlendMode: "lighten", width: "auto", height: "160px" }}
                />
              </div>
              <p
                className="text-[#E8E8E8] text-center leading-snug mt-0.5"
                style={{ fontFamily: "sans-serif", fontSize: "18px", animation: "lf-rise-sm 0.6s ease-out 0.8s both" }}
              >
                <span style={{ display: "block", whiteSpace: "nowrap" }}>Your Financial Freedom,</span>
                <span style={{ display: "block", whiteSpace: "nowrap" }}>In One Place</span>
              </p>
            </div>
            {/* Col 3: right actions */}
            <div className="flex items-center justify-end gap-1.5 md:gap-2.5 pt-1">
              <Link href="/pricing" className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#D4AF37]/30 hover:bg-[#D4AF37]/10 transition-colors">
                <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span className="text-xs font-semibold text-[#D4AF37]">Plans</span>
              </Link>
              <MotionButton variant="ghost" className="relative p-1.5 md:p-2 border-white/10 rounded-xl !py-1.5 !px-1.5 md:!py-2 md:!px-2">
                <Bell className="w-4 h-4 text-[#9ca3af]" />
                {notifications > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#ef4444] text-white text-xs flex items-center justify-center font-bold">
                    {notifications}
                  </span>
                )}
              </MotionButton>
              <div className="w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0" style={{ background: "linear-gradient(135deg, #E8834A, #D4601A)", color: "#FFF8F0" }}>
                {userInitials}
              </div>
            </div>
          </div>
        </header>

        {/* Body */}
        <main className="flex-1 overflow-y-auto p-6 space-y-6" style={{ WebkitOverflowScrolling: "touch" }}>

          {/* ── Activating plan banner ────────────────────────────────── */}
          {activating && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 px-5 py-3 rounded-2xl border border-[#D4AF37]/40"
              style={{ background: "rgba(212,175,55,0.08)" }}
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
                className="w-4 h-4 rounded-full border-2 border-[#D4AF37] border-t-transparent shrink-0"
              />
              <span className="text-sm font-medium text-[#D4AF37]">Activating your plan — this takes a few seconds…</span>
            </motion.div>
          )}

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
              {/* ── Add quick-add strip ───────────────────────────────── */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.05 }}
                className="rounded-3xl border border-[#D4AF37]/40 px-4 py-3 mx-auto w-fit"
                style={{ background: "linear-gradient(135deg, rgba(212,175,55,0.08) 0%, rgba(79,142,247,0.05) 100%)" }}
              >
                <div className="flex gap-2 justify-center flex-nowrap">
                  {[
                    { label: "💳 Credit Card", mode: "card"    as const, color: "#4F8EF7" },
                    { label: "🧾 Bill",         mode: "bill"    as const, color: "#D4AF37" },
                    { label: "⚡ Utility",      mode: "utility" as const, color: "#f59e0b" },
                  ].map(({ label, mode, color }) => (
                    <motion.button
                      key={mode}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => window.dispatchEvent(new CustomEvent("lifefi:openAdd", { detail: { sheet: mode } }))}
                      className="flex items-center gap-1.5 px-3 md:px-5 py-1.5 md:py-2.5 rounded-full font-semibold border transition-all whitespace-nowrap"
                      style={{ borderColor: `${color}50`, background: `${color}15`, color, fontSize: "12px" }}
                    >
                      {label}
                    </motion.button>
                  ))}
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
                    <div className="font-display text-2xl font-bold text-[#E8E8E8] mb-1 tabular-nums" style={{ fontVariantNumeric: "tabular-nums" }}>
                      <CountUp to={kpi.value} prefix={kpi.prefix ?? ""} suffix={kpi.suffix ?? ""} duration={1.3} />
                    </div>
                    {kpi.trendVal !== "—" && (
                      <div className="flex items-center gap-1.5">
                        {kpi.trend === "up"   && <TrendingUp   className="w-3 h-3 text-[#22c55e]" />}
                        {kpi.trend === "down" && <TrendingDown className="w-3 h-3 text-[#f59e0b]" />}
                        <span className="text-xs text-[#9ca3af]">{kpi.trendVal}</span>
                      </div>
                    )}
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

              {/* Demo data notice */}
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs text-[#9ca3af]" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <Sparkles className="w-3.5 h-3.5 text-[#D4AF37] flex-shrink-0" />
                <span>Demo data — add your information to see your real numbers</span>
              </div>

              {/* Health Score + Upcoming */}
              <div className="grid lg:grid-cols-3 gap-6">
                <AnimatedSection className="glass-gold p-6 flex flex-col items-center text-center">
                  <div className="text-sm font-medium text-[#D4AF37] mb-4">LifeFi Financial Meter</div>
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
                    {upcomingBills.length === 0 && (
                      <div className="text-center py-6 text-sm text-[#9ca3af]">
                        No upcoming bills.{" "}
                        <button onClick={() => window.dispatchEvent(new CustomEvent("lifefi:openAdd", { detail: { sheet: "bill" } }))} className="text-[#4F8EF7] hover:underline">Add a bill</button>
                      </div>
                    )}
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
                  <MotionButton variant="ghost" className="text-xs text-[#4F8EF7] border-0 py-1 px-2" onClick={() => window.dispatchEvent(new CustomEvent("lifefi:openAdd", { detail: { sheet: "card" } }))}>
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
                    <span className="text-xs text-[#9ca3af]">{new Date().toLocaleString("default", { month: "long", year: "numeric" })}</span>
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
                    <MotionButton variant="ghost" className="text-xs text-[#4F8EF7] border-0 py-1 px-2" onClick={() => window.dispatchEvent(new CustomEvent("lifefi:openAdd", { detail: { sheet: "bill" } }))}>
                      + Add Bill
                    </MotionButton>
                  </div>
                  <motion.div variants={staggerContainer} initial="hidden" whileInView="visible"
                    viewport={{ once: true }} className="space-y-1 max-h-[400px] overflow-y-auto pr-1">
                    {bills.length === 0 && (
                      <div className="text-center py-6 text-sm text-[#9ca3af]">
                        No bills yet.{" "}
                        <button onClick={() => window.dispatchEvent(new CustomEvent("lifefi:openAdd", { detail: { sheet: "bill" } }))} className="text-[#4F8EF7] hover:underline">Add your first bill</button>
                      </div>
                    )}
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
              {/* Voice row */}
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
                {bills.length === 0 && (
                  <div className="text-center py-10 space-y-3">
                    <div className="text-4xl">🧾</div>
                    <div className="text-sm font-medium text-[#E8E8E8]">No bills added yet</div>
                    <div className="text-xs text-[#9ca3af]">Add a bill by voice or use the + button to get started</div>
                  </div>
                )}
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
            <AnimatedSection className="space-y-4">
            <div className="glass p-6">
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

          {/* ── Settings ──────────────────────────────────────────────── */}
          {activeNav === "settings" && (
            <AnimatedSection className="space-y-6 max-w-2xl">
              {/* Account Info */}
              <div className="glass p-6 space-y-5">
                <div className="flex items-center gap-2 mb-2">
                  <Settings className="w-4 h-4 text-[#4F8EF7]" />
                  <h2 className="font-semibold text-[#E8E8E8]">Account</h2>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#4F8EF7] to-[#D4AF37] flex items-center justify-center text-white text-lg font-bold shrink-0">
                    {userInitials}
                  </div>
                  <div>
                    <div className="font-medium text-[#E8E8E8]">{userProfile?.full_name || "—"}</div>
                    <div className="text-sm text-[#9ca3af]">{userProfile?.email || "—"}</div>
                    <div className={`text-xs mt-0.5 font-medium ${isPremium ? "text-[#D4AF37]" : "text-[#9ca3af]"}`}>{planName}</div>
                  </div>
                </div>
              </div>

              {/* Subscription */}
              <div className="glass p-6 space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <Crown className="w-4 h-4 text-[#D4AF37]" />
                  <h2 className="font-semibold text-[#E8E8E8]">Subscription</h2>
                </div>
                <div className={`flex items-center justify-between p-4 rounded-2xl border ${isPremium ? "border-[#D4AF37]/30 bg-[#D4AF37]/[0.06]" : "border-white/10 bg-white/[0.04]"}`}>
                  <div>
                    <div className={`font-semibold ${isPremium ? "text-[#D4AF37]" : "text-[#E8E8E8]"}`}>{planName}</div>
                    {isPremium && planPrice && <div className="text-xs text-[#9ca3af]">{planPrice}</div>}
                    {!isPremium && <div className="text-xs text-[#9ca3af]">Free plan — limited features</div>}
                  </div>
                  <Link href="/pricing">
                    <button className="px-4 py-2 rounded-xl text-sm font-semibold transition-colors"
                      style={isPremium
                        ? { border: "1px solid rgba(255,255,255,0.1)", color: "#9ca3af" }
                        : { background: "linear-gradient(135deg, #D4AF37, #b8962e)", color: "#0a0a0f" }
                      }>
                      {isPremium ? "Manage Plan" : "Upgrade"}
                    </button>
                  </Link>
                </div>
              </div>

              {/* Privacy */}
              <div className="glass p-6 space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <Star className="w-4 h-4 text-[#4F8EF7]" />
                  <h2 className="font-semibold text-[#E8E8E8]">Privacy</h2>
                </div>
                <div className="flex items-center justify-between py-2">
                  <div>
                    <div className="text-sm font-medium text-[#E8E8E8]">Privacy Mode</div>
                    <div className="text-xs text-[#9ca3af]">Hide balances and amounts across the dashboard</div>
                  </div>
                </div>
              </div>

              {/* Legal */}
              <div className="glass p-6 space-y-3">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-4 h-4 text-[#9ca3af]" />
                  <h2 className="font-semibold text-[#E8E8E8]">Legal</h2>
                </div>
                <Link href="/terms" className="flex items-center justify-between py-2 text-sm text-[#9ca3af] hover:text-[#E8E8E8] transition-colors">
                  <span>Terms of Service</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
                <Link href="/terms#privacy" className="flex items-center justify-between py-2 text-sm text-[#9ca3af] hover:text-[#E8E8E8] transition-colors">
                  <span>Privacy Policy</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
                <a href="mailto:support@lifefi.ai" className="flex items-center justify-between py-2 text-sm text-[#9ca3af] hover:text-[#E8E8E8] transition-colors">
                  <span>Contact Support</span>
                  <ChevronRight className="w-4 h-4" />
                </a>
              </div>

              {/* Danger zone */}
              <div className="glass p-6 space-y-4 border border-red-500/10">
                <h2 className="font-semibold text-[#E8E8E8] mb-2">Account Actions</h2>
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 text-sm text-[#9ca3af] hover:text-[#E8E8E8] hover:border-white/20 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
                <div className="text-xs text-[#9ca3af]">
                  To delete your account, contact{" "}
                  <a href="mailto:support@lifefi.ai" className="text-[#4F8EF7] hover:underline">support@lifefi.ai</a>
                </div>
              </div>
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

      {/* ── Upgrade Modal ────────────────────────────────────────────────── */}
      {showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)} />}
    </div>
  );
}
