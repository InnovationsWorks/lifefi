"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePlaidLink } from "react-plaid-link";
import type { PlaidLinkOnSuccessMetadata } from "react-plaid-link";
import { Building2, CheckCircle2, AlertTriangle, Loader2, ExternalLink, ChevronDown, ChevronUp } from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { useToast } from "@/contexts/ToastContext";
import type { PlaidAccount, ConnectedBank } from "@/lib/types";

// ── Account type helpers ───────────────────────────────────────────────────

const ACCOUNT_TYPE_COLORS: Record<string, string> = {
  depository: "#22c55e",
  credit:     "#4F8EF7",
  loan:       "#f59e0b",
  investment: "#8b5cf6",
  other:      "#9ca3af",
};

const ACCOUNT_SUBTYPE_LABELS: Record<string, string> = {
  checking:        "Checking",
  savings:         "Savings",
  credit_card:     "Credit Card",
  "credit card":   "Credit Card",
  mortgage:        "Mortgage",
  auto:            "Auto Loan",
  student:         "Student Loan",
  brokerage:       "Brokerage",
  "401k":          "401(k)",
  ira:             "IRA",
};

function accountLabel(subtype: string | null, type: string): string {
  if (subtype) return ACCOUNT_SUBTYPE_LABELS[subtype.toLowerCase()] ?? subtype;
  return type.charAt(0).toUpperCase() + type.slice(1);
}

// ── Connected bank card ────────────────────────────────────────────────────

function BankCard({ bank, defaultOpen = false }: { bank: ConnectedBank; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  const totalBalance = bank.accounts.reduce(
    (s, a) => s + (a.current_balance ?? a.available_balance ?? 0), 0
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl overflow-hidden"
    >
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between p-4 hover:bg-white/[0.04] transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#22c55e]/20 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5 text-[#22c55e]" />
          </div>
          <div className="text-left">
            <div className="text-sm font-semibold text-[#E8E8E8]">{bank.institutionName}</div>
            <div className="text-xs text-[#9ca3af]">{bank.accounts.length} account{bank.accounts.length !== 1 ? "s" : ""} connected</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-xs text-[#9ca3af]">Total</div>
            <div className="text-sm font-bold text-[#E8E8E8]">
              ${Math.abs(totalBalance).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
          {open ? <ChevronUp className="w-4 h-4 text-[#9ca3af]" /> : <ChevronDown className="w-4 h-4 text-[#9ca3af]" />}
        </div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden"
          >
            <div className="border-t border-white/08 px-4 pb-4 pt-3 space-y-2">
              {bank.accounts.map((account) => {
                const color  = ACCOUNT_TYPE_COLORS[account.type] ?? "#9ca3af";
                const label  = accountLabel(account.subtype, account.type);
                const bal    = account.current_balance ?? account.available_balance;
                return (
                  <div key={account.account_id}
                    className="flex items-center justify-between py-2 px-3 rounded-xl bg-white/[0.03]">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full shrink-0" style={{ background: color }} />
                      <div>
                        <div className="text-sm text-[#E8E8E8]">{account.name}</div>
                        <div className="text-xs text-[#9ca3af]">
                          {label}{account.mask ? ` ····${account.mask}` : ""}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-[#E8E8E8]">
                        {bal !== null
                          ? `$${Math.abs(bal).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                          : "—"}
                      </div>
                      {account.type === "credit" && account.limit && (
                        <div className="text-xs text-[#9ca3af]">
                          of ${account.limit.toLocaleString()} limit
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── Main PlaidLink component ───────────────────────────────────────────────

interface PlaidLinkProps {
  /** Called when a bank is successfully connected */
  onConnected?: (bank: ConnectedBank) => void;
  /** If true, renders a compact inline button instead of the full panel */
  compact?: boolean;
}

export function PlaidLink({ onConnected, compact = false }: PlaidLinkProps) {
  const { connectedBanks, addConnectedBank } = useApp();
  const { addToast } = useToast();

  const [linkToken,    setLinkToken]    = useState<string | null>(null);
  const [loading,      setLoading]      = useState(false);
  const [tokenLoading, setTokenLoading] = useState(true);
  const [error,        setError]        = useState<string | null>(null);
  const [lastAdded,    setLastAdded]    = useState<ConnectedBank | null>(null);

  // Fetch link token on mount
  useEffect(() => {
    setTokenLoading(true);
    fetch("/api/plaid/create-link-token", { method: "POST" })
      .then((r) => r.json())
      .then((d: { link_token?: string; error?: string }) => {
        if (d.link_token) setLinkToken(d.link_token);
        else setError(d.error ?? "Could not initialize Plaid.");
      })
      .catch(() => setError("Network error — could not reach Plaid."))
      .finally(() => setTokenLoading(false));
  }, []);

  const onSuccess = useCallback(
    async (publicToken: string, metadata: PlaidLinkOnSuccessMetadata) => {
      setLoading(true);
      setError(null);
      try {
        // Exchange public token
        const exchangeRes = await fetch("/api/plaid/exchange-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            public_token: publicToken,
            institution: metadata.institution,
          }),
        });
        const exchangeData = await exchangeRes.json() as {
          success?: boolean;
          institution_name?: string;
          institution_id?: string;
          error?: string;
        };
        if (!exchangeData.success) throw new Error(exchangeData.error ?? "Exchange failed");

        // Fetch accounts
        const accountsRes = await fetch("/api/plaid/accounts");
        const accountsData = await accountsRes.json() as {
          accounts?: PlaidAccount[];
          error?: string;
        };
        if (!accountsData.accounts) throw new Error(accountsData.error ?? "Could not fetch accounts");

        const bank: ConnectedBank = {
          institutionId:   exchangeData.institution_id   ?? metadata.institution?.institution_id ?? "",
          institutionName: exchangeData.institution_name ?? metadata.institution?.name ?? "Your Bank",
          accounts:        accountsData.accounts,
        };

        addConnectedBank(bank);
        setLastAdded(bank);
        onConnected?.(bank);
        addToast({
          type:    "success",
          title:   "Bank connected!",
          message: `${bank.institutionName} is now linked to LifeFi.`,
        });
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Connection failed";
        setError(msg);
        addToast({ type: "warning", title: "Connection failed", message: msg });
      } finally {
        setLoading(false);
      }
    },
    [addConnectedBank, onConnected, addToast]
  );

  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess,
    onExit: (err) => {
      if (err) setError("Plaid Link closed unexpectedly.");
    },
  });

  const isReady    = ready && !tokenLoading && !loading;
  const hasAnyBank = connectedBanks.length > 0;

  // ── Compact (button-only) mode ─────────────────────────────────────────
  if (compact) {
    return (
      <div className="space-y-3">
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => open()}
          disabled={!isReady}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all disabled:opacity-50"
          style={{ background: "linear-gradient(135deg, #D4AF37, #b8962e)", color: "#0a0a0f" }}
        >
          {loading || tokenLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Building2 className="w-4 h-4" />
          )}
          {loading ? "Connecting…" : tokenLoading ? "Initializing…" : hasAnyBank ? "Connect Another Bank" : "Connect Your Bank"}
        </motion.button>
        {error && (
          <div className="flex items-center gap-2 text-xs text-[#ef4444]">
            <AlertTriangle className="w-3 h-3 shrink-0" />
            {error}
          </div>
        )}
      </div>
    );
  }

  // ── Full panel mode ────────────────────────────────────────────────────
  return (
    <div className="space-y-4">
      {/* Already-connected banks */}
      {connectedBanks.map((bank) => (
        <BankCard key={bank.institutionId} bank={bank} defaultOpen={bank.institutionId === lastAdded?.institutionId} />
      ))}

      {/* Connect button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => open()}
        disabled={!isReady}
        className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-semibold text-base shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        style={{ background: "linear-gradient(135deg, #D4AF37, #b8962e)", color: "#0a0a0f" }}
      >
        {loading || tokenLoading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            {loading ? "Connecting…" : "Initializing…"}
          </>
        ) : (
          <>
            <Building2 className="w-5 h-5" />
            {hasAnyBank ? "Connect Another Bank" : "Connect Your Bank"}
            <ExternalLink className="w-4 h-4 opacity-60" />
          </>
        )}
      </motion.button>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-2 p-3 rounded-xl bg-[#ef4444]/10 border border-[#ef4444]/20 text-sm text-[#ef4444]"
        >
          <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </motion.div>
      )}
    </div>
  );
}
