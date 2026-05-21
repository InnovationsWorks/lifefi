"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Fingerprint, X, Shield } from "lucide-react"
import {
  isPlatformAuthenticatorAvailable,
  registerBiometric,
  BIOMETRIC_CRED_KEY,
  BIOMETRIC_DECLINED_KEY,
  BIOMETRIC_EMAIL_KEY,
} from "@/lib/webauthn"
import { createClient } from "@/lib/supabase/client"

interface Props {
  onClose: () => void
}

export function BiometricEnrollModal({ onClose }: Props) {
  const [available, setAvailable] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    isPlatformAuthenticatorAvailable().then(setAvailable)
  }, [])

  if (!available) return null

  async function handleEnable() {
    setLoading(true)
    let enrolled = false
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { onClose(); return }

      const credId = await registerBiometric(
        user.id,
        user.email ?? "",
        user.user_metadata?.full_name ?? ""
      )

      if (credId) {
        enrolled = true
        localStorage.setItem(BIOMETRIC_CRED_KEY, credId)
        localStorage.setItem(BIOMETRIC_EMAIL_KEY, user.email ?? "")
        // Best-effort — requires migration 003 to have run in Supabase
        await supabase.from("profiles").update({ webauthn_credential_id: credId }).eq("id", user.id)
      }
    } catch {
      // OS dialog cancelled or WebAuthn error — don't mark declined
    } finally {
      setLoading(false)
      if (!enrolled) {
        // Cancelled without explicit "Not now" — leave declined unset so we ask again next session
      }
      onClose()
    }
  }

  function handleDecline() {
    localStorage.setItem(BIOMETRIC_DECLINED_KEY, "true")
    onClose()
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={handleDecline}
        />
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          className="relative glass p-8 rounded-2xl w-full max-w-sm text-center z-10"
        >
          <button
            onClick={handleDecline}
            className="absolute top-4 right-4 text-[#9ca3af] hover:text-[#E8E8E8] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="w-16 h-16 rounded-full bg-[#4F8EF7]/15 border border-[#4F8EF7]/30 flex items-center justify-center mx-auto mb-5">
            <Fingerprint className="w-8 h-8 text-[#4F8EF7]" />
          </div>

          <h2 className="font-display text-xl font-bold text-[#E8E8E8] mb-2">
            Enable Face ID / Touch ID?
          </h2>
          <p className="text-[#9ca3af] text-sm mb-5 leading-relaxed">
            Skip the password on your next visit using your device&apos;s biometrics.
          </p>

          <div className="flex items-center justify-center gap-2 text-xs text-[#9ca3af] mb-6">
            <Shield className="w-3.5 h-3.5 text-[#22c55e] shrink-0" />
            <span>Your biometric data never leaves this device</span>
          </div>

          <button
            onClick={handleEnable}
            disabled={loading}
            className="btn-gold w-full justify-center py-3 mb-3"
          >
            {loading ? "Setting up…" : "Enable Face ID / Touch ID"}
          </button>
          <button
            onClick={handleDecline}
            className="w-full py-2.5 text-sm text-[#9ca3af] hover:text-[#E8E8E8] transition-colors"
          >
            Not now
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
