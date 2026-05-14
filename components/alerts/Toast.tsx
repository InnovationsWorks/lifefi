"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Lightbulb, AlertTriangle, CheckCircle, Info } from "lucide-react";
import { useToast, ToastType } from "@/contexts/ToastContext";

const typeConfig: Record<ToastType, { icon: typeof Info; border: string; bg: string; iconColor: string }> = {
  tip:     { icon: Lightbulb,      border: "border-[#D4AF37]/50", bg: "bg-[#D4AF37]/08", iconColor: "#D4AF37" },
  warning: { icon: AlertTriangle,  border: "border-[#ef4444]/50", bg: "bg-[#ef4444]/08", iconColor: "#ef4444" },
  success: { icon: CheckCircle,    border: "border-[#22c55e]/50", bg: "bg-[#22c55e]/08", iconColor: "#22c55e" },
  info:    { icon: Info,           border: "border-[#4F8EF7]/50", bg: "bg-[#4F8EF7]/08", iconColor: "#4F8EF7" },
};

export function ToastContainer() {
  const { toasts, removeToast } = useToast();
  return (
    <div className="fixed top-4 right-4 z-[200] flex flex-col gap-2 pointer-events-none" style={{ maxWidth: 360 }}>
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => {
          const cfg = typeConfig[toast.type];
          return (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, x: 80, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 80, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 340, damping: 28 }}
              className={`pointer-events-auto glass ${cfg.bg} ${cfg.border} border p-4 rounded-2xl shadow-2xl`}
            >
              <div className="flex items-start gap-3">
                <cfg.icon className="w-4 h-4 mt-0.5 shrink-0" style={{ color: cfg.iconColor }} />
                <div className="flex-1 min-w-0">
                  {toast.title && (
                    <div className="text-sm font-semibold text-[#E8E8E8] mb-0.5">{toast.title}</div>
                  )}
                  <div className="text-xs text-[#9ca3af] leading-relaxed">{toast.message}</div>
                </div>
                <button
                  onClick={() => removeToast(toast.id)}
                  className="text-[#9ca3af] hover:text-[#E8E8E8] transition-colors shrink-0 mt-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
