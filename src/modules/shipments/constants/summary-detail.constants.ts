/** Valores hardcodeados del dropdown Detalle del resumen internacional (MVP1). */
export interface SummaryDetailRow {
  readonly label: string
  readonly amountArs: number
}

export const SUMMARY_DETAIL_ROWS: readonly SummaryDetailRow[] = [
  { label: 'Servicio Postal', amountArs: 10000 },
  { label: 'Servicio de Entrega', amountArs: 10000 },
  { label: 'Costos de representación', amountArs: 10000 },
  { label: 'Tributos incluidos', amountArs: 0 },
  { label: 'Total', amountArs: 10000 },
]

/** Derechos de exportación (declaración / resumen). */
/** Mock demo: tasa % sobre valor declarado hasta regla real de aduana. */
export const EXPORT_DUTIES_RATE = 0.05

export function computeExportDutiesUsd(totalValueUsd: number): number {
  if (!Number.isFinite(totalValueUsd) || totalValueUsd <= 0) return 0
  return Math.round(totalValueUsd * EXPORT_DUTIES_RATE * 100) / 100
}

/** @deprecated Preferí computeExportDutiesUsd; se mantiene en 0 para callers legacy. */
export const EXPORT_DUTIES_USD = 0

export const SHIPPING_SERVICE_PRICES_ARS: Readonly<Record<string, number>> = {
  EMS: 15000,
  ENCOMIENDA: 10000,
  PEQUENO_PAQUETE: 7500,
  EMS_DOCUMENTACION: 8000,
}

/** Tope de peso del contenido declarado (paso Declaración). */
export const PACKAGE_MAX_WEIGHT_KG = 20

/**
 * Peso máximo del paquete con embalaje (paso Paquete).
 * Mismo tope que el contenido declarado: 20 kg.
 */
export const PACKAGE_GROSS_MAX_WEIGHT_KG = PACKAGE_MAX_WEIGHT_KG

/**
 * Margen de embalaje para Peso Total Aforado (artículos + esta constante).
 * Placeholder hasta que negocio defina el valor o un porcentaje.
 */
export const PACKAGE_PACKING_ALLOWANCE_KG = 0

/** Suma máxima largo + ancho + alto (cm) en el paso Paquete. */
export const PACKAGE_MAX_SUM_OF_SIDES_CM = 300

export const PACKAGE_MAX_WEIGHT_LABEL = 'Peso máximo (tener en cuenta el peso del embalaje)'

export const PACKAGE_MAX_WEIGHT_TOOLTIP =
  'Peso máximo (tener en cuenta el peso del embalaje). El límite es 20 kg incluyendo embalaje.'

export const PACKAGE_GROSS_MAX_WEIGHT_TOOLTIP =
  'Peso máximo (tener en cuenta el peso del embalaje). El límite es 20 kg incluyendo embalaje.'

/** Costo adicional si se desactiva representación ante Aduana. */
export const ADUANA_WITHOUT_REPRESENTATION_COST_ARS = 16000

export const INFO_VIGENTE_PATH = '/informacion-vigente'
export const INFO_VIGENTE_URL = 'https://www.correoargentino.com.ar/informacion-vigente'
export const VUCE_URL = 'https://www.vuce.gob.ar/'
