export function toNum(v: unknown, fallback = 0): number {
  if (typeof v === 'number') return v
  if (typeof v === 'string' && v.trim() !== '') {
    const n = Number(v.replace(/,/g, '').trim())
    if (!Number.isNaN(n)) return n
  }
  return fallback
}

export function toOptionalNum(v: unknown): number | undefined {
  if (v === undefined || v === null || v === '') return undefined
  return toNum(v)
}

export function toStr(v: unknown, fallback = ''): string {
  if (v === undefined || v === null) return fallback
  return String(v).trim()
}

export function toBool(v: unknown): boolean {
  if (typeof v === 'boolean') return v
  const s = String(v ?? '').trim().toLowerCase()
  return s === 'true' || s === 'yes' || s === '1'
}

export function toIsoDate(v: unknown): string {
  if (v instanceof Date) return v.toISOString().slice(0, 10)
  if (typeof v === 'number') {
    // Excel serial date (days since 1899-12-30)
    const ms = Math.round((v - 25569) * 86400 * 1000)
    return new Date(ms).toISOString().slice(0, 10)
  }
  const s = toStr(v)
  const parsed = new Date(s)
  if (!Number.isNaN(parsed.getTime()) && /^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10)
  if (!Number.isNaN(parsed.getTime())) return parsed.toISOString().slice(0, 10)
  return s
}

export function toList(v: unknown): string[] {
  const s = toStr(v)
  if (!s) return []
  return s.split(',').map((x) => x.trim()).filter(Boolean)
}
