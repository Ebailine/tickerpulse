const POS = ["beats", "beat", "surge", "record", "rallies", "rally", "upgrade", "outperform", "raises", "strong", "positive", "bullish", "growth"];
const NEG = ["miss", "misses", "cut", "cuts", "downgrade", "fall", "falls", "plunge", "plunges", "slump", "warns", "guidance", "negative", "bearish", "lawsuit", "probe"];

export function scoreSentiment(title: string, summary?: string) {
  const text = (title + " " + (summary || "")).toLowerCase();
  let score = 0;
  for (const p of POS) if (text.includes(p)) score += 1;
  for (const n of NEG) if (text.includes(n)) score -= 1;
  return score > 0 ? "bullish" : score < 0 ? "bearish" : "neutral";
}
