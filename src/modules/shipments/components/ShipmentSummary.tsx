import { useState } from 'react'
import type { ReactNode } from 'react'
import { cn } from '@/shared/lib/cn'
import { Stepper } from '@/shared/ui/Stepper'
import { SHIPMENT_STEPS, SHIPMENT_STEP_LABELS } from '../forms/shipment.schema'
import type { ShipmentStep } from '../forms/shipment.schema'
import styles from './ShipmentSummary.module.css'

/** Un renglón del resumen: etiqueta + valor (o `-` si todavía no se cargó). */
export interface SummaryRow {
  readonly label: string
  readonly value: string
}

export interface ShipmentSummaryProps {
  readonly currentStep: ShipmentStep
  readonly origin: readonly SummaryRow[]
  readonly packageRows: readonly SummaryRow[]
  readonly destination: readonly SummaryRow[]
  /** Volver a un paso desde el enlace "Editar". */
  readonly onEditStep: (step: ShipmentStep) => void
  /** Bloquea los "Editar" cuando el envío ya no se puede modificar. */
  readonly readOnly?: boolean
  /**
   * Botón "Pagar", pegado al fondo de esta misma tarjeta, a todo el ancho.
   * El botón en sí va cuadrado (`shape="square"`): quien redondea la esquina
   * inferior es la tarjeta (`.panel`), que lo recorta con `overflow:hidden`.
   */
  readonly payButton?: ReactNode
}

function Chevron({ isOpen }: { readonly isOpen: boolean }) {
  return (
    <svg
      className={cn(styles.chevron, isOpen && styles.chevronOpen)}
      width="14"
      height="14"
      viewBox="0 0 16 16"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z" />
    </svg>
  )
}

/**
 * Resumen del envío en construcción.
 *
 * Arranca con Origen abierto y los otros dos cerrados, igual que el original
 * (`#mosOri2` visible, `#mosPaq2` y `#mosDes2` con `d-none`).
 */
export function ShipmentSummary({
  currentStep,
  origin,
  packageRows,
  destination,
  onEditStep,
  readOnly = false,
  payButton,
}: ShipmentSummaryProps) {
  const [openBlocks, setOpenBlocks] = useState<ReadonlySet<ShipmentStep>>(new Set(['ORIGEN']))

  const toggleBlock = (step: ShipmentStep) => {
    setOpenBlocks((current) => {
      const next = new Set(current)
      if (next.has(step)) next.delete(step)
      else next.add(step)
      return next
    })
  }

  const renderBlock = (step: ShipmentStep, children: ReactNode) => {
    const isOpen = openBlocks.has(step)

    return (
      <div className={styles.block}>
        <div className={styles.blockHeader}>
          <span className={styles.blockTitle}>{SHIPMENT_STEP_LABELS[step]}</span>

          <button
            type="button"
            className={styles.edit}
            disabled={readOnly}
            onClick={() => onEditStep(step)}
          >
            Editar
          </button>

          <button
            type="button"
            className={styles.toggle}
            aria-expanded={isOpen}
            aria-label={isOpen ? `Ocultar ${SHIPMENT_STEP_LABELS[step]}` : `Mostrar ${SHIPMENT_STEP_LABELS[step]}`}
            onClick={() => toggleBlock(step)}
          >
            <Chevron isOpen={isOpen} />
          </button>
        </div>

        {isOpen && <div className={styles.body}>{children}</div>}
      </div>
    )
  }

  const renderRows = (rows: readonly SummaryRow[], inline = false) => (
    <div className={cn(inline ? styles.rowInline : undefined)}>
      {rows.map((row) => (
        <div key={row.label} className={inline ? undefined : styles.row}>
          <span className={styles.label}>{row.label}</span>
          <span className={styles.value}>{row.value}</span>
        </div>
      ))}
    </div>
  )

  const steps = SHIPMENT_STEPS.map((step) => ({ id: step, label: SHIPMENT_STEP_LABELS[step] }))

  return (
    <aside className={styles.panel}>
      <div className={styles.content}>
        <div className={styles.stepperWrap}>
          <Stepper
            steps={steps}
            currentIndex={SHIPMENT_STEPS.indexOf(currentStep)}
            onStepClick={(_, step) => onEditStep(step.id as ShipmentStep)}
          />
        </div>

        <h6 className={styles.title}>Resumen</h6>

        {renderBlock('ORIGEN', renderRows(origin))}
        {renderBlock('PAQUETE', renderRows(packageRows, true))}
        {renderBlock('DESTINO', renderRows(destination))}
      </div>

      {/* Pegado al fondo, a todo el ancho: la tarjeta (`.panel`) es la que
          recorta la esquina inferior, no el botón. */}
      {payButton !== undefined && <div className={styles.payButtonSlot}>{payButton}</div>}
    </aside>
  )
}
