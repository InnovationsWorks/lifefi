"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { Bill, CreditCard, Utility, ConnectedBank } from "@/lib/types";

// ── Initial mock data ──────────────────────────────────────────────────────

const INITIAL_BILLS: Bill[] = [
  { id: "b1", name: "Netflix",        amount: 15.99, dueDate: "May 15", dueDay: 15, status: "paid",     category: "Entertainment", frequency: "monthly" },
  { id: "b2", name: "Spotify",        amount: 9.99,  dueDate: "May 17", dueDay: 17, status: "due_soon", category: "Entertainment", frequency: "monthly" },
  { id: "b3", name: "Rent",           amount: 2200,  dueDate: "May 20", dueDay: 20, status: "unpaid",   category: "Housing",       frequency: "monthly" },
  { id: "b4", name: "Car Insurance",  amount: 187,   dueDate: "May 21", dueDay: 21, status: "unpaid",   category: "Insurance",     frequency: "monthly" },
  { id: "b5", name: "Gym Membership", amount: 45,    dueDate: "May 24", dueDay: 24, status: "unpaid",   category: "Health",        frequency: "monthly" },
  { id: "b6", name: "Adobe CC",       amount: 54.99, dueDate: "May 28", dueDay: 28, status: "unpaid",   category: "Software",      frequency: "monthly" },
  { id: "b7", name: "Amazon Prime",   amount: 14.99, dueDate: "Jun 1",  dueDay: 1,  status: "paid",     category: "Shopping",      frequency: "monthly" },
];

const INITIAL_CARDS: CreditCard[] = [
  { id: "c1", name: "Chase Sapphire Preferred", last4: "4521", balance: 3240, limit: 10000, dueDate: "May 18", dueDay: 18, color: "#1a56db", utilization: 32 },
  { id: "c2", name: "Amex Gold Card",           last4: "8834", balance: 1870, limit: 5000,  dueDate: "May 22", dueDay: 22, color: "#D4AF37", utilization: 37 },
  { id: "c3", name: "Citi Premier Card",        last4: "2291", balance: 5410, limit: 12000, dueDate: "May 25", dueDay: 25, color: "#6366f1", utilization: 45 },
  { id: "c4", name: "Discover it Cash Back",    last4: "7743", balance: 890,  limit: 8000,  dueDate: "Jun 2",  dueDay: 2,  color: "#f97316", utilization: 11 },
];

const INITIAL_UTILITIES: Utility[] = [
  { id: "u1", name: "Electric", amount: 142,   trend: +8,  color: "#f59e0b", category: "electric" },
  { id: "u2", name: "Water",    amount: 68,    trend: -3,  color: "#4F8EF7", category: "water"   },
  { id: "u3", name: "Gas",      amount: 89,    trend: +12, color: "#ef4444", category: "gas"     },
  { id: "u4", name: "Internet", amount: 79.99, trend: 0,   color: "#8b5cf6", category: "internet" },
];

// ── Context ────────────────────────────────────────────────────────────────

interface AppContextValue {
  bills: Bill[];
  cards: CreditCard[];
  utilities: Utility[];
  connectedBanks: ConnectedBank[];
  privacyMode: boolean;
  lastUpdated: Date;
  addBill: (b: Omit<Bill, "id">) => void;
  payBill: (id: string) => void;
  addCard: (c: Omit<CreditCard, "id">) => void;
  addUtility: (u: Omit<Utility, "id">) => void;
  addConnectedBank: (bank: ConnectedBank) => void;
  togglePrivacy: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

function uid() { return Math.random().toString(36).slice(2); }

export function AppProvider({ children }: { children: ReactNode }) {
  const [bills, setBills]               = useState<Bill[]>(INITIAL_BILLS);
  const [cards, setCards]               = useState<CreditCard[]>(INITIAL_CARDS);
  const [utilities, setUtilities]       = useState<Utility[]>(INITIAL_UTILITIES);
  const [connectedBanks, setBanks]      = useState<ConnectedBank[]>([]);
  const [privacyMode, setPrivacy]       = useState(false);
  const [lastUpdated, setUpdated]       = useState(new Date());

  const touch = () => setUpdated(new Date());

  const addBill = useCallback((b: Omit<Bill, "id">) => {
    setBills((p) => [...p, { ...b, id: uid() }]);
    touch();
  }, []);

  const payBill = useCallback((id: string) => {
    setBills((p) => p.map((b) => b.id === id ? { ...b, status: "paid" } : b));
    touch();
  }, []);

  const addCard = useCallback((c: Omit<CreditCard, "id">) => {
    setCards((p) => [...p, { ...c, id: uid() }]);
    touch();
  }, []);

  const addUtility = useCallback((u: Omit<Utility, "id">) => {
    setUtilities((p) => [...p, { ...u, id: uid() }]);
    touch();
  }, []);

  const addConnectedBank = useCallback((bank: ConnectedBank) => {
    setBanks((prev) => {
      const filtered = prev.filter((b) => b.institutionId !== bank.institutionId);
      return [...filtered, bank];
    });
    touch();
  }, []);

  const togglePrivacy = useCallback(() => setPrivacy((p) => !p), []);

  return (
    <AppContext.Provider value={{ bills, cards, utilities, connectedBanks, privacyMode, lastUpdated, addBill, payBill, addCard, addUtility, addConnectedBank, togglePrivacy }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
