/**
 * Cotización simulada.
 *
 * NO es la tarifa real de Correo Argentino: es una fórmula inventada, estable y
 * determinística, para que la maqueta muestre precios coherentes al recotizar.
 * Cuando exista el servicio real, se reemplaza este archivo y nada más.
 */

import type { Money } from '@/core/types/common'
import { volumetricWeightKg } from '../types/shipment.types'
import type { NationalProduct, PackageMeasures } from '../types/shipment.types'

/** Multiplicador por producto. PAQ.AR Hoy es el más caro. */
const PRODUCT_MULTIPLIER: Record<NationalProduct, number> = {
  PAQAR_HOY: 2.75,
  PAQAR_EXPRESO: 2.2,
  PAQAR_CLASICO: 1,
}

const BASE_PRICE_ARS = 5200
const PRICE_PER_KG_ARS = 1450

/**
 * Precio por producto.
 *
 * Se cobra por el mayor entre peso real y peso volumétrico, que es el criterio
 * documentado para EMS (largo × ancho × alto / 6000).
 */
export function quoteNationalShipment(
  measures: PackageMeasures,
): Readonly<Record<NationalProduct, Money>> {
  const chargeableWeight = Math.max(measures.weightKg, volumetricWeightKg(measures))
  const base = BASE_PRICE_ARS + chargeableWeight * PRICE_PER_KG_ARS

  const price = (product: NationalProduct): Money => ({
    // Se redondea a decenas para que el número se lea como una tarifa.
    amount: Math.round((base * PRODUCT_MULTIPLIER[product]) / 10) * 10,
    currency: 'ARS',
  })

  return {
    PAQAR_HOY: price('PAQAR_HOY'),
    PAQAR_EXPRESO: price('PAQAR_EXPRESO'),
    PAQAR_CLASICO: price('PAQAR_CLASICO'),
  }
}

/** Arma las medidas a partir de los strings del formulario. */
export function measuresFromStrings(values: {
  readonly lengthCm: string
  readonly widthCm: string
  readonly heightCm: string
  readonly weightKg: string
}): PackageMeasures {
  const parse = (value: string): number => Number(value.replace(',', '.')) || 0

  return {
    lengthCm: parse(values.lengthCm),
    widthCm: parse(values.widthCm),
    heightCm: parse(values.heightCm),
    weightKg: parse(values.weightKg),
  }
}
