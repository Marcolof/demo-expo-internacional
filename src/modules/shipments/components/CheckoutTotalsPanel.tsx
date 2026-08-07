import { cn } from '@/shared/lib/cn'
import { formatMoney } from '@/shared/lib/formatCurrency'
import type { CheckoutTotals } from '../types/checkout.types'
import styles from './CheckoutTotalsPanel.module.css'

export interface CheckoutTotalsPanelProps {
  readonly totals: CheckoutTotals
  /** "Ver desglose". Sin handler el link no se muestra. */
  readonly onShowBreakdown?: () => void
  readonly className?: string
}

/**
 * Panel de totales del checkout: subtotal, pickup, descuento informado y
 * precio total. El descuento se muestra pero no se resta: ya viene aplicado
 * en el subtotal (ver `checkoutTotals`).
 */
export function CheckoutTotalsPanel({ totals, onShowBreakdown, className }: CheckoutTotalsPanelProps) {
  return (
    <div className={cn(styles.card, className)}>
      <div className={styles.rows}>
        <div className={styles.row}>
          <span className={styles.label}>Subtotal:</span>
          <span className={styles.value}>{formatMoney(totals.subtotal)}</span>
        </div>
        <div className={styles.row}>
          <span className={styles.label}>Pickup:</span>
          <span className={styles.value}>{formatMoney(totals.pickup)}</span>
        </div>
      </div>

      <div className={styles.discountBlock}>
        <div className={styles.row}>
          <span className={styles.discountLabel}>Descuento total sin IVA:</span>
          <span className={styles.discountValue}>{formatMoney(totals.totalDiscountWithoutVat)}</span>
        </div>

        {onShowBreakdown !== undefined && (
          <button type="button" className={styles.breakdownLink} onClick={onShowBreakdown}>
            Ver desglose
          </button>
        )}
      </div>

      <div className={styles.totalBlock}>
        <p className={styles.total}>Precio total: {formatMoney(totals.total)}</p>
        <p className={styles.totalNote}>(con impuestos e IVA incluido)</p>
      </div>
    </div>
  )
}
