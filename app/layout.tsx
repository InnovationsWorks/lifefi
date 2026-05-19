import type { Metadata } from "next";
import "./globals.css";
import { ClientProviders } from "./client-providers";

export const metadata: Metadata = {
  metadataBase: new URL("https://lifefi.ai"),
  icons: {
    icon: "/images/logos/LifeFi_Icon_Only_TRUE.svg",
    shortcut: "/images/logos/LifeFi_Icon_Only_TRUE.svg",
  },
  title: "LifeFi — Your Financial Life, Finally in Order",
  description:
    "LifeFi is a luxury personal financial organizer. Track cards, pay bills, monitor utilities, and get smart alerts — all in one beautiful dashboard.",
  keywords: ["personal finance", "budget", "credit cards", "bills", "financial organizer"],
  alternates: {
    canonical: "https://lifefi.ai",
  },
  openGraph: {
    title: "LifeFi — Your Financial Life, Finally in Order",
    description: "Luxury personal finance management for modern individuals.",
    type: "website",
    url: "https://lifefi.ai",
    siteName: "LifeFi",
  },
  twitter: {
    card: "summary_large_image",
    title: "LifeFi — Your Financial Life, Finally in Order",
    description: "Luxury personal finance management for modern individuals.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="bg-[#0a0a0f] text-[#E8E8E8] antialiased min-h-screen">
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}
