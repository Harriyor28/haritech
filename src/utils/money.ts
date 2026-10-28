/* One naira formatter for the whole site.
   - Full value, no rounding to the nearest thousand.
   - Fixed en-NG grouping, so a non-Nigerian browser locale cannot produce 1,50,000.
   - Handles the boundary that previously rendered ₦999,999 as "₦1000,000". */
export function formatNaira(value: number): string {
  const safe = Number.isFinite(value) ? Math.round(value) : 0;
  return `₦${safe.toLocaleString('en-NG')}`;
}

/** Compact form for tight cards: ₦950k, ₦2.5m, ₦12m. Exact at the boundary. */
export function formatNairaShort(value: number): string {
  const safe = Number.isFinite(value) ? Math.round(value) : 0;
  if (Math.abs(safe) >= 1_000_000) {
    const millions = safe / 1_000_000;
    return `₦${Number.isInteger(millions) ? millions : millions.toFixed(1)}m`;
  }
  if (Math.abs(safe) >= 1_000) {
    const thousands = safe / 1_000;
    return `₦${Number.isInteger(thousands) ? thousands : thousands.toFixed(1)}k`;
  }
  return `₦${safe}`;
}

/** "₦35,000/m²" or "₦25,000/month". */
export function formatUnitPrice(value: number, unit: string | null): string {
  return unit ? `${formatNaira(value)}/${unit}` : formatNaira(value);
}
