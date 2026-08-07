import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { PageContainer } from '@/shared/layout/PageContainer'
import { Button } from '@/shared/ui/Button'
import { RadioGroup } from '@/shared/ui/Checkbox'
import { CheckoutItemsTable } from '../components/CheckoutItemsTable'
import { CheckoutTotalsPanel } from '../components/CheckoutTotalsPanel'
import { CHECKOUT_ITEMS, CHECKOUT_PICKUP_FEE } from '../mocks/checkout.mocks'
import { CHECKOUT_PAYMENT_METHOD_LABELS, checkoutTotals } from '../types/checkout.types'
import type { CheckoutPaymentMethod, CheckoutItem, InternationalCheckoutItem } from '../types/checkout.types'
import { wizardStore } from '../stores/session.store'
import layout from './NewShipmentPage.module.css'
import styles from './CheckoutPage.module.css'

interface IntlCheckoutState {
  readonly service: string
  readonly servicePriceArs: number
  readonly serviceLabel: string
  readonly totalValueUsd: number
  readonly packageWeightKg: number
  readonly lengthCm: number
  readonly widthCm: number
  readonly heightCm: number
  readonly originLabel: string
  readonly destinationLabel: string
  readonly orderNumber?: string
}

function buildIntlItem(s: IntlCheckoutState): InternationalCheckoutItem {
  const priceArs = s.servicePriceArs
  const discountAmt = -Math.round(priceArs * 0.15)
  const priceWithDiscountAmt = priceArs + discountAmt
  const vatAmt = Math.round(priceWithDiscountAmt / 1.21 * 0.21)
  const net = priceWithDiscountAmt - vatAmt
  const vol = Math.round((s.lengthCm * s.widthCm * s.heightCm) / 6000 * 100) / 100

  return {
    id: 'intl-current',
    scope: 'INTERNACIONAL',
    integration: 'MiCorreo',
    orderNumber: s.orderNumber ?? '-',
    originLabel: s.originLabel,
    destinationLabel: s.destinationLabel,
    reportedWeightKg: s.packageWeightKg,
    volumetricWeightKg: vol,
    measures: { lengthCm: s.lengthCm, widthCm: s.widthCm, heightCm: s.heightCm },
    priceWithDiscount: { amount: priceWithDiscountAmt, currency: 'ARS' },
    service: s.service as InternationalCheckoutItem['service'],
    estimatedTaxes: { amount: Math.round(s.totalValueUsd * 95), currency: 'ARS' },
    breakdown: {
      deliveryService: { amount: Math.round(net / 2), currency: 'ARS' },
      warehouseService: { amount: Math.round(net / 2), currency: 'ARS' },
      discount: { amount: discountAmt, currency: 'ARS' },
      includedVat: { amount: vatAmt, currency: 'ARS' },
    },
  }
}

const PAYMENT_METHODS: readonly CheckoutPaymentMethod[] = [
  'MERCADO_PAGO',
  'SALDO',
  'TARJETA_CREDITO',
  'CUENTA_CORRIENTE',
]

/**
 * Checkout ("Realizá tu pago"): grilla de los ítems ya cotizados, selección de
 * medio de pago y totales.
 *
 * La grilla mezcla envíos nacionales e internacionales a propósito: es el
 * carrito de todo lo pendiente de pago, no el de un envío puntual. Los ítems
 * salen de un mock (`checkout.mocks.ts`) porque la maqueta no cotiza de verdad.
 */
export function CheckoutPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [paymentMethod, setPaymentMethod] = useState<CheckoutPaymentMethod>('TARJETA_CREDITO')

  const intlState = (location.state as { intl?: IntlCheckoutState } | null)?.intl
  const items: readonly CheckoutItem[] = intlState
    ? [buildIntlItem(intlState), ...CHECKOUT_ITEMS.filter((i) => i.scope === 'NACIONAL')]
    : CHECKOUT_ITEMS
  const totals = checkoutTotals(items, CHECKOUT_PICKUP_FEE)

  return (
    <PageContainer width="full">
      <div className={styles.page}>
        <div className={styles.header}>
          <h3 className={layout.title}>Realizá tu pago</h3>
          <p className={styles.itemsCount}>Ítems cotizados: {items.length}</p>
        </div>

        <CheckoutItemsTable items={items} />

        <div className={styles.bottom}>
          <section className={styles.payment}>
            <h4 className={styles.sectionTitle}>Seleccioná un medio de pago</h4>

            <RadioGroup<CheckoutPaymentMethod>
              name="checkout-payment-method"
              inline
              value={paymentMethod}
              onChange={setPaymentMethod}
              options={PAYMENT_METHODS.map((method) => ({
                value: method,
                label: CHECKOUT_PAYMENT_METHOD_LABELS[method],
              }))}
            />
          </section>

          {/* "Ver desglose" es decorativo: la maqueta no abre el detalle
              consolidado todavía. */}
          <CheckoutTotalsPanel className={styles.totals} totals={totals} onShowBreakdown={() => undefined} />
        </div>

        <div className={styles.actions}>
          <Button variant="secondary" onClick={() => navigate(-1)}>
            Atrás
          </Button>

          <Button
            variant="primary"
            onClick={() => {
              wizardStore.clear()
              navigate('/propuesta/mis-envios', { replace: true })
            }}
          >
            Pagar
          </Button>
        </div>
      </div>
    </PageContainer>
  )
}
