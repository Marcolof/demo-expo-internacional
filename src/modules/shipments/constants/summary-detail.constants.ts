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

/** Derechos de exportación (declaración / resumen) — hardcode MVP1. */
export const EXPORT_DUTIES_USD = 0

/** Peso máximo de paquete (kg) documentado en UI. */
export const PACKAGE_MAX_WEIGHT_KG = 20

export const PACKAGE_MAX_WEIGHT_LABEL = 'Peso máximo (tener en cuenta el peso del embalaje)'

export const PACKAGE_MAX_WEIGHT_TOOLTIP =
  'Peso máximo (tener en cuenta el peso del embalaje). El límite es 20 kg incluyendo embalaje.'

/** Costo adicional si se desactiva representación ante Aduana. */
export const ADUANA_WITHOUT_REPRESENTATION_COST_ARS = 16000

export const INFO_VIGENTE_URL = 'https://www.correoargentino.com.ar/información-vigente'
export const VUCE_URL = 'https://www.vuce.gob.ar/'
