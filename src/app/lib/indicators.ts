export type Candle = { d: string; close: number };

export function sma(values: number[], period: number): (number | null)[] {
  const out: (number | null)[] = Array(values.length).fill(null);
  let sum = 0;
  for (let i = 0; i < values.length; i++) {
    sum += values[i];
    if (i >= period) sum -= values[i - period];
    if (i >= period - 1) out[i] = sum / period;
  }
  return out;
}

export function rsi(values: number[], period = 14): (number | null)[] {
  const out: (number | null)[] = Array(values.length).fill(null);
  if (values.length <= period) return out;

  let gains = 0, losses = 0;
  for (let i = 1; i <= period; i++) {
    const diff = values[i] - values[i - 1];
    if (diff >= 0) gains += diff; else losses -= diff;
  }

  let avgG = gains / period;
  let avgL = losses / period;
  out[period] = avgL === 0 ? 100 : 100 - 100 / (1 + (avgG / avgL));

  for (let i = period + 1; i < values.length; i++) {
    const diff = values[i] - values[i - 1];
    const up = Math.max(diff, 0);
    const down = Math.max(-diff, 0);
    avgG = (avgG * (period - 1) + up) / period;
    avgL = (avgL * (period - 1) + down) / period;
    out[i] = avgL === 0 ? 100 : 100 - 100 / (1 + (avgG / avgL));
  }
  return out;
}
