"use client";

import { ReactNode, useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { ToastProvider } from "@/contexts/ToastContext";
import { AppProvider } from "@/contexts/AppContext";
import { ToastContainer } from "@/components/alerts/Toast";
import { VoiceButton } from "@/components/voice/VoiceButton";
import { QuickAddFAB } from "@/components/quickadd/QuickAddFAB";
import { BiometricLockScreen } from "@/components/auth/BiometricLockScreen";
import { BiometricEnrollModal } from "@/components/auth/BiometricEnrollModal";
import { useSessionLock } from "@/hooks/useSessionLock";
import {
  BIOMETRIC_CRED_KEY,
  BIOMETRIC_DECLINED_KEY,
  isPlatformAuthenticatorAvailable,
} from "@/lib/webauthn";

const PUBLIC_PATHS = ["/", "/login", "/signup", "/pricing", "/terms", "/auth"];

function DashboardWidgets() {
  const pathname = usePathname();
  if (!pathname.startsWith("/dashboard")) return null;
  return (
    <>
      <QuickAddFAB />
      <VoiceButton />
    </>
  );
}

function BiometricEnrollPrompt() {
  const pathname = usePathname();
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (!pathname.startsWith("/dashboard")) return;
    const enrolled = !!localStorage.getItem(BIOMETRIC_CRED_KEY);
    const declined = localStorage.getItem(BIOMETRIC_DECLINED_KEY) === "true";
    if (enrolled || declined) return;

    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | null = null;

    isPlatformAuthenticatorAvailable().then((available) => {
      if (!cancelled && available) {
        timer = setTimeout(() => setShowModal(true), 1500);
      }
    });

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [pathname]);

  if (!showModal) return null;
  return <BiometricEnrollModal onClose={() => setShowModal(false)} />;
}

export function ClientProviders({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { isLocked, unlock } = useSessionLock();
  const isPublicPage = PUBLIC_PATHS.some((p) => pathname.startsWith(p));

  return (
    <ToastProvider>
      <AppProvider>
        {children}
        <ToastContainer />
        <DashboardWidgets />
        <BiometricEnrollPrompt />
        {isLocked && !isPublicPage && <BiometricLockScreen onUnlock={unlock} />}
      </AppProvider>
    </ToastProvider>
  );
}
