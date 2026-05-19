"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, X, Check, RefreshCw, Upload, Sparkles, ChevronDown, AlertCircle, ImageIcon } from "lucide-react";

interface ScannedResult {
  name: string;
  amount: number;
  dueDay: number;
  category: string;
  last4?: string;
  expiry?: string;
}

type Phase = "choose" | "preview" | "form" | "done";

interface CameraScannerProps {
  mode: "bill" | "card" | "utility";
  onConfirm: (result: ScannedResult) => void;
  onClose: () => void;
}

const MODE_LABEL: Record<string, string> = {
  card:    "Scan Credit Card",
  bill:    "Scan Bill",
  utility: "Scan Utility Statement",
};

const MODE_HINT: Record<string, string> = {
  card:    "Take a photo or upload an image of the front of your card",
  bill:    "Take a photo or upload your bill — Claude AI will extract amount, date, and category",
  utility: "Take a photo or upload your utility statement",
};

const BILL_CATEGORIES = [
  "Housing", "Entertainment", "Insurance", "Health",
  "Transport", "Software", "Shopping", "Phone", "Internet", "Other",
];

const UTILITY_CATEGORIES = [
  { value: "electric", label: "Electric" },
  { value: "gas",      label: "Gas"      },
  { value: "water",    label: "Water"    },
  { value: "internet", label: "Internet" },
  { value: "phone",    label: "Phone"    },
  { value: "other",    label: "Other"    },
];

async function prepareImage(file: File): Promise<{ base64: string; mimeType: string }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        let { width, height } = img;
        const maxDim = 1568; // Claude's recommended max
        if (width > maxDim || height > maxDim) {
          const r = Math.min(maxDim / width, maxDim / height);
          width = Math.round(width * r);
          height = Math.round(height * r);
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) { reject(new Error("Canvas not supported")); return; }
        ctx.drawImage(img, 0, 0, width, height);
        URL.revokeObjectURL(url);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.82);
        resolve({ base64: dataUrl.split(",")[1], mimeType: "image/jpeg" });
      } catch (e) {
        URL.revokeObjectURL(url);
        reject(e);
      }
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Failed to load image")); };
    img.src = url;
  });
}

function errorMessage(status: number | null): string {
  if (status === 401) return "Session expired — please refresh the page";
  if (status === 429) return "Rate limit reached — please try again in a moment";
  if (status === 400) return "Image quality too low — try a clearer photo";
  return "Couldn't analyze image — you can enter details manually below";
}

export function CameraScanner({ mode, onConfirm, onClose }: CameraScannerProps) {
  const [phase, setPhase]               = useState<Phase>("choose");
  const [imageUrl, setImageUrl]         = useState<string | null>(null);
  const [analyzing, setAnalyzing]       = useState(false);
  const [progress, setProgress]         = useState(0);
  const [statusMsg, setStatusMsg]       = useState("Analyzing…");
  const [scanError, setScanError]       = useState<string | null>(null);
  const [scanInfo, setScanInfo]         = useState<string | null>(null);
  const [dragOver, setDragOver]         = useState(false);
  const [isMobile, setIsMobile]         = useState(false);

  const fileInputRef   = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const tickerRef      = useRef<ReturnType<typeof setInterval> | null>(null);

  const [formName,     setFormName]     = useState("");
  const [formAmount,   setFormAmount]   = useState("");
  const [formDueDay,   setFormDueDay]   = useState("");
  const [formLast4,    setFormLast4]    = useState("");
  const [formExpiry,   setFormExpiry]   = useState("");
  const [formCategory, setFormCategory] = useState(
    mode === "card" ? "card" : mode === "utility" ? "other" : "Other"
  );

  useEffect(() => {
    setIsMobile(
      window.matchMedia("(pointer: coarse)").matches ||
      ("maxTouchPoints" in navigator && navigator.maxTouchPoints > 0)
    );
    return () => { if (tickerRef.current) clearInterval(tickerRef.current); };
  }, []);

  const handleImageFile = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setScanError("Please select an image file (JPG, PNG, HEIC, etc.)");
      return;
    }

    const url = URL.createObjectURL(file);
    setImageUrl(url);
    setPhase("preview");
    setAnalyzing(true);
    setProgress(0);
    setScanError(null);
    setScanInfo(null);
    setStatusMsg("Reading image…");

    // Progress animation: fast to 65%, slow crawl after
    const start = Date.now();
    tickerRef.current = setInterval(() => {
      const ms = Date.now() - start;
      const p = ms < 2500
        ? Math.min(0.65, ms / 2500 * 0.65)
        : 0.65 + Math.min(0.28, (ms - 2500) / 25000 * 0.28);
      setProgress(p);
    }, 80);

    let httpStatus: number | null = null;
    try {
      setStatusMsg("Compressing image…");
      const { base64, mimeType } = await prepareImage(file);

      setStatusMsg("Asking Claude AI…");
      const res = await fetch("/api/claude/analyze-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: base64, mimeType, mode }),
      });

      httpStatus = res.status;

      if (tickerRef.current) clearInterval(tickerRef.current);
      setProgress(1);

      if (res.ok) {
        const data = await res.json();
        if (data.error) {
          if (mode === "card") {
            setScanInfo("We could partially read your card — please verify the details below");
          } else {
            setScanError(errorMessage(null));
          }
        } else {
          setFormName(data.name ?? "");
          setFormAmount(data.amount != null ? String(data.amount) : "");
          setFormDueDay(data.dueDay != null ? String(data.dueDay) : "");
          setFormLast4(data.last4 ?? "");
          setFormExpiry(data.expiry ?? "");
          setFormCategory(
            data.category ??
            (mode === "card" ? "card" : mode === "utility" ? "other" : "Other")
          );
          setStatusMsg("Done!");
          if (mode === "card" && (!data.last4 || !data.expiry || !data.name)) {
            setScanInfo("We could partially read your card — please verify the details below");
          }
        }
      } else {
        if (mode === "card") {
          setScanInfo("We could partially read your card — please verify the details below");
        } else {
          setScanError(errorMessage(httpStatus));
        }
      }
    } catch {
      if (tickerRef.current) clearInterval(tickerRef.current);
      setProgress(1);
      if (mode === "card") {
        setScanInfo("We could partially read your card — please verify the details below");
      } else {
        setScanError(errorMessage(httpStatus));
      }
    }

    setTimeout(() => {
      setAnalyzing(false);
      setPhase("form");
    }, 380);
  }, [mode]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleImageFile(file);
    e.target.value = "";
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleImageFile(file);
  }

  function handleConfirm() {
    const result: ScannedResult = {
      name:     formName   || "Unknown",
      amount:   parseFloat(formAmount)  || 0,
      dueDay:   parseInt(formDueDay)    || 1,
      category: formCategory,
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
    setProgress(0);
    setScanError(null);
    setScanInfo(null);
    setFormName(""); setFormAmount(""); setFormDueDay("");
    setFormLast4(""); setFormExpiry("");
    setFormCategory(mode === "card" ? "card" : mode === "utility" ? "other" : "Other");
  }

  const inputClass = "w-full bg-white/[0.06] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-[#E8E8E8] placeholder:text-[#9ca3af]/50 focus:outline-none focus:border-[#D4AF37]/60 transition-colors";

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] bg-black/85 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ y: 60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 60, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="w-full sm:max-w-md glass rounded-t-3xl sm:rounded-3xl overflow-hidden max-h-[92vh] flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-white/[0.08] shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: "linear-gradient(135deg,#D4AF37,#b8962e)" }}>
                <Camera className="w-4 h-4 text-[#0a0a0f]" />
              </div>
              <span className="font-semibold text-[#E8E8E8] text-sm">{MODE_LABEL[mode]}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium text-[#D4AF37]"
                style={{ background: "rgba(212,175,55,0.12)", border: "1px solid rgba(212,175,55,0.25)" }}>
                <Sparkles className="w-2.5 h-2.5" />
                Claude AI
              </div>
              <button onClick={onClose}
                className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-[#9ca3af] hover:text-[#E8E8E8] transition-colors">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="overflow-y-auto flex-1">

            {/* ── CHOOSE phase ── */}
            {phase === "choose" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-5 space-y-4">
                {mode !== "card" && (
                  <p className="text-xs text-[#9ca3af] text-center leading-relaxed">{MODE_HINT[mode]}</p>
                )}

                {mode !== "card" && (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-[#9ca3af]"
                    style={{ background: "rgba(212,175,55,0.06)", border: "1px solid rgba(212,175,55,0.18)" }}>
                    <Sparkles className="w-3 h-3 text-[#D4AF37] shrink-0" />
                    Claude AI will automatically read and fill in all the details
                  </div>
                )}

                {isMobile ? (
                  /* ── MOBILE: camera + gallery buttons ── */
                  <div className="space-y-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                      onClick={() => cameraInputRef.current?.click()}
                      className="w-full flex items-center gap-4 p-5 rounded-2xl border border-[#D4AF37]/40 hover:bg-[#D4AF37]/[0.08] transition-all"
                      style={{ background: "rgba(212,175,55,0.06)" }}
                    >
                      <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
                        style={{ background: "linear-gradient(135deg,#D4AF37,#b8962e)" }}>
                        <Camera className="w-7 h-7 text-[#0a0a0f]" />
                      </div>
                      <div className="text-left">
                        <div className="text-base font-bold text-[#E8E8E8] mb-0.5">📷 Take Photo</div>
                        <div className="text-xs text-[#9ca3af]">Use your camera to snap a picture</div>
                      </div>
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full flex items-center gap-4 p-5 rounded-2xl border border-white/10 hover:bg-white/[0.05] transition-all"
                    >
                      <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center shrink-0">
                        <ImageIcon className="w-7 h-7 text-[#9ca3af]" />
                      </div>
                      <div className="text-left">
                        <div className="text-base font-bold text-[#E8E8E8] mb-0.5">🖼️ Photo Library</div>
                        <div className="text-xs text-[#9ca3af]">Choose an existing photo</div>
                      </div>
                    </motion.button>
                  </div>
                ) : (
                  /* ── DESKTOP: drag & drop zone ── */
                  <div
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragOver(false); }}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`w-full flex flex-col items-center gap-4 p-10 rounded-2xl border-2 border-dashed cursor-pointer transition-all select-none ${
                      dragOver
                        ? "border-[#D4AF37] bg-[#D4AF37]/[0.08]"
                        : "border-white/20 hover:border-[#D4AF37]/40 hover:bg-white/[0.03]"
                    }`}
                  >
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all ${
                      dragOver ? "scale-110" : ""
                    }`} style={{ background: dragOver ? "rgba(212,175,55,0.2)" : "rgba(255,255,255,0.06)" }}>
                      <Upload className={`w-8 h-8 transition-colors ${dragOver ? "text-[#D4AF37]" : "text-[#9ca3af]"}`} />
                    </div>
                    <div className="text-center">
                      <div className="text-base font-bold text-[#E8E8E8] mb-1">
                        {dragOver ? "Drop to analyze" : "Drag & drop image here"}
                      </div>
                      <div className="text-xs text-[#9ca3af]">
                        or <span className="text-[#4F8EF7] underline underline-offset-2">click to browse</span> your files
                      </div>
                      <div className="text-[10px] text-[#4a5568] mt-2">JPG, PNG, HEIC, WEBP supported</div>
                    </div>
                  </div>
                )}

                {scanError && (
                  <div className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm text-[#ef4444]"
                    style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {scanError}
                  </div>
                )}

                {/* Hidden inputs */}
                <input ref={cameraInputRef} type="file" accept="image/*" capture="environment"
                  className="hidden" onChange={handleFileChange} />
                <input ref={fileInputRef} type="file" accept="image/*"
                  className="hidden" onChange={handleFileChange} />
              </motion.div>
            )}

            {/* ── PREVIEW / ANALYZING phase ── */}
            {phase === "preview" && imageUrl && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-5 space-y-4">
                <div className="relative rounded-2xl overflow-hidden aspect-[4/3] bg-[#0a0a0f]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={imageUrl} alt="Captured" className="w-full h-full object-cover" />

                  {analyzing && (
                    <div className="absolute inset-0 bg-black/55 flex flex-col items-center justify-center gap-3">
                      {/* Corner brackets */}
                      {[
                        "top-3 left-3 border-t-2 border-l-2 rounded-tl-lg",
                        "top-3 right-3 border-t-2 border-r-2 rounded-tr-lg",
                        "bottom-3 left-3 border-b-2 border-l-2 rounded-bl-lg",
                        "bottom-3 right-3 border-b-2 border-r-2 rounded-br-lg",
                      ].map((cls, i) => (
                        <div key={i} className={`absolute w-7 h-7 border-[#D4AF37] ${cls}`} />
                      ))}
                      {/* Scan line */}
                      <motion.div
                        animate={{ y: ["-120%", "120%"] }}
                        transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute left-0 right-0 h-0.5"
                        style={{
                          background: "linear-gradient(90deg, transparent, #D4AF37, transparent)",
                          boxShadow: "0 0 12px 3px rgba(212,175,55,0.6)",
                        }}
                      />
                      <div className="flex flex-col items-center gap-1.5 z-10">
                        <div className="flex items-center gap-1.5 bg-black/50 px-3 py-1.5 rounded-full">
                          <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                          <span className="text-sm font-semibold text-[#E8E8E8]">{statusMsg}</span>
                        </div>
                        <div className="text-xs text-[#9ca3af]">{Math.round(progress * 100)}%</div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Progress bar — plain div with CSS transition for smooth fill */}
                <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-150 ease-out"
                    style={{
                      width: `${progress * 100}%`,
                      background: "linear-gradient(90deg, #D4AF37, #b8962e)",
                    }}
                  />
                </div>
                <p className="text-xs text-[#9ca3af] text-center">
                  Claude AI is reading your {mode === "card" ? "card" : "statement"}…
                </p>
              </motion.div>
            )}

            {/* ── FORM phase ── */}
            {phase === "form" && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="p-5 space-y-4">
                {/* Thumbnail */}
                {imageUrl && (
                  <div className="relative rounded-xl overflow-hidden h-20">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={imageUrl} alt="Captured" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-2 left-3 flex items-center gap-1.5">
                      {scanError ? (
                        <>
                          <div className="w-4 h-4 rounded-full bg-[#f59e0b] flex items-center justify-center">
                            <AlertCircle className="w-2.5 h-2.5 text-white" />
                          </div>
                          <span className="text-xs text-white font-medium">Enter details manually</span>
                        </>
                      ) : scanInfo ? (
                        <>
                          <div className="w-4 h-4 rounded-full bg-[#60a5fa] flex items-center justify-center">
                            <AlertCircle className="w-2.5 h-2.5 text-white" />
                          </div>
                          <span className="text-xs text-white font-medium">Partial read — please verify</span>
                        </>
                      ) : (
                        <>
                          <div className="w-4 h-4 rounded-full bg-[#D4AF37] flex items-center justify-center">
                            <Sparkles className="w-2.5 h-2.5 text-[#0a0a0f]" />
                          </div>
                          <span className="text-xs text-white font-medium">
                            {formName ? "Claude AI extracted details — confirm below" : "Review and fill in details below"}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* Error banner */}
                {scanError && (
                  <div className="flex items-start gap-2 px-4 py-3 rounded-xl text-xs text-[#f59e0b]"
                    style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)" }}>
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold mb-0.5">{scanError}</div>
                      <div className="text-[#9ca3af]">Please fill in the fields below.</div>
                    </div>
                  </div>
                )}

                {/* Partial-read info banner (card mode) */}
                {scanInfo && !scanError && (
                  <div className="flex items-start gap-2 px-4 py-3 rounded-xl text-xs text-[#60a5fa]"
                    style={{ background: "rgba(96,165,250,0.08)", border: "1px solid rgba(96,165,250,0.2)" }}>
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold mb-0.5">{scanInfo}</div>
                      <div className="text-[#9ca3af]">Please fill in or correct any missing details below.</div>
                    </div>
                  </div>
                )}

                <div className="text-xs text-[#D4AF37] font-semibold uppercase tracking-wider">
                  {scanError ? "Enter Details" : scanInfo ? "Verify Details" : "Confirm Details — Edit if Needed"}
                </div>

                <div className="space-y-3">
                  {/* Name */}
                  <div>
                    <label className="text-xs text-[#9ca3af] mb-1 block">
                      {mode === "card" ? "Card Name / Bank" : mode === "utility" ? "Provider Name" : "Bill Name"}
                    </label>
                    <input value={formName} onChange={(e) => setFormName(e.target.value)}
                      placeholder={mode === "card" ? "e.g. Chase Sapphire" : "e.g. Verizon"}
                      className={inputClass} />
                  </div>

                  {/* Amount + Due Day */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-[#9ca3af] mb-1 block">
                        {mode === "card" ? "Credit Limit ($)" : "Amount ($)"}
                      </label>
                      <input type="number" value={formAmount} onChange={(e) => setFormAmount(e.target.value)}
                        placeholder="0.00" className={inputClass} />
                    </div>
                    <div>
                      <label className="text-xs text-[#9ca3af] mb-1 block">Due Day of Month</label>
                      <input type="number" min="1" max="31" value={formDueDay}
                        onChange={(e) => setFormDueDay(e.target.value)}
                        placeholder="e.g. 15" className={inputClass} />
                    </div>
                  </div>

                  {/* Card-specific */}
                  {mode === "card" && (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-[#9ca3af] mb-1 block">Last 4 Digits</label>
                        <input type="text" maxLength={4} value={formLast4}
                          onChange={(e) => setFormLast4(e.target.value.replace(/\D/g, ""))}
                          placeholder="e.g. 4242" className={inputClass} />
                      </div>
                      <div>
                        <label className="text-xs text-[#9ca3af] mb-1 block">Expiry (MM/YY)</label>
                        <input type="text" maxLength={5} value={formExpiry}
                          onChange={(e) => setFormExpiry(e.target.value)}
                          placeholder="12/27" className={inputClass} />
                      </div>
                    </div>
                  )}

                  {/* Bill category */}
                  {mode === "bill" && (
                    <div>
                      <label className="text-xs text-[#9ca3af] mb-1 block">Category</label>
                      <div className="relative">
                        <select value={formCategory} onChange={(e) => setFormCategory(e.target.value)}
                          className={`${inputClass} appearance-none pr-9 cursor-pointer`}>
                          {BILL_CATEGORIES.map((cat) => (
                            <option key={cat} value={cat} style={{ background: "#0a0a0f" }}>{cat}</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9ca3af] pointer-events-none" />
                      </div>
                    </div>
                  )}

                  {/* Utility type */}
                  {mode === "utility" && (
                    <div>
                      <label className="text-xs text-[#9ca3af] mb-1 block">Utility Type</label>
                      <div className="relative">
                        <select value={formCategory} onChange={(e) => setFormCategory(e.target.value)}
                          className={`${inputClass} appearance-none pr-9 cursor-pointer`}>
                          {UTILITY_CATEGORIES.map((cat) => (
                            <option key={cat.value} value={cat.value} style={{ background: "#0a0a0f" }}>{cat.label}</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9ca3af] pointer-events-none" />
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 pt-1">
                  <motion.button
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                    onClick={handleConfirm}
                    disabled={!formName || !formAmount}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm disabled:opacity-40 transition-opacity"
                    style={{ background: "linear-gradient(135deg, #D4AF37, #b8962e)", color: "#0a0a0f" }}
                  >
                    <Check className="w-4 h-4" />
                    Add {mode === "card" ? "Card" : mode === "utility" ? "Utility" : "Bill"}
                  </motion.button>
                  <button onClick={handleRetry}
                    className="flex items-center justify-center px-4 py-3 rounded-xl border border-white/10 text-[#9ca3af] hover:text-[#E8E8E8] transition-colors"
                    title="Try a different image">
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* ── DONE phase ── */}
            {phase === "done" && (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                className="p-10 flex flex-col items-center gap-3">
                <div className="w-16 h-16 rounded-full bg-[#22c55e]/20 flex items-center justify-center">
                  <Check className="w-8 h-8 text-[#22c55e]" />
                </div>
                <div className="text-base font-bold text-[#E8E8E8]">
                  {mode === "card" ? "Card" : mode === "utility" ? "Utility" : "Bill"} Added!
                </div>
              </motion.div>
            )}

          </div>
          <div className="pb-5 shrink-0" />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
