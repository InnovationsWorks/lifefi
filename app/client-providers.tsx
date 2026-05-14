"use client";

import { ReactNode } from "react";
import { ToastProvider } from "@/contexts/ToastContext";
import { AppProvider } from "@/contexts/AppContext";
import { ToastContainer } from "@/components/alerts/Toast";
import { VoiceButton } from "@/components/voice/VoiceButton";
import { QuickAddFAB } from "@/components/quickadd/QuickAddFAB";
import { OnboardingFlow } from "@/components/onboarding/OnboardingFlow";

export function ClientProviders({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <AppProvider>
        {children}
        <ToastContainer />
        <QuickAddFAB />
        <VoiceButton />
        <OnboardingFlow />
      </AppProvider>
    </ToastProvider>
  );
}
