"use client";

import { motion, HTMLMotionProps } from "framer-motion";
import { ReactNode } from "react";

interface GlassCardProps extends Omit<HTMLMotionProps<"div">, "children"> {
  children: ReactNode;
  gold?: boolean;
  className?: string;
  animate?: boolean;
}

export function GlassCard({
  children,
  gold = false,
  className = "",
  animate = true,
  ...props
}: GlassCardProps) {
  const base = gold ? "glass-gold" : "glass";
  const Tag = animate ? motion.div : "div";

  if (!animate) {
    return (
      <div className={`${base} ${className}`} {...(props as React.HTMLAttributes<HTMLDivElement>)}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={`${base} ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
}
