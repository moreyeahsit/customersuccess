/** Formats a rupee amount using Indian Lakh/Crore notation, e.g. 48_60_000 -> "₹48.6L" */
export function formatINR(value: number, opts?: { compact?: boolean }): string {
  const compact = opts?.compact ?? true
  const abs = Math.abs(value)
  const sign = value < 0 ? '-' : ''

  if (compact && abs >= 1_00_00_000) {
    return `${sign}₹${(abs / 1_00_00_000).toFixed(2)}Cr`
  }
  if (compact && abs >= 1_00_000) {
    return `${sign}₹${(abs / 1_00_000).toFixed(1)}L`
  }
  if (compact && abs >= 1_000) {
    return `${sign}₹${(abs / 1_000).toFixed(1)}K`
  }
  return `${sign}₹${abs.toLocaleString('en-IN')}`
}

export function formatNumber(value: number): string {
  return value.toLocaleString('en-IN')
}

export function formatPercent(value: number, digits = 0): string {
  return `${value.toFixed(digits)}%`
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function formatDateShort(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}
