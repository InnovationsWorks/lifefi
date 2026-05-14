"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

interface DebtItem {
  id: string | number;
  name: string;
  balance: number;
  limit: number;
  color: string;
}

interface DebtTrackerProps {
  items: DebtItem[];
}

export function DebtTracker({ items }: DebtTrackerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });

  return (
    <div ref={ref} className="space-y-5">
      {items.map((item, i) => {
        const paidOff = item.limit - item.balance;
        const pct = Math.round((paidOff / item.limit) * 100);
        const isPaidOff = pct >= 100;

        return (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: -20 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: i * 0.1, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ background: item.color }} />
                <span className="text-sm font-medium text-[#E8E8E8]">{item.name}</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-[#9ca3af]">
                <span>${item.balance.toLocaleString()} remaining</span>
                <span
                  className="font-semibold"
                  style={{ color: item.color }}
                >
                  {pct}%
                </span>
              </div>
            </div>

            <div className="relative h-3 rounded-full bg-white/[0.06] overflow-hidden">
              <motion.div
                className="absolute inset-y-0 left-0 rounded-full"
                style={{ background: `linear-gradient(90deg, ${item.color}99, ${item.color})` }}
                initial={{ width: 0 }}
                animate={inView ? { width: `${pct}%` } : { width: 0 }}
                transition={{ duration: 1.1, delay: 0.2 + i * 0.12, ease: [0.22, 1, 0.36, 1] }}
              />
              {/* Glow */}
              <motion.div
                className="absolute inset-y-0 left-0 rounded-full"
                style={{ background: `linear-gradient(90deg, transparent, ${item.color}60)`, filter: "blur(4px)" }}
                initial={{ width: 0 }}
                animate={inView ? { width: `${pct}%` } : { width: 0 }}
                transition={{ duration: 1.1, delay: 0.2 + i * 0.12, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>

            <div className="flex justify-between text-xs text-[#9ca3af] mt-1">
              <span>${paidOff.toLocaleString()} paid off</span>
              <span>Limit: ${item.limit.toLocaleString()}</span>
            </div>

            {isPaidOff && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-1 text-xs font-semibold text-[#22c55e] flex items-center gap-1"
              >
                🎉 Paid off! Amazing work.
              </motion.div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
