import Link from "next/link";
import { Wallet, CheckCircle2 } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Account Confirmed — LifeFi",
  description: "Your LifeFi account has been confirmed.",
};

export default function AuthConfirmPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background glows */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-[#D4AF37] opacity-5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/3 left-1/4 w-64 h-64 bg-[#4F8EF7] opacity-5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10 text-center">
        {/* Logo */}
        <Link href="/" className="inline-flex items-center gap-3 mb-10">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#4F8EF7] to-[#D4AF37] flex items-center justify-center">
            <Wallet className="w-5 h-5 text-white" />
          </div>
          <span className="font-display text-2xl font-bold text-[#E8E8E8]">LifeFi</span>
        </Link>

        {/* Card */}
        <div
          className="p-10"
          style={{
            background: "rgba(10, 22, 40, 0.80)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            border: "1px solid rgba(201, 168, 76, 0.22)",
            borderRadius: "24px",
          }}
        >
          {/* Check icon */}
          <div
            className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center"
            style={{
              background: "rgba(34, 197, 94, 0.12)",
              border: "1px solid rgba(34, 197, 94, 0.30)",
            }}
          >
            <CheckCircle2 className="w-9 h-9 text-[#22c55e]" />
          </div>

          <h1 className="font-display text-2xl font-bold text-[#E8E8E8] mb-3">
            Thank you for signing up with LifeFi!
          </h1>
          <p className="text-[#7A8A9E] text-sm leading-relaxed mb-8">
            Your account is confirmed. Click below to sign in and start managing your finances.
          </p>

          {/* Gold CTA */}
          <Link
            href="/login"
            className="inline-flex items-center justify-center w-full py-3.5 rounded-xl font-bold text-[#0A1628] transition-all"
            style={{
              background: "linear-gradient(135deg, #C9A84C, #a8863a)",
              fontSize: "0.95rem",
            }}
          >
            Sign In to LifeFi
          </Link>
        </div>

        <p className="text-xs text-[#4a5568] mt-8">
          Need help?{" "}
          <a href="mailto:support@lifefi.ai" className="hover:text-[#9ca3af] transition-colors">
            support@lifefi.ai
          </a>
        </p>
      </div>
    </div>
  );
}
