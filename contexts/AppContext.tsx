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
      const { data: cardsData, error: cardsError } = await supabase
        .from('credit_cards')
        .select('*')
        .order('created_at', { ascending: false });
      if (cardsError) console.error('[loadData] credit_cards fetch failed:', cardsError.message);
      if (cardsData && cardsData.length > 0) setCards(cardsData);

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

  const addCard = useCallback((c: Omit<CreditCard, 'id'>) => {
    const newCard = { ...c, id: uid() };
    setCards((p) => [...p, newCard]);
    touch();
    supabase.from('credit_cards').insert(newCard).then(({ error }) => {
      if (error) console.error('[addCard] Supabase insert failed:', error.message);
    });
  }, []);

  const updateCard = useCallback((id: string, updates: Partial<Omit<CreditCard, 'id'>>) => {
    // Guard: never run an unfiltered update — an empty id could affect all rows
    if (!id) {
      console.error('[updateCard] called with empty id — aborting Supabase write');
      return;
    }
    setCards((p) => p.map((c) => c.id === id ? { ...c, ...updates } : c));
    touch();
    supabase.from('credit_cards').update(updates).eq('id', id).then(({ error }) => {
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
