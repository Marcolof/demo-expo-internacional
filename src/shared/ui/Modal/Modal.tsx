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
  /** Clase extra sobre el diálogo (p. ej. alto Figma). */
  readonly className?: string
  readonly bodyClassName?: string
  readonly footerClassName?: string
}

const SIZE_CLASS: Record<ModalSize, string | undefined> = {
  sm: styles.sizeSm,
  md: styles.sizeMd,
  lg: styles.sizeLg,
  xl: styles.sizeXl,
}

function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path
        d="M1.293 1.293a1 1 0 0 1 1.414 0L8 6.586l5.293-5.293a1 1 0 1 1 1.414 1.414L9.414 8l5.293 5.293a1 1 0 0 1-1.414 1.414L8 9.414l-5.293 5.293a1 1 0 0 1-1.414-1.414L6.586 8 1.293 2.707a1 1 0 0 1 0-1.414Z"
        fill="currentColor"
      />
    </svg>
  )
}

/**
 * Modal genérico con franja superior (48px) + X de cierre a la derecha —
 * patrón Figma MiCorreo (ejemplovistamodal / modalejemplocontainersuperior).
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
  className,
  bodyClassName,
  footerClassName,
}: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null)

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
        className={cn(styles.dialog, SIZE_CLASS[size], className)}
      >
        {closable && (
          <div className={styles.topStripe}>
            <button
              type="button"
              className={styles.close}
              onClick={onClose}
              aria-label="Cerrar"
            >
              <CloseIcon />
            </button>
          </div>
        )}

        <div className={cn(styles.body, centered && styles.bodyCentered, bodyClassName)}>
          {title !== undefined && (
            <h5 id={titleId} className={styles.title}>
              {title}
            </h5>
          )}
          {children}
        </div>

        {footer !== undefined && (
          <div className={cn(styles.footer, footerClassName)}>{footer}</div>
        )}
      </div>
    </div>,
    document.body,
  )
}
