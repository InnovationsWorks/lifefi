'use client';

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { Bill, CreditCard, Utility, ConnectedBank } from '@/lib/types';
import { createClient } from '@/lib/supabase/client';

const INITIAL_UTILITIES: Utility[] = [
  { id: 'u1', name: 'Electric', amount: 142,   trend: +8,  color: '#f59e0b', category: 'electric' },
  { id: 'u2', name: 'Water',    amount: 68,    trend: -3,  color: '#4F8EF7', category: 'water'    },
  { id: 'u3', name: 'Gas',      amount: 89,    trend: +12, color: '#ef4444', category: 'gas'      },
  { id: 'u4', name: 'Internet', amount: 79.99, trend: 0,   color: '#8b5cf6', category: 'internet' },
];

interface AppContextValue {
  bills: Bill[];
  cards: CreditCard[];
  utilities: Utility[];
  connectedBanks: ConnectedBank[];
  privacyMode: boolean;
  lastUpdated: Date;
  userName: string;
  addBill: (b: Omit<Bill, 'id'>) => void;
  payBill: (id: string) => void;
  addCard: (c: Omit<CreditCard, 'id'>) => void;
  updateCard: (id: string, updates: Partial<Omit<CreditCard, 'id'>>) => void;
  addUtility: (u: Omit<Utility, 'id'>) => void;
  addConnectedBank: (bank: ConnectedBank) => void;
  togglePrivacy: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

function uid() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
}

// Maps a Supabase credit_cards row (snake_case columns) → app CreditCard type (camelCase).
// All Supabase ↔ app translation lives here; UI components only ever see CreditCard.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function supabaseRowToCard(row: any): CreditCard {
  const balance     = Number(row.balance      ?? 0);
  const creditLimit = Number(row.credit_limit ?? 0);
  const dueDate     = String(row.due_date     ?? '');
  const dueDayMatch = dueDate.match(/(\d+)/);
  return {
    id:          String(row.id        ?? ''),
    name:        String(row.card_name ?? ''),
    last4:       String(row.last_four ?? '0000'),
    balance,
    limit:       creditLimit,
    dueDate,
    dueDay:      dueDayMatch ? parseInt(dueDayMatch[1], 10) : undefined,
    color:       String(row.color ?? '#4F8EF7'),
    utilization: creditLimit > 0
      ? Math.min(100, Math.round((balance / creditLimit) * 100))
      : 0,
  };
}

export function AppProvider({ children }: { children: ReactNode }) {
  const supabase = createClient();

  const [bills, setBills]          = useState<Bill[]>([]);
  const [cards, setCards]          = useState<CreditCard[]>([]);
  const [utilities, setUtilities]  = useState<Utility[]>(INITIAL_UTILITIES);
  const [connectedBanks, setBanks] = useState<ConnectedBank[]>([]);
  const [privacyMode, setPrivacy]  = useState(false);
  const [lastUpdated, setUpdated]  = useState(new Date());
  const [userName, setUserName]    = useState('');

  const touch = () => setUpdated(new Date());

  useEffect(() => {
    const loadData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', user.id)
          .single();
        if (profile?.full_name) setUserName(profile.full_name);
        else if (user.email) setUserName(user.email.split('@')[0]);
      }

      // credit_cards: select raw Supabase rows, then map snake_case → CreditCard
      const { data: cardsData, error: cardsError } = await supabase
        .from('credit_cards')
        .select('*')
        .order('created_at', { ascending: false });
      if (cardsError) console.error('[loadData] credit_cards fetch failed:', cardsError.message);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (cardsData && cardsData.length > 0) setCards((cardsData as any[]).map(supabaseRowToCard));

      const { data: billsData, error: billsError } = await supabase
        .from('bills')
        .select('*')
        .order('due_date', { ascending: true });
      if (billsError) console.error('[loadData] bills fetch failed:', billsError.message);
      if (billsData && billsData.length > 0) setBills(billsData);
    };
    loadData();
  }, []);

  const addBill = useCallback((b: Omit<Bill, 'id'>) => {
    const newBill = { ...b, id: uid() };
    setBills((p) => [...p, newBill]);
    touch();
    supabase.from('bills').insert(newBill).then(({ error }) => {
      if (error) console.error('[addBill] Supabase insert failed:', error.message);
    });
  }, []);

  const payBill = useCallback((id: string) => {
    setBills((p) => p.map((b) => b.id === id ? { ...b, status: 'paid' } : b));
    touch();
    supabase.from('bills').update({ status: 'paid' }).eq('id', id).then(({ error }) => {
      if (error) console.error('[payBill] Supabase update failed:', error.message);
    });
  }, []);

  // addCard: maps app CreditCard fields → Supabase column names, then backfills the
  // real Supabase UUID into local state so updateCard's .eq('id', ...) always matches.
  const addCard = useCallback(async (c: Omit<CreditCard, 'id'>) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('[addCard] no authenticated user — aborting');
      return;
    }

    // Optimistic add with a temp UUID so the UI responds immediately
    const tempId = uid();
    setCards((p) => [...p, { ...c, id: tempId }]);
    touch();

    const { data, error } = await supabase
      .from('credit_cards')
      .insert({
        user_id:      user.id,
        card_name:    c.name,
        last_four:    c.last4,
        balance:      c.balance,
        credit_limit: c.limit,
        due_date:     c.dueDate,
        color:        c.color,
        apr:          0,
      })
      .select()
      .single();

    if (error) {
      console.error('[addCard] Supabase insert failed:', error.message);
      // Rollback the optimistic add
      setCards((p) => p.filter((card) => card.id !== tempId));
      return;
    }

    // Replace the temp ID with the Supabase-generated UUID and correct field names
    if (data) {
      setCards((p) => p.map((card) => card.id === tempId ? supabaseRowToCard(data) : card));
    }
  }, []);

  // updateCard: maps only the changed app fields → Supabase column names.
  // Fields not present in the Supabase schema (dueDay, utilization) are skipped.
  const updateCard = useCallback((id: string, updates: Partial<Omit<CreditCard, 'id'>>) => {
    // Guard: an empty id would produce an unfiltered UPDATE affecting all rows
    if (!id) {
      console.error('[updateCard] called with empty id — aborting Supabase write');
      return;
    }
    setCards((p) => p.map((c) => c.id === id ? { ...c, ...updates } : c));
    touch();

    // Build the Supabase payload using correct column names
    const row: Record<string, unknown> = {};
    if (updates.name    !== undefined) row.card_name    = updates.name;
    if (updates.last4   !== undefined) row.last_four    = updates.last4;
    if (updates.limit   !== undefined) row.credit_limit = updates.limit;
    if (updates.dueDate !== undefined) row.due_date     = updates.dueDate;
    if (updates.balance !== undefined) row.balance      = updates.balance;
    if (updates.color   !== undefined) row.color        = updates.color;
    if (Object.keys(row).length === 0) return;

    supabase.from('credit_cards').update(row).eq('id', id).then(({ error }) => {
      if (error) console.error('[updateCard] Supabase update failed:', error.message);
    });
  }, []);

  const addUtility = useCallback((u: Omit<Utility, 'id'>) => {
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
    <AppContext.Provider value={{ bills, cards, utilities, connectedBanks, privacyMode, lastUpdated, userName, addBill, payBill, addCard, updateCard, addUtility, addConnectedBank, togglePrivacy }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
