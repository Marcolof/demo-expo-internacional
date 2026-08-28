import type { SelectOption } from '@/core/types/common'

/**
 * Unidades de medida para posición arancelaria (modal Agregar artículo).
 *
 * - `MeasureUnitCode`: clave de negocio estable; hoy también es el `label` visible.
 * - `MEASURE_UNIT_REGISTRY`: flags por código — único lugar a editar al extender.
 * - `id` en runtime: `registry.id` si existe (DB uuid/serial), si no `code`.
 */
export enum MeasureUnitCategory {
  Weight = 'weight',
  Length = 'length',
  Area = 'area',
  Volume = 'volume',
  Count = 'count',
}

/** Valor del enum = label mostrado en UI (fuente única id/label en la maqueta). */
export enum MeasureUnitCode {
  Kilogramo = 'KILOGRAMO',
  Metro = 'METRO',
  MetroCuadrado = 'METRO CUADRADO',
  MetroCubico = 'METRO CUBICO',
  Litros = 'LITROS',
  Unidad = 'UNIDAD',
  Par = 'PAR',
  Docena = 'DOCENA',
  Gramo = 'GRAMO',
  Milimetro = 'MILIMETRO',
  Centimetro = 'CENTIMETRO',
}

interface MeasureUnitRegistryEntry {
  readonly category: MeasureUnitCategory
  readonly enabled: boolean
  readonly requiresInteger: boolean
  /** Id persistido (uuid / autoincrement). Omitir en maqueta → se usa `code`. */
  readonly id?: string
}

/** Mapper de configuración — agregar filas acá al extender el catálogo. */
export const MEASURE_UNIT_REGISTRY: Record<MeasureUnitCode, MeasureUnitRegistryEntry> = {
  [MeasureUnitCode.Kilogramo]: {
    category: MeasureUnitCategory.Weight,
    enabled: true,
    requiresInteger: false,
  },
  [MeasureUnitCode.Metro]: {
    category: MeasureUnitCategory.Length,
    enabled: true,
    requiresInteger: false,
  },
  [MeasureUnitCode.MetroCuadrado]: {
    category: MeasureUnitCategory.Area,
    enabled: true,
    requiresInteger: false,
  },
  [MeasureUnitCode.MetroCubico]: {
    category: MeasureUnitCategory.Volume,
    enabled: true,
    requiresInteger: false,
  },
  [MeasureUnitCode.Litros]: {
    category: MeasureUnitCategory.Volume,
    enabled: true,
    requiresInteger: false,
  },
  [MeasureUnitCode.Unidad]: {
    category: MeasureUnitCategory.Count,
    enabled: true,
    requiresInteger: true,
  },
  [MeasureUnitCode.Par]: {
    category: MeasureUnitCategory.Count,
    enabled: true,
    requiresInteger: true,
  },
  [MeasureUnitCode.Docena]: {
    category: MeasureUnitCategory.Count,
    enabled: true,
    requiresInteger: true,
  },
  [MeasureUnitCode.Gramo]: {
    category: MeasureUnitCategory.Weight,
    enabled: true,
    requiresInteger: false,
  },
  [MeasureUnitCode.Milimetro]: {
    category: MeasureUnitCategory.Length,
    enabled: true,
    requiresInteger: false,
  },
  [MeasureUnitCode.Centimetro]: {
    category: MeasureUnitCategory.Length,
    enabled: true,
    requiresInteger: false,
  },
}

export interface MeasureUnitDefinition {
  readonly code: MeasureUnitCode
  readonly id: string
  readonly label: string
  readonly category: MeasureUnitCategory
  readonly enabled: boolean
  readonly requiresInteger: boolean
}

function buildMeasureUnitDefinition(code: MeasureUnitCode): MeasureUnitDefinition {
  const entry = MEASURE_UNIT_REGISTRY[code]
  return {
    code,
    id: entry.id ?? code,
    label: code,
    category: entry.category,
    enabled: entry.enabled,
    requiresInteger: entry.requiresInteger,
  }
}

export const MEASURE_UNIT_CATALOG: readonly MeasureUnitDefinition[] = (
  Object.values(MeasureUnitCode) as MeasureUnitCode[]
).map(buildMeasureUnitDefinition)

const catalogById = new Map(MEASURE_UNIT_CATALOG.map((unit) => [unit.id, unit]))
const catalogByCode = new Map(MEASURE_UNIT_CATALOG.map((unit) => [unit.code, unit]))

/** @deprecated Preferir `MeasureUnitCode`. Alias del código de negocio. */
export type MeasureUnit = MeasureUnitCode

export const DEFAULT_MEASURE_UNIT = MeasureUnitCode.Kilogramo

export const ENABLED_MEASURE_UNITS: readonly MeasureUnitDefinition[] = MEASURE_UNIT_CATALOG.filter(
  (unit) => unit.enabled,
)

export function getMeasureUnitDefinition(ref: string): MeasureUnitDefinition | undefined {
  return catalogById.get(ref) ?? catalogByCode.get(ref as MeasureUnitCode)
}

export function isMeasureUnitEnabled(ref: string): boolean {
  return getMeasureUnitDefinition(ref)?.enabled ?? false
}

export function measureUnitRequiresInteger(ref: string): boolean {
  return getMeasureUnitDefinition(ref)?.requiresInteger ?? false
}

export const MEASURE_UNIT_OPTIONS: readonly SelectOption[] = ENABLED_MEASURE_UNITS.map((unit) => ({
  value: unit.id,
  label: unit.label,
}))
