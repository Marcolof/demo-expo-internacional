import { Fragment } from 'react'
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
  /**
   * Pasos navegables (base 0). Si se omite y `onStepClick` está definido,
   * todos los no-activos son clicables. Si se pasa un Set vacío, ninguno lo es.
   */
  readonly unlockedIndices?: ReadonlySet<number>
  readonly onStepClick?: (index: number, step: StepperStep) => void
  /** Muestra los labels debajo de cada punto (Internacional). Ocultos por defecto (Nacional). */
  readonly showLabels?: boolean
  readonly className?: string
}

type StepState = 'visited' | 'active' | 'pending'

function stateFor(index: number, currentIndex: number): StepState {
  if (index < currentIndex) return 'visited'
  if (index === currentIndex) return 'active'
  return 'pending'
}

/**
 * Indicador de pasos unificado: cubre tanto el flujo nacional (puntos sin
 * labels, conector pseudo-elem) como el internacional (labels visibles,
 * pasos clicables para volver atrás).
 */
export function Stepper({
  steps,
  currentIndex,
  unlockedIndices,
  onStepClick,
  showLabels = false,
  className,
}: StepperProps) {
  return (
    <div
      className={cn(styles.stepper, showLabels && styles.stepperWithLabels, className)}
      role="list"
      aria-label="Progreso del envío"
    >
      {steps.map((step, index) => {
        const state = stateFor(index, currentIndex)
        const isClickable =
          onStepClick !== undefined &&
          state !== 'active' &&
          (unlockedIndices === undefined || unlockedIndices.has(index))

        return (
          <Fragment key={step.id}>
            {index > 0 && (
              <span
                className={cn(styles.connector, index <= currentIndex && styles.connectorPassed)}
                aria-hidden="true"
              />
            )}
            <div
              className={styles.step}
              role="listitem"
              aria-current={state === 'active' ? 'step' : undefined}
            >
              <button
                type="button"
                className={styles.hitArea}
                disabled={!isClickable}
                onClick={() => onStepClick?.(index, step)}
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
                {showLabels ? (
                  <span className={styles.label}>{step.label}</span>
                ) : (
                  <span className={styles.srOnly}>{step.label}</span>
                )}
              </button>
            </div>
          </Fragment>
        )
      })}
    </div>
  )
}
