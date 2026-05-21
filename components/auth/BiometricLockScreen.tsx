"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Fingerprint, Mail, Lock, Eye, EyeOff, AlertCircle } from "lucide-react"
import Image from "next/image"
import {
  authenticateWithBiometric,
  BIOMETRIC_CRED_KEY,
  BIOMETRIC_EMAIL_KEY,
} from "@/lib/webauthn"
import { createClient } from "@/lib/supabase/client"

interface Props {
  onUnlock: () => void
}

export function BiometricLockScreen({ onUnlock }: Props) {
  const [mode, setMode] = useState<"biometric" | "password">("biometric")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [biometricLoading, setBiometricLoading] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [hasBiometric, setHasBiometric] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem(BIOMETRIC_EMAIL_KEY)
    if (stored) setEmail(stored)
    setHasBiometric(!!localStorage.getItem(BIOMETRIC_CRED_KEY))
  }, [])

  async function handleBiometric() {
    setBiometricLoading(true)
    setError("")
    const ok = await authenticateWithBiometric()
    setBiometricLoading(false)
    if (ok) {
      onUnlock()
    } else {
      setError("Biometric failed. Use your password instead.")
      setMode("password")
    }
  }

  async function handlePasswordUnlock(e: React.FormEvent) {
    e.preventDefault()
    setPasswordLoading(true)
    setError("")
    const supabase = createClient()
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })
    setPasswordLoading(false)
    if (authError) {
      setError(authError.message)
    } else {
      onUnlock()
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[60] bg-[#0a0a0f] flex flex-col items-center justify-center px-4"
    >
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-[#D4AF37] opacity-5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/3 left-1/4 w-64 h-64 bg-[#4F8EF7] opacity-5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-sm relative z-10 text-center">
        <Image
          src="/images/logos/LifeFi_Logo_text_SVG.svg"
          alt="LifeFi"
          width={140}
          height={140}
          className="mx-auto mb-8"
        />

        {mode === "biometric" ? (
          <>
            <p className="text-[#9ca3af] text-sm mb-8">
              Your session is locked. Verify to continue.
            </p>

            <button
              onClick={handleBiometric}
              disabled={biometricLoading}
              className="w-24 h-24 rounded-full bg-[#4F8EF7]/10 border border-[#4F8EF7]/30 flex items-center justify-center mx-auto mb-5 hover:bg-[#4F8EF7]/20 transition-colors disabled:opacity-60 active:scale-95"
            >
              {biometricLoading ? (
                <svg className="animate-spin w-10 h-10 text-[#4F8EF7]" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <Fingerprint className="w-10 h-10 text-[#4F8EF7]" />
              )}
            </button>

            <p className="text-[#E8E8E8] font-medium">
              {biometricLoading ? "Verifying…" : "Tap to use Face ID / Touch ID"}
            </p>

            {error && (
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm mt-4 text-left">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            <button
              onClick={() => { setError(""); setMode("password") }}
              className="mt-6 text-sm text-[#9ca3af] hover:text-[#E8E8E8] transition-colors"
            >
              Use password instead
            </button>
          </>
        ) : (
          <>
            <p className="text-[#9ca3af] text-sm mb-6">Enter your password to unlock.</p>

            <form onSubmit={handlePasswordUnlock} className="glass p-6 text-left space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#E8E8E8] mb-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9ca3af]" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    autoComplete="email"
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
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-12 text-[#E8E8E8] placeholder-[#4a5568] focus:outline-none focus:border-[#4F8EF7]/50 transition-all text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9ca3af] hover:text-[#E8E8E8] transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {error}
                </div>
              )}

              <button type="submit" disabled={passwordLoading} className="btn-gold w-full justify-center py-3">
                {passwordLoading ? "Unlocking…" : "Unlock"}
              </button>
            </form>

            {hasBiometric && (
              <button
                onClick={() => { setError(""); setMode("biometric") }}
                className="mt-4 text-sm text-[#4F8EF7] hover:text-[#7EB3FF] transition-colors"
              >
                Try Face ID / Touch ID again
              </button>
            )}
          </>
        )}
      </div>
    </motion.div>
  )
}
