import { useState } from 'react'
import { Button } from '@/shared/ui/Button'
import { cn } from '@/shared/lib/cn'
import { InternationalStepper } from './InternationalStepper'
import type { InternationalStep } from './InternationalStepper'
import styles from './InternationalSummary.module.css'

export interface SummaryRow {
  readonly label: string
  readonly value: string
}

const EMPTY = '-'

/** Filas de la sección Declaración (valores en "-" para el estado inicial). */
const DECLARACION_ROWS: readonly SummaryRow[] = [
  { label: 'Categoría de envío', value: EMPTY },
  { label: 'Cantidad de artículos', value: EMPTY },
  { label: 'Valor total declarado', value: EMPTY },
  { label: 'Peso total declarado', value: EMPTY },
]

function Chevron({ open }: { readonly open: boolean }) {
  return (
    <svg
      className={cn(styles.chevron, open && styles.chevronOpen)}
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z" />
    </svg>
  )
}

interface SectionProps {
  readonly title: string
  readonly open: boolean
  readonly onToggle: () => void
  readonly rows?: readonly SummaryRow[]
}

function Section({ title, open, onToggle, rows }: SectionProps) {
  return (
    <button type="button" className={styles.section} onClick={onToggle} aria-expanded={open}>
      <span className={styles.sectionHeader}>
        <span className={styles.sectionTitle}>{title}</span>
        <span className={styles.edit}>
          Editar
          <Chevron open={open} />
        </span>
      </span>

      {open && rows !== undefined && (
        <span className={styles.rows}>
          {rows.map((row) => (
            <span key={row.label} className={styles.row}>
              <span className={styles.rowLabel}>{row.label}</span>
              <span className={styles.rowValue}>{row.value}</span>
            </span>
          ))}
        </span>
      )}
    </button>
  )
}

export interface InternationalSummaryProps {
  /** Paso en curso, para el stepper. */
  readonly currentStep?: InternationalStep
  readonly className?: string
}

/**
 * Panel Resumen del flujo internacional (Figma 7323:94782): stepper + secciones
 * colapsables (Declaración / Paquete / Origen / Destino) + botón Pagar.
 * Estado inicial de la maqueta: sólo Declaración abierta, valores en "-".
 */
export function InternationalSummary({ currentStep = 'Declaración', className }: InternationalSummaryProps) {
  const [open, setOpen] = useState<ReadonlySet<string>>(new Set(['Declaración']))

  const toggle = (id: string) => {
    setOpen((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <div className={cn(styles.card, className)}>
      <InternationalStepper current={currentStep} />

      <div className={styles.info}>
        <p className={styles.heading}>Resumen</p>

        <Section
          title="Declaración"
          open={open.has('Declaración')}
          onToggle={() => toggle('Declaración')}
          rows={DECLARACION_ROWS}
        />
        <Section title="Paquete" open={open.has('Paquete')} onToggle={() => toggle('Paquete')} />
        <Section title="Origen" open={open.has('Origen')} onToggle={() => toggle('Origen')} />
        <Section title="Destino" open={open.has('Destino')} onToggle={() => toggle('Destino')} />
      </div>

      <Button variant="primary" shape="square" fullWidth disabled>
        Pagar
      </Button>
    </div>
  )
}
