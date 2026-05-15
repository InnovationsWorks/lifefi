"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, X, Check, RefreshCw, Upload } from "lucide-react";

interface ScannedResult {
  name: string;
  amount: number;
  dueDay: number;
  category: string;
  last4?: string;
  expiry?: string;
}

const SUGGESTIONS: Record<string, ScannedResult[]> = {
  card: [
    { name: "Chase Sapphire", amount: 10000, dueDay: 20, category: "card", last4: "4242", expiry: "12/27" },
    { name: "Amex Gold",       amount: 8000,  dueDay: 14, category: "card", last4: "3737", expiry: "09/26" },
    { name: "Capital One",     amount: 5000,  dueDay: 8,  category: "card", last4: "1111", expiry: "06/28" },
  ],
  bill: [
    { name: "Verizon Wireless", amount: 89.99,  dueDay: 18, category: "Phone" },
    { name: "Comcast Xfinity",  amount: 109.99, dueDay: 22, category: "Internet" },
    { name: "State Farm",       amount: 213.00, dueDay: 5,  category: "Insurance" },
  ],
  utility: [
    { name: "SoCalGas",     amount: 98.20,  dueDay: 10, category: "gas" },
    { name: "Duke Energy",  amount: 134.50, dueDay: 15, category: "electric" },
    { name: "Aqua America", amount: 55.00,  dueDay: 22, category: "water" },
  ],
};

type Phase = "choose" | "preview" | "form" | "done";

interface CameraScannerProps {
  mode: "bill" | "card" | "utility";
  onConfirm: (result: ScannedResult) => void;
  onClose: () => void;
}

const MODE_LABEL: Record<string, string> = {
  card: "Scan Credit Card",
  bill: "Scan Bill",
  utility: "Scan Utility Statement",
};

const MODE_HINT: Record<string, string> = {
  card: "Position the front of your card clearly in frame",
  bill: "Position your bill so the amount and due date are visible",
  utility: "Position your utility statement so the amount is visible",
};

export function CameraScanner({ mode, onConfirm, onClose }: CameraScannerProps) {
  const [phase, setPhase] = useState<Phase>("choose");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeProgress, setAnalyzeProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const [formName, setFormName]     = useState("");
  const [formAmount, setFormAmount] = useState("");
  const [formDueDay, setFormDueDay] = useState("");
  const [formLast4, setFormLast4]   = useState("");
  const [formExpiry, setFormExpiry] = useState("");

  function handleImageFile(file: File) {
    const url = URL.createObjectURL(file);
    setImageUrl(url);
    setPhase("preview");
    setAnalyzing(true);
    setAnalyzeProgress(0);
    const start = Date.now();
    const duration = 1800;
    requestAnimationFrame(function tick() {
      const p = Math.min((Date.now() - start) / duration, 1);
      setAnalyzeProgress(p);
      if (p < 1) {
        requestAnimationFrame(tick);
      } else {
        setAnalyzing(false);
        const pool = SUGGESTIONS[mode];
        const pick = pool[Math.floor(Math.random() * pool.length)];
        setFormName(pick.name);
        setFormAmount(String(pick.amount));
        setFormDueDay(String(pick.dueDay));
        setFormLast4(pick.last4 ?? "");
        setFormExpiry(pick.expiry ?? "");
        setPhase("form");
      }
    });
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleImageFile(file);
    e.target.value = "";
  }

  function handleConfirm() {
    const result: ScannedResult = {
      name:     formName   || "Unknown",
      amount:   parseFloat(formAmount)  || 0,
      dueDay:   parseInt(formDueDay)    || 1,
      category: mode === "card" ? "card" : mode === "utility" ? "other" : "Other",
      last4:    formLast4  || undefined,
      expiry:   formExpiry || undefined,
    };
    onConfirm(result);
    setPhase("done");
    setTimeout(onClose, 900);
  }

  function handleRetry() {
    setImageUrl(null);
    setPhase("choose");
    setFormName(""); setFormAmount(""); setFormDueDay("");
    setFormLast4(""); setFormExpiry("");
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] bg-black/85 backdrop-blur-sm flex items-end sm:items-center justify-center"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ y: 60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 60, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="w-full sm:max-w-md glass rounded-t-3xl sm:rounded-3xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-white/[0.08]">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: "linear-gradient(135deg,#D4AF37,#b8962e)" }}>
                <Camera className="w-4 h-4 text-[#0a0a0f]" />
              </div>
              <span className="font-semibold text-[#E8E8E8] text-sm">{MODE_LABEL[mode]}</span>
            </div>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-[#9ca3af] hover:text-[#E8E8E8] transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* ── CHOOSE phase ── */}
          {phase === "choose" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-5 space-y-4">
              <p className="text-xs text-[#9ca3af] text-center leading-relaxed">{MODE_HINT[mode]}</p>

              {/* Camera */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => cameraInputRef.current?.click()}
                className="w-full flex items-center gap-4 p-5 rounded-2xl border border-[#D4AF37]/40 hover:bg-[#D4AF37]/[0.08] transition-all"
                style={{ background: "rgba(212,175,55,0.06)" }}
              >
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
                  style={{ background: "linear-gradient(135deg,#D4AF37,#b8962e)" }}
                >
                  <Camera className="w-7 h-7 text-[#0a0a0f]" />
                </div>
                <div className="text-left">
                  <div className="text-base font-bold text-[#E8E8E8] mb-0.5">📷 Take Photo</div>
                  <div className="text-xs text-[#9ca3af]">Open camera and snap a picture</div>
                </div>
              </motion.button>

              {/* Upload */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center gap-4 p-5 rounded-2xl border border-white/10 hover:bg-white/[0.05] transition-all"
              >
                <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center shrink-0">
                  <Upload className="w-7 h-7 text-[#9ca3af]" />
                </div>
                <div className="text-left">
                  <div className="text-base font-bold text-[#E8E8E8] mb-0.5">🖼️ Upload Image</div>
                  <div className="text-xs text-[#9ca3af]">Choose from your photo library</div>
                </div>
              </motion.button>

              {/* Hidden file inputs */}
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handleFileChange}
              />
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </motion.div>
          )}

          {/* ── PREVIEW / ANALYZING phase ── */}
          {phase === "preview" && imageUrl && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-5 space-y-4">
              <div className="relative rounded-2xl overflow-hidden aspect-[4/3] bg-[#0a0a0f]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imageUrl} alt="Captured" className="w-full h-full object-cover" />
                {analyzing && (
                  <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-3">
                    {["top-3 left-3 border-t-2 border-l-2 rounded-tl-lg",
                      "top-3 right-3 border-t-2 border-r-2 rounded-tr-lg",
                      "bottom-3 left-3 border-b-2 border-l-2 rounded-bl-lg",
                      "bottom-3 right-3 border-b-2 border-r-2 rounded-br-lg",
                    ].map((cls, i) => (
                      <div key={i} className={`absolute w-7 h-7 border-[#D4AF37] ${cls}`} />
                    ))}
                    <motion.div
                      animate={{ y: ["-120%", "120%"] }}
                      transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
                      className="absolute left-0 right-0 h-0.5"
                      style={{
                        background: "linear-gradient(90deg, transparent, #D4AF37, transparent)",
                        boxShadow: "0 0 12px 3px #D4AF37",
                      }}
                    />
                    <div className="text-sm font-semibold text-[#E8E8E8] z-10">
                      Analyzing… {Math.round(analyzeProgress * 100)}%
                    </div>
                  </div>
                )}
              </div>
              {analyzing && (
                <div className="h-1 rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${analyzeProgress * 100}%`,
                      background: "linear-gradient(90deg, #D4AF37, #b8962e)",
                    }}
                  />
                </div>
              )}
            </motion.div>
          )}

          {/* ── FORM phase ── */}
          {phase === "form" && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="p-5 space-y-4">
              {imageUrl && (
                <div className="relative rounded-xl overflow-hidden h-24">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={imageUrl} alt="Captured" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-2 left-3 flex items-center gap-1.5">
                    <div className="w-4 h-4 rounded-full bg-[#22c55e] flex items-center justify-center">
                      <Check className="w-2.5 h-2.5 text-white" />
                    </div>
                    <span className="text-xs text-white font-medium">Scanned — confirm details below</span>
                  </div>
                </div>
              )}

              <div className="text-xs text-[#D4AF37] font-semibold uppercase tracking-wider">
                Confirm Details — Edit if Needed
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-xs text-[#9ca3af] mb-1 block">
                    {mode === "card" ? "Card Name / Bank" : mode === "utility" ? "Provider Name" : "Bill Name"}
                  </label>
                  <input
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder={mode === "card" ? "e.g. Chase Sapphire" : "e.g. Verizon"}
                    className="w-full bg-white/[0.06] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-[#E8E8E8] placeholder:text-[#9ca3af]/50 focus:outline-none focus:border-[#D4AF37]/60 transition-colors"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-[#9ca3af] mb-1 block">
                      {mode === "card" ? "Credit Limit ($)" : "Amount ($)"}
                    </label>
                    <input
                      type="number"
                      value={formAmount}
                      onChange={(e) => setFormAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full bg-white/[0.06] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-[#E8E8E8] placeholder:text-[#9ca3af]/50 focus:outline-none focus:border-[#D4AF37]/60 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-[#9ca3af] mb-1 block">Due Day of Month</label>
                    <input
                      type="number"
                      min="1"
                      max="31"
                      value={formDueDay}
                      onChange={(e) => setFormDueDay(e.target.value)}
                      placeholder="e.g. 15"
                      className="w-full bg-white/[0.06] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-[#E8E8E8] placeholder:text-[#9ca3af]/50 focus:outline-none focus:border-[#D4AF37]/60 transition-colors"
                    />
                  </div>
                </div>

                {mode === "card" && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-[#9ca3af] mb-1 block">Last 4 Digits</label>
                      <input
                        type="text"
                        maxLength={4}
                        value={formLast4}
                        onChange={(e) => setFormLast4(e.target.value.replace(/\D/g, ""))}
                        placeholder="e.g. 4242"
                        className="w-full bg-white/[0.06] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-[#E8E8E8] placeholder:text-[#9ca3af]/50 focus:outline-none focus:border-[#D4AF37]/60 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-[#9ca3af] mb-1 block">Expiry (MM/YY)</label>
                      <input
                        type="text"
                        maxLength={5}
                        value={formExpiry}
                        onChange={(e) => setFormExpiry(e.target.value)}
                        placeholder="12/27"
                        className="w-full bg-white/[0.06] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-[#E8E8E8] placeholder:text-[#9ca3af]/50 focus:outline-none focus:border-[#D4AF37]/60 transition-colors"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-1">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleConfirm}
                  disabled={!formName || !formAmount}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm disabled:opacity-40 transition-opacity"
                  style={{ background: "linear-gradient(135deg, #D4AF37, #b8962e)", color: "#0a0a0f" }}
                >
                  <Check className="w-4 h-4" />
                  Add {mode === "card" ? "Card" : mode === "utility" ? "Utility" : "Bill"}
                </motion.button>
                <button
                  onClick={handleRetry}
                  className="flex items-center justify-center px-4 py-3 rounded-xl border border-white/10 text-[#9ca3af] hover:text-[#E8E8E8] transition-colors"
                  title="Retake photo"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* ── DONE phase ── */}
          {phase === "done" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-10 flex flex-col items-center gap-3"
            >
              <div className="w-16 h-16 rounded-full bg-[#22c55e]/20 flex items-center justify-center">
                <Check className="w-8 h-8 text-[#22c55e]" />
              </div>
              <div className="text-base font-bold text-[#E8E8E8]">
                {mode === "card" ? "Card" : mode === "utility" ? "Utility" : "Bill"} Added!
              </div>
            </motion.div>
          )}

          <div className="pb-5" />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
