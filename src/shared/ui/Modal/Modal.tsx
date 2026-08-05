import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/shared/lib/cn'
import styles from './Modal.module.css'

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl'

export interface ModalProps {
  readonly isOpen: boolean
  readonly onClose: () => void
  readonly title?: string
  readonly children: ReactNode
  readonly footer?: ReactNode
  readonly size?: ModalSize
  /** `false` quita la X y bloquea Escape / clic en el fondo (modal obligatorio). */
  readonly closable?: boolean
  readonly centered?: boolean
  readonly labelledById?: string
}

const SIZE_CLASS: Record<ModalSize, string | undefined> = {
  sm: styles.sizeSm,
  md: styles.sizeMd,
  lg: styles.sizeLg,
  xl: styles.sizeXl,
}

/**
 * Modal genérico, renderizado en un portal sobre `document.body`.
 *
 * DECISIÓN DE ARQUITECTURA
 * Este componente sólo sabe abrir, cerrar y encuadrar. Qué se pregunta y qué
 * pasa al confirmar es responsabilidad de los modales de cada módulo
 * (`modules/[dominio]/modals/*`), que lo envuelven.
 */
export function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  closable = true,
  centered = false,
  labelledById,
}: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null)

  // Escape cierra, y el scroll del fondo se bloquea mientras está abierto.
  useEffect(() => {
    if (!isOpen) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && closable) onClose()
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', onKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [isOpen, closable, onClose])

  // El foco entra al diálogo para que el lector de pantalla lo anuncie.
  useEffect(() => {
    if (isOpen) dialogRef.current?.focus()
  }, [isOpen])

  if (!isOpen) return null

  const titleId = labelledById ?? (title !== undefined ? 'modal-title' : undefined)

  return createPortal(
    <div
      className={styles.backdrop}
      onClick={(event) => {
        if (event.target === event.currentTarget && closable) onClose()
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={cn(styles.dialog, SIZE_CLASS[size])}
      >
        {(title !== undefined || closable) && (
          <div className={cn(styles.header, title === undefined && styles.headerBare)}>
            {title !== undefined && (
              <h5 id={titleId} className={styles.title}>
                {title}
              </h5>
            )}
            {closable && (
              <button
                type="button"
                className={styles.close}
                onClick={onClose}
                aria-label="Cerrar"
              >
                &times;
              </button>
            )}
          </div>
        )}

        <div className={cn(styles.body, centered && styles.bodyCentered)}>{children}</div>

        {footer !== undefined && <div className={styles.footer}>{footer}</div>}
      </div>
    </div>,
    document.body,
  )
}
