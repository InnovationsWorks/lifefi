"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, Check, X } from "lucide-react";
import { parseVoiceInput, formatParsedSummary, ParsedVoiceInput } from "@/lib/parseVoice";
import { useApp } from "@/contexts/AppContext";
import { useToast } from "@/contexts/ToastContext";

// ── Type stubs for Web Speech API ─────────────────────────────────────────
declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognitionInstance;
    webkitSpeechRecognition: new () => SpeechRecognitionInstance;
  }
}
interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: ((e: SpeechRecognitionEvent) => void) | null;
  onerror:  ((e: { error: string }) => void) | null;
  onend:    (() => void) | null;
}
interface SpeechRecognitionEvent {
  results: { [i: number]: { [i: number]: { transcript: string } }; length: number };
}

// ── Waveform bars ──────────────────────────────────────────────────────────
function WaveformBars() {
  return (
    <div className="flex items-center gap-1 h-8">
      {Array.from({ length: 7 }).map((_, i) => (
        <motion.div
          key={i}
          className="w-1 rounded-full bg-[#D4AF37]"
          animate={{ height: ["8px", `${12 + Math.random() * 20}px`, "8px"] }}
          transition={{ duration: 0.5 + i * 0.07, repeat: Infinity, ease: "easeInOut", delay: i * 0.06 }}
        />
      ))}
    </div>
  );
}

// ── Confirm card ───────────────────────────────────────────────────────────
function ConfirmCard({
  parsed, transcript, onConfirm, onRetry, onClose,
}: {
  parsed: ParsedVoiceInput;
  transcript: string;
  onConfirm: () => void;
  onRetry: () => void;
  onClose: () => void;
}) {
  const isLowConfidence = parsed.confidence < 0.55;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      className="glass-gold p-5 w-80 rounded-2xl shadow-2xl"
    >
      {isLowConfidence ? (
        <>
          <div className="text-sm font-semibold text-[#E8E8E8] mb-1">Didn&apos;t catch that clearly</div>
          <div className="text-xs text-[#9ca3af] mb-4 italic">&ldquo;{transcript}&rdquo;</div>
          <div className="flex gap-2">
            <button onClick={onRetry} className="btn-gold flex-1 py-2 text-sm justify-center">
              Try Again
            </button>
            <button onClick={onClose} className="flex-1 py-2 text-sm border border-white/15 rounded-xl text-[#9ca3af] hover:text-[#E8E8E8] transition-colors">
              Cancel
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="text-xs text-[#D4AF37] font-medium mb-1">I heard:</div>
          <div className="text-sm font-semibold text-[#E8E8E8] mb-1">{formatParsedSummary(parsed)}</div>
          <div className="text-xs text-[#9ca3af] mb-4 italic">&ldquo;{transcript}&rdquo;</div>
          <div className="flex gap-2">
            <button onClick={onConfirm} className="btn-gold flex-1 py-2 text-sm justify-center flex items-center gap-2">
              <Check className="w-3.5 h-3.5" /> Add This
            </button>
            <button onClick={onRetry} className="flex-1 py-2 text-sm border border-white/15 rounded-xl text-[#9ca3af] hover:text-[#E8E8E8] transition-colors">
              Retry
            </button>
            <button onClick={onClose} className="w-9 h-9 flex items-center justify-center border border-white/10 rounded-xl text-[#9ca3af] hover:text-[#E8E8E8] transition-colors">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </>
      )}
    </motion.div>
  );
}

// ── Main voice button ──────────────────────────────────────────────────────
type VoiceState = "idle" | "listening" | "confirm" | "success";

export function VoiceButton() {
  const [state, setState]         = useState<VoiceState>("idle");
  const [transcript, setTranscript] = useState("");
  const [parsed, setParsed]       = useState<ParsedVoiceInput | null>(null);
  const recogRef                  = useRef<SpeechRecognitionInstance | null>(null);
  const { addBill, addCard, addUtility } = useApp();
  const { addToast } = useToast();

  const supported = typeof window !== "undefined" && ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);

  const stopListening = useCallback(() => {
    recogRef.current?.stop();
    recogRef.current = null;
  }, []);

  const startListening = useCallback(() => {
    if (!supported) { addToast({ type: "warning", title: "Not supported", message: "Voice input requires Chrome or Safari." }); return; }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recog = new SR();
    recog.continuous = false;
    recog.interimResults = false;
    recog.lang = "en-US";

    recog.onresult = (e) => {
      const text = e.results[0][0].transcript;
      setTranscript(text);
      setParsed(parseVoiceInput(text));
      setState("confirm");
    };
    recog.onerror = () => {
      setState("confirm");
      setTranscript("Sorry, I couldn't hear that.");
      setParsed(null);
    };
    recog.onend = () => {
      if (state === "listening") setState("idle");
    };

    recogRef.current = recog;
    recog.start();
    setState("listening");
  }, [supported, addToast, state]);

  useEffect(() => () => stopListening(), [stopListening]);

  // Allow external trigger via custom DOM event
  useEffect(() => {
    const handler = () => { if (state === "idle") startListening(); };
    window.addEventListener("lifefi:startVoice", handler);
    return () => window.removeEventListener("lifefi:startVoice", handler);
  }, [state, startListening]);

  function handleConfirm() {
    if (!parsed) return;
    const day = parsed.dueDay ?? 1;
    const dueDateStr = `Due ${day}${day === 1 ? "st" : day === 2 ? "nd" : day === 3 ? "rd" : "th"}`;

    if (parsed.type === "card") {
      addCard({ name: parsed.name, last4: "0000", balance: 0, limit: parsed.limit ?? 0, dueDate: dueDateStr, dueDay: day, color: "#4F8EF7", utilization: 0 });
    } else if (parsed.type === "utility") {
      addUtility({ name: parsed.name, amount: parsed.amount ?? 0, trend: 0, color: "#f59e0b", category: "other" });
    } else {
      addBill({ name: parsed.name, amount: parsed.amount ?? 0, dueDate: dueDateStr, dueDay: day, status: "unpaid", category: parsed.category, frequency: parsed.frequency });
    }
    addToast({ type: "success", title: "Added!", message: `${parsed.name} added to your ${parsed.type === "card" ? "cards" : parsed.type === "utility" ? "utilities" : "bills"}.` });
    setState("success");
    setTimeout(() => setState("idle"), 1600);
  }

  return (
    <>
      {/* Floating mic button */}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end gap-3">
        <AnimatePresence>
          {state === "confirm" && parsed && (
            <ConfirmCard
              parsed={parsed}
              transcript={transcript}
              onConfirm={handleConfirm}
              onRetry={() => { setState("idle"); setTimeout(startListening, 200); }}
              onClose={() => setState("idle")}
            />
          )}
        </AnimatePresence>

        <div className="flex items-center gap-3">
          {state === "listening" && (
            <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
              className="glass px-3 py-2 rounded-2xl flex items-center gap-2">
              <WaveformBars />
              <span className="text-xs text-[#D4AF37]">Listening…</span>
            </motion.div>
          )}

          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.93 }}
            onClick={() => {
              if (state === "listening") { stopListening(); setState("idle"); }
              else if (state === "idle") startListening();
            }}
            className="w-14 h-14 rounded-full flex items-center justify-center shadow-2xl relative overflow-visible"
            style={{ background: "linear-gradient(135deg, #D4AF37, #b8962e)" }}
            aria-label="Voice input"
          >
            {/* Pulsing glow when listening */}
            {state === "listening" && (
              <>
                <motion.div animate={{ scale: [1, 1.6, 1], opacity: [0.5, 0, 0.5] }} transition={{ duration: 1.4, repeat: Infinity }}
                  className="absolute inset-0 rounded-full bg-[#D4AF37]" />
                <motion.div animate={{ scale: [1, 2.0, 1], opacity: [0.3, 0, 0.3] }} transition={{ duration: 1.4, repeat: Infinity, delay: 0.2 }}
                  className="absolute inset-0 rounded-full bg-[#D4AF37]" />
              </>
            )}

            {state === "success" ? (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 400 }}>
                <Check className="w-6 h-6 text-[#0a0a0f]" />
              </motion.div>
            ) : state === "listening" ? (
              <MicOff className="w-6 h-6 text-[#0a0a0f] relative z-10" />
            ) : (
              <Mic className="w-6 h-6 text-[#0a0a0f]" />
            )}
          </motion.button>
        </div>
      </div>
    </>
  );
}
