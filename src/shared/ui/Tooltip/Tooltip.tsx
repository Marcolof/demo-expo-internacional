import {
  useId,
  useState,
  type FocusEvent,
  type ReactElement,
  type ReactNode,
} from 'react'
import infoIcon from '@/assets/icons/info.svg'
import { cn } from '@/shared/lib/cn'
import styles from './Tooltip.module.css'

export type TooltipPlacement = 'top' | 'bottom'

export interface TooltipProps {
  readonly content: ReactNode
  readonly children: ReactElement
  readonly placement?: TooltipPlacement
  readonly className?: string
}

/**
 * Tooltip por hover/focus. El trigger debe ser un único elemento que acepte
 * refs vía clone implícito (wrapper span para no forzar forwardRef).
 */
export function Tooltip({
  content,
  children,
  placement = 'top',
  className,
}: TooltipProps) {
  const tipId = useId()
  const [open, setOpen] = useState(false)

  const show = () => setOpen(true)
  const hide = () => setOpen(false)

  const onBlur = (event: FocusEvent<HTMLSpanElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
      hide()
    }
  }

  return (
    <span
      className={cn(styles.root, className)}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={onBlur}
    >
      <span className={styles.trigger} aria-describedby={open ? tipId : undefined}>
        {children}
      </span>
      {open && (
        <span
          id={tipId}
          role="tooltip"
          className={cn(styles.tip, placement === 'bottom' ? styles.bottom : styles.top)}
        >
          {content}
        </span>
      )}
    </span>
  )
}

export interface InfoTooltipProps {
  readonly content: ReactNode
  readonly placement?: TooltipPlacement
  readonly label?: string
  readonly className?: string
}

/** Trigger estándar: ícono info de marca. */
export function InfoTooltip({
  content,
  placement = 'top',
  label = 'Más información',
  className,
}: InfoTooltipProps) {
  return (
    <Tooltip content={content} placement={placement} className={className}>
      <button type="button" className={styles.infoBtn} aria-label={label}>
        <img src={infoIcon} alt="" width={20} height={20} aria-hidden="true" />
      </button>
    </Tooltip>
  )
}
