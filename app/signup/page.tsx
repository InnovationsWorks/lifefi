"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { Mail, Lock, Eye, EyeOff, User, Check, ArrowRight, AlertCircle } from "lucide-react";
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
  const [googleLoading, setGoogleLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function handleGoogleSignIn() {
    setGoogleLoading(true);
    setError("");
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: "https://lifefi.ai/auth/callback?next=/dashboard",
      },
    });
    setGoogleLoading(false);
  }

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
      {/* Google OAuth */}
      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={googleLoading}
        className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-100 text-gray-800 font-semibold py-3 px-4 rounded-xl transition-colors text-sm mb-5 disabled:opacity-60"
      >
        {googleLoading ? (
          <svg className="animate-spin w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
        )}
        {googleLoading ? "Redirecting…" : "Continue with Google"}
      </button>

      {/* Divider */}
      <div className="flex items-center gap-3 mb-5">
        <div className="flex-1 h-px bg-white/10" />
        <span className="text-xs text-[#9ca3af] font-medium">or</span>
        <div className="flex-1 h-px bg-white/10" />
      </div>

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
          <Link href="/" className="inline-block mb-6">
            <Image src="/images/logos/LifeFi_Logo_text_SVG.svg" alt="LifeFi" width={180} height={180} />
          </Link>
          <h1 className="font-display text-3xl font-bold text-[#E8E8E8] mb-2">
            Start Your Journey
          </h1>
          <p className="text-[#9ca3af] text-sm">
            Your finances, organized in one place
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
