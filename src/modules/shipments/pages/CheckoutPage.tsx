import { useMemo, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { PageContainer } from '@/shared/layout/PageContainer'
import { Button } from '@/shared/ui/Button'
import { RadioGroup } from '@/shared/ui/Checkbox'
import { useFeatureFlag } from '@/shared/hooks/useFeatureFlag'
import { useScrollToTop } from '@/shared/hooks/useScrollToTop'
import { EmptyState } from '@/shared/ui/EmptyState'
import { useToast } from '@/shared/ui/Toast'
import { CheckoutItemsTable } from '../components/CheckoutItemsTable'
import { CheckoutTotalsPanel } from '../components/CheckoutTotalsPanel'
import { CHECKOUT_ITEMS_INTERNATIONAL, CHECKOUT_PICKUP_FEE } from '../mocks/checkout.mocks'
import { CHECKOUT_PAYMENT_METHOD_LABELS, checkoutTotals } from '../types/checkout.types'
import type { CheckoutPaymentMethod, CheckoutItem, InternationalCheckoutItem } from '../types/checkout.types'
import type { IntlCheckoutState } from '../lib/intl-checkout-state'
import { wizardStore, markWizardShipmentPaid } from '../stores/session.store'
import styles from './CheckoutPage.module.css'

function buildIntlItem(s: IntlCheckoutState): InternationalCheckoutItem {
  const priceArs = s.servicePriceArs
  const discountAmt = -500
  const priceWithDiscountAmt = priceArs + discountAmt
  const vatAmt = Math.round((priceWithDiscountAmt / 1.21) * 0.21)
  const net = priceWithDiscountAmt - vatAmt
  const vol = Math.round(((s.lengthCm * s.widthCm * s.heightCm) / 6000) * 100) / 100
  const representationCost = s.representationCostArs ?? 0

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
      representationCost: { amount: representationCost, currency: 'ARS' },
    },
  }
}

const PAYMENT_METHODS: readonly CheckoutPaymentMethod[] = [
  'MERCADO_PAGO',
  'SALDO',
  'TARJETA_CREDITO',
]

/**
 * Checkout internacional: carrito vacío hasta cotizar.
 * Los ítems seed vuelven con el flag `CHECKOUT_SEED_ITEMS`.
 * "Atrás" no limpia el wizard. Pagar comercial → Factura E; si no → Mis envíos.
 */
export function CheckoutPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { showToast } = useToast()
  const showSeedItems = useFeatureFlag('CHECKOUT_SEED_ITEMS')
  useScrollToTop()
  const [paymentMethod, setPaymentMethod] = useState<CheckoutPaymentMethod>('TARJETA_CREDITO')
  const [paying, setPaying] = useState(false)

  const locationState = location.state as {
    intl?: IntlCheckoutState
    commercial?: boolean
  } | null
  const intlState = locationState?.intl

  const items: readonly CheckoutItem[] = useMemo(() => {
    const quoted = intlState !== undefined ? [buildIntlItem(intlState)] : []
    if (!showSeedItems) return quoted
    return [...quoted, ...CHECKOUT_ITEMS_INTERNATIONAL]
  }, [intlState, showSeedItems])

  const totals = checkoutTotals(items, CHECKOUT_PICKUP_FEE)
  const canPay = items.length > 0 && !paying

  const handlePay = () => {
    if (!canPay) return
    setPaying(true)
    const commercial =
      intlState?.commercial === true ||
      locationState?.commercial === true ||
      wizardStore.get()?.commercial === true
    window.setTimeout(() => {
      if (commercial) {
        navigate('/internacional/factura-e', {
          state: intlState !== undefined ? { intl: intlState } : undefined,
        })
        return
      }
      markWizardShipmentPaid()
      wizardStore.clear()
      showToast('Pago simulado con éxito.', 'success')
      navigate('/propuesta/mis-envios', { state: { paymentResult: 'success', tab: 'pagados' } })
    }, 400)
  }

  return (
    <PageContainer width="full">
      <div className={styles.page}>
        <div className={styles.header}>
          <h1 className={styles.pageTitle}>Realizá tu pago</h1>
          <p className={styles.itemsCount}>Ítems cotizados: {items.length}</p>
        </div>

        {items.length === 0 ? (
          <EmptyState
            className={styles.empty}
            title="No hay ítems cotizados"
            description="Cotizá un envío pendiente para verlo acá y continuar el pago."
          />
        ) : (
          <CheckoutItemsTable items={items} />
        )}

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

          <Button variant="primary" disabled={!canPay} onClick={handlePay}>
            {paying ? 'Procesando…' : 'Pagar'}
          </Button>
        </div>
      </div>
    </PageContainer>
  )
}
