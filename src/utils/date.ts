/** Formata data ISO (yyyy-MM-dd ou ISO completo) para pt-BR (dd/mm/aaaa). */
export function formatDate(value: string | Date | null | undefined): string {
  if (!value) return '—'
  const date = typeof value === 'string' ? new Date(value) : value
  if (Number.isNaN(date.getTime())) return '—'
  return new Intl.DateTimeFormat('pt-BR').format(date)
}

/** Formata data/hora ISO para pt-BR. */
export function formatDateTime(value: string | Date | null | undefined): string {
  if (!value) return '—'
  const date = typeof value === 'string' ? new Date(value) : value
  if (Number.isNaN(date.getTime())) return '—'
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short'
  }).format(date)
}

/** Data de hoje no formato yyyy-MM-dd (timezone local). */
export function todayISO(): string {
  return toISODate(new Date())
}

/** Converte Date → yyyy-MM-dd (timezone local). */
export function toISODate(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/** Primeiro dia do mês atual em yyyy-MM-dd. */
export function startOfMonthISO(date = new Date()): string {
  return toISODate(new Date(date.getFullYear(), date.getMonth(), 1))
}

/** Último dia do mês atual em yyyy-MM-dd. */
export function endOfMonthISO(date = new Date()): string {
  return toISODate(new Date(date.getFullYear(), date.getMonth() + 1, 0))
}

/** Retorna { from, to } de um mês N meses atrás (deslocado em relação a hoje). */
export function monthRange(monthsAgo: number): { from: string; to: string } {
  const now = new Date()
  const from = new Date(now.getFullYear(), now.getMonth() - monthsAgo, 1)
  return { from: toISODate(from), to: todayISO() }
}

/** Rótulo curto do mês (ex.: "ago/26") a partir de "2026-08". */
export function shortMonthLabel(month: string): string {
  if (!month || month.length < 7) return month
  const [y, m] = month.split('-')
  const months = [
    'jan', 'fev', 'mar', 'abr', 'mai', 'jun',
    'jul', 'ago', 'set', 'out', 'nov', 'dez'
  ]
  const mi = Number(m) - 1
  return `${mi >= 0 && mi < 12 ? months[mi] : m}/${String(y).slice(2)}`
}
