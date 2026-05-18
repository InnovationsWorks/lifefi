"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Mail, Lock, Eye, EyeOff, User, Wallet, Check, ArrowRight, AlertCircle } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/client";

const planLabels: Record<string, string> = {
  premium: "Premium — $4.99/mo",
  bizfi: "BizFi Bundle — $12.99/mo",
};

function SignupForm() {
  const searchParams = useSearchParams();
  const plan = searchParams.get("plan") ?? "free";

  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  function update(field: string) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: { full_name: form.name },
        emailRedirectTo: `https://lifefi.ai/auth/callback?next=/auth/confirm`,
      },
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
    } else {
      setLoading(false);
      setSuccess(true);
    }
  }

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass p-10 text-center"
      >
        <div className="w-16 h-16 rounded-full bg-[#22c55e]/15 border border-[#22c55e]/30 flex items-center justify-center mx-auto mb-5">
          <Check className="w-8 h-8 text-[#22c55e]" />
        </div>
        <h2 className="font-display text-2xl font-bold text-[#E8E8E8] mb-2">
          Account Created!
        </h2>
        <p className="text-[#9ca3af] text-sm mb-6">
          Welcome to LifeFi, {form.name.split(" ")[0]}. Check your email to verify your account.
        </p>
        <Link href="/dashboard" className="btn-primary inline-flex justify-center px-8 py-3">
          Go to Dashboard <ArrowRight className="w-4 h-4" />
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="glass p-8"
    >
      {plan !== "free" && (
        <div className="mb-6 p-3 rounded-xl glass-gold flex items-center gap-3 text-sm">
          <Check className="w-4 h-4 text-[#D4AF37] shrink-0" />
          <span className="text-[#E8E8E8]">
            You selected: <strong className="text-gradient-gold">{planLabels[plan]}</strong>
          </span>
        </div>
      )}

      <form onSubmit={handleSignup} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-[#E8E8E8] mb-2">Full Name</label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9ca3af]" />
            <input
              type="text"
              value={form.name}
              onChange={update("name")}
              placeholder="Jane Smith"
              required
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-[#E8E8E8] placeholder-[#4a5568] focus:outline-none focus:border-[#4F8EF7]/50 transition-all text-sm"
            />
          </div>
        </div>

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
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-[#E8E8E8] placeholder-[#4a5568] focus:outline-none focus:border-[#4F8EF7]/50 transition-all text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#E8E8E8] mb-2">Password</label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9ca3af]" />
            <input
              type={showPassword ? "text" : "password"}
              value={form.password}
              onChange={update("password")}
              placeholder="Min. 8 characters"
              required
              minLength={8}
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
          {form.password.length > 0 && (
            <div className="flex gap-1 mt-2">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="flex-1 h-1 rounded-full transition-all"
                  style={{
                    background:
                      form.password.length > i * 3
                        ? form.password.length < 6
                          ? "#ef4444"
                          : form.password.length < 10
                          ? "#f59e0b"
                          : "#22c55e"
                        : "rgba(255,255,255,0.1)",
                  }}
                />
              ))}
            </div>
          )}
        </div>

        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            id="terms"
            required
            className="w-4 h-4 mt-0.5 accent-[#4F8EF7]"
          />
          <label htmlFor="terms" className="text-xs text-[#9ca3af] leading-relaxed">
            I agree to LifeFi&apos;s{" "}
            <Link href="/terms" className="text-[#4F8EF7] hover:underline">Terms of Service</Link> and{" "}
            <Link href="/terms#privacy" className="text-[#4F8EF7] hover:underline">Privacy Policy</Link>
          </label>
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
              Creating Account...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              Create Account <ArrowRight className="w-4 h-4" />
            </span>
          )}
        </button>
      </form>
    </motion.div>
  );
}

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-[#D4AF37] opacity-5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/3 left-1/4 w-64 h-64 bg-[#4F8EF7] opacity-5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <Link href="/" className="inline-flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#4F8EF7] to-[#D4AF37] flex items-center justify-center">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <span className="font-display text-2xl font-bold text-[#E8E8E8]">LifeFi</span>
          </Link>
          <h1 className="font-display text-3xl font-bold text-[#E8E8E8] mb-2">
            Start Your Journey
          </h1>
          <p className="text-[#9ca3af] text-sm">
            Join 50,000+ people managing their finances smarter
          </p>
        </motion.div>

        <Suspense fallback={<div className="glass p-8 text-center text-[#9ca3af]">Loading...</div>}>
          <SignupForm />
        </Suspense>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center text-sm text-[#9ca3af] mt-6"
        >
          Already have an account?{" "}
          <Link href="/login" className="text-[#4F8EF7] hover:text-[#7EB3FF] font-medium transition-colors">
            Sign in
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
