"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, type PanInfo } from "framer-motion";
import {
  Wallet,
  ChevronRight, ChevronLeft, X, ArrowRight,
} from "lucide-react";

// ── Design tokens ──────────────────────────────────────────────────────────

const GOLD   = "#C9A84C";
const NAVY   = "#0A1628";
const WHITE  = "#F0F0F0";
const MUTED  = "#7A8A9E";

// Card glass style — dark navy with gold border, no brownish tint
const cardStyle: React.CSSProperties = {
  background:          "rgba(10, 22, 40, 0.80)",
  backdropFilter:      "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  border:              `1px solid rgba(201, 168, 76, 0.22)`,
  borderRadius:        "24px",
};

// Overlay — dark navy
const overlayStyle: React.CSSProperties = {
  background:     `rgba(10, 22, 40, 0.96)`,
  backdropFilter: "blur(16px)",
};

// Gold icon circle
const iconCircle: React.CSSProperties = {
  background: "rgba(201, 168, 76, 0.12)",
  border:     `1px solid rgba(201, 168, 76, 0.30)`,
};

// Gold CTA button
const btnGoldStyle: React.CSSProperties = {
  background: `linear-gradient(135deg, ${GOLD}, #a8863a)`,
  color:      NAVY,
  padding:    "12px 20px",
  borderRadius: "12px",
  fontWeight:  700,
  fontSize:    "0.9rem",
  border:      "none",
  cursor:      "pointer",
  display:     "inline-flex",
  alignItems:  "center",
  gap:         "8px",
  width:       "100%",
  justifyContent: "center",
};

// ── Welcome copy ───────────────────────────────────────────────────────────

const WELCOME = {
  title:       "Welcome to LifeFi",
  subtitle:    "Your personal and business finances, organized",
  description: "LifeFi simplifies life with bank-level safety.",
};

// ── Tour slides ────────────────────────────────────────────────────────────

const TOUR_SLIDES = [
  {
    emoji:       "💳",
    title:       "Everything in one place",
    description: "Your cards, bills, and due dates — all in one clean dashboard. No spreadsheets. No guessing. No missed payments.",
  },
  {
    emoji:       "📋",
    title:       "Your cards, under control",
    description: "Add any credit card and LifeFi tracks your balance, limit, utilization, and next due date. Always know where you stand.",
  },
  {
    emoji:       "🔔",
    title:       "Never miss a payment again",
    description: "Add your monthly bills and utilities. LifeFi color-codes what's coming up so nothing sneaks up on you.",
  },
  {
    emoji:       "🔒",
    title:       "Safe and private by design",
    description: "We don't see and don't store your bank data. Your credentials stay with Plaid — a bank-level secure service trusted by millions.",
  },
  {
    emoji:       "📊",
    title:       "Know your financial health",
    description: "The LifeFi Financial Meter shows you how you're doing right now and what to focus on. Simple, honest, no jargon.",
  },
] as const;

const STORAGE_KEY = "lifefi_onboarding_done";

// ── Slide transition variants ──────────────────────────────────────────────

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 260 : -260, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit:  (dir: number) => ({ x: dir > 0 ? -260 : 260, opacity: 0 }),
};

// ── Component ──────────────────────────────────────────────────────────────

export function OnboardingFlow() {
  const router = useRouter();
  const [visible,   setVisible]   = useState(false);
  const [showTour,  setShowTour]  = useState(false);
  const [slide,     setSlide]     = useState(0);
  const [direction, setDirection] = useState(1);
  const [exiting,   setExiting]   = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && !localStorage.getItem(STORAGE_KEY)) {
      setVisible(true);
    }
  }, []);

  function dismiss() {
    setExiting(true);
    setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, "1");
      setVisible(false);
      setExiting(false);
    }, 350);
  }

  function goSlide(dir: number) {
    const next = slide + dir;
    if (next < 0 || next >= TOUR_SLIDES.length) return;
    setDirection(dir);
    setSlide(next);
  }

  function jumpSlide(target: number) {
    setDirection(target > slide ? 1 : -1);
    setSlide(target);
  }

  function handleDragEnd(_: unknown, info: PanInfo) {
    if (info.offset.x < -50) goSlide(1);
    else if (info.offset.x > 50) goSlide(-1);
  }

  if (!visible) return null;

  const current = TOUR_SLIDES[slide];
  const isLast  = slide === TOUR_SLIDES.length - 1;

  return (
    <AnimatePresence>
      {!exiting && (
        <motion.div
          key="overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[500] flex items-center justify-center p-4"
          style={overlayStyle}
        >
          <AnimatePresence mode="wait">

            {/* ── Welcome screen ─────────────────────────────────────────── */}
            {!showTour && (
              <motion.div
                key="welcome"
                initial={{ scale: 0.93, opacity: 0, y: 24 }}
                animate={{ scale: 1,    opacity: 1, y: 0 }}
                exit={{   scale: 0.95,  opacity: 0, y: -16 }}
                transition={{ type: "spring", stiffness: 300, damping: 28 }}
                className="w-full max-w-sm p-8 relative text-center"
                style={cardStyle}
              >
                {/* Close */}
                <button
                  onClick={dismiss}
                  aria-label="Close"
                  className="absolute top-4 right-4 transition-colors"
                  style={{ color: MUTED }}
                  onMouseEnter={e => (e.currentTarget.style.color = WHITE)}
                  onMouseLeave={e => (e.currentTarget.style.color = MUTED)}
                >
                  <X className="w-4 h-4" />
                </button>

                {/* Logo mark */}
                <motion.div
                  initial={{ scale: 0.7, opacity: 0, rotate: -10 }}
                  animate={{ scale: 1,   opacity: 1, rotate: 0 }}
                  transition={{ delay: 0.1, type: "spring", stiffness: 360, damping: 24 }}
                  className="w-20 h-20 rounded-3xl mx-auto mb-6 flex items-center justify-center"
                  style={iconCircle}
                >
                  <Wallet className="w-9 h-9" style={{ color: GOLD }} />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.16 }}
                >
                  <h2
                    className="font-display text-2xl font-bold mb-2"
                    style={{ color: WHITE }}
                  >
                    {WELCOME.title}
                  </h2>
                  <div
                    className="text-sm font-semibold mb-4"
                    style={{ color: GOLD }}
                  >
                    {WELCOME.subtitle}
                  </div>
                  <p
                    className="text-sm leading-relaxed mb-8"
                    style={{ color: MUTED }}
                  >
                    {WELCOME.description}
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.24 }}
                >
                  {/* Get Started → /signup */}
                  <motion.button
                    whileHover={{ scale: 1.03, boxShadow: `0 8px 28px rgba(201,168,76,0.30)` }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => { dismiss(); router.push("/signup"); }}
                    style={btnGoldStyle}
                    className="mb-4"
                  >
                    Get Started <ArrowRight className="w-4 h-4" />
                  </motion.button>

                  {/* Tour the site */}
                  <button
                    onClick={() => setShowTour(true)}
                    className="w-full text-center text-xs py-1 transition-colors"
                    style={{ color: MUTED }}
                    onMouseEnter={e => (e.currentTarget.style.color = WHITE)}
                    onMouseLeave={e => (e.currentTarget.style.color = MUTED)}
                  >
                    Tour the site
                  </button>
                </motion.div>
              </motion.div>
            )}

            {/* ── Tour slides ────────────────────────────────────────────── */}
            {showTour && (
              <motion.div
                key="tour"
                initial={{ scale: 0.93, opacity: 0, y: 24 }}
                animate={{ scale: 1,    opacity: 1, y: 0 }}
                exit={{   scale: 0.95,  opacity: 0, y: -16 }}
                transition={{ type: "spring", stiffness: 300, damping: 28 }}
                className="w-full max-w-sm p-8 relative overflow-hidden"
                style={cardStyle}
              >
                {/* Close */}
                <button
                  onClick={dismiss}
                  aria-label="Close"
                  className="absolute top-4 right-4 z-10 transition-colors"
                  style={{ color: MUTED }}
                  onMouseEnter={e => (e.currentTarget.style.color = WHITE)}
                  onMouseLeave={e => (e.currentTarget.style.color = MUTED)}
                >
                  <X className="w-4 h-4" />
                </button>

                {/* Back to welcome */}
                <button
                  onClick={() => { setShowTour(false); setSlide(0); setDirection(1); }}
                  aria-label="Back to welcome"
                  className="absolute top-4 left-4 z-10 transition-colors"
                  style={{ color: MUTED }}
                  onMouseEnter={e => (e.currentTarget.style.color = WHITE)}
                  onMouseLeave={e => (e.currentTarget.style.color = MUTED)}
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {/* Progress dots */}
                <div className="flex gap-1.5 justify-center mb-8 mt-2">
                  {TOUR_SLIDES.map((_, i) => (
                    <motion.button
                      key={i}
                      aria-label={`Go to slide ${i + 1}`}
                      onClick={() => jumpSlide(i)}
                      animate={{
                        width:      i === slide ? 24 : 8,
                        background: i === slide
                          ? GOLD
                          : i < slide
                          ? `rgba(201, 168, 76, 0.45)`
                          : "rgba(255, 255, 255, 0.15)",
                      }}
                      transition={{ duration: 0.28 }}
                      className="h-2 rounded-full"
                    />
                  ))}
                </div>

                {/* Swipeable slide content */}
                <AnimatePresence mode="wait" custom={direction}>
                  <motion.div
                    key={slide}
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ type: "spring", stiffness: 340, damping: 32 }}
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.16}
                    onDragEnd={handleDragEnd}
                    className="cursor-grab active:cursor-grabbing select-none touch-pan-y"
                  >
                    {/* Icon */}
                    <div
                      className="w-20 h-20 rounded-3xl mx-auto mb-6 flex items-center justify-center"
                      style={iconCircle}
                    >
                      <span className="text-4xl">{current.emoji}</span>
                    </div>

                    {/* Text */}
                    <div className="text-center mb-8">
                      <h2
                        className="font-display text-2xl font-bold mb-3"
                        style={{ color: WHITE }}
                      >
                        {current.title}
                      </h2>
                      <p
                        className="text-sm leading-relaxed"
                        style={{ color: MUTED }}
                      >
                        {current.description}
                      </p>
                    </div>
                  </motion.div>
                </AnimatePresence>

                {/* Navigation row: ← [Next / Get Started] → */}
                <div className="flex items-center gap-3">
                  {/* Left arrow */}
                  <motion.button
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.92 }}
                    onClick={() => goSlide(-1)}
                    disabled={slide === 0}
                    aria-label="Previous slide"
                    className="w-10 h-10 shrink-0 rounded-full flex items-center justify-center transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
                    style={{
                      border: `1px solid rgba(201, 168, 76, 0.25)`,
                      color:  MUTED,
                    }}
                    onMouseEnter={e => !e.currentTarget.disabled && (e.currentTarget.style.color = WHITE)}
                    onMouseLeave={e => (e.currentTarget.style.color = MUTED)}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </motion.button>

                  {/* Center CTA */}
                  {!isLast ? (
                    <motion.button
                      whileHover={{ scale: 1.02, boxShadow: `0 8px 28px rgba(201,168,76,0.28)` }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => goSlide(1)}
                      style={{ ...btnGoldStyle, flex: 1 }}
                    >
                      Next <ChevronRight className="w-4 h-4" />
                    </motion.button>
                  ) : (
                    <motion.button
                      whileHover={{ scale: 1.02, boxShadow: `0 8px 28px rgba(201,168,76,0.28)` }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => { dismiss(); router.push("/signup"); }}
                      style={{ ...btnGoldStyle, flex: 1 }}
                    >
                      Get Started <ArrowRight className="w-4 h-4" />
                    </motion.button>
                  )}

                  {/* Right arrow */}
                  <motion.button
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.92 }}
                    onClick={() => goSlide(1)}
                    disabled={isLast}
                    aria-label="Next slide"
                    className="w-10 h-10 shrink-0 rounded-full flex items-center justify-center transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
                    style={{
                      border: `1px solid rgba(201, 168, 76, 0.25)`,
                      color:  MUTED,
                    }}
                    onMouseEnter={e => !e.currentTarget.disabled && (e.currentTarget.style.color = WHITE)}
                    onMouseLeave={e => (e.currentTarget.style.color = MUTED)}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </motion.button>
                </div>

                {/* Close */}
                <button
                  onClick={dismiss}
                  className="w-full text-center text-xs mt-4 py-1 transition-colors"
                  style={{ color: MUTED }}
                  onMouseEnter={e => (e.currentTarget.style.color = WHITE)}
                  onMouseLeave={e => (e.currentTarget.style.color = MUTED)}
                >
                  Close
                </button>
              </motion.div>
            )}

          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
