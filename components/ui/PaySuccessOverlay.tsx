"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";

const Player = dynamic(
  () => import("@lottiefiles/react-lottie-player").then((m) => m.Player),
  { ssr: false }
);

interface PaySuccessOverlayProps {
  visible: boolean;
  billName: string;
  amount: number;
  onDone: () => void;
}

export function PaySuccessOverlay({ visible, billName, amount, onDone }: PaySuccessOverlayProps) {
  useEffect(() => {
    if (!visible) return;
    const t = setTimeout(onDone, 3000);
    return () => clearTimeout(t);
  }, [visible, onDone]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: "rgba(10,10,15,0.85)", backdropFilter: "blur(10px)" }}
          onClick={onDone}
        >
          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.85, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 22 }}
            className="glass-gold p-10 flex flex-col items-center text-center max-w-xs w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <Player
              autoplay
              keepLastFrame
              src="https://assets10.lottiefiles.com/packages/lf20_jbrw3hcz.json"
              style={{ width: 140, height: 140 }}
            />
            <div className="font-display text-2xl font-bold text-[#E8E8E8] mt-2">
              Payment Sent!
            </div>
            <div className="text-[#9ca3af] text-sm mt-1">
              <span className="text-[#D4AF37] font-semibold">{billName}</span> — ${amount.toFixed(2)}
            </div>
            <motion.div
              className="mt-4 text-xs text-[#9ca3af]"
              animate={{ opacity: [1, 0.4, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              Tap anywhere to dismiss
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
