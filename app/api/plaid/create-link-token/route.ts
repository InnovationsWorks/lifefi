import { NextResponse } from "next/server";
import { plaidClient } from "@/lib/plaid";
import { Products, CountryCode } from "plaid";

export async function POST() {
  try {
    const response = await plaidClient.linkTokenCreate({
      user: { client_user_id: "lifefi-demo-user" },
      client_name: "LifeFi",
      products: [Products.Transactions],
      country_codes: [CountryCode.Us],
      language: "en",
    });
    return NextResponse.json({ link_token: response.data.link_token });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to create link token";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
