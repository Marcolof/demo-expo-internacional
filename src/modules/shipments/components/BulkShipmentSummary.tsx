import { useState } from 'react'
import type { ReactNode } from 'react'
import { cn } from '@/shared/lib/cn'
import { Button } from '@/shared/ui/Button'
import styles from './BulkShipmentSummary.module.css'

export interface BulkSummaryData {
  readonly homeAddresses: number
  readonly packages: number
  readonly shipments: number
}

export interface BulkShipmentSummaryProps {
  /** `null` = todavía no se cargó ningún archivo (estado vacío). */
  readonly data: BulkSummaryData | null
  /** "Pagar" queda deshabilitado sin handler o sin archivo cargado. */
  readonly onPay?: () => void
  readonly className?: string
}

const EMPTY = '-'

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

/** `house.svg` inline con `currentColor`, mismo criterio que el resto de los íconos del proyecto. */
function HouseIcon() {
  return (
    <svg className={styles.statIcon} width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 1.00195C12.5249 1.00195 13.0401 1.14066 13.4951 1.40234L13.4961 1.40137L20.4961 5.40137L20.5 5.4043C20.9555 5.66734 21.3344 6.04557 21.5977 6.50098C21.8608 6.95635 21.9995 7.4731 22 7.99902V16.001C21.9995 16.5269 21.8608 17.0436 21.5977 17.499C21.3344 17.9545 20.9556 18.3327 20.5 18.5957L20.4961 18.5986L13.4961 22.5986L13.4951 22.5977C13.0712 22.8414 12.5951 22.9767 12.1074 22.9941C12.0721 22.9979 12.0363 23 12 23C11.9634 23 11.9272 22.998 11.8916 22.9941C11.404 22.9765 10.9277 22.8415 10.5039 22.5977V22.5986L3.50391 18.5986L3.5 18.5957C3.04444 18.3327 2.6656 17.9545 2.40234 17.499C2.13918 17.0436 2.00055 16.5269 2 16.001V7.99902L2.00684 7.80176C2.03742 7.34449 2.17219 6.89929 2.40234 6.50098C2.66559 6.04557 3.04448 5.66734 3.5 5.4043L3.50391 5.40137L10.5039 1.40137V1.40234C10.9591 1.14038 11.4748 1.00195 12 1.00195ZM4 15.999L4.00879 16.1299C4.02601 16.2592 4.06815 16.3844 4.13379 16.498C4.22077 16.6485 4.34602 16.7738 4.49609 16.8613L11 20.5771V12.5781L4 8.55566V15.999ZM13 12.5781V20.5771L19.5039 16.8613C19.654 16.7738 19.7792 16.6485 19.8662 16.498C19.9536 16.3466 19.9996 16.1748 20 16V8.55566L13 12.5781ZM12 3.00195C11.8245 3.00195 11.652 3.048 11.5 3.13574L11.4961 3.1377L5.02246 6.83594L12 10.8457L18.9766 6.83594L12.5039 3.1377L12.5 3.13574C12.348 3.048 12.1755 3.00195 12 3.00195Z"
      />
    </svg>
  )
}

/** `box.svg` inline con `currentColor`. */
function BoxIcon() {
  return (
    <svg className={styles.statIcon} width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 1.00195C12.5249 1.00195 13.0401 1.14066 13.4951 1.40234L13.4961 1.40137L20.4961 5.40137L20.5 5.4043C20.9555 5.66734 21.3344 6.04557 21.5977 6.50098C21.8608 6.95635 21.9995 7.4731 22 7.99902V16.001C21.9995 16.5269 21.8608 17.0436 21.5977 17.499C21.3344 17.9545 20.9556 18.3327 20.5 18.5957L20.4961 18.5986L13.4961 22.5986L13.4951 22.5977C13.0712 22.8414 12.5951 22.9767 12.1074 22.9941C12.0721 22.9979 12.0363 23 12 23C11.9634 23 11.9272 22.998 11.8916 22.9941C11.404 22.9765 10.9277 22.8415 10.5039 22.5977V22.5986L3.50391 18.5986L3.5 18.5957C3.04444 18.3327 2.6656 17.9545 2.40234 17.499C2.13918 17.0436 2.00055 16.5269 2 16.001V7.99902L2.00684 7.80176C2.03742 7.34449 2.17219 6.89929 2.40234 6.50098C2.66559 6.04557 3.04448 5.66734 3.5 5.4043L3.50391 5.40137L10.5039 1.40137V1.40234C10.9591 1.14038 11.4748 1.00195 12 1.00195ZM4 15.999L4.00879 16.1299C4.02601 16.2592 4.06815 16.3844 4.13379 16.498C4.22077 16.6485 4.34602 16.7738 4.49609 16.8613L11 20.5771V12.5781L4 8.55566V15.999ZM13 12.5781V20.5771L19.5039 16.8613C19.654 16.7738 19.7792 16.6485 19.8662 16.498C19.9536 16.3466 19.9996 16.1748 20 16V8.55566L13 12.5781ZM12 3.00195C11.8245 3.00195 11.652 3.048 11.5 3.13574L11.4961 3.1377L5.02246 6.83594L12 10.8457L18.9766 6.83594L12.5039 3.1377L12.5 3.13574C12.348 3.048 12.1755 3.00195 12 3.00195Z"
      />
    </svg>
  )
}

/** `send.svg` inline con `currentColor`. */
function SendIcon() {
  return (
    <svg className={styles.statIcon} width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        fill="currentColor"
        d="M21.6698 1.0557C22.0323 0.928998 22.4354 1.02146 22.7069 1.293C22.9784 1.56454 23.0709 1.96763 22.9442 2.33011L15.9442 22.3301C15.8088 22.717 15.4504 22.9822 15.0409 22.9991C14.6312 23.0158 14.2523 22.781 14.0858 22.4063L10.242 13.7578L1.59361 9.9141C1.21893 9.74757 0.984123 9.3687 1.00084 8.95902C1.01765 8.54945 1.28286 8.19112 1.66978 8.0557L21.6698 1.0557ZM12.1922 13.2207L14.8885 19.2871L19.6073 5.8057L12.1922 13.2207ZM4.71177 9.11039L10.7782 11.8067L18.1932 4.39164L4.71177 9.11039Z"
      />
    </svg>
  )
}

interface StatPillProps {
  readonly icon: 'house' | 'box' | 'send'
  readonly label: string
  readonly value: string
}

function StatPill({ icon, label, value }: StatPillProps) {
  return (
    <div className={styles.statPill}>
      {icon === 'house' && <HouseIcon />}
      {icon === 'box' && <BoxIcon />}
      {icon === 'send' && <SendIcon />}
      <span className={styles.statLabel}>{label}</span>
      <span className={styles.statValue}>{value}</span>
    </div>
  )
}

interface SectionProps {
  readonly title: string
  readonly open: boolean
  readonly onToggle: () => void
  readonly editable?: boolean
  readonly children: ReactNode
}

function Section({ title, open, onToggle, editable = false, children }: SectionProps) {
  return (
    <div className={styles.section}>
      <button type="button" className={styles.sectionHeader} onClick={onToggle} aria-expanded={open}>
        <span className={styles.sectionTitle}>{title}</span>
        {editable && <span className={styles.edit}>Editar</span>}
        <Chevron open={open} />
      </button>

      {/* Truco `grid-template-rows: 0fr → 1fr` para animar una altura "auto"
          con CSS puro — el contenido queda siempre montado (no
          `{open && ...}`), así hay algo que transicionar en vez de
          aparecer/desaparecer de golpe. */}
      <div className={cn(styles.sectionBody, open && styles.sectionBodyOpen)} aria-hidden={!open}>
        <div className={styles.sectionBodyInner}>
          <div className={styles.statsRow}>{children}</div>
        </div>
      </div>
    </div>
  )
}

/**
 * Panel Resumen de la carga masiva (Figma 5658:21815) — distinto del resumen
 * de carga individual: sin stepper, dos secciones (Origen / Carga de datos)
 * con "pills" de estadísticas en vez de filas etiqueta/valor. Estado inicial
 * vacío (`data === null`, valores en "-"); al simular la carga de un
 * archivo se completa con datos mock.
 */
export function BulkShipmentSummary({ data, onPay, className }: BulkShipmentSummaryProps) {
  const [open, setOpen] = useState<ReadonlySet<string>>(new Set(['Origen', 'Carga de datos']))

  const toggle = (id: string) => {
    setOpen((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const homeAddresses = data !== null ? String(data.homeAddresses) : EMPTY
  const packages = data !== null ? String(data.packages) : EMPTY
  const shipments = data !== null ? String(data.shipments) : EMPTY

  return (
    <div className={cn(styles.card, className)}>
      <div className={styles.info}>
        <p className={styles.heading}>Resumen</p>

        <Section title="Origen" open={open.has('Origen')} onToggle={() => toggle('Origen')}>
          <StatPill icon="house" label="Domicilios" value={homeAddresses} />
          <StatPill icon="box" label="Paquetes" value={packages} />
        </Section>

        <Section title="Carga de datos" open={open.has('Carga de datos')} onToggle={() => toggle('Carga de datos')} editable>
          <StatPill icon="send" label="Envíos" value={shipments} />
        </Section>
      </div>

      <Button
        variant="primary"
        shape="square"
        fullWidth
        disabled={data === null || onPay === undefined}
        onClick={onPay}
      >
        Pagar
      </Button>
    </div>
  )
}
