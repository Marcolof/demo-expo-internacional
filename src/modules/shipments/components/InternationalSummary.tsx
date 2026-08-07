import { useState } from 'react'
import { Button } from '@/shared/ui/Button'
import { Stepper } from '@/shared/ui/Stepper'
import { cn } from '@/shared/lib/cn'
import { formatUsd, formatWeightKg } from '@/shared/lib/formatCurrency'
import type { Remitente } from '../types/remitente.types'
import styles from './InternationalSummary.module.css'

/** Pasos del flujo internacional, en orden. Re-exportados para el page. */
export const INTERNATIONAL_STEPS = ['Declaración', 'Paquete', 'Origen', 'Destino'] as const
export type InternationalStep = (typeof INTERNATIONAL_STEPS)[number]

const INTL_STEPPER_STEPS = INTERNATIONAL_STEPS.map((id) => ({ id, label: id }))

export interface SummaryRow {
  readonly label: string
  readonly value: string
}

const EMPTY = '-'

/** Datos en curso del paso Declaración, para reflejarlos en el resumen. */
export interface DeclaracionSummaryData {
  readonly categoryLabel?: string
  readonly totalArticles: number
  readonly totalValueUsd: number
  readonly totalWeightKg: number
}

function declaracionRows(data?: DeclaracionSummaryData): readonly SummaryRow[] {
  if (data === undefined) {
    return [
      { label: 'Categoría de envío', value: EMPTY },
      { label: 'Cantidad de artículos', value: EMPTY },
      { label: 'Valor total declarado', value: EMPTY },
      { label: 'Peso total declarado', value: EMPTY },
    ]
  }

  return [
    { label: 'Categoría de envío', value: data.categoryLabel ?? EMPTY },
    { label: 'Cantidad de artículos', value: String(data.totalArticles) },
    { label: 'Valor total declarado', value: formatUsd(data.totalValueUsd) },
    { label: 'Peso total declarado', value: formatWeightKg(data.totalWeightKg) },
  ]
}

/** Datos en curso del paso Paquete, para reflejarlos en el resumen. */
export interface PaqueteSummaryData {
  readonly measuresLabel?: string
  readonly weightLabel?: string
}

function paqueteRows(data?: PaqueteSummaryData): readonly SummaryRow[] | undefined {
  if (data === undefined) return undefined

  return [
    { label: 'Medidas', value: data.measuresLabel ?? EMPTY },
    { label: 'Peso', value: data.weightLabel ?? EMPTY },
  ]
}

function origenRows(remitente?: Remitente): readonly SummaryRow[] | undefined {
  if (remitente === undefined) return undefined

  return [
    { label: 'Nombre y apellido / Razón social', value: remitente.razonSocial },
    { label: 'Dirección', value: remitente.direccionFiscal },
    { label: 'Remitente', value: remitente.direccionRemitente },
  ]
}

/** Datos del paso Destino para el panel Resumen. */
export interface DestinoSummaryData {
  readonly countryLabel?: string
  readonly city?: string
  readonly address?: string
}

function destinoRows(data?: DestinoSummaryData): readonly SummaryRow[] | undefined {
  if (data === undefined) return undefined

  return [
    { label: 'País de destino', value: data.countryLabel ?? EMPTY },
    { label: 'Ciudad',          value: data.city          ?? EMPTY },
    { label: 'Dirección',       value: data.address       ?? EMPTY },
  ]
}

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
  /** Pasos ya alcanzados — determina cuáles son clicables en el stepper. */
  readonly unlockedSteps?: ReadonlySet<InternationalStep>
  /** Navegación del stepper: click en un paso ya desbloqueado. */
  readonly onStepClick?: (step: InternationalStep) => void
  readonly className?: string
  /** Totales del paso Declaración. Sin esto, la sección muestra "-" (estado inicial). */
  readonly declaracion?: DeclaracionSummaryData
  /** Medidas y peso del paso Paquete. Sin esto, la sección queda sin filas. */
  readonly paquete?: PaqueteSummaryData
  /**
   * Remitente para la sección Origen. Se elige en el paso 3 vía Select.
   */
  readonly origen?: Remitente
  /** Datos del paso Destino. Sin esto la sección muestra "-". */
  readonly destino?: DestinoSummaryData
  /** Callback del botón "Pagar". Sin definir, el botón queda deshabilitado. */
  readonly onPay?: () => void
}

/**
 * Panel Resumen del flujo internacional (Figma 7323:94782): stepper + secciones
 * colapsables (Declaración / Paquete / Origen / Destino) + botón Pagar.
 * Estado inicial de la maqueta: sólo Declaración abierta, valores en "-".
 */
export function InternationalSummary({
  currentStep = 'Declaración',
  unlockedSteps,
  onStepClick,
  className,
  declaracion,
  paquete,
  origen,
  destino,
  onPay,
}: InternationalSummaryProps) {
  const origenSectionRows = origenRows(origen)
  const destinoSectionRows = destinoRows(destino)
  const [open, setOpen] = useState<ReadonlySet<string>>(
    new Set(origenSectionRows !== undefined ? ['Declaración', 'Origen'] : ['Declaración']),
  )

  const toggle = (id: string) => {
    setOpen((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const currentIndex = INTERNATIONAL_STEPS.indexOf(currentStep)
  const unlockedIndices =
    unlockedSteps !== undefined
      ? new Set(
        INTERNATIONAL_STEPS.map((_, i) => i).filter((i) =>
            unlockedSteps.has(INTERNATIONAL_STEPS[i]!),
          ),
        )
      : undefined

  return (
    <div className={cn(styles.card, className)}>
      <div className={styles.stepperWrap}>
        <Stepper
          steps={INTL_STEPPER_STEPS}
          currentIndex={currentIndex}
          unlockedIndices={unlockedIndices}
          showLabels
          onStepClick={
            onStepClick !== undefined
              ? (index) => onStepClick(INTERNATIONAL_STEPS[index]!)
              : undefined
          }
        />
      </div>

      <div className={styles.info}>
        <p className={styles.heading}>Resumen</p>

        <Section
          title="Declaración"
          open={open.has('Declaración')}
          onToggle={() => toggle('Declaración')}
          rows={declaracionRows(declaracion)}
        />
        <Section
          title="Paquete"
          open={open.has('Paquete')}
          onToggle={() => toggle('Paquete')}
          rows={paqueteRows(paquete)}
        />
        <Section
          title="Origen"
          open={open.has('Origen')}
          onToggle={() => toggle('Origen')}
          rows={origenSectionRows}
        />
        <Section
          title="Destino"
          open={open.has('Destino')}
          onToggle={() => toggle('Destino')}
          rows={destinoSectionRows}
        />
      </div>

      <Button variant="primary" shape="square" fullWidth disabled={onPay === undefined} onClick={onPay}>
        Pagar
      </Button>
    </div>
  )
}
