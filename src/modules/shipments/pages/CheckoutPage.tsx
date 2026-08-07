import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageContainer } from '@/shared/layout/PageContainer'
import { Button } from '@/shared/ui/Button'
import { RadioGroup } from '@/shared/ui/Checkbox'
import { CheckoutItemsTable } from '../components/CheckoutItemsTable'
import { CheckoutTotalsPanel } from '../components/CheckoutTotalsPanel'
import { CHECKOUT_ITEMS, CHECKOUT_PICKUP_FEE } from '../mocks/checkout.mocks'
import { CHECKOUT_PAYMENT_METHOD_LABELS, checkoutTotals } from '../types/checkout.types'
import type { CheckoutPaymentMethod } from '../types/checkout.types'
import layout from './NewShipmentPage.module.css'
import styles from './CheckoutPage.module.css'

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
  const [paymentMethod, setPaymentMethod] = useState<CheckoutPaymentMethod>('TARJETA_CREDITO')

  const items = CHECKOUT_ITEMS
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

          {/* Sin flujo de confirmación de pago todavía (ver documentación). */}
          <Button variant="primary" onClick={() => undefined}>
            Pagar
          </Button>
        </div>
      </div>
    </PageContainer>
  )
}
