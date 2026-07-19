/** Цена винаги с точно 2 знака след десетичната (13.4 → 13,40; 13.4239 → 13,42). */
export function formatEuro(price: number | string): string {
  return Number(price).toLocaleString('bg-BG', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}
