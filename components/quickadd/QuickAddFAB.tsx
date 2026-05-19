"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, X, CreditCard, FileText, Zap, List,
  Check, ChevronRight,
} from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { useToast } from "@/contexts/ToastContext";

// ── Common bills quick-add list ────────────────────────────────────────────

const COMMON_BILLS = [
  { name: "Netflix",       amount: 15.99, category: "Entertainment", color: "#ef4444" },
  { name: "Spotify",       amount: 9.99,  category: "Entertainment", color: "#22c55e" },
  { name: "Amazon Prime",  amount: 14.99, category: "Shopping",      color: "#f59e0b" },
  { name: "Disney+",       amount: 13.99, category: "Entertainment", color: "#4F8EF7" },
  { name: "YouTube Premium",amount: 13.99,category: "Entertainment", color: "#ef4444" },
  { name: "Apple iCloud",  amount: 2.99,  category: "Software",      color: "#9ca3af" },
  { name: "Hulu",          amount: 17.99, category: "Entertainment", color: "#22c55e" },
  { name: "Gym Membership",amount: 45,    category: "Health",        color: "#8b5cf6" },
  { name: "Adobe CC",      amount: 54.99, category: "Software",      color: "#ef4444" },
  { name: "Microsoft 365", amount: 9.99,  category: "Software",      color: "#4F8EF7" },
];

// ── Manual form fields ─────────────────────────────────────────────────────

interface ManualFields {
  name: string;
  amount: string;
  dueDay: string;
  category: string;
}

const EMPTY_FIELDS: ManualFields = { name: "", amount: "", dueDay: "1", category: "Other" };

type Sheet = "main" | "bill" | "card" | "utility" | "common";

// ── Sub-sheet: Common Bills ────────────────────────────────────────────────

function CommonBillsSheet({ onClose }: { onClose: () => void }) {
  const { addBill, bills } = useApp();
  const { addToast } = useToast();
  const existingNames = new Set(bills.map((b) => b.name.toLowerCase()));
  const [added, setAdded] = useState<Set<string>>(new Set());

  function handleAdd(b: typeof COMMON_BILLS[0]) {
    const day = 1;
    addBill({ name: b.name, amount: b.amount, dueDate: "Due 1st", dueDay: day, status: "unpaid", category: b.category, frequency: "monthly" });
    setAdded((prev) => { const next = new Set(prev); next.add(b.name); return next; });
    addToast({ type: "success", title: "Added!", message: `${b.name} added to your bills.` });
  }

  return (
    <div className="p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-[#E8E8E8]">Common Subscriptions</h3>
        <button onClick={onClose} className="text-[#9ca3af] hover:text-[#E8E8E8] transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
        {COMMON_BILLS.map((b) => {
          const isExisting = existingNames.has(b.name.toLowerCase());
          const isAdded = added.has(b.name);
          const done = isExisting || isAdded;
          return (
            <div key={b.name}
              className="flex items-center justify-between p-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.07] transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0"
                  style={{ background: `${b.color}20`, color: b.color }}>
                  {b.name[0]}
                </div>
                <div>
                  <div className="text-sm font-medium text-[#E8E8E8]">{b.name}</div>
                  <div className="text-xs text-[#9ca3af]">{b.category} · ${b.amount}/mo</div>
                </div>
              </div>
              <button
                onClick={() => !done && handleAdd(b)}
                disabled={done}
                className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
                  done
                    ? "bg-[#22c55e]/20 text-[#22c55e]"
                    : "bg-[#D4AF37]/20 text-[#D4AF37] hover:bg-[#D4AF37]/30"
                }`}
              >
                {done ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Sub-sheet: Add Bill ────────────────────────────────────────────────────

function AddBillSheet({ onClose }: { onClose: () => void }) {
  const { addBill } = useApp();
  const { addToast } = useToast();
  const [f, setF] = useState<ManualFields>(EMPTY_FIELDS);

  function handleSubmit() {
    if (!f.name.trim() || !f.amount) return;
    const day = parseInt(f.dueDay) || 1;
    addBill({
      name: f.name.trim(),
      amount: parseFloat(f.amount),
      dueDate: `Due ${day}${ordSuffix(day)}`,
      dueDay: day,
      status: "unpaid",
      category: f.category,
      frequency: "monthly",
    });
    addToast({ type: "success", title: "Bill Added", message: `${f.name.trim()} added successfully.` });
    onClose();
  }

  return (
    <div className="p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-[#E8E8E8]">Add Bill</h3>
        <button onClick={onClose} className="text-[#9ca3af] hover:text-[#E8E8E8] transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="space-y-3">
        <FormInput label="Bill Name" value={f.name} onChange={(v) => setF({ ...f, name: v })} placeholder="e.g. Rent" />
        <FormInput label="Amount ($)" value={f.amount} onChange={(v) => setF({ ...f, amount: v })} placeholder="0.00" type="number" />
        <FormInput label="Due Day (1-31)" value={f.dueDay} onChange={(v) => setF({ ...f, dueDay: v })} placeholder="1" type="number" />
        <FormSelect label="Category" value={f.category} onChange={(v) => setF({ ...f, category: v })}
          options={["Housing","Entertainment","Insurance","Health","Transport","Software","Shopping","Other"]} />
      </div>
      <button onClick={handleSubmit} className="btn-gold w-full mt-4 justify-center">Add Bill</button>
    </div>
  );
}

// ── Sub-sheet: Add Card ────────────────────────────────────────────────────

function AddCardSheet({ onClose }: { onClose: () => void }) {
  const { addCard } = useApp();
  const { addToast } = useToast();
  const [name,    setName]    = useState("");
  const [last4,   setLast4]   = useState("");
  const [limit,   setLimit]   = useState("");
  const [balance, setBalance] = useState("");
  const [dueDay,  setDueDay]  = useState("1");

  const CARD_COLORS = ["#1a56db", "#D4AF37", "#6366f1", "#f97316", "#22c55e", "#ef4444"];
  const [color, setColor] = useState(CARD_COLORS[0]);

  function handleSubmit() {
    if (!name.trim()) return;
    const day         = parseInt(dueDay)       || 1;
    const parsedLimit = parseFloat(limit)      || 0;
    const parsedBal   = parseFloat(balance)    || 0;
    const util        = parsedLimit > 0 ? Math.min(100, Math.round((parsedBal / parsedLimit) * 100)) : 0;
    addCard({ name: name.trim(), last4: last4 || "0000", balance: parsedBal, limit: parsedLimit, dueDate: `Due ${day}${ordSuffix(day)}`, dueDay: day, color, utilization: util });
    addToast({ type: "success", title: "Card Added", message: `${name.trim()} added successfully.` });
    onClose();
  }

  return (
    <div className="p-5">
      <div className="flex items-center justify-between mb-1">
        <h3 className="font-semibold text-[#E8E8E8]">Add a Credit Card to Track</h3>
        <button onClick={onClose} className="text-[#9ca3af] hover:text-[#E8E8E8] transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>
      <p className="text-xs text-[#9ca3af] mb-4">Track your credit utilization and never miss a payment</p>
      <div className="space-y-3">
        <FormInput label="Card Name" value={name} onChange={setName} placeholder="e.g. Chase Sapphire" />
        <div>
          <label className="text-xs text-[#9ca3af] mb-1 block">Last 4 digits on your card</label>
          <input
            type="text"
            value={last4}
            onChange={(e) => setLast4(e.target.value.replace(/\D/g, ""))}
            placeholder="0000"
            maxLength={4}
            className="w-full bg-white/[0.06] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-[#E8E8E8] placeholder-[#6b7280] outline-none focus:border-[#D4AF37]/50 transition-colors"
          />
          <p className="text-[10px] text-[#4a5568] mt-1 ml-1">Used to identify your card on the dashboard</p>
        </div>
        <FormInput label="Card Limit ($)" value={limit} onChange={setLimit} placeholder="0" type="number" />
        <FormInput label="Current Balance on Card ($)" value={balance} onChange={setBalance} placeholder="0.00" type="number" />
        <FormInput label="Choose Payment Date (day 1–31)" value={dueDay} onChange={setDueDay} placeholder="e.g. 15" type="number" />
        <div>
          <div className="text-xs text-[#9ca3af] mb-2">Card Color</div>
          <div className="flex gap-2">
            {CARD_COLORS.map((c) => (
              <button key={c} onClick={() => setColor(c)}
                className={`w-7 h-7 rounded-full border-2 transition-all ${color === c ? "border-white scale-110" : "border-transparent"}`}
                style={{ background: c }} />
            ))}
          </div>
        </div>
      </div>
      <button onClick={handleSubmit} className="btn-gold w-full mt-4 justify-center">Add Card</button>
    </div>
  );
}

// ── Sub-sheet: Add Utility ─────────────────────────────────────────────────

function AddUtilitySheet({ onClose }: { onClose: () => void }) {
  const { addUtility } = useApp();
  const { addToast } = useToast();
  const [name, setName]     = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCat]  = useState<"electric"|"water"|"gas"|"internet"|"phone"|"other">("other");

  const CAT_COLORS: Record<string, string> = {
    electric: "#f59e0b", water: "#4F8EF7", gas: "#ef4444",
    internet: "#8b5cf6", phone: "#22c55e", other: "#9ca3af",
  };

  function handleSubmit() {
    if (!name.trim() || !amount) return;
    addUtility({ name: name.trim(), amount: parseFloat(amount), trend: 0, color: CAT_COLORS[category], category });
    addToast({ type: "success", title: "Utility Added", message: `${name.trim()} added successfully.` });
    onClose();
  }

  return (
    <div className="p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-[#E8E8E8]">Add Utility</h3>
        <button onClick={onClose} className="text-[#9ca3af] hover:text-[#E8E8E8] transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="space-y-3">
        <FormInput label="Utility Name" value={name} onChange={setName} placeholder="e.g. Electric" />
        <FormInput label="Monthly Amount ($)" value={amount} onChange={setAmount} placeholder="0.00" type="number" />
        <FormSelect label="Type" value={category} onChange={(v) => setCat(v as typeof category)}
          options={["electric","water","gas","internet","phone","other"]} />
      </div>
      <button onClick={handleSubmit} className="btn-gold w-full mt-4 justify-center">Add Utility</button>
    </div>
  );
}

// ── Shared form primitives ─────────────────────────────────────────────────

function FormInput({ label, value, onChange, placeholder, type = "text", maxLength }: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; type?: string; maxLength?: number;
}) {
  return (
    <div>
      <label className="text-xs text-[#9ca3af] mb-1 block">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        className="w-full bg-white/[0.06] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-[#E8E8E8] placeholder-[#6b7280] outline-none focus:border-[#D4AF37]/50 transition-colors"
      />
    </div>
  );
}

function FormSelect({ label, value, onChange, options }: {
  label: string; value: string; onChange: (v: string) => void; options: string[];
}) {
  return (
    <div>
      <label className="text-xs text-[#9ca3af] mb-1 block">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-white/[0.06] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-[#E8E8E8] outline-none focus:border-[#D4AF37]/50 transition-colors appearance-none"
        style={{ backgroundImage: "none" }}
      >
        {options.map((o) => <option key={o} value={o} className="bg-[#0d0d14]">{o}</option>)}
      </select>
    </div>
  );
}

function ordSuffix(n: number) {
  const s = ["th","st","nd","rd"], v = n % 100;
  return n + (s[(v-20)%10] || s[v] || s[0]);
}

// ── Main FAB ───────────────────────────────────────────────────────────────

const MAIN_ACTIONS = [
  { id: "bill"   as Sheet, label: "Add Bill",       icon: FileText,  color: "#4F8EF7" },
  { id: "card"   as Sheet, label: "Add Card",       icon: CreditCard,color: "#D4AF37" },
  { id: "utility"as Sheet, label: "Add Utility",    icon: Zap,       color: "#f59e0b" },
  { id: "common" as Sheet, label: "Quick Subscriptions", icon: List, color: "#22c55e" },
];

export function QuickAddFAB() {
  const [open, setOpen]     = useState(false);
  const [sheet, setSheet]   = useState<Sheet>("main");

  function close() { setOpen(false); setTimeout(() => setSheet("main"), 300); }

  function openSheet(s: Sheet) { setSheet(s); }

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] bg-black/50 backdrop-blur-sm"
            onClick={close}
          />
        )}
      </AnimatePresence>

      {/* Bottom sheet */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", stiffness: 380, damping: 36 }}
            className="fixed bottom-0 left-0 right-0 z-[120] glass rounded-t-3xl overflow-hidden"
            style={{ maxWidth: 480, margin: "0 auto" }}
          >
            <div className="w-12 h-1 rounded-full bg-white/20 mx-auto mt-3 mb-1" />

            {sheet === "main" && (
              <div className="p-5 pb-8">
                <div className="text-center mb-5">
                  <div className="text-base font-semibold text-[#E8E8E8]">Quick Add</div>
                  <div className="text-xs text-[#9ca3af]">What would you like to add?</div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {MAIN_ACTIONS.map((a) => (
                    <motion.button
                      key={a.id}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => openSheet(a.id)}
                      className="flex items-center gap-3 p-4 rounded-2xl border border-white/10 hover:border-white/20 transition-colors text-left"
                      style={{ background: `${a.color}10` }}
                    >
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                        style={{ background: `${a.color}20` }}>
                        <a.icon className="w-4 h-4" style={{ color: a.color }} />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-[#E8E8E8]">{a.label}</div>
                        <ChevronRight className="w-3 h-3 text-[#9ca3af] mt-0.5" />
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {sheet === "bill"    && <AddBillSheet    onClose={close} />}
            {sheet === "card"    && <AddCardSheet    onClose={close} />}
            {sheet === "utility" && <AddUtilitySheet onClose={close} />}
            {sheet === "common"  && <CommonBillsSheet onClose={close} />}
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAB — sits at bottom-right, above VoiceButton (right-24) */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.93 }}
        onClick={() => { if (open) { close(); } else { setOpen(true); } }}
        className="fixed bottom-6 right-24 z-[130] w-14 h-14 rounded-full flex items-center justify-center shadow-2xl"
        style={{ background: "linear-gradient(135deg, #D4AF37, #b8962e)" }}
        aria-label="Quick add"
      >
        <motion.div animate={{ rotate: open ? 45 : 0 }} transition={{ duration: 0.2 }}>
          <Plus className="w-6 h-6 text-white" />
        </motion.div>
      </motion.button>
    </>
  );
}
