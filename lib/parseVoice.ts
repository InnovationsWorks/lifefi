export interface ParsedVoiceInput {
  name: string;
  amount?: number;
  limit?: number;
  dueDay?: number;
  frequency?: "monthly" | "weekly" | "yearly" | "one-time";
  type: "card" | "bill" | "utility" | "unknown";
  category: string;
  confidence: number;
}

const ONES: Record<string, number> = {
  zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5,
  six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
  eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15,
  sixteen: 16, seventeen: 17, eighteen: 18, nineteen: 19,
};
const TENS: Record<string, number> = {
  twenty: 20, thirty: 30, forty: 40, fifty: 50,
  sixty: 60, seventy: 70, eighty: 80, ninety: 90,
};
const MULTIPLIERS: Record<string, number> = { hundred: 100, thousand: 1000 };

const ORDINALS: Record<string, number> = {
  first: 1, second: 2, third: 3, fourth: 4, fifth: 5,
  sixth: 6, seventh: 7, eighth: 8, ninth: 9, tenth: 10,
  eleventh: 11, twelfth: 12, thirteenth: 13, fourteenth: 14, fifteenth: 15,
  sixteenth: 16, seventeenth: 17, eighteenth: 18, nineteenth: 19,
  twentieth: 20, thirtieth: 30,
};

const ONES_ORDINALS = ["first","second","third","fourth","fifth","sixth","seventh","eighth","ninth"];
const TWO_WORD_ORDINALS: Record<string, number> = {};
ONES_ORDINALS.forEach((w, i) => {
  TWO_WORD_ORDINALS[`twenty ${w}`] = 21 + i;
  TWO_WORD_ORDINALS[`thirty ${w}`] = 31 + i;
});

function wordsToNumber(tokens: string[]): { value: number; consumed: number } | null {
  let total = 0, current = 0, i = 0, found = false;
  while (i < tokens.length) {
    const w = tokens[i];
    if (ONES[w] !== undefined) { current += ONES[w]; found = true; i++; }
    else if (TENS[w] !== undefined) { current += TENS[w]; found = true; i++; }
    else if (MULTIPLIERS[w] !== undefined) {
      const m = MULTIPLIERS[w];
      if (m === 100) current = current === 0 ? 100 : current * 100;
      else { total += (current === 0 ? 1 : current) * m; current = 0; }
      found = true; i++;
    } else break;
  }
  return found ? { value: total + current, consumed: i } : null;
}

function extractAmount(tokens: string[]): { amount: number; start: number; end: number } | null {
  for (let i = 0; i < tokens.length; i++) {
    const num = parseFloat(tokens[i].replace(/[$,]/g, ""));
    if (!isNaN(num) && num > 0) return { amount: num, start: i, end: i + 1 };
  }
  for (let i = 0; i < tokens.length; i++) {
    const res = wordsToNumber(tokens.slice(i));
    if (!res || res.value <= 0) continue;
    const end = i + res.consumed;
    const next = tokens[end];
    if (next === "dollars" || next === "dollar") return { amount: res.value, start: i, end: end + 1 };
    if (res.value < 1000 && end < tokens.length) {
      const cents = wordsToNumber(tokens.slice(end));
      if (cents && cents.value < 100) return { amount: res.value + cents.value / 100, start: i, end: end + cents.consumed };
    }
    return { amount: res.value, start: i, end };
  }
  return null;
}

function extractDueDay(tokens: string[]): { day: number; start: number; end: number } | null {
  for (let i = 0; i + 1 < tokens.length; i++) {
    const two = `${tokens[i]} ${tokens[i + 1]}`;
    if (TWO_WORD_ORDINALS[two] !== undefined) return { day: TWO_WORD_ORDINALS[two], start: i, end: i + 2 };
  }
  for (let i = 0; i < tokens.length; i++) {
    if (ORDINALS[tokens[i]] !== undefined) return { day: ORDINALS[tokens[i]], start: i, end: i + 1 };
    const m = tokens[i].match(/^(\d+)(st|nd|rd|th)$/);
    if (m) { const d = parseInt(m[1]); if (d >= 1 && d <= 31) return { day: d, start: i, end: i + 1 }; }
  }
  return null;
}

function extractFrequency(text: string): ParsedVoiceInput["frequency"] {
  if (/\b(every month|monthly|per month|each month)\b/i.test(text)) return "monthly";
  if (/\b(every week|weekly|per week|each week)\b/i.test(text)) return "weekly";
  if (/\b(every year|yearly|annually|annual|per year)\b/i.test(text)) return "yearly";
  if (/\b(one.?time|once|single)\b/i.test(text)) return "one-time";
  return undefined;
}

function detectType(text: string): ParsedVoiceInput["type"] {
  if (/\b(credit card|debit card)\b/i.test(text)) return "card";
  if (/\b(electric|electricity|water|gas|internet|broadband|phone|mobile)\b/i.test(text)) return "utility";
  if (/\b(bill|subscription|membership|insurance|payment|rent|mortgage)\b/i.test(text)) return "bill";
  return "unknown";
}

function detectCategory(text: string): string {
  if (/\b(netflix|hulu|disney|spotify|apple tv|youtube|hbo|peacock|amazon prime|prime video)\b/i.test(text)) return "Entertainment";
  if (/\b(electric|electricity|water|gas|internet|broadband|phone|mobile)\b/i.test(text)) return "Utilities";
  if (/\b(rent|mortgage)\b/i.test(text)) return "Housing";
  if (/\b(insurance)\b/i.test(text)) return "Insurance";
  if (/\b(gym|fitness|workout)\b/i.test(text)) return "Health";
  if (/\b(car|auto)\b/i.test(text)) return "Transport";
  return "Other";
}

const NOISE = new Set([
  "add","the","a","an","my","i","want","to","please","limit","balance",
  "amount","due","date","on","every","dollars","dollar","cents","cent",
  "per","each","credit","debit","card","bill","utility","subscription",
  "membership","payment","month","week","year","and","of","with",
]);

export function parseVoiceInput(text: string): ParsedVoiceInput {
  const cleaned = text.toLowerCase().trim();
  const tokens = cleaned.split(/\s+/);
  const type = detectType(cleaned);
  const category = detectCategory(cleaned);
  const frequency = extractFrequency(cleaned);
  const used = new Set<number>();

  tokens.forEach((t, i) => { if (NOISE.has(t)) used.add(i); });

  const amtResult = extractAmount(tokens);
  let amount: number | undefined;
  if (amtResult) { amount = amtResult.amount; for (let i = amtResult.start; i < amtResult.end; i++) used.add(i); }

  const dayResult = extractDueDay(tokens);
  let dueDay: number | undefined;
  if (dayResult) { dueDay = dayResult.day; for (let i = dayResult.start; i < dayResult.end; i++) used.add(i); }

  const nameParts: string[] = [];
  tokens.forEach((t, i) => { if (!used.has(i) && !NOISE.has(t)) nameParts.push(t); });
  const name = nameParts.slice(0, 4).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ") || "Unknown";

  let confidence = 0.4;
  if (name !== "Unknown") confidence += 0.15;
  if (amount !== undefined) confidence += 0.25;
  if (dueDay !== undefined) confidence += 0.1;
  if (frequency) confidence += 0.1;

  return {
    name,
    amount: type === "card" ? undefined : amount,
    limit: type === "card" ? amount : undefined,
    dueDay,
    frequency,
    type: type === "unknown" ? "bill" : type,
    category,
    confidence: Math.min(confidence, 1),
  };
}

export function formatParsedSummary(p: ParsedVoiceInput): string {
  const parts: string[] = [p.name];
  if (p.amount !== undefined) parts.push(`$${p.amount.toFixed(2)}`);
  else if (p.limit !== undefined) parts.push(`limit $${p.limit.toLocaleString()}`);
  if (p.dueDay) parts.push(`due the ${ordSuffix(p.dueDay)}`);
  if (p.frequency) parts.push(p.frequency);
  return parts.join(" · ");
}

function ordSuffix(n: number): string {
  const s = ["th","st","nd","rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}
