import type { ReactNode } from 'react'
import { cn } from '@/shared/lib/cn'
import { Button } from '@/shared/ui/Button'
import { Modal } from '@/shared/ui/Modal'
import styles from './ConfirmDialog.module.css'

export type ConfirmTone = 'default' | 'danger'

/** Qué botón se destaca visualmente. */
export type ConfirmEmphasis = 'confirm' | 'cancel'

export interface ConfirmDialogProps {
  readonly isOpen: boolean
  readonly onClose: () => void
  readonly onConfirm: () => void
  readonly title: string
  readonly description?: string
  readonly confirmLabel?: string
  readonly cancelLabel?: string
  readonly tone?: ConfirmTone
  /**
   * Cuál es la acción recomendada.
   *
   * Por defecto se destaca Confirmar. Con `'cancel'` se invierte: el botón
   * primario pasa a ser el de cancelar. Hace falta para el modal de
   * Representación ante Aduana, donde la acción recomendada es MANTENER la
   * representación y desactivarla es la opción secundaria.
   */
  readonly emphasis?: ConfirmEmphasis
  /** Deshabilita AMBOS botones (acción en curso). */
  readonly isBusy?: boolean
  /**
   * Deshabilita sólo Confirmar.
   *
   * Es lo que hay que usar cuando una regla de negocio bloquea la acción: el
   * usuario tiene que seguir pudiendo cerrar el modal con Cancelar.
   */
  readonly confirmDisabled?: boolean
  /** Contenido extra bajo la descripción (una alerta, un campo). */
  readonly children?: ReactNode
}

/**
 * Confirmación de dos opciones.
 *
 * No sabe qué se está confirmando: los modales de cada módulo lo envuelven y
 * le pasan los textos y el handler.
 */
export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  tone = 'default',
  emphasis = 'confirm',
  isBusy = false,
  confirmDisabled = false,
  children,
}: ConfirmDialogProps) {
  const confirmButton = (
    <Button
      key="confirm"
      variant={emphasis === 'confirm' ? 'primary' : 'secondary'}
      onClick={onConfirm}
      disabled={isBusy || confirmDisabled}
    >
      {confirmLabel}
    </Button>
  )

  const cancelButton = (
    <Button
      key="cancel"
      variant={emphasis === 'cancel' ? 'primary' : 'secondary'}
      onClick={onClose}
      disabled={isBusy}
    >
      {cancelLabel}
    </Button>
  )

  // El botón destacado va siempre a la derecha.
  const footer = emphasis === 'confirm' ? [cancelButton, confirmButton] : [confirmButton, cancelButton]

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="md" centered footer={footer}>
      {description !== undefined && description !== '' && (
        <p className={cn(styles.description, tone === 'danger' && styles.descriptionDanger)}>
          {description}
        </p>
      )}
      {children !== undefined && <div className={styles.extra}>{children}</div>}
    </Modal>
  )
}
