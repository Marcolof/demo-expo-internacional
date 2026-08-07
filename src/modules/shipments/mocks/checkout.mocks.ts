/**
 * Ítems simulados del checkout. Reproducen la referencia de diseño: un envío
 * internacional (con servicio postal y tributos) mezclado con varios envíos
 * nacionales, para poder mostrar que el panel "Detalle" NO es el mismo en los
 * dos casos.
 */

import type { Money } from '@/core/types/common'
import type { CheckoutItem, CheckoutPriceBreakdown } from '../types/checkout.types'

const ars = (amount: number): Money => ({ amount, currency: 'ARS' })

/** Costo de pickup simulado (fila "Pickup" del panel de totales). */
export const CHECKOUT_PICKUP_FEE: Money = ars(2500)

const round2 = (value: number) => Math.round(value * 100) / 100

/**
 * Desglose derivado del precio final para que los números cierren: IVA del
 * 21% contenido en el precio, descuento del 15% (ya aplicado) y el neto
 * repartido entre servicio de entrega y de almacén.
 */
function breakdownFromPrice(price: number): CheckoutPriceBreakdown {
  const includedVat = round2(price - price / 1.21)
  const net = round2(price - includedVat)
  const delivery = round2(net / 2)

  return {
    deliveryService: ars(delivery),
    warehouseService: ars(round2(net - delivery)),
    discount: ars(-round2(price * 0.15)),
    includedVat: ars(includedVat),
  }
}

export const CHECKOUT_ITEMS: readonly CheckoutItem[] = [
  {
    id: 'chk-001',
    scope: 'INTERNACIONAL',
    integration: 'MiCorreo',
    orderNumber: '1234567878',
    originLabel: 'Almacén Tortuguitas',
    destinationLabel: 'Salzburgo - Austria',
    reportedWeightKg: 3,
    volumetricWeightKg: 2,
    measures: { lengthCm: 6, widthCm: 6, heightCm: 6 },
    priceWithDiscount: ars(28000),
    service: 'EMS_PAQUETERIA',
    estimatedTaxes: ars(25500),
    /* Importes tomados literalmente de la referencia de diseño (no derivados
     * del precio): es el único desglose que la referencia muestra abierto. */
    breakdown: {
      deliveryService: ars(9900.5),
      warehouseService: ars(9900.5),
      discount: ars(-5000),
      includedVat: ars(5000),
    },
  },
  {
    id: 'chk-002',
    scope: 'NACIONAL',
    integration: 'MiCorreo',
    orderNumber: '4235567978',
    originLabel: 'Martinez',
    destinationLabel: 'Martinez - Buenos Aires',
    reportedWeightKg: 4,
    volumetricWeightKg: 10,
    measures: { lengthCm: 1, widthCm: 1, heightCm: 2 },
    priceWithDiscount: ars(16500),
    breakdown: breakdownFromPrice(16500),
  },
  {
    id: 'chk-003',
    scope: 'NACIONAL',
    integration: 'MiCorreo',
    orderNumber: '9876543210',
    originLabel: 'Distribuciones Rápidas',
    destinationLabel: 'Córdoba - Celiz',
    reportedWeightKg: 5,
    volumetricWeightKg: 15,
    measures: { lengthCm: 10, widthCm: 10, heightCm: 10 },
    priceWithDiscount: ars(32000),
    breakdown: breakdownFromPrice(32000),
  },
  {
    id: 'chk-004',
    scope: 'NACIONAL',
    integration: 'MiCorreo',
    orderNumber: '1112233445',
    originLabel: 'Mercado Verde',
    destinationLabel: 'Buenos Aires',
    reportedWeightKg: 2,
    volumetricWeightKg: 5,
    measures: { lengthCm: 5, widthCm: 5, heightCm: 5 },
    priceWithDiscount: ars(12000),
    breakdown: breakdownFromPrice(12000),
  },
  {
    id: 'chk-005',
    scope: 'NACIONAL',
    integration: 'MiCorreo',
    orderNumber: '6789012345',
    originLabel: 'Tienda Global',
    destinationLabel: 'CABA',
    reportedWeightKg: 6,
    volumetricWeightKg: 12,
    measures: { lengthCm: 12, widthCm: 12, heightCm: 12 },
    priceWithDiscount: ars(40000),
    breakdown: breakdownFromPrice(40000),
  },
  {
    id: 'chk-006',
    scope: 'NACIONAL',
    integration: 'MiCorreo',
    orderNumber: '2233445566',
    originLabel: 'Electrodomésticos ABC',
    destinationLabel: 'CABA',
    reportedWeightKg: 8,
    volumetricWeightKg: 20,
    measures: { lengthCm: 15, widthCm: 15, heightCm: 15 },
    priceWithDiscount: ars(50000),
    breakdown: breakdownFromPrice(50000),
  },
]
