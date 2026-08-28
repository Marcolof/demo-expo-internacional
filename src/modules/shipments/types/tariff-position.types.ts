import type { Id } from '@/core/types/common'
import type { MeasureUnitCode } from '../constants/measure-units.constants'

/**
 * Sugerencia de clasificación arancelaria (maqueta). En producción vendría
 * de VUCE; hoy alimenta el autocompletado de "Descripción del artículo".
 */
export interface TariffPositionSuggestion {
  readonly id: Id
  readonly category: string
  readonly productName: string
  readonly tariffPosition: string
  readonly unitOfMeasure: MeasureUnitCode
}
