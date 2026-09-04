/**
 * Mapeo producto (paso Paquete) → servicio postal (paso Destino).
 * Regla simple de revisión 3 (R3-05); sin reglas extra de peso/categoría.
 */

export type ParcelShippingService = 'EMS' | 'ENCOMIENDA' | 'PEQUENO_PAQUETE'

export const PACKAGE_PRESET_TO_SERVICE: Readonly<
  Record<string, ParcelShippingService>
> = {
  'pequeno-paquete': 'PEQUENO_PAQUETE',
  encomienda: 'ENCOMIENDA',
  'encomienda-ems': 'EMS',
}

/** Devuelve el servicio postal comercial asociado al preset, o undefined si no aplica. */
export function postalServiceFromPackagePreset(
  presetId: string,
): ParcelShippingService | undefined {
  return PACKAGE_PRESET_TO_SERVICE[presetId]
}
