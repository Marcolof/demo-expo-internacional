/**
 * Preset de producto/paquete para el select de medidas en el paso Paquete.
 * Interfaz abierta a propósito: se pueden sumar servicio postal, peso aforado, etc.
 */
export interface PackageProductPreset {
  readonly id: string
  readonly label: string
  readonly maxWeightKg: number
  readonly lengthCm: number
  readonly widthCm: number
  readonly heightCm: number
}
