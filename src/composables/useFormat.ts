import { formatCurrency, formatPercent, parseCurrency } from '@/utils/currency'
import { formatDate, formatDateTime } from '@/utils/date'

/** Helpers de formatação pt-BR (moeda, data, percentual). */
export function useFormat() {
  return {
    currency: formatCurrency,
    percent: formatPercent,
    date: formatDate,
    dateTime: formatDateTime,
    parseCurrency
  }
}
