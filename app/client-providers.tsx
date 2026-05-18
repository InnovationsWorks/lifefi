"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { ToastProvider } from "@/contexts/ToastContext";
import { AppProvider } from "@/contexts/AppContext";
import { ToastContainer } from "@/components/alerts/Toast";
import { VoiceButton } from "@/components/voice/VoiceButton";
import { QuickAddFAB } from "@/components/quickadd/QuickAddFAB";

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

export function ClientProviders({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <AppProvider>
        {children}
        <ToastContainer />
        <DashboardWidgets />
      </AppProvider>
    </ToastProvider>
  );
}
