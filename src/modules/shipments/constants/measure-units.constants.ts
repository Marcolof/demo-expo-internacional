import type { SelectOption } from '@/core/types/common'

/**
 * Unidades de medida para posición arancelaria (MVP1).
 * Fuente: documentation/feedback-mvp1-revision/unidades-medida.md
 */
const MEASURE_UNIT_LABELS = [
  'KILOGRAMO',
  'METRO',
  'METRO CUADRADO',
  'METRO CUBICO',
  'LITROS',
  '1000 KILOWATT HORA',
  'UNIDAD',
  'PAR',
  'DOCENA',
  'QUILATE',
  'MILLAR',
  'GRAMO',
  'MILIMETRO',
  'MMCUBICO',
  'KILOMETRO',
  'HECTOLITRO',
  'CENTIMETRO',
  'JGO.PQT.MAZO NAIPES',
  'CMCUBICO',
  'TONELADA',
  'DAMCUBICO',
  'HMCUBICO',
  'KMCUBICO',
  'MICROGRAMO',
  'NANOGRAMO',
  'PICOGRAMO',
  'MILIGRAMO',
  'MILILITRO',
  'CURIE',
  'MILICURIE',
  'MICROCURIE',
  'UIACTHOR',
  'MUIACTHOR',
  'KGBASE',
  'GRUESA',
  'KG.BRUTO',
  'UIACTANTI',
  'MUIACTANT',
  'UIACTIG',
  'MUIACTIG',
  'KGACTIVO',
  'GRACTIVO',
  'GRAMO BASE',
] as const

export type MeasureUnit = (typeof MEASURE_UNIT_LABELS)[number]

export const DEFAULT_MEASURE_UNIT: MeasureUnit = 'UNIDAD'

export const MEASURE_UNIT_OPTIONS: readonly SelectOption[] = MEASURE_UNIT_LABELS.map((label) => ({
  value: label,
  label,
}))
