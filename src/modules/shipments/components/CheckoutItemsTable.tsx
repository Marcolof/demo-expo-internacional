import { useState } from 'react'
import { cn } from '@/shared/lib/cn'
import { formatDimensionsCm, formatMoney, formatWeightKg } from '@/shared/lib/formatCurrency'
import { POSTAL_SERVICE_LABELS } from '../types/shipment.types'
import type { CheckoutItem } from '../types/checkout.types'
import styles from './CheckoutItemsTable.module.css'

/** Chevron de 16px, el mismo glifo que usan los otros acordeones del proyecto. */
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

/**
 * Globo + cubo: marca los envíos internacionales. Es el mismo dibujo que
 * `assets/icons/internacional.svg`, copiado inline y con `fill="currentColor"`
 * en lugar del azul fijo del asset — igual que `boxes.svg` / `house.svg` en el
 * resto del módulo. Como `<img>` no se podría repintar desde el CSS, y acá
 * tiene que ir del mismo gris que el sobre de los envíos nacionales.
 */
function InternationalIcon() {
  return (
    <svg
      className={styles.productIcon}
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        fill="currentColor"
        d="M8.57801 1.20117C12.4033 1.20129 15.5234 4.21331 15.7005 7.99485L14.7305 7.45101C14.4939 7.31851 14.2396 7.22944 13.9803 7.18263C13.5853 5.3192 12.2531 3.80272 10.4983 3.15209C10.6803 3.43292 10.8447 3.7335 10.9888 4.04829C11.4447 5.04435 11.7382 6.24056 11.8254 7.53028H12.2334L9.38632 9.13747H6.99201C7.01429 9.42159 7.04802 9.69876 7.09246 9.96696C7.23076 10.8014 7.47162 11.5392 7.77442 12.1431V15.2916C7.77443 15.3344 7.77607 15.377 7.77834 15.4195C4.21584 15.0218 1.44543 12.0024 1.44531 8.33387C1.44544 4.39491 4.63905 1.20131 8.57801 1.20117ZM3.11215 9.13747C3.41019 11.1823 4.82734 12.8628 6.72284 13.5384C6.70154 13.5059 6.68002 13.4734 6.65927 13.4403C6.10597 12.559 5.7087 11.45 5.50645 10.2299C5.44782 9.87603 5.40757 9.51081 5.38246 9.13747H3.11215ZM6.72284 3.12855C4.82729 3.80429 3.40945 5.48541 3.11136 7.53028H5.38168C5.46871 6.24033 5.76218 5.04455 6.21823 4.04829C6.36625 3.72497 6.53479 3.41593 6.72284 3.12855ZM8.60312 3.35456C8.2732 3.66814 7.95331 4.12056 7.68024 4.7169C7.32506 5.49279 7.07609 6.45763 6.99201 7.53028H10.215C10.131 6.45815 9.88253 5.49336 9.52757 4.71769C9.25436 4.12078 8.93338 3.66853 8.60312 3.35456Z"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        fill="currentColor"
        d="M12.7616 8.15479C13.2502 7.87902 13.8478 7.87747 14.3374 8.15165L17.733 10.0555C18.2402 10.3397 18.5546 10.8757 18.5547 11.4571V15.2891C18.5546 15.8704 18.2401 16.4064 17.733 16.6906L14.3374 18.5937C13.8477 18.8681 13.2504 18.8674 12.7616 18.5913L9.39495 16.6899C8.89036 16.4048 8.57807 15.8702 8.57801 15.2906V11.4547C8.57812 10.8751 8.89023 10.3397 9.39495 10.0547L12.7616 8.15479ZM14.3539 13.8113V16.7424L16.9475 15.2891V12.3572L14.3539 13.8113ZM10.1852 15.2906L12.7467 16.7369V13.8098L10.1852 12.3619V15.2906ZM11.0155 10.9854L13.551 12.4184L16.107 10.9862L13.5518 9.55402L11.0155 10.9854Z"
      />
    </svg>
  )
}

/**
 * Sobre: marca los envíos nacionales. Va inline con `currentColor` (mismo
 * criterio que `boxes.svg` / `house.svg` en el resto del módulo) porque el
 * proyecto no tiene todavía un asset de sobre y el color lo define el CSS.
 */
function MailIcon() {
  return (
    <svg
      className={styles.productIcon}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  )
}

interface DetailRowProps {
  readonly label: string
  readonly value: string
}

function DetailRow({ label, value }: DetailRowProps) {
  return (
    <div className={styles.detailRow}>
      <dt className={styles.detailLabel}>{label}</dt>
      <dd className={styles.detailValue}>{value}</dd>
    </div>
  )
}

interface CheckoutRowProps {
  readonly item: CheckoutItem
  readonly defaultOpen: boolean
}

function CheckoutRow({ item, defaultOpen }: CheckoutRowProps) {
  const [open, setOpen] = useState(defaultOpen)
  const isInternational = item.scope === 'INTERNACIONAL'

  return (
    <div className={cn(styles.card, open && styles.cardOpen)}>
      <button
        type="button"
        className={styles.rowMain}
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        <span className={styles.cell}>
          {isInternational ? <InternationalIcon /> : <MailIcon />}
          {/* Los íconos son decorativos: el alcance se anuncia por texto. */}
          <span className="visually-hidden">
            {isInternational ? 'Envío internacional' : 'Envío nacional'}
          </span>
        </span>
        <span className={styles.cell}>{item.integration}</span>
        <span className={styles.cell}>{item.orderNumber}</span>
        <span className={cn(styles.cell, styles.cellTruncate)}>{item.originLabel}</span>
        <span className={cn(styles.cell, styles.cellTruncate)}>{item.destinationLabel}</span>
        <span className={styles.cell}>{formatWeightKg(item.reportedWeightKg)}</span>
        <span className={styles.cell}>{formatWeightKg(item.volumetricWeightKg)}</span>
        <span className={styles.cell}>
          {formatDimensionsCm(item.measures.lengthCm, item.measures.widthCm, item.measures.heightCm)}
        </span>
        <span className={cn(styles.cell, styles.priceCell)}>{formatMoney(item.priceWithDiscount)}</span>
        <span className={styles.cell}>
          <Chevron open={open} />
        </span>
      </button>

      {open && (
        <div className={styles.detail}>
          <div className={styles.detailInner}>
            <p className={styles.detailTitle}>Detalle</p>

            {/* Servicio postal y tributos estimados existen SÓLO en los ítems
                internacionales — el tipo los excluye en los nacionales, así
                que acá alcanza con estrechar por `scope`. */}
            <dl className={styles.detailRows}>
              {isInternational && (
                <DetailRow label="Servicio postal" value={POSTAL_SERVICE_LABELS[item.service]} />
              )}
              <DetailRow
                label="Servicio de entrega"
                value={formatMoney(item.breakdown.deliveryService)}
              />
              <DetailRow
                label="Servicio de almacén"
                value={formatMoney(item.breakdown.warehouseService)}
              />
              <DetailRow label="Descuento" value={formatMoney(item.breakdown.discount)} />
              <DetailRow label="IVA incluido" value={formatMoney(item.breakdown.includedVat)} />
              {isInternational && (
                <DetailRow label="Tributos estimados" value={formatMoney(item.estimatedTaxes)} />
              )}
            </dl>
          </div>
        </div>
      )}
    </div>
  )
}

export interface CheckoutItemsTableProps {
  readonly items: readonly CheckoutItem[]
  readonly className?: string
}

/**
 * Grilla de ítems cotizados del checkout, con una fila desplegable por ítem.
 *
 * No usa `DataTable`: ese componente no soporta filas expandibles, y el diseño
 * necesita que la fila y su panel "Detalle" se vean como una única tarjeta
 * continua (con `border-spacing` de tabla quedaría un corte entre las dos).
 * Se sigue entonces el patrón de acordeón del módulo (`ArticleAccordionItem`),
 * con una grilla de columnas compartida entre el encabezado y las filas.
 */
export function CheckoutItemsTable({ items, className }: CheckoutItemsTableProps) {
  return (
    <div className={cn(styles.scroller, className)}>
      <div className={styles.table}>
        <div className={styles.headerRow}>
          <span className={styles.headerCell}>Producto</span>
          <span className={styles.headerCell}>Integración</span>
          <span className={styles.headerCell}>N° de orden</span>
          <span className={styles.headerCell}>Origen</span>
          <span className={styles.headerCell}>Destino</span>
          <span className={styles.headerCell}>
            Peso
            <small className={styles.headerHint}>(Informado)</small>
          </span>
          <span className={styles.headerCell}>
            Peso
            <small className={styles.headerHint}>(Volumétrico)</small>
          </span>
          <span className={styles.headerCell}>
            Medidas
            <small className={styles.headerHint}>(Largo x Ancho x Alto)</small>
          </span>
          <span className={styles.headerCell}>
            Precio C/DTO
            <small className={styles.headerHint}>(IVA incluido)</small>
          </span>
          <span className={styles.headerCell} />
        </div>

        {items.map((item, index) => (
          /* Sólo el primero arranca abierto, como en la referencia. */
          <CheckoutRow key={item.id} item={item} defaultOpen={index === 0} />
        ))}
      </div>
    </div>
  )
}
