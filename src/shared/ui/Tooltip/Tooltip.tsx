import {
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type FocusEvent,
  type ReactElement,
  type ReactNode,
} from 'react'
import { createPortal } from 'react-dom'
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
 * Tooltip por hover/focus. El tip se renderiza en portal (body) para no
 * recortarse por overflow de modales/scroll containers.
 */
export function Tooltip({
  content,
  children,
  placement = 'top',
  className,
}: TooltipProps) {
  const tipId = useId()
  const rootRef = useRef<HTMLSpanElement>(null)
  const [open, setOpen] = useState(false)
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null)

  const show = () => setOpen(true)
  const hide = () => setOpen(false)

  const onBlur = (event: FocusEvent<HTMLSpanElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
      hide()
    }
  }

  useLayoutEffect(() => {
    if (!open || rootRef.current === null) {
      setCoords(null)
      return
    }

    const update = () => {
      const rect = rootRef.current?.getBoundingClientRect()
      if (rect === undefined) return
      const gap = 4
      setCoords({
        top: placement === 'bottom' ? rect.bottom + gap : rect.top - gap,
        left: rect.left + rect.width / 2,
      })
    }

    update()
    window.addEventListener('scroll', update, true)
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update, true)
      window.removeEventListener('resize', update)
    }
  }, [open, placement])

  const tipStyle: CSSProperties | undefined =
    coords === null
      ? undefined
      : {
          position: 'fixed',
          top: coords.top,
          left: coords.left,
          transform:
            placement === 'bottom' ? 'translate(-50%, 0)' : 'translate(-50%, -100%)',
        }

  return (
    <span
      ref={rootRef}
      className={cn(styles.root, className)}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={onBlur}
    >
      <span className={styles.trigger} aria-describedby={open ? tipId : undefined}>
        {children}
      </span>
      {open &&
        coords !== null &&
        createPortal(
          <span
            id={tipId}
            role="tooltip"
            className={cn(styles.tip, styles.tipPortal)}
            style={tipStyle}
          >
            {content}
          </span>,
          document.body,
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
