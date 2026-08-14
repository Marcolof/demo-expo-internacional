/**
 * Ítems simulados del checkout.
 * `CHECKOUT_ITEMS` conserva el seed mixto histórico.
 * `CHECKOUT_ITEMS_INTERNATIONAL` es el carrito del flujo internacional
 * (5 destinos distintos + ítem dinámico del usuario).
 */

import type { Money } from '@/core/types/common'
import type { CheckoutItem, CheckoutPriceBreakdown, InternationalCheckoutItem } from '../types/checkout.types'

const ars = (amount: number): Money => ({ amount, currency: 'ARS' })

/** Costo de pickup simulado (histórico; el panel intl Figma no lo muestra). */
export const CHECKOUT_PICKUP_FEE: Money = ars(0)

const round2 = (value: number) => Math.round(value * 100) / 100

/** Descuento mock: 0 o múltiplo de 500 (negativo = ya aplicado). */
function discountMultipleOf500(seed: number): Money {
  const steps = [0, -500, -1000, -1500, -2000, -2500]
  return ars(steps[seed % steps.length] ?? 0)
}

function breakdownFromPrice(price: number, discountSeed = 0): CheckoutPriceBreakdown {
  const includedVat = round2(price - price / 1.21)
  const net = round2(price - includedVat)
  const delivery = round2(net / 2)
  const discount = discountMultipleOf500(discountSeed)

  return {
    deliveryService: ars(delivery),
    warehouseService: ars(round2(net - delivery)),
    discount,
    includedVat: ars(includedVat),
    postalService: ars(10000),
    nationalTaxes: ars(5000),
    foreignTaxes: ars(5000),
    representationCost: ars(10000),
  }
}

/**
 * Seed mixto histórico (nacional + 1 intl). Se mantiene para no romper demos
 * que aún lo referencien; el checkout del flujo intl usa
 * `CHECKOUT_ITEMS_INTERNATIONAL`.
 */
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
    breakdown: {
      deliveryService: ars(9900.5),
      warehouseService: ars(9900.5),
      discount: ars(-5000),
      includedVat: ars(5000),
      postalService: ars(10000),
      nationalTaxes: ars(5000),
      foreignTaxes: ars(5000),
      representationCost: ars(10000),
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
    breakdown: breakdownFromPrice(16500, 1),
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
    breakdown: breakdownFromPrice(32000, 2),
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
    breakdown: breakdownFromPrice(12000, 3),
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
    breakdown: breakdownFromPrice(40000, 4),
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
    breakdown: breakdownFromPrice(50000, 5),
  },
]

/** Cinco envíos internacionales (país/ciudad distintos) para el carrito intl. */
export const CHECKOUT_ITEMS_INTERNATIONAL: readonly InternationalCheckoutItem[] = [
  {
    id: 'chk-intl-001',
    scope: 'INTERNACIONAL',
    integration: 'MiCorreo',
    orderNumber: 'ORD-INT-1001',
    originLabel: 'Suc. Retiro',
    destinationLabel: 'Salzburgo - Austria',
    reportedWeightKg: 2,
    volumetricWeightKg: 1.5,
    measures: { lengthCm: 15, widthCm: 12, heightCm: 10 },
    priceWithDiscount: ars(28000),
    service: 'EMS_PAQUETERIA',
    estimatedTaxes: ars(10000),
    breakdown: {
      deliveryService: ars(10000),
      warehouseService: ars(0),
      discount: ars(-500),
      includedVat: ars(4000),
      postalService: ars(10000),
      nationalTaxes: ars(5000),
      foreignTaxes: ars(5000),
      representationCost: ars(10000),
    },
  },
  {
    id: 'chk-intl-002',
    scope: 'INTERNACIONAL',
    integration: 'MiCorreo',
    orderNumber: 'ORD-INT-1002',
    originLabel: 'Suc. Banfield',
    destinationLabel: 'Montevideo - Uruguay',
    reportedWeightKg: 3,
    volumetricWeightKg: 2,
    measures: { lengthCm: 20, widthCm: 15, heightCm: 12 },
    priceWithDiscount: ars(22000),
    service: 'ENCOMIENDA_INTERNACIONAL',
    estimatedTaxes: ars(8000),
    breakdown: breakdownFromPrice(22000, 1),
  },
  {
    id: 'chk-intl-003',
    scope: 'INTERNACIONAL',
    integration: 'MiCorreo',
    orderNumber: 'ORD-INT-1003',
    originLabel: 'Suc. CABA Sur',
    destinationLabel: 'Santiago - Chile',
    reportedWeightKg: 1.5,
    volumetricWeightKg: 1.2,
    measures: { lengthCm: 12, widthCm: 10, heightCm: 8 },
    priceWithDiscount: ars(18000),
    service: 'PEQUENO_PAQUETE',
    estimatedTaxes: ars(6000),
    breakdown: breakdownFromPrice(18000, 2),
  },
  {
    id: 'chk-intl-004',
    scope: 'INTERNACIONAL',
    integration: 'Correo',
    orderNumber: 'ORD-INT-1004',
    originLabel: 'Almacén Tortuguitas',
    destinationLabel: 'Miami - Estados Unidos',
    reportedWeightKg: 4,
    volumetricWeightKg: 3.5,
    measures: { lengthCm: 30, widthCm: 20, heightCm: 15 },
    priceWithDiscount: ars(35000),
    service: 'EMS_PAQUETERIA',
    estimatedTaxes: ars(12000),
    breakdown: breakdownFromPrice(35000, 0),
  },
  {
    id: 'chk-intl-005',
    scope: 'INTERNACIONAL',
    integration: 'MiCorreo',
    orderNumber: 'ORD-INT-1005',
    originLabel: 'Suc. Retiro',
    destinationLabel: 'Madrid - España',
    reportedWeightKg: 2.5,
    volumetricWeightKg: 2,
    measures: { lengthCm: 18, widthCm: 14, heightCm: 10 },
    priceWithDiscount: ars(30000),
    service: 'EMS_DOCUMENTACION',
    estimatedTaxes: ars(7000),
    breakdown: breakdownFromPrice(30000, 4),
  },
]
