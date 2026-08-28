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

/** Tope de peso del contenido declarado (paso Declaración). */
export const PACKAGE_MAX_WEIGHT_KG = 20

/**
 * Peso máximo del paquete con embalaje (paso Paquete).
 * Distinto del tope de contenido declarado: Figma del paso Paquete usa 50 kg.
 */
export const PACKAGE_GROSS_MAX_WEIGHT_KG = 50

/** Suma máxima largo + ancho + alto (cm) en el paso Paquete. */
export const PACKAGE_MAX_SUM_OF_SIDES_CM = 300

export const PACKAGE_MAX_WEIGHT_LABEL = 'Peso máximo (tener en cuenta el peso del embalaje)'

export const PACKAGE_MAX_WEIGHT_TOOLTIP =
  'Peso máximo (tener en cuenta el peso del embalaje). El límite es 20 kg incluyendo embalaje.'

export const PACKAGE_GROSS_MAX_WEIGHT_TOOLTIP =
  'Peso máximo (tener en cuenta el peso del embalaje). El límite es 50 kg incluyendo embalaje.'

/** Costo adicional si se desactiva representación ante Aduana. */
export const ADUANA_WITHOUT_REPRESENTATION_COST_ARS = 16000

export const INFO_VIGENTE_URL = 'https://www.correoargentino.com.ar/información-vigente'
export const VUCE_URL = 'https://www.vuce.gob.ar/'
