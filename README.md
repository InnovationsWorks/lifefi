# LifeFi — Luxury Personal Financial Organizer

LifeFi is a stunning web app for managing your complete financial life: credit cards, bills, utilities, and spending analytics — all in one beautiful dashboard.

## Features

- **Financial Health Score** — animated circular progress score (0–100) based on payment history, utilization, and account age
- **Credit Card Tracker** — gorgeous glassmorphism cards showing balance, limit, due dates, and utilization bars
- **Bill Management** — monthly bills with paid/unpaid/due-soon status and one-click pay buttons
- **Utilities Tracker** — electric, water, gas, and internet costs with monthly trend indicators
- **Spending Analytics** — stacked bar chart (Recharts) showing 6-month category breakdowns
- **Upcoming Payments** — next 7 days of due bills at a glance
- **Framer Motion animations** — smooth fade-in, slide-up, and progress animations throughout
- **Mobile responsive** — collapsible sidebar, responsive grid layouts

## Design System

| Token | Value |
|---|---|
| Background | `#0a0a0f` |
| Primary Accent | `#4F8EF7` (electric blue) |
| Secondary Accent | `#D4AF37` (gold) |
| Text | `#E8E8E8` |
| Card BG | `rgba(255,255,255,0.05)` + `backdrop-filter: blur(12px)` |
| Border Radius | `16px` |
| Heading Font | Playfair Display |
| Body Font | Inter |

## Tech Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS** (custom design tokens)
- **Framer Motion** (animations)
- **Recharts** (spending charts)
- **Supabase** (auth + database)
- **Stripe** (payments)
- **Lucide React** (icons)

## Pages

| Route | Description |
|---|---|
| `/` | Marketing landing page with hero, features, how-it-works, pricing |
| `/login` | Authentication page |
| `/signup` | Registration with plan selection |
| `/dashboard` | Full financial dashboard |

## Getting Started

```bash
# Install dependencies
npm install

# Copy env template
cp .env.local.example .env.local
# Fill in your Supabase and Stripe keys

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the landing page, or [http://localhost:3000/dashboard](http://localhost:3000/dashboard) for the dashboard.

## Pricing Plans

| Plan | Price | Features |
|---|---|---|
| Free | $0 | 2 cards, 5 bills, basic analytics |
| Premium | $4.99/mo | Unlimited everything, advanced analytics, push alerts |
| BizFi Bundle | $12.99/mo | Everything + business expense tracking, tax tagging, API access |

## Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Deployment

Deploy instantly on [Vercel](https://vercel.com) — connect your GitHub repo and add environment variables in the Vercel dashboard.

---

Built with Next.js 14 · TypeScript · Tailwind CSS · Framer Motion · Supabase · Stripe
