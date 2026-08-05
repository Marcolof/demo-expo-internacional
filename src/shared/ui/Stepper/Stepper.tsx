import { cn } from '@/shared/lib/cn'
import styles from './Stepper.module.css'

export interface StepperStep {
  readonly id: string
  readonly label: string
}

export interface StepperProps {
  readonly steps: readonly StepperStep[]
  /** Índice del paso actual, base 0. */
  readonly currentIndex: number
  /** En la maqueta no navega; se conserva por API. */
  readonly onStepClick?: (index: number, step: StepperStep) => void
  /** Oculta textos (el original ya no muestra labels en los puntos). */
  readonly hideLabels?: boolean
  readonly className?: string
}

type StepState = 'visited' | 'active' | 'pending'

function stateFor(index: number, currentIndex: number): StepState {
  if (index < currentIndex) return 'visited'
  if (index === currentIndex) return 'active'
  return 'pending'
}

/**
 * Indicador de pasos — réplica de `.tabenvios` del HTML de referencia.
 * Tres círculos conectados por una línea gris detrás; el activo es
 * disco amarillo con anillo amarillo (`bi-circle-fill` + `.active`).
 */
export function Stepper({
  steps,
  currentIndex,
  hideLabels = false,
  className,
}: StepperProps) {
  const hasProgress = currentIndex > 0

  return (
    <ol
      className={cn(styles.stepper, hasProgress && styles.stepperHasProgress, className)}
      aria-label="Progreso del envío"
    >
      {steps.map((step, index) => {
        const state = stateFor(index, currentIndex)

        return (
          <li
            key={step.id}
            className={styles.step}
            aria-current={state === 'active' ? 'step' : undefined}
          >
            <span
              className={cn(
                styles.dot,
                state === 'visited' && styles.dotVisited,
                state === 'active' && styles.dotActive,
                state === 'pending' && styles.dotPending,
              )}
              aria-hidden="true"
            />

            {!hideLabels && <span className={styles.srOnly}>{step.label}</span>}
          </li>
        )
      })}
    </ol>
  )
}
