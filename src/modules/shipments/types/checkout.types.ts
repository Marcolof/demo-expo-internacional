/**
 * Tipos del checkout ("Realizá tu pago"): la grilla de ítems cotizados, su
 * desglose de precio y los totales del pago.
 *
 * Un ítem del checkout NO es un `Shipment`: el envío guarda su estado, sus
 * partes y sus medidas, mientras que acá interesa el resultado de la
 * cotización (precio con descuento y su desglose). Se modela aparte para no
 * ensuciar `Shipment` con campos que sólo existen a la hora de pagar.
 */

import type { Id, Money } from '@/core/types/common'
import type { PackageMeasures, PostalService } from './shipment.types'

/**
 * Desglose del precio de un ítem (panel "Detalle" de la grilla).
 * `discount` e `includedVat` ya están contenidos en `priceWithDiscount`: se
 * informan para que se entienda el precio, no para volver a sumarlos.
 */
export interface CheckoutPriceBreakdown {
  readonly deliveryService: Money
  readonly warehouseService: Money
  /** Negativo. Ya aplicado dentro de `priceWithDiscount`. */
  readonly discount: Money
  /** IVA contenido en `priceWithDiscount`, no un cargo aparte. */
  readonly includedVat: Money
}

interface CheckoutItemBase {
  readonly id: Id
  /** Canal por el que se dio de alta el envío ("MiCorreo", una integración…). */
  readonly integration: string
  readonly orderNumber: string
  readonly originLabel: string
  readonly destinationLabel: string
  /** Peso declarado por quien despacha. */
  readonly reportedWeightKg: number
  /** Peso volumétrico que calcula el sistema; nunca lo ingresa el usuario. */
  readonly volumetricWeightKg: number
  readonly measures: Pick<PackageMeasures, 'lengthCm' | 'widthCm' | 'heightCm'>
  /** Columna "Precio C/DTO": con descuento aplicado e IVA incluido. */
  readonly priceWithDiscount: Money
  readonly breakdown: CheckoutPriceBreakdown
}

/**
 * Ítem nacional.
 *
 * DECISIÓN DE MODELADO: no lleva `service` ni `estimatedTaxes`. Un envío que
 * no cruza la aduana no tiene servicio postal internacional ni tributos, así
 * que el tipo los excluye en lugar de dejarlos opcionales — de esta forma el
 * panel "Detalle" no puede mostrar esas filas en un envío local por descuido.
 */
export interface NationalCheckoutItem extends CheckoutItemBase {
  readonly scope: 'NACIONAL'
}

/** Ítem internacional: agrega servicio postal y tributos estimados. */
export interface InternationalCheckoutItem extends CheckoutItemBase {
  readonly scope: 'INTERNACIONAL'
  readonly service: PostalService
  readonly estimatedTaxes: Money
}

export type CheckoutItem = NationalCheckoutItem | InternationalCheckoutItem

/**
 * Medios de pago del checkout.
 *
 * No se reutiliza `TopUpMethod` del módulo Saldo: ése es el set para RECARGAR
 * saldo (débito, transferencia) y acá el set es distinto — se puede pagar CON
 * el saldo o con Mercado Pago, que no son formas de recargar.
 */
export type CheckoutPaymentMethod = 'MERCADO_PAGO' | 'SALDO' | 'TARJETA_CREDITO' | 'CUENTA_CORRIENTE'

export const CHECKOUT_PAYMENT_METHOD_LABELS: Record<CheckoutPaymentMethod, string> = {
  MERCADO_PAGO: 'Mercado Pago',
  SALDO: 'Saldo',
  TARJETA_CREDITO: 'Tarjeta de crédito',
  CUENTA_CORRIENTE: 'Cuenta Corriente',
}

export interface CheckoutTotals {
  readonly subtotal: Money
  readonly pickup: Money
  /** Suma de los descuentos. Informativo: ya está dentro del subtotal. */
  readonly totalDiscountWithoutVat: Money
  readonly total: Money
}

/**
 * Totales del pago.
 *
 * `subtotal` es la suma de la columna "Precio C/DTO", que ya trae descuento e
 * IVA. Por eso el descuento se informa aparte pero NO se resta otra vez, y el
 * total es `subtotal + pickup`.
 */
export function checkoutTotals(items: readonly CheckoutItem[], pickup: Money): CheckoutTotals {
  const subtotal = items.reduce((sum, item) => sum + item.priceWithDiscount.amount, 0)
  const discount = items.reduce((sum, item) => sum + item.breakdown.discount.amount, 0)

  return {
    subtotal: { amount: subtotal, currency: pickup.currency },
    pickup,
    totalDiscountWithoutVat: { amount: discount, currency: pickup.currency },
    total: { amount: subtotal + pickup.amount, currency: pickup.currency },
  }
}
