import { Button } from '@/shared/ui/Button'
import { Modal } from '@/shared/ui/Modal'
import styles from './AduanaConfirmModal.module.css'

export interface AduanaConfirmModalProps {
  readonly isOpen: boolean
  /** El usuario elige mantener la representación (cierra sin cambios). */
  readonly onKeep: () => void
  /** El usuario confirma que quiere continuar sin representación. */
  readonly onConfirm: () => void
  /** Ubicación de planta citada en el mensaje. */
  readonly plantaLabel?: string
}

/**
 * Modal de confirmación de baja de representación ante Aduana.
 * Usa el chrome compartido de Modal (topStripe + X).
 */
export function AduanaConfirmModal({
  isOpen,
  onKeep,
  onConfirm,
  plantaLabel = 'planta CPI Retiro, CABA',
}: AduanaConfirmModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onKeep}
      title="Representación ante Aduana desactivada"
      size="xl"
      centered
      bodyClassName={styles.body}
      footerClassName={styles.footer}
      footer={
        <div className={styles.buttons}>
          <div className={styles.buttonCol}>
            <Button variant="secondary" onClick={onConfirm}>
              Continuar sin representación
            </Button>
            <span className={styles.supporting}>Con costo adicional</span>
          </div>
          <div className={styles.buttonCol}>
            <Button variant="primary" onClick={onKeep}>
              Mantener representación
            </Button>
            <span className={styles.supporting}>Sin costo</span>
          </div>
        </div>
      }
    >
      <p className={styles.copy}>
        Si desactivás esta opción, no podremos representarte ante la Aduana en caso de que el envío
        requiera una revisión. De ser necesario, serás citado vos o un tercero en tu representación,
        a {plantaLabel}, para continuar con la gestión del paquete. Tené en cuenta que, al
        desactivar esta opción, se aplicará un cargo adicional.
      </p>
    </Modal>
  )
}
