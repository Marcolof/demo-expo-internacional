/**
 * Formateo de fechas. Siempre `es-AR`.
 *
 * Los mocks guardan ISO; el formateo pasa únicamente por acá para que las
 * grillas y los detalles no se desalineen.
 */

import type { IsoDate } from '@/core/types/common'

const DATE_FORMATTER = new Intl.DateTimeFormat('es-AR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
})

const DATE_TIME_FORMATTER = new Intl.DateTimeFormat('es-AR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

const LONG_DATE_FORMATTER = new Intl.DateTimeFormat('es-AR', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

function parse(value: IsoDate): Date | null {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

/** `"2026-08-04"` → `"04/08/2026"`. Devuelve `"-"` si la fecha no es válida. */
export function formatDate(value: IsoDate): string {
  const date = parse(value)
  return date === null ? '-' : DATE_FORMATTER.format(date)
}

/** `"2026-08-04T14:30:00Z"` → `"04/08/2026 14:30"` */
export function formatDateTime(value: IsoDate): string {
  const date = parse(value)
  return date === null ? '-' : DATE_TIME_FORMATTER.format(date)
}

/** `"2026-08-04"` → `"4 de agosto de 2026"` */
export function formatLongDate(value: IsoDate): string {
  const date = parse(value)
  return date === null ? '-' : LONG_DATE_FORMATTER.format(date)
}

/**
 * Días que faltan para una fecha. Negativo si ya pasó.
 * Se usa para la vigencia de 30 días de la documentación de un envío pagado.
 */
export function daysUntil(value: IsoDate, from: IsoDate): number | null {
  const target = parse(value)
  const origin = parse(from)
  if (target === null || origin === null) return null

  const millisecondsPerDay = 24 * 60 * 60 * 1000
  return Math.ceil((target.getTime() - origin.getTime()) / millisecondsPerDay)
}
