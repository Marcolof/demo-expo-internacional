import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/shared/lib/cn'
import styles from './Modal.module.css'

/**
 * `close.svg` traído inline (no `<img>`), mismo criterio que `boxes.svg` /
 * `file-text.svg`: `currentColor` en vez del `fill="black"` fijo del asset,
 * para pintarlo con el token `--icon-enabled` desde `.closeIcon` en CSS.
 */
function CloseIcon() {
  return (
    <svg className={styles.closeIcon} width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        fill="currentColor"
        d="M0.292786 0.29302C0.480314 0.105549 0.734622 0.000233689 0.999786 0.000233689C1.26495 0.000233689 1.51926 0.105549 1.70679 0.29302L7.99979 6.58602L14.2928 0.29302C14.385 0.19751 14.4954 0.121328 14.6174 0.0689187C14.7394 0.0165097 14.8706 -0.0110765 15.0034 -0.0122303C15.1362 -0.0133841 15.2678 0.0119176 15.3907 0.0621985C15.5136 0.112479 15.6253 0.186732 15.7192 0.280625C15.8131 0.374518 15.8873 0.48617 15.9376 0.609066C15.9879 0.731962 16.0132 0.863642 16.012 0.996421C16.0109 1.1292 15.9833 1.26042 15.9309 1.38242C15.8785 1.50443 15.8023 1.61477 15.7068 1.70702L9.41379 8.00002L15.7068 14.293C15.8889 14.4816 15.9897 14.7342 15.9875 14.9964C15.9852 15.2586 15.88 15.5094 15.6946 15.6948C15.5092 15.8802 15.2584 15.9854 14.9962 15.9877C14.734 15.99 14.4814 15.8892 14.2928 15.707L7.99979 9.41402L1.70679 15.707C1.51818 15.8892 1.26558 15.99 1.00339 15.9877C0.741189 15.9854 0.490376 15.8802 0.304968 15.6948C0.11956 15.5094 0.0143908 15.2586 0.0121124 14.9964C0.00983399 14.7342 0.110628 14.4816 0.292786 14.293L6.58579 8.00002L0.292786 1.70702C0.105315 1.51949 0 1.26518 0 1.00002C0 0.734856 0.105315 0.480548 0.292786 0.29302Z"
      />
    </svg>
  )
}

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
        {closable && (
          <div className={styles.closeRow}>
            <button type="button" className={styles.close} onClick={onClose} aria-label="Cerrar">
              <CloseIcon />
            </button>
          </div>
        )}

        {title !== undefined && (
          <h5 id={titleId} className={styles.title}>
            {title}
          </h5>
        )}

        <div className={cn(styles.body, centered && styles.bodyCentered)}>{children}</div>

        {footer !== undefined && <div className={styles.footer}>{footer}</div>}
      </div>
    </div>,
    document.body,
  )
}
