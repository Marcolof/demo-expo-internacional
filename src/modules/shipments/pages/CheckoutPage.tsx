import { useMemo, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { PageContainer } from '@/shared/layout/PageContainer'
import { Button } from '@/shared/ui/Button'
import { RadioGroup } from '@/shared/ui/Checkbox'
import { useScrollToTop } from '@/shared/hooks/useScrollToTop'
import { CheckoutItemsTable } from '../components/CheckoutItemsTable'
import { CheckoutTotalsPanel } from '../components/CheckoutTotalsPanel'
import { CHECKOUT_ITEMS_INTERNATIONAL, CHECKOUT_PICKUP_FEE } from '../mocks/checkout.mocks'
import { CHECKOUT_PAYMENT_METHOD_LABELS, checkoutTotals } from '../types/checkout.types'
import type { CheckoutPaymentMethod, CheckoutItem, InternationalCheckoutItem } from '../types/checkout.types'
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
  const discountAmt = -500
  const priceWithDiscountAmt = priceArs + discountAmt
  const vatAmt = Math.round((priceWithDiscountAmt / 1.21) * 0.21)
  const net = priceWithDiscountAmt - vatAmt
  const vol = Math.round(((s.lengthCm * s.widthCm * s.heightCm) / 6000) * 100) / 100

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
      warehouseService: { amount: 0, currency: 'ARS' },
      discount: { amount: discountAmt, currency: 'ARS' },
      includedVat: { amount: vatAmt, currency: 'ARS' },
      postalService: { amount: priceArs, currency: 'ARS' },
      nationalTaxes: { amount: 5000, currency: 'ARS' },
      foreignTaxes: { amount: 5000, currency: 'ARS' },
      representationCost: { amount: 10000, currency: 'ARS' },
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
 * Checkout internacional: sólo ítems intl (seed de 5 destinos + el del usuario).
 * "Atrás" no limpia el wizard — conserva datos del envío no guardado.
 */
export function CheckoutPage() {
  const navigate = useNavigate()
  const location = useLocation()
  useScrollToTop()
  const [paymentMethod, setPaymentMethod] = useState<CheckoutPaymentMethod>('TARJETA_CREDITO')

  const intlState = (location.state as { intl?: IntlCheckoutState } | null)?.intl

  const items: readonly CheckoutItem[] = useMemo(() => {
    const seed = [...CHECKOUT_ITEMS_INTERNATIONAL]
    if (intlState !== undefined) {
      return [buildIntlItem(intlState), ...seed]
    }
    return seed
  }, [intlState])

  const totals = checkoutTotals(items, CHECKOUT_PICKUP_FEE)

  return (
    <PageContainer width="full">
      <div className={styles.page}>
        <div className={styles.header}>
          <h1 className={styles.pageTitle}>Realizá tu pago</h1>
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

          <CheckoutTotalsPanel className={styles.totals} totals={totals} />
        </div>

        <div className={styles.actions}>
          <Button variant="secondary" onClick={() => navigate(-1)}>
            Atrás
          </Button>

          <Button variant="primary" onClick={() => undefined}>
            Pagar
          </Button>
        </div>
      </div>
    </PageContainer>
  )
}
