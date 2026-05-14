import { NextRequest, NextResponse } from "next/server";
import { plaidClient } from "@/lib/plaid";

export async function GET(req: NextRequest) {
  const accessToken = req.cookies.get("plaid_access_token")?.value;

  if (!accessToken) {
    return NextResponse.json({ error: "No connected account" }, { status: 401 });
  }

  try {
    const end   = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 30);

    const fmt = (d: Date) => d.toISOString().split("T")[0];

    const response = await plaidClient.transactionsGet({
      access_token: accessToken,
      start_date:   fmt(start),
      end_date:     fmt(end),
      options:      { count: 50, offset: 0 },
    });

    const transactions = response.data.transactions.map((t) => ({
      transaction_id: t.transaction_id,
      account_id:     t.account_id,
      name:           t.name,
      amount:         t.amount,
      date:           t.date,
      category:       t.personal_finance_category?.primary ?? (t.category?.[0] ?? "Other"),
      merchant_name:  t.merchant_name ?? null,
      pending:        t.pending,
    }));

    return NextResponse.json({
      transactions,
      total: response.data.total_transactions,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to fetch transactions";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
