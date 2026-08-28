/**
 * Catálogo estático de posiciones arancelarias para el autocompletado del
 * modal "Agregar artículo". No hay regla de match: se muestran todas al
 * interactuar con la descripción. La unidad de medida viaja con cada
 * posición (contrato VUCE / D-03, mock interim).
 */

import { MeasureUnitCode } from '../constants/measure-units.constants'
import type { TariffPositionSuggestion } from '../types/tariff-position.types'

export const TARIFF_POSITION_SEED: readonly TariffPositionSuggestion[] = [
  {
    id: 'hs-6109',
    category: 'PRENDAS Y COMPLEMENTOS (ACCESORIOS) DE VESTIR, DE PUNTO',
    productName: '«T-SHIRTS» Y CAMISETAS, DE PUNTO.',
    tariffPosition: '61.09',
    unitOfMeasure: MeasureUnitCode.MetroCuadrado,
  },
  {
    id: 'hs-0901',
    category: 'CAFÉ, TÉ, YERBA MATE Y ESPECIAS',
    productName: 'CAFÉ TOSTADO, SIN DESCAFEINAR.',
    tariffPosition: '09.01',
    unitOfMeasure: MeasureUnitCode.Kilogramo,
  },
  {
    id: 'hs-0903',
    category: 'CAFÉ, TÉ, YERBA MATE Y ESPECIAS',
    productName: 'YERBA MATE.',
    tariffPosition: '09.03',
    unitOfMeasure: MeasureUnitCode.Kilogramo,
  },
  {
    id: 'hs-6404',
    category: 'CALZADO, POLAINAS Y ARTÍCULOS ANÁLOGOS; PARTES DE ESTOS ARTÍCULOS',
    productName: 'CALZADO CON SUELA DE CAUCHO O PLÁSTICO.',
    tariffPosition: '64.04',
    unitOfMeasure: MeasureUnitCode.Par,
  },
  {
    id: 'hs-4202',
    category: 'ARTÍCULOS DE MARROQUINERÍA; ARTÍCULOS DE VIAJE',
    productName: 'MOCHILAS DE MATERIA TEXTIL.',
    tariffPosition: '42.02',
    unitOfMeasure: MeasureUnitCode.Unidad,
  },
  {
    id: 'hs-1806',
    category: 'CACAO Y SUS PREPARACIONES',
    productName: 'CHOCOLATE Y DEMÁS PREPARACIONES ALIMENTICIAS QUE CONTENGAN CACAO.',
    tariffPosition: '18.06',
    unitOfMeasure: MeasureUnitCode.Kilogramo,
  },
  {
    id: 'hs-2204',
    category: 'BEBIDAS, LÍQUIDOS ALCOHÓLICOS Y VINAGRE',
    productName: 'VINO DE UVAS FRESCAS.',
    tariffPosition: '22.04',
    unitOfMeasure: MeasureUnitCode.Litros,
  },
  {
    id: 'hs-9503',
    category: 'JUGUETES, ARTÍCULOS DE RECREO O DE DEPORTE; SUS PARTES Y ACCESORIOS',
    productName: 'LOS DEMÁS JUGUETES.',
    tariffPosition: '95.03',
    unitOfMeasure: MeasureUnitCode.Unidad,
  },
]
