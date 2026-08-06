import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/shared/lib/cn'
import styles from './Button.module.css'

export type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'link'
export type ButtonSize = 'sm' | 'md' | 'step'
/**
 * `pill` (por defecto): usa `--button-radius` en las cuatro esquinas.
 * `square`: sin radio propio. Se usa cuando el REDONDEO lo aporta un
 * contenedor externo que recorta con `overflow:hidden` (p. ej. el botón
 * Pagar, cuyo contenedor sólo redondea las esquinas inferiores).
 */
export type ButtonShape = 'pill' | 'square'

export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className'> {
  readonly variant?: ButtonVariant
  readonly size?: ButtonSize
  readonly shape?: ButtonShape
  readonly fullWidth?: boolean
  /** URL de un ícono PNG del proyecto, a la izquierda del texto. */
  readonly iconSrc?: string
  /** Sólo para posicionar el botón (grid/flex). No para repintarlo. */
  readonly className?: string
  readonly children?: ReactNode
}

const SIZE_CLASS: Record<ButtonSize, string | undefined> = {
  sm: styles.sizeSm,
  md: styles.sizeMd,
  step: styles.sizeStep,
}

/**
 * Botón genérico. No conoce reglas de negocio: quien lo usa decide si va
 * deshabilitado (normalmente con el resultado de una función de `rules/*`).
 */
export function Button({
  variant = 'primary',
  size = 'md',
  shape = 'pill',
  fullWidth = false,
  iconSrc,
  className,
  children,
  type = 'button',
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        styles.button,
        styles[variant],
        SIZE_CLASS[size],
        shape === 'square' && styles.shapeSquare,
        fullWidth && styles.fullWidth,
        className,
      )}
      {...rest}
    >
      {iconSrc !== undefined && (
        <span className={styles.icon}>
          <img src={iconSrc} alt="" />
        </span>
      )}
      {children}
    </button>
  )
}
