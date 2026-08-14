/**
 * Validadores reutilizables.
 *
 * Devuelven `string | null`: el mensaje de error, o `null` si está bien.
 * Los esquemas de cada módulo (`forms/*.schema.ts`) los componen; acá no hay
 * ninguna regla de negocio de un dominio en particular.
 */

export type ValidationError = string | null

/** Campo obligatorio. El texto es el del HTML de referencia. */
export function required(value: string | null | undefined): ValidationError {
  if (value === null || value === undefined || value.trim() === '') {
    return '* Campo obligatorio'
  }
  return null
}

export function maxLength(value: string, max: number): ValidationError {
  return value.length > max ? `Máximo ${max} caracteres.` : null
}

export function minLength(value: string, min: number): ValidationError {
  return value.length < min ? `Mínimo ${min} caracteres.` : null
}

export function isEmail(value: string): ValidationError {
  if (value.trim() === '') return null
  // Validación deliberadamente laxa: la maqueta no valida mails de verdad.
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)
    ? null
    : 'Ingresá un correo electrónico válido.'
}

/** Sólo dígitos. `allowEmpty` permite dejar el campo vacío. */
export function isNumeric(value: string, allowEmpty = true): ValidationError {
  if (value.trim() === '') return allowEmpty ? null : '* Campo obligatorio'
  return /^\d+$/.test(value) ? null : 'Ingresá sólo números.'
}

/** Número decimal positivo (peso, medidas, valores). Acepta coma o punto. */
export function isPositiveNumber(value: string, allowEmpty = true): ValidationError {
  if (value.trim() === '') return allowEmpty ? null : '* Campo obligatorio'
  const parsed = Number(value.replace(',', '.'))
  if (Number.isNaN(parsed)) return 'Ingresá un número válido.'
  return parsed > 0 ? null : 'El valor debe ser mayor a cero.'
}

/** Código postal argentino: 4 dígitos. */
export function isArgentinePostalCode(value: string): ValidationError {
  if (value.trim() === '') return null
  return /^\d{4}$/.test(value) ? null : 'El código postal debe tener 4 números.'
}

/**
 * CUIT/CUIL argentino. Valida formato y dígito verificador.
 * Se usa para el CUIT de la cuenta y para "Designar representante".
 */
export function isCuit(value: string): ValidationError {
  if (value.trim() === '') return null

  const digits = value.replace(/\D/g, '')
  if (digits.length !== 11) return 'El CUIT/CUIL debe tener 11 números.'

  const weights = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2]
  let sum = 0
  for (let index = 0; index < weights.length; index += 1) {
    sum += Number(digits[index]) * (weights[index] as number)
  }

  const remainder = 11 - (sum % 11)
  const expected = remainder === 11 ? 0 : remainder === 10 ? 9 : remainder

  return Number(digits[10]) === expected ? null : 'El CUIT/CUIL ingresado no es válido.'
}

/** Número decimal no negativo con hasta 2 decimales (montos). Acepta coma o punto. */
export function isMoneyAmount(value: string, allowEmpty = true): ValidationError {
  if (value.trim() === '') return allowEmpty ? null : '* Campo obligatorio'
  const normalized = value.replace(',', '.')
  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) {
    return 'Ingresá un monto con hasta 2 decimales.'
  }
  const parsed = Number(normalized)
  if (Number.isNaN(parsed) || parsed < 0) return 'Ingresá un monto válido.'
  return null
}

/** Formatea dígitos a máscara CUIT `XX-YYYYYYYY-Z`. */
export function formatCuitMask(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 11)
  if (digits.length <= 2) return digits
  if (digits.length <= 10) return `${digits.slice(0, 2)}-${digits.slice(2)}`
  return `${digits.slice(0, 2)}-${digits.slice(2, 10)}-${digits.slice(10)}`
}

/** Formatea dígitos a máscara CUIL/CUIT con puntos `XX.XXXXXXXX.X` (Figma stepper 4). */
export function formatCuitDotsMask(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 11)
  if (digits.length <= 2) return digits
  if (digits.length <= 10) return `${digits.slice(0, 2)}.${digits.slice(2)}`
  return `${digits.slice(0, 2)}.${digits.slice(2, 10)}.${digits.slice(10)}`
}

/** Placeholder de longitud de referencia para CUIL con puntos. */
export const CUIT_DOTS_PLACEHOLDER = '20.31211156.3'

/**
 * Identificación tributaria del destinatario en el país de destino (ej. CPF de
 * Brasil). Alfanumérico flexible: NO se valida como CUIT argentino.
 */
export function isForeignTaxId(value: string): ValidationError {
  if (value.trim() === '') return null
  return /^[A-Za-z0-9.\-/]{3,30}$/.test(value)
    ? null
    : 'Ingresá una identificación tributaria válida.'
}

/** Devuelve el primer error de una lista de validaciones. */
export function firstError(...errors: readonly ValidationError[]): ValidationError {
  return errors.find((error) => error !== null) ?? null
}
