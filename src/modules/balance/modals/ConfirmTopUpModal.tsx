import type { Money } from '@/core/types/common'
import { formatMoney } from '@/shared/lib/formatCurrency'
import { Button } from '@/shared/ui/Button'
import { Modal } from '@/shared/ui/Modal'
import { useToast } from '@/shared/ui/Toast'
import type { TopUpMethod } from '../types/balance.types'
import { TOP_UP_METHOD_LABELS } from '../types/balance.types'
import styles from './ConfirmTopUpModal.module.css'

export interface ConfirmTopUpModalProps {
  readonly isOpen: boolean
  readonly onClose: () => void
  readonly onConfirm: () => void
  readonly amount: Money
  readonly method: TopUpMethod
}

/**
 * Última confirmación antes de acreditar la recarga.
 *
 * El modal avisa por toast y le deja al llamador decidir qué hacer después
 * (limpiar el formulario, cerrar, navegar): así no duplica el cierre.
 */
export function ConfirmTopUpModal({
  isOpen,
  onClose,
  onConfirm,
  amount,
  method,
}: ConfirmTopUpModalProps) {
  const { showToast } = useToast()

  const handleConfirm = () => {
    onConfirm()
    showToast(`Recargaste ${formatMoney(amount)} en tu saldo.`, 'success')
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Confirmá la recarga"
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleConfirm}>
            Confirmar recarga
          </Button>
        </>
      }
    >
      <p className={styles.intro}>Vas a acreditar en tu cuenta de MiCorreo:</p>

      <dl className={styles.detail}>
        <div className={styles.row}>
          <dt className={styles.label}>Importe</dt>
          <dd className={styles.value}>{formatMoney(amount)}</dd>
        </div>

        <div className={styles.row}>
          <dt className={styles.label}>Medio de pago</dt>
          <dd className={styles.value}>{TOP_UP_METHOD_LABELS[method]}</dd>
        </div>
      </dl>

      <p className={styles.note}>
        La acreditación es inmediata. Esta maqueta no procesa pagos reales.
      </p>
    </Modal>
  )
}
