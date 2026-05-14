"use client";

import { motion } from "framer-motion";
import { ButtonHTMLAttributes, ReactNode } from "react";

interface MotionButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "gold" | "ghost" | "pay";
}

const variants = {
  primary: "btn-primary",
  gold: "btn-gold",
  ghost:
    "px-4 py-2 text-[#E8E8E8] border border-white/10 rounded-xl hover:border-white/20 transition-colors",
  pay: "text-xs text-[#4F8EF7] border border-[#4F8EF7]/30 rounded-lg px-3 py-1.5 hover:bg-[#4F8EF7]/10 transition-colors",
};

export function MotionButton({
  children,
  variant = "primary",
  className = "",
  ...props
}: MotionButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      transition={{ duration: 0.15 }}
      className={`${variants[variant]} ${className}`}
      {...(props as React.ComponentPropsWithoutRef<typeof motion.button>)}
    >
      {children}
    </motion.button>
  );
}
