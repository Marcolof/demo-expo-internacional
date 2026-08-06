/**
 * Tipos transversales de la maqueta.
 *
 * Sólo va acá lo que usan dos o más dominios. Un tipo que pertenece a un
 * único módulo vive en `modules/[dominio]/types`.
 */

/** Identificador opaco. La maqueta usa strings legibles ("shp-001"). */
export type Id = string

/** Fecha en ISO 8601. Se formatea siempre con `shared/lib/formatDate`. */
export type IsoDate = string

/** Moneda soportada por la maqueta. */
export type Currency = 'ARS' | 'USD'

/** Importe monetario. Se guarda el número crudo, nunca formateado. */
export interface Money {
  readonly amount: number
  readonly currency: Currency
}

/** Estado de una carga simulada. Permite demostrar loading / error sin backend. */
export type LoadState = 'idle' | 'loading' | 'success' | 'error'

/**
 * Resultado de una acción simulada. Los `rules/*` devuelven este tipo cuando
 * necesitan explicar POR QUÉ algo no se permite (para tooltips y modales).
 */
export type ActionResult =
  | { readonly allowed: true }
  | { readonly allowed: false; readonly reason: string }

/** Helper para construir un `ActionResult` permitido. */
export const allow = (): ActionResult => ({ allowed: true })

/** Helper para construir un `ActionResult` denegado con motivo visible al usuario. */
export const deny = (reason: string): ActionResult => ({ allowed: false, reason })

/** Opción de un `Select`. */
export interface SelectOption {
  readonly value: string
  readonly label: string
  readonly disabled?: boolean
}

/** Provincia argentina, tal como las expone el HTML de referencia (value = letra). */
export interface Provincia {
  readonly code: string
  readonly name: string
}
