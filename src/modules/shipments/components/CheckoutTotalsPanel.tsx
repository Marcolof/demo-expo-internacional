import { useState } from 'react'
import { cn } from '@/shared/lib/cn'
import { formatMoney } from '@/shared/lib/formatCurrency'
import type { CheckoutTotals } from '../types/checkout.types'
import styles from './CheckoutTotalsPanel.module.css'

export interface CheckoutTotalsPanelProps {
  readonly totals: CheckoutTotals
  readonly className?: string
}

/**
 * Panel de totales del checkout (Figma resumen-valores / css-resumen-valores.md):
 * Subtotal → sep → Ver desglose (+ líneas) → sep → Precio total + nota IVA.
 */
export function CheckoutTotalsPanel({ totals, className }: CheckoutTotalsPanelProps) {
  const [breakdownOpen, setBreakdownOpen] = useState(true)
  const lines = totals.breakdownLines

  return (
    <div className={cn(styles.card, className)}>
      <div className={styles.row}>
        <span className={styles.label}>Subtotal:</span>
        <span className={styles.value}>{formatMoney(totals.subtotal)}</span>
      </div>

      <div className={styles.divider} role="separator" />

      <button
        type="button"
        className={styles.breakdownLink}
        aria-expanded={breakdownOpen}
        onClick={() => setBreakdownOpen((open) => !open)}
      >
        Ver desglose
      </button>

      {breakdownOpen && (
        <div className={styles.breakdownList}>
          <div className={styles.row}>
            <span className={styles.breakdownLabel}>Servicio postal</span>
            <span className={styles.breakdownValue}>{formatMoney(lines.postalService)}</span>
          </div>
          <div className={styles.row}>
            <span className={styles.breakdownLabel}>Servicio de entrega</span>
            <span className={styles.breakdownValue}>{formatMoney(lines.deliveryService)}</span>
          </div>
          <div className={styles.row}>
            <span className={styles.breakdownLabel}>Costos de representación</span>
            <span className={styles.breakdownValue}>{formatMoney(lines.representationCost)}</span>
          </div>
          <div className={styles.row}>
            <span className={styles.breakdownLabel}>Tributos incluidos</span>
            <span className={styles.breakdownValue}>{formatMoney(lines.taxesIncluded)}</span>
          </div>
        </div>
      )}

      <div className={styles.divider} role="separator" />

      <div className={styles.totalBlock}>
        <p className={styles.total}>Precio total: {formatMoney(totals.total)}</p>
        <p className={styles.totalNote}>(con impuestos e IVA incluído)</p>
      </div>
    </div>
  )
}
