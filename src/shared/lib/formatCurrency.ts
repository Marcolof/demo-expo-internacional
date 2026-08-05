/**
 * Formateo de importes.
 *
 * La maqueta muestra pesos argentinos con el formato local (punto para miles,
 * coma para decimales) y dólares para el valor declarado de los envíos
 * internacionales.
 */

import type { Currency, Money } from '@/core/types/common'

const FORMATTERS: Record<Currency, Intl.NumberFormat> = {
  ARS: new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }),
  USD: new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }),
}

/** `formatMoney({ amount: 12345.6, currency: 'ARS' })` → `"$ 12.345,60"` */
export function formatMoney(money: Money): string {
  return FORMATTERS[money.currency].format(money.amount)
}

/** Igual que `formatMoney` pero a partir de número + moneda sueltos. */
export function formatCurrency(amount: number, currency: Currency = 'ARS'): string {
  return FORMATTERS[currency].format(amount)
}

/**
 * Formato del panel de saldo del HTML de referencia: `"12.345,60"` sin símbolo,
 * porque el template ya escribe `$` y `ARS` alrededor del número.
 */
export function formatAmountOnly(amount: number): string {
  return new Intl.NumberFormat('es-AR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

/**
 * Dólares con el prefijo `"USD"` en lugar del símbolo `$` (declaración de
 * envíos internacionales). `1250` → `"USD 1.250,00"`
 */
export function formatUsd(amount: number): string {
  return `USD ${formatAmountOnly(amount)}`
}

/** Peso en kilogramos, con hasta 3 decimales. `1.5` → `"1,5 kg"` */
export function formatWeightKg(kilograms: number): string {
  const value = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 3 }).format(kilograms)
  return `${value} kg`
}

/** Medidas del paquete en centímetros. `"30 x 20 x 10 cm"` */
export function formatDimensionsCm(lengthCm: number, widthCm: number, heightCm: number): string {
  return `${lengthCm} x ${widthCm} x ${heightCm} cm`
}
