import { NextRequest, NextResponse } from "next/server";
import { plaidClient } from "@/lib/plaid";

export async function GET(req: NextRequest) {
  const accessToken = req.cookies.get("plaid_access_token")?.value;

  if (!accessToken) {
    return NextResponse.json({ error: "No connected account" }, { status: 401 });
  }

  try {
    const response = await plaidClient.accountsGet({ access_token: accessToken });

    const accounts = response.data.accounts.map((a) => ({
      account_id:        a.account_id,
      name:              a.name,
      official_name:     a.official_name ?? null,
      mask:              a.mask ?? null,
      type:              a.type as string,
      subtype:           a.subtype as string | null,
      current_balance:   a.balances.current  ?? null,
      available_balance: a.balances.available ?? null,
      limit:             a.balances.limit ?? null,
    }));

    return NextResponse.json({ accounts });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to fetch accounts";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
