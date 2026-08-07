import { cn } from '@/shared/lib/cn'
import styles from './RadioDot.module.css'

export interface RadioDotProps {
  readonly selected: boolean
  readonly disabled?: boolean
  readonly className?: string
}

/**
 * Indicador visual de radio (Design System, node 231:829): contenedor
 * 24×24, anillo exterior de 20×20 con stroke interior de 2px, círculo
 * interior de 10×10 centrado cuando está seleccionado. Es SVG, no
 * border+pseudo-elemento, para que el trazo mida exactamente lo pedido en
 * vez de aproximarse con `border-box`.
 *
 * Puramente decorativo (`aria-hidden`) — va junto a un
 * `<input type="radio">` real, oculto con `.visually-hidden`, que maneja el
 * estado y el teclado.
 */
export function RadioDot({ selected, disabled = false, className }: RadioDotProps) {
  return (
    <svg
      className={cn(styles.dot, className)}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      {/* r=9 + stroke-width=2 centrado en el trazo → el anillo ocupa de r=8 a
          r=10 (20×20), con el stroke íntegramente hacia adentro de esa
          circunferencia de 20×20. */}
      <circle
        cx="12"
        cy="12"
        r="9"
        strokeWidth="2"
        className={cn(styles.ring, selected && styles.ringSelected, disabled && styles.ringDisabled)}
      />
      {selected && (
        <circle
          cx="12"
          cy="12"
          r="5"
          className={cn(styles.innerDot, disabled && styles.innerDotDisabled)}
        />
      )}
    </svg>
  )
}
