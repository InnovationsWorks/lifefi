import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";

const client = new Anthropic();

const PROMPTS: Record<string, string> = {
  card: `You are analyzing an image of a credit or debit card — it may be the front or the back. Some cards (e.g. Wells Fargo, certain Visa cards) print the full card number on the back. Look carefully at ALL visible text, numbers, and logos on the entire card.

Respond ONLY with valid JSON, no other text:
{
  "name": "Bank name + card product name e.g. 'Wells Fargo Active Cash' or 'Chase Sapphire Preferred' or 'Amex Gold'",
  "last4": "last 4 digits of the card number as a string — check front AND back",
  "expiry": "expiry date in MM/YY format e.g. '12/27'",
  "network": "Visa, Mastercard, Amex, Discover, or null",
  "amount": estimated credit limit as a number,
  "dueDay": 15,
  "category": "card"
}

Rules:
- last4: find any 16-digit (or 15-digit Amex) number anywhere on the card — take the last 4 digits. The number may be split into groups of 4.
- name: combine the bank/issuer name (from logo or text) with the card product name if visible. If only the bank is visible, use just the bank name.
- expiry: look for MM/YY or MM/YYYY anywhere — convert to MM/YY.
- network: identify from logo (Visa logo, Mastercard circles, Amex, Discover) or card number prefix.
- amount: estimate based on card tier — premium/travel cards (Sapphire, Amex Platinum/Gold, Venture X) = 15000, cashback cards = 8000, basic/student = 3000, unknown = 5000.
- Always return your best partial result — never return all nulls if ANY card details are visible.
- If this is clearly not a payment card at all, set name to null.`,

  bill: `You are analyzing a bill or statement image. Extract the following and respond ONLY with valid JSON, no other text:
{
  "name": "provider or company name",
  "amount": amount due as number,
  "dueDay": day of month payment is due as number,
  "category": one of: "Housing", "Entertainment", "Insurance", "Health", "Transport", "Software", "Shopping", "Phone", "Internet", "Other"
}
If amount or dueDay is not visible use null.`,

  utility: `You are analyzing a utility bill or statement image. Extract the following and respond ONLY with valid JSON, no other text:
{
  "name": "utility provider name",
  "amount": amount due as number,
  "dueDay": day of month payment is due as number,
  "category": one of: "electric", "gas", "water", "internet", "phone", "other"
}
If amount or dueDay is not visible use null.`,
};

export async function POST(request: NextRequest) {
  try {
    // Verify auth
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { imageBase64, mimeType, mode } = await request.json();

    if (!imageBase64 || !mode || !PROMPTS[mode]) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const validMime = ["image/jpeg", "image/png", "image/gif", "image/webp"].includes(mimeType)
      ? mimeType as "image/jpeg" | "image/png" | "image/gif" | "image/webp"
      : "image/jpeg";

    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 256,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: { type: "base64", media_type: validMime, data: imageBase64 },
            },
            { type: "text", text: PROMPTS[mode] },
          ],
        },
      ],
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "";
    // Strip markdown code fences if present, then extract JSON object
    const stripped = text.replace(/```(?:json)?\s*/gi, "").replace(/```/g, "").trim();
    const jsonMatch = stripped.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return NextResponse.json({ error: "Parse failed" }, { status: 500 });

    const extracted = JSON.parse(jsonMatch[0]);
    // Coerce nulls to undefined so the client can detect missing fields
    for (const key of Object.keys(extracted)) {
      if (extracted[key] === null) extracted[key] = undefined;
    }
    return NextResponse.json(extracted);
  } catch (err) {
    console.error("Claude analyze-image error:", err);
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 });
  }
}
