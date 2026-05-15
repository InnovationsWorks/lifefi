"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface PaymentMethodModalProps {
  visible: boolean;
  billName: string;
  amount: number;
  onSelect: (method: string) => void;
  onClose: () => void;
}

function GoogleGLogo() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

function AppleLogo() {
  return (
    <svg width="15" height="18" viewBox="0 0 814 1000" fill="white" aria-hidden="true">
      <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-57.8-155.5-127.4C46 411.3 55.7 238.6 106.2 168.1c32.8-45.3 84.1-73.9 139.3-73.9 54.9 0 89.5 36.4 163.8 36.4 71.9 0 116.1-36.4 175.3-36.4 54.3 0 103.2 24.2 140.5 67.1zm-197.3-97.9c-5.8-30.8-18.1-72.1-46-104.4-11.2-12.7-38.6-37.4-63.2-52.1-21.6-13-51.6-21-81.6-21-3.8 0-7.6.6-11.3.9 1 24.3 10.3 64.9 39.1 99.6 16 19.3 43 38.6 65.8 49.4 20.8 9.7 55.2 19 97.2 27.6z" />
    </svg>
  );
}

export function PaymentMethodModal({ visible, billName, amount, onSelect, onClose }: PaymentMethodModalProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
          style={{ background: "rgba(10,10,15,0.88)", backdropFilter: "blur(12px)" }}
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 40, opacity: 0, scale: 0.97 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 40, opacity: 0, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            className="glass w-full max-w-sm rounded-2xl p-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-1">
              <h2 className="font-display text-lg font-bold text-[#E8E8E8]">Pay with</h2>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
                aria-label="Close"
              >
                <X className="w-4 h-4 text-[#9ca3af]" />
              </button>
            </div>
            <p className="text-[#9ca3af] text-sm mb-5">
              <span className="text-[#D4AF37] font-medium">{billName}</span>
              {" — "}${amount.toFixed(2)}
            </p>

            <div className="space-y-3">
              {/* PayPal */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => onSelect("PayPal")}
                className="w-full h-14 rounded-xl flex items-center justify-center gap-2.5 transition-opacity hover:opacity-90"
                style={{ background: "linear-gradient(135deg, #003087 0%, #0070ba 100%)" }}
              >
                <span className="flex items-baseline leading-none" aria-hidden="true">
                  <span className="font-black text-[22px]" style={{ color: "#009cde" }}>P</span>
                  <span className="font-black text-[22px] -ml-[5px]" style={{ color: "#ffffff" }}>P</span>
                </span>
                <span className="text-white text-base font-bold tracking-wide">PayPal</span>
              </motion.button>

              {/* Google Pay */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => onSelect("Google Pay")}
                className="w-full h-14 rounded-xl flex items-center justify-center gap-2.5 border transition-opacity hover:opacity-90"
                style={{ background: "#ffffff", borderColor: "#dadce0" }}
              >
                <GoogleGLogo />
                <span className="text-base font-medium" style={{ color: "#3c4043" }}>Google Pay</span>
              </motion.button>

              {/* Apple Pay */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => onSelect("Apple Pay")}
                className="w-full h-14 rounded-xl flex items-center justify-center gap-2.5 transition-opacity hover:opacity-90"
                style={{ background: "#000000" }}
              >
                <AppleLogo />
                <span className="text-white text-base font-semibold tracking-wide">Apple Pay</span>
              </motion.button>

              {/* Zelle */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => onSelect("Zelle")}
                className="w-full h-14 rounded-xl flex items-center justify-center gap-2.5 transition-opacity hover:opacity-90"
                style={{ background: "linear-gradient(135deg, #6D1ED4 0%, #8b35e8 100%)" }}
              >
                <span className="text-white font-black text-xl italic leading-none" aria-hidden="true">Z</span>
                <span className="text-white text-base font-bold tracking-wide">Zelle</span>
              </motion.button>
            </div>

            <button
              onClick={onClose}
              className="w-full mt-4 py-2.5 text-sm text-[#9ca3af] hover:text-[#E8E8E8] transition-colors"
            >
              Cancel
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
