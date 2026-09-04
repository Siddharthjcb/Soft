/**
 * Format an integer paise amount as an INR string, e.g. 499900 -> "₹4,999".
 * All money in this app is stored as integer paise (CLAUDE.md).
 */
export function formatINR(paise: number): string {
  const rupees = paise / 100;
  return `₹${rupees.toLocaleString("en-IN", {
    maximumFractionDigits: Number.isInteger(rupees) ? 0 : 2,
  })}`;
}
