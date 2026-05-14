import { NextRequest, NextResponse } from "next/server";
import { plaidClient } from "@/lib/plaid";

export async function POST(req: NextRequest) {
  try {
    const { public_token, institution } = await req.json() as {
      public_token: string;
      institution: { institution_id: string; name: string } | null;
    };

    const exchangeResponse = await plaidClient.itemPublicTokenExchange({
      public_token,
    });

    const { access_token, item_id } = exchangeResponse.data;

    const res = NextResponse.json({
      success: true,
      item_id,
      institution_name: institution?.name ?? "Your Bank",
      institution_id:   institution?.institution_id ?? "",
    });

    res.cookies.set("plaid_access_token", access_token, {
      httpOnly: true,
      secure:   process.env.NODE_ENV === "production",
      sameSite: "strict",
      path:     "/",
      maxAge:   60 * 60 * 24 * 30,
    });

    return res;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Token exchange failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
