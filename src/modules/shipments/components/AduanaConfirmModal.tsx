import { Button } from '@/shared/ui/Button'
import { Modal } from '@/shared/ui/Modal'
import styles from './AduanaConfirmModal.module.css'

export interface AduanaConfirmModalProps {
  readonly isOpen: boolean
  /** El usuario elige mantener la representación (cierra sin cambios). */
  readonly onKeep: () => void
  /** El usuario confirma que quiere continuar sin representación. */
  readonly onConfirm: () => void
}

/**
 * Modal de confirmación de baja de representación ante Aduana — Figma 8069:124678.
 * Franja superior con X de cierre + cuerpo centrado (Gilroy Bold 24px) + botones en fila.
 * Se usa size="xl" (600px) y se toma control total del layout con márgenes negativos.
 */
export function AduanaConfirmModal({ isOpen, onKeep, onConfirm }: AduanaConfirmModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onKeep} size="xl" centered closable={false}>
      {/*
       * .wrapper rompe el padding del Modal.body (16px top/bottom, 24px left/right)
       * para poder aplicar el padding exacto del Figma a cada sección.
       */}
      <div className={styles.wrapper}>
        {/* Franja superior — 48px, X de cierre alineada a la derecha */}
        <div className={styles.topStripe}>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onKeep}
            aria-label="Cerrar"
          >
            {/* Ícono X — Figma node 10569:6997, 16×16 */}
            <svg width="16" height="16" viewBox="568 16 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path
                opacity="0.5"
                d="M568.293 16.2931C568.481 16.1056 568.735 16.0003 569 16.0003C569.265 16.0003 569.519 16.1056 569.707 16.2931L576 22.5861L582.293 16.2931C582.385 16.1976 582.496 16.1214 582.618 16.069C582.74 16.0166 582.871 15.989 583.004 15.9878C583.136 15.9867 583.268 16.012 583.391 16.0623C583.514 16.1125 583.626 16.1868 583.719 16.2807C583.813 16.3746 583.888 16.4862 583.938 16.6091C583.988 16.732 584.013 16.8637 584.012 16.9965C584.011 17.1293 583.984 17.2605 583.931 17.3825C583.879 17.5045 583.803 17.6148 583.707 17.7071L577.414 24.0001L583.707 30.2931C583.889 30.4817 583.99 30.7343 583.988 30.9965C583.985 31.2587 583.88 31.5095 583.695 31.6949C583.509 31.8803 583.259 31.9855 582.996 31.9878C582.734 31.99 582.482 31.8892 582.293 31.7071L576 25.4141L569.707 31.7071C569.518 31.8892 569.266 31.99 569.004 31.9878C568.741 31.9855 568.491 31.8803 568.305 31.6949C568.12 31.5095 568.015 31.2587 568.012 30.9965C568.01 30.7343 568.111 30.4817 568.293 30.2931L574.586 24.0001L568.293 17.7071C568.106 17.5196 568 17.2652 568 17.0001C568 16.7349 568.106 16.4806 568.293 16.2931Z"
                fill="currentColor"
              />
            </svg>
          </button>
        </div>

        {/* Sección de texto — padding: 16px 28px 24px 28px, gap: 24px */}
        <div className={styles.content}>
          <h5 className={styles.title}>Representación ante Aduana desactivada</h5>

          <p className={styles.body}>
            Si desactivás esta opción, Correo Argentino no podrá representarte ante Aduana en caso
            de que el envío requiera revisión. En esa situación, serás citado/a para presentarte
            personalmente en la planta CPI Retiro, CABA, a fin de continuar con la gestión del
            paquete.
          </p>
        </div>

        {/* Sección de botones — padding: 16px 28px 28px 28px, gap: 16px */}
        <div className={styles.buttons}>
          <Button variant="secondary" onClick={onConfirm}>
            Continuar sin representación
          </Button>
          <Button variant="primary" onClick={onKeep}>
            Mantener representación
          </Button>
        </div>
      </div>
    </Modal>
  )
}
