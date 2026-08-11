/** Formata um valor decimal em moeda BRL (pt-BR). */
export function formatCurrency(value: number | null | undefined): string {
  const amount = value ?? 0
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(amount)
}

/** Converte string de moeda pt-BR (ex.: "1.234,56" ou "R$ 1.234,56") em número. */
export function parseCurrency(input: string): number {
  if (!input) return 0
  const cleaned = input
    .replace(/R\$\s?/gi, '')
    .replace(/\./g, '')
    .replace(',', '.')
    .trim()
  const parsed = Number(cleaned)
  return Number.isFinite(parsed) ? parsed : 0
}

/** Formata um número como percentual (0–100 → "12,3%"). */
export function formatPercent(value: number | null | undefined, digits = 1): string {
  const v = value ?? 0
  return new Intl.NumberFormat('pt-BR', {
    style: 'percent',
    minimumFractionDigits: 0,
    maximumFractionDigits: digits
  }).format(v / 100)
}
