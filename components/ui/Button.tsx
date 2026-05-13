"use client";

import { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "gold" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  children: ReactNode;
  loading?: boolean;
}

const variants = {
  primary: "btn-primary",
  gold: "btn-gold",
  ghost: "px-4 py-2 text-[#E8E8E8] border border-white/10 rounded-xl hover:border-white/20 transition-colors",
  danger: "px-4 py-2 bg-[#ef4444]/10 text-[#ef4444] border border-[#ef4444]/20 rounded-xl hover:bg-[#ef4444]/20 transition-colors",
};

const sizes = {
  sm: "text-sm py-2 px-4",
  md: "text-sm py-2.5 px-5",
  lg: "text-base py-3.5 px-8",
};

export function Button({
  variant = "primary",
  size = "md",
  children,
  loading = false,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={`${variants[variant]} ${size !== "md" ? sizes[size] : ""} ${className} disabled:opacity-50 disabled:cursor-not-allowed`}
      {...props}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Loading...
        </span>
      ) : (
        children
      )}
    </button>
  );
}
