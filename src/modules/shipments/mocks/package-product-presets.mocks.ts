/**
 * Catálogo de productos/paquete para el select del paso Paquete (internacional).
 * Figma muestra el campo como "Medidas frecuentes"; el pedido actual de UI
 * usa el label "Productos". Las medidas L×A×H son ejemplos de maqueta.
 */

import type { SelectOption } from '@/core/types/common'
import type { PackageProductPreset } from '../types/package-product-preset.types'

export const PACKAGE_PRODUCT_PRESETS: readonly PackageProductPreset[] = [
  {
    id: 'pequeno-paquete',
    label: 'Pequeño paquete (Hasta 2kg)',
    maxWeightKg: 2,
    lengthCm: 25,
    widthCm: 18,
    heightCm: 10,
  },
  {
    id: 'encomienda',
    label: 'Encomienda (Hasta 20kg)',
    maxWeightKg: 20,
    lengthCm: 45,
    widthCm: 35,
    heightCm: 25,
  },
  {
    id: 'encomienda-ems',
    label: 'Encomienda EMS (Hasta 20kg)',
    maxWeightKg: 20,
    lengthCm: 50,
    widthCm: 40,
    heightCm: 30,
  },
]

export const PACKAGE_PRODUCT_OPTIONS: readonly SelectOption[] = PACKAGE_PRODUCT_PRESETS.map(
  (preset) => ({ value: preset.id, label: preset.label }),
)

/** Oculta productos cuyo tope es menor al peso declarado en el paso anterior. */
export function packageProductOptionsForDeclaredWeight(
  declaredWeightKg: number,
): readonly SelectOption[] {
  return PACKAGE_PRODUCT_PRESETS.filter((preset) => declaredWeightKg <= preset.maxWeightKg).map(
    (preset) => ({ value: preset.id, label: preset.label }),
  )
}

export function findPackageProductPreset(id: string): PackageProductPreset | undefined {
  return PACKAGE_PRODUCT_PRESETS.find((preset) => preset.id === id)
}
