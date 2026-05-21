"use client"

import { useEffect, useCallback, useRef, useState } from "react"
import {
  BIOMETRIC_CRED_KEY,
  SESSION_LOCKED_KEY,
  LAST_ACTIVITY_KEY,
} from "@/lib/webauthn"

const INACTIVITY_MS = 15 * 60 * 1000

export function useSessionLock() {
  const [isLocked, setIsLocked] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const lock = useCallback(() => {
    setIsLocked(true)
    localStorage.setItem(SESSION_LOCKED_KEY, "true")
  }, [])

  const unlock = useCallback(() => {
    setIsLocked(false)
    localStorage.removeItem(SESSION_LOCKED_KEY)
  }, [])

  // Keep a stable ref to lock so the inactivity timer never captures a stale closure
  const lockRef = useRef(lock)
  useEffect(() => { lockRef.current = lock }, [lock])

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => lockRef.current(), INACTIVITY_MS)
    localStorage.setItem(LAST_ACTIVITY_KEY, Date.now().toString())
  }, [])

  useEffect(() => {
    // Only activate the lock mechanism when biometric is enrolled
    if (!localStorage.getItem(BIOMETRIC_CRED_KEY)) return

    const wasLocked = localStorage.getItem(SESSION_LOCKED_KEY) === "true"
    const lastActivity = Number(localStorage.getItem(LAST_ACTIVITY_KEY) ?? "0")
    const elapsed = Date.now() - lastActivity

    if (wasLocked || elapsed > INACTIVITY_MS) {
      setIsLocked(true)
      localStorage.setItem(SESSION_LOCKED_KEY, "true")
    } else {
      resetTimer()
    }

    const handleActivity = () => resetTimer()
    const events = ["mousedown", "keydown", "touchstart", "scroll"] as const
    events.forEach(e => window.addEventListener(e, handleActivity, { passive: true }))

    const handleVisibility = () => {
      if (document.hidden && !!localStorage.getItem(BIOMETRIC_CRED_KEY)) {
        lockRef.current()
      }
    }
    document.addEventListener("visibilitychange", handleVisibility)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      events.forEach(e => window.removeEventListener(e, handleActivity))
      document.removeEventListener("visibilitychange", handleVisibility)
    }
  }, [resetTimer])

  return { isLocked, lock, unlock }
}
