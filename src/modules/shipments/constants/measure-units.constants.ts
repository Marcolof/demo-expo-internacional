import type { SelectOption } from '@/core/types/common'

/**
 * Unidades de medida para posición arancelaria (MVP1).
 * Filtro revisión 2: solo longitudinales y de peso (sin área, volumen, conteo, etc.).
 * Fuente original: documentation/feedback-mvp1-revision/unidades-medida.md
 */
const MEASURE_UNIT_LABELS = [
  'KILOGRAMO',
  'GRAMO',
  'MILIGRAMO',
  'MICROGRAMO',
  'NANOGRAMO',
  'PICOGRAMO',
  'TONELADA',
  'KGBASE',
  'KG.BRUTO',
  'KGACTIVO',
  'GRACTIVO',
  'GRAMO BASE',
  'QUILATE',
  'METRO',
  'KILOMETRO',
  'CENTIMETRO',
  'MILIMETRO',
] as const

export type MeasureUnit = (typeof MEASURE_UNIT_LABELS)[number]

export const DEFAULT_MEASURE_UNIT: MeasureUnit = 'KILOGRAMO'

/** Unidades de conteo (enteros). Vacío: el filtro actual solo deja longitudinales/peso. */
const INTEGER_MEASURE_UNITS: ReadonlySet<string> = new Set()

export function measureUnitRequiresInteger(unit: string): boolean {
  return INTEGER_MEASURE_UNITS.has(unit)
}

export const MEASURE_UNIT_OPTIONS: readonly SelectOption[] = MEASURE_UNIT_LABELS.map((label) => ({
  value: label,
  label,
}))
