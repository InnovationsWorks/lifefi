import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";

const client = new Anthropic();

const PROMPTS: Record<string, string> = {
  card: `You are analyzing a credit card image. Extract the following and respond ONLY with valid JSON, no other text:
{
  "name": "full card name e.g. Chase Sapphire Preferred",
  "last4": "last 4 digits as string e.g. 4242",
  "expiry": "expiry date as MM/YY e.g. 12/27",
  "amount": credit limit as number (estimate if not visible: Sapphire=10000, Amex Gold=15000, Capital One=5000, generic=5000),
  "dueDay": payment due day as number (use 15 if not visible),
  "category": "card"
}
If a field is not visible, use a reasonable default or null for name/last4/expiry.`,

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
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return NextResponse.json({ error: "Parse failed" }, { status: 500 });

    const extracted = JSON.parse(jsonMatch[0]);
    return NextResponse.json(extracted);
  } catch (err) {
    console.error("Claude analyze-image error:", err);
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 });
  }
}
