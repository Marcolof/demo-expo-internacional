import type { ActionResult } from '@/core/types/common'
import { formatDateTime } from '@/shared/lib/formatDate'
import { formatMoney } from '@/shared/lib/formatCurrency'
import { Badge } from '@/shared/ui/Badge'
import { Button } from '@/shared/ui/Button'
import type { AccountBalance } from '../types/balance.types'
import styles from './BalanceCard.module.css'

export interface BalanceCardProps {
  readonly balance: AccountBalance
  readonly onTopUp?: () => void
  readonly canTopUp: ActionResult
}

/**
 * Panel de saldo de la cuenta.
 *
 * Cuando la recarga está denegada el botón queda visible pero deshabilitado: la
 * acción existe, el usuario no la tiene. Se explica dos veces — en el `title`
 * para el mouse y en una nota abajo, porque un `title` no lo lee nadie con
 * teclado.
 */
export function BalanceCard({ balance, onTopUp, canTopUp }: BalanceCardProps) {
  const deniedReason = canTopUp.allowed ? undefined : canTopUp.reason

  return (
    <section className={styles.card} aria-labelledby="balance-card-title">
      <header className={styles.header}>
        <h2 id="balance-card-title" className={styles.title}>
          Tu saldo
        </h2>
        {balance.hasCurrentAccount && <Badge tone="info">Cuenta corriente</Badge>}
      </header>

      <div className={styles.amounts}>
        <div className={styles.amount}>
          <span className={styles.amountLabel}>Saldo disponible</span>
          <strong className={styles.amountValue}>{formatMoney(balance.available)}</strong>
        </div>

        <div className={styles.amount}>
          <span className={styles.amountLabel}>Retenido</span>
          <strong className={styles.amountValuePending}>{formatMoney(balance.pending)}</strong>
          <small className={styles.amountHint}>Envíos pendientes de imputación</small>
        </div>

        {balance.creditLimit !== undefined && (
          <div className={styles.amount}>
            <span className={styles.amountLabel}>Límite de crédito</span>
            <strong className={styles.amountValueSecondary}>
              {formatMoney(balance.creditLimit)}
            </strong>
          </div>
        )}
      </div>

      <footer className={styles.footer}>
        <p className={styles.updated}>
          Última actualización: {formatDateTime(balance.lastUpdatedAt)}
        </p>

        <Button
          variant="primary"
          onClick={onTopUp}
          disabled={!canTopUp.allowed}
          title={deniedReason}
        >
          Recargar saldo
        </Button>
      </footer>

      {deniedReason !== undefined && (
        <p className={styles.deniedNote} role="note">
          {deniedReason}
        </p>
      )}
    </section>
  )
}
