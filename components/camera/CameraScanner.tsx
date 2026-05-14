"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, X, Check, RefreshCw } from "lucide-react";

interface ScannedResult {
  name: string;
  amount: number;
  dueDay: number;
  category: string;
}

const MOCK_BILLS: ScannedResult[] = [
  { name: "Verizon Wireless", amount: 89.99, dueDay: 18, category: "Phone" },
  { name: "T-Mobile",          amount: 65.00, dueDay: 12, category: "Phone" },
  { name: "Comcast Xfinity",   amount: 109.99,dueDay: 22, category: "Internet" },
  { name: "State Farm",        amount: 213.00,dueDay: 5,  category: "Insurance" },
  { name: "Planet Fitness",    amount: 24.99, dueDay: 10, category: "Health" },
];

const MOCK_CARDS: ScannedResult[] = [
  { name: "Capital One Venture", amount: 5000,  dueDay: 20, category: "card" },
  { name: "Wells Fargo Active",  amount: 8000,  dueDay: 14, category: "card" },
  { name: "Bank of America",     amount: 12000, dueDay: 8,  category: "card" },
];

type Phase = "scanning" | "result" | "done";

interface CameraScannerProps {
  mode: "bill" | "card";
  onConfirm: (result: ScannedResult) => void;
  onClose: () => void;
}

export function CameraScanner({ mode, onConfirm, onClose }: CameraScannerProps) {
  const [phase, setPhase] = useState<Phase>("scanning");
  const [result, setResult] = useState<ScannedResult | null>(null);
  const [scanProgress, setScanProgress] = useState(0);

  useEffect(() => {
    if (phase !== "scanning") return;
    const start = Date.now();
    const duration = 2400;
    const raf = requestAnimationFrame(function tick() {
      const elapsed = Date.now() - start;
      const p = Math.min(elapsed / duration, 1);
      setScanProgress(p);
      if (p < 1) {
        requestAnimationFrame(tick);
      } else {
        const pool = mode === "card" ? MOCK_CARDS : MOCK_BILLS;
        setResult(pool[Math.floor(Math.random() * pool.length)]);
        setPhase("result");
      }
    });
    return () => cancelAnimationFrame(raf);
  }, [phase, mode]);

  function handleConfirm() {
    if (result) {
      onConfirm(result);
      setPhase("done");
      setTimeout(onClose, 800);
    }
  }

  function handleRetry() {
    setScanProgress(0);
    setResult(null);
    setPhase("scanning");
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ scale: 0.92, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.92, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 28 }}
          className="w-full max-w-sm glass rounded-3xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 pt-5 pb-3">
            <div className="flex items-center gap-2">
              <Camera className="w-4 h-4 text-[#D4AF37]" />
              <span className="font-semibold text-[#E8E8E8] text-sm">
                {mode === "card" ? "Scan Card" : "Scan Bill"}
              </span>
            </div>
            <button onClick={onClose} className="text-[#9ca3af] hover:text-[#E8E8E8] transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Viewfinder */}
          <div className="relative mx-5 mb-4 rounded-2xl overflow-hidden bg-[#0a0a0f] aspect-[4/3]">
            {/* Corner guides */}
            {[
              "top-2 left-2 border-t-2 border-l-2 rounded-tl-lg",
              "top-2 right-2 border-t-2 border-r-2 rounded-tr-lg",
              "bottom-2 left-2 border-b-2 border-l-2 rounded-bl-lg",
              "bottom-2 right-2 border-b-2 border-r-2 rounded-br-lg",
            ].map((cls, i) => (
              <div key={i} className={`absolute w-6 h-6 border-[#D4AF37] ${cls}`} />
            ))}

            {/* Mock video feed */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-full h-full bg-gradient-to-br from-[#0d0d14] via-[#111120] to-[#0a0a0f] flex items-center justify-center">
                {phase === "scanning" && (
                  <div className="text-center">
                    <Camera className="w-10 h-10 text-[#D4AF37]/40 mx-auto mb-2" />
                    <div className="text-xs text-[#9ca3af]">
                      {mode === "card" ? "Position card in frame" : "Position bill in frame"}
                    </div>
                  </div>
                )}
                {phase === "result" && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-14 h-14 rounded-full bg-[#22c55e]/20 flex items-center justify-center"
                  >
                    <Check className="w-7 h-7 text-[#22c55e]" />
                  </motion.div>
                )}
                {phase === "done" && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-14 h-14 rounded-full bg-[#D4AF37]/20 flex items-center justify-center"
                  >
                    <Check className="w-7 h-7 text-[#D4AF37]" />
                  </motion.div>
                )}
              </div>
            </div>

            {/* Scanning line */}
            {phase === "scanning" && (
              <motion.div
                animate={{ y: ["0%", "100%", "0%"] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent shadow-lg"
                style={{ boxShadow: "0 0 12px 2px #D4AF37" }}
              />
            )}

            {/* Progress bar at bottom */}
            {phase === "scanning" && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
                <motion.div
                  className="h-full bg-gradient-to-r from-[#D4AF37] to-[#b8962e]"
                  style={{ width: `${scanProgress * 100}%` }}
                />
              </div>
            )}
          </div>

          {/* Status / Result */}
          <div className="px-5 pb-5">
            {phase === "scanning" && (
              <div className="text-center py-2">
                <div className="text-sm text-[#9ca3af]">Scanning… {Math.round(scanProgress * 100)}%</div>
              </div>
            )}

            {phase === "result" && result && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                <div className="glass-gold p-4 rounded-2xl mb-4">
                  <div className="text-xs text-[#D4AF37] font-medium mb-2">Detected</div>
                  <div className="text-base font-bold text-[#E8E8E8] mb-1">{result.name}</div>
                  <div className="flex items-center gap-3 text-sm text-[#9ca3af]">
                    <span>${result.amount.toFixed(2)}/mo</span>
                    <span>·</span>
                    <span>Due {result.dueDay}{["th","st","nd","rd"][((result.dueDay % 100) - 20) % 10] || ["th","st","nd","rd"][result.dueDay % 100] || "th"}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleConfirm}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm"
                    style={{ background: "linear-gradient(135deg, #D4AF37, #b8962e)", color: "#0a0a0f" }}
                  >
                    <Check className="w-4 h-4" /> Add This
                  </button>
                  <button
                    onClick={handleRetry}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 text-[#9ca3af] hover:text-[#E8E8E8] transition-colors text-sm"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={onClose}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 text-[#9ca3af] hover:text-[#E8E8E8] transition-colors text-sm"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            )}

            {phase === "done" && (
              <div className="text-center py-2">
                <div className="text-sm text-[#22c55e] font-medium">Added successfully!</div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
