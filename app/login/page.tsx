"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { Mail, Lock, Eye, EyeOff, AlertCircle } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/client";
import { OnboardingFlow } from "@/components/onboarding/OnboardingFlow";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackError = searchParams.get("error");

  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [error, setError] = useState(
    callbackError === "auth_callback_failed" ? "Email confirmation failed. Please try again." : ""
  );

  async function handleForgotPassword() {
    if (!form.email) { setError("Enter your email address above, then click Forgot Password."); return; }
    setResetLoading(true);
    setError("");
    const supabase = createClient();
    await supabase.auth.resetPasswordForEmail(form.email, {
      redirectTo: `${window.location.origin}/auth/callback`,
    });
    setResetSent(true);
    setResetLoading(false);
  }

  function update(field: string) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="glass p-8"
    >
      <form onSubmit={handleLogin} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-[#E8E8E8] mb-2">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9ca3af]" />
            <input
              type="email"
              value={form.email}
              onChange={update("email")}
              placeholder="you@example.com"
              required
              autoComplete="email"
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-[#E8E8E8] placeholder-[#4a5568] focus:outline-none focus:border-[#4F8EF7]/50 transition-all text-sm"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-[#E8E8E8]">Password</label>
            <button
              type="button"
              onClick={handleForgotPassword}
              disabled={resetLoading}
              className="text-xs text-[#4F8EF7] hover:text-[#7EB3FF] transition-colors"
            >
              {resetLoading ? "Sending…" : resetSent ? "Email sent ✓" : "Forgot password?"}
            </button>
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9ca3af]" />
            <input
              type={showPassword ? "text" : "password"}
              value={form.password}
              onChange={update("password")}
              placeholder="Your password"
              required
              autoComplete="current-password"
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-12 text-[#E8E8E8] placeholder-[#4a5568] focus:outline-none focus:border-[#4F8EF7]/50 transition-all text-sm"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9ca3af] hover:text-[#E8E8E8] transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="btn-gold w-full justify-center py-3.5 text-base"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Signing in...
            </span>
          ) : (
            "Sign In"
          )}
        </button>
      </form>
    </motion.div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <OnboardingFlow />
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-[#D4AF37] opacity-5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/3 left-1/4 w-64 h-64 bg-[#4F8EF7] opacity-5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <Link href="/" className="inline-block mb-6">
            <Image src="/images/logos/LifeFi_Logo_text_SVG.svg" alt="LifeFi" width={180} height={180} />
          </Link>
          <h1 className="font-display text-3xl font-bold text-[#E8E8E8] mb-2">
            Welcome back
          </h1>
          <p className="text-[#9ca3af] text-sm">
            Sign in to your LifeFi account
          </p>
        </motion.div>

        <Suspense fallback={<div className="glass p-8 text-center text-[#9ca3af]">Loading...</div>}>
          <LoginForm />
        </Suspense>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center text-sm text-[#9ca3af] mt-6"
        >
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-[#4F8EF7] hover:text-[#7EB3FF] font-medium transition-colors">
            Sign up free
          </Link>
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center text-xs text-[#4a5568] mt-8 flex items-center justify-center gap-4"
        >
          <Link href="/terms" className="hover:text-[#9ca3af] transition-colors">Terms</Link>
          <span>·</span>
          <Link href="/terms#privacy" className="hover:text-[#9ca3af] transition-colors">Privacy</Link>
          <span>·</span>
          <a href="mailto:support@lifefi.ai" className="hover:text-[#9ca3af] transition-colors">Support</a>
        </motion.div>
      </div>
    </div>
  );
}
