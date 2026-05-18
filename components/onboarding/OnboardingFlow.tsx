"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence, type PanInfo } from "framer-motion";
import {
  Wallet, CreditCard, FileText, Zap, Bell,
  ChevronRight, ChevronLeft, X, ArrowRight,
} from "lucide-react";
import Link from "next/link";

// ── Welcome screen copy ────────────────────────────────────────────────────

const WELCOME = {
  title: "Welcome to LifeFi",
  subtitle: "Your personal and business finances, organized",
  description: "LifeFi simplifies life with bank-level safety.",
};

// ── Tour slides (placeholder content — update after review) ───────────────

const TOUR_SLIDES = [
  {
    icon: Wallet,
    color: "#D4AF37",
    title: "Slide 1 Title",
    description:
      "Placeholder description for slide 1. This is where the first key feature or benefit will be explained in a short, compelling sentence.",
  },
  {
    icon: CreditCard,
    color: "#4F8EF7",
    title: "Slide 2 Title",
    description:
      "Placeholder description for slide 2. This is where the second key feature or benefit will be explained in a short, compelling sentence.",
  },
  {
    icon: FileText,
    color: "#22c55e",
    title: "Slide 3 Title",
    description:
      "Placeholder description for slide 3. This is where the third key feature or benefit will be explained in a short, compelling sentence.",
  },
  {
    icon: Zap,
    color: "#f59e0b",
    title: "Slide 4 Title",
    description:
      "Placeholder description for slide 4. This is where the fourth key feature or benefit will be explained in a short, compelling sentence.",
  },
  {
    icon: Bell,
    color: "#8b5cf6",
    title: "Slide 5 Title",
    description:
      "Placeholder description for slide 5. This is where the fifth key feature or benefit will be explained in a short, compelling sentence.",
  },
] as const;

const STORAGE_KEY = "lifefi_onboarding_done";

// ── Slide transition variants ──────────────────────────────────────────────

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 280 : -280, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -280 : 280, opacity: 0 }),
};

// ── Component ──────────────────────────────────────────────────────────────

export function OnboardingFlow() {
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
  const Icon = current.icon;
  const isLast = slide === TOUR_SLIDES.length - 1;

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
          style={{ background: "rgba(10,10,15,0.92)", backdropFilter: "blur(14px)" }}
        >
          <AnimatePresence mode="wait">
            {!showTour ? (
              /* ── Welcome screen ───────────────────────────────────────── */
              <motion.div
                key="welcome"
                initial={{ scale: 0.92, opacity: 0, y: 24 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.94, opacity: 0, y: -16 }}
                transition={{ type: "spring", stiffness: 300, damping: 28 }}
                className="glass-gold w-full max-w-sm rounded-3xl p-8 relative text-center"
              >
                {/* Close */}
                <button
                  onClick={dismiss}
                  aria-label="Close"
                  className="absolute top-4 right-4 text-[#9ca3af] hover:text-[#E8E8E8] transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>

                {/* Logo mark */}
                <motion.div
                  initial={{ scale: 0.7, opacity: 0, rotate: -12 }}
                  animate={{ scale: 1,   opacity: 1, rotate: 0 }}
                  transition={{ delay: 0.1, type: "spring", stiffness: 360, damping: 24 }}
                  className="w-20 h-20 rounded-3xl mx-auto mb-6 flex items-center justify-center"
                  style={{ background: "rgba(212,175,55,0.18)", border: "1px solid rgba(212,175,55,0.35)" }}
                >
                  <Wallet className="w-9 h-9 text-[#D4AF37]" />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.18 }}
                >
                  <h2 className="font-display text-2xl font-bold text-[#E8E8E8] mb-2">
                    {WELCOME.title}
                  </h2>
                  <div className="text-sm font-semibold text-[#D4AF37] mb-4">
                    {WELCOME.subtitle}
                  </div>
                  <p className="text-sm text-[#9ca3af] leading-relaxed mb-8">
                    {WELCOME.description}
                  </p>
                </motion.div>

                {/* Get Started → /signup */}
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.26 }}
                >
                  <Link href="/signup" onClick={dismiss}>
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      className="btn-gold w-full justify-center gap-2 mb-4"
                    >
                      Get Started <ArrowRight className="w-4 h-4" />
                    </motion.button>
                  </Link>

                  {/* Tour the site */}
                  <button
                    onClick={() => setShowTour(true)}
                    className="w-full text-center text-xs text-[#9ca3af] hover:text-[#E8E8E8] transition-colors py-1"
                  >
                    Tour the site
                  </button>
                </motion.div>
              </motion.div>
            ) : (
              /* ── Tour slides ──────────────────────────────────────────── */
              <motion.div
                key="tour"
                initial={{ scale: 0.92, opacity: 0, y: 24 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.94, opacity: 0, y: -16 }}
                transition={{ type: "spring", stiffness: 300, damping: 28 }}
                className="glass-gold w-full max-w-sm rounded-3xl p-8 relative overflow-hidden"
              >
                {/* Close */}
                <button
                  onClick={dismiss}
                  aria-label="Close"
                  className="absolute top-4 right-4 z-10 text-[#9ca3af] hover:text-[#E8E8E8] transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>

                {/* Back to welcome */}
                <button
                  onClick={() => { setShowTour(false); setSlide(0); setDirection(1); }}
                  aria-label="Back"
                  className="absolute top-4 left-4 z-10 text-[#9ca3af] hover:text-[#E8E8E8] transition-colors"
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
                        width: i === slide ? 24 : 8,
                        background:
                          i === slide
                            ? current.color
                            : i < slide
                            ? "#22c55e"
                            : "rgba(255,255,255,0.2)",
                      }}
                      transition={{ duration: 0.3 }}
                      className="h-2 rounded-full"
                    />
                  ))}
                </div>

                {/* Swipeable slide */}
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
                    dragElastic={0.18}
                    onDragEnd={handleDragEnd}
                    className="cursor-grab active:cursor-grabbing select-none touch-pan-y"
                  >
                    {/* Icon */}
                    <div
                      className="w-20 h-20 rounded-3xl mx-auto mb-6 flex items-center justify-center"
                      style={{
                        background: `${current.color}20`,
                        border: `1px solid ${current.color}35`,
                      }}
                    >
                      <Icon className="w-9 h-9" style={{ color: current.color }} />
                    </div>

                    {/* Text */}
                    <div className="text-center mb-8">
                      <h2 className="font-display text-2xl font-bold text-[#E8E8E8] mb-3">
                        {current.title}
                      </h2>
                      <p className="text-sm text-[#9ca3af] leading-relaxed">
                        {current.description}
                      </p>
                    </div>
                  </motion.div>
                </AnimatePresence>

                {/* Navigation row: ← [Next/Get Started] → */}
                <div className="flex items-center gap-3">
                  {/* Left arrow */}
                  <motion.button
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.92 }}
                    onClick={() => goSlide(-1)}
                    disabled={slide === 0}
                    aria-label="Previous slide"
                    className="w-10 h-10 shrink-0 rounded-full border border-white/15 flex items-center justify-center text-[#9ca3af] hover:text-[#E8E8E8] hover:border-white/30 transition-colors disabled:opacity-25 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </motion.button>

                  {/* Center CTA */}
                  {!isLast ? (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => goSlide(1)}
                      className="btn-gold flex-1 justify-center gap-2"
                    >
                      Next <ChevronRight className="w-4 h-4" />
                    </motion.button>
                  ) : (
                    <Link href="/signup" className="flex-1" onClick={dismiss}>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.97 }}
                        className="btn-gold w-full justify-center gap-2"
                      >
                        Get Started <ArrowRight className="w-4 h-4" />
                      </motion.button>
                    </Link>
                  )}

                  {/* Right arrow */}
                  <motion.button
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.92 }}
                    onClick={() => goSlide(1)}
                    disabled={isLast}
                    aria-label="Next slide"
                    className="w-10 h-10 shrink-0 rounded-full border border-white/15 flex items-center justify-center text-[#9ca3af] hover:text-[#E8E8E8] hover:border-white/30 transition-colors disabled:opacity-25 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </motion.button>
                </div>

                {/* Close / dismiss */}
                <button
                  onClick={dismiss}
                  className="w-full text-center text-xs text-[#9ca3af] hover:text-[#E8E8E8] mt-4 transition-colors py-1"
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
