import type { ReactNode } from 'react'
import {
  AR,
  AT,
  BR,
  CL,
  CO,
  DE,
  ES,
  FR,
  GB,
  IT,
  MX,
  PE,
  PY,
  US,
  UY,
} from 'country-flag-icons/react/3x2'
import { Modal } from '@/shared/ui/Modal'
import type { InternationalShipmentDetail } from '../types/international-shipment-detail.types'
import styles from './InternationalShipmentDetailModal.module.css'

const FLAG_COMPONENTS: Record<string, typeof AR> = {
  AR,
  AT,
  BR,
  CL,
  UY,
  PY,
  PE,
  CO,
  MX,
  US,
  ES,
  FR,
  IT,
  DE,
  GB,
}

export interface InternationalShipmentDetailModalProps {
  readonly isOpen: boolean
  readonly onClose: () => void
  readonly detail: InternationalShipmentDetail | null
  readonly title?: string
  readonly labelledById?: string
}

function Flag({ isoCode }: { readonly isoCode: string }) {
  if (isoCode === '') return null
  const FlagComponent = FLAG_COMPONENTS[isoCode.toUpperCase()]
  if (FlagComponent === undefined) return null
  return <FlagComponent className={styles.flag} aria-hidden="true" />
}

interface DetailField {
  readonly label: string
  readonly value: string
  readonly trailing?: ReactNode
}

function DetailTable({
  columnsClassName,
  fields,
}: {
  readonly columnsClassName: string | undefined
  readonly fields: readonly DetailField[]
}) {
  return (
    <div className={styles.grid} role="table">
      <div className={`${styles.headerRow} ${columnsClassName ?? ''}`} role="row">
        {fields.map((field) => (
          <div key={field.label} className={styles.th} role="columnheader">
            {field.label}
          </div>
        ))}
      </div>
      <div className={`${styles.dataRow} ${columnsClassName ?? ''}`} role="row">
        {fields.map((field) => (
          <div key={field.label} className={styles.td} role="cell">
            {field.trailing}
            <span>{field.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * Modal de solo lectura. Cada bloque (Origen / Destino / Paquete) sigue el
 * schema Figma: barra de título gris + tabla de labels y valores.
 */
export function InternationalShipmentDetailModal({
  isOpen,
  onClose,
  detail,
  title = 'Detalles del envío internacional',
  labelledById = 'factura-e-shipment-detail-title',
}: InternationalShipmentDetailModalProps) {
  const resumenFields =
    detail?.resumen === undefined
      ? []
      : [
          { label: 'N° de orden', value: detail.resumen.orderNumber },
          { label: 'Estado', value: detail.resumen.status },
          ...detail.resumen.extras,
        ]
  const resumenColumns =
    resumenFields.length <= 3 ? styles.colsResumen3 : styles.colsResumen4

  return (
    <Modal
      isOpen={isOpen && detail !== null}
      onClose={onClose}
      title={title}
      size="lg"
      labelledById={labelledById}
      className={styles.dialog}
      bodyClassName={styles.body}
    >
      {detail !== null && (
        <>
          {resumenFields.length > 0 && (
            <section className={styles.card} aria-labelledby="detail-resumen-title">
              <h3 id="detail-resumen-title" className={styles.cardTitle}>
                Envío
              </h3>
              <DetailTable columnsClassName={resumenColumns} fields={resumenFields} />
            </section>
          )}
          <section className={styles.card} aria-labelledby="detail-origen-title">
            <h3 id="detail-origen-title" className={styles.cardTitle}>
              Origen
            </h3>
            <DetailTable
              columnsClassName={styles.colsOrigen}
              fields={[
                { label: 'Sucursal de imposición', value: detail.origen.branchName },
                { label: 'Provincia', value: detail.origen.province },
                { label: 'Dirección', value: detail.origen.address },
                { label: 'Código postal', value: detail.origen.postalCode },
                { label: 'Teléfono', value: detail.origen.phone },
              ]}
            />
          </section>

          <section className={styles.card} aria-labelledby="detail-destino-title">
            <h3 id="detail-destino-title" className={styles.cardTitle}>
              Destino
            </h3>
            <DetailTable
              columnsClassName={styles.colsDestinoTop}
              fields={[
                { label: 'Nombre del destinatario', value: detail.destino.recipientName },
                { label: 'Teléfono', value: detail.destino.phone },
                { label: 'Email', value: detail.destino.email },
              ]}
            />
            <DetailTable
              columnsClassName={styles.colsDestinoBottom}
              fields={[
                { label: 'Dirección', value: detail.destino.address },
                { label: 'Código postal', value: detail.destino.postalCode },
                { label: 'Ciudad', value: detail.destino.city },
                { label: 'Provincia / Región', value: detail.destino.region },
                {
                  label: 'País',
                  value: detail.destino.countryLabel,
                  trailing: <Flag isoCode={detail.destino.countryIso} />,
                },
              ]}
            />
          </section>

          <section className={styles.card} aria-labelledby="detail-paquete-title">
            <h3 id="detail-paquete-title" className={styles.cardTitle}>
              Datos del paquete
            </h3>
            <DetailTable
              columnsClassName={styles.colsPaqueteTop}
              fields={[
                { label: 'Servicio postal', value: detail.paquete.serviceLabel },
                { label: 'Tipo de producto', value: detail.paquete.productType },
                { label: 'N° de bultos', value: detail.paquete.parcelCount },
                { label: 'Peso del paquete (contenido + embalaje)', value: detail.paquete.weightLabel },
              ]}
            />
            <DetailTable
              columnsClassName={styles.colsPaqueteBottom}
              fields={[
                { label: 'Largo', value: detail.paquete.lengthLabel },
                { label: 'Ancho', value: detail.paquete.widthLabel },
                { label: 'Alto', value: detail.paquete.heightLabel },
                { label: 'Valor del contenido', value: detail.paquete.contentValueLabel },
                { label: 'Moneda', value: detail.paquete.currency },
              ]}
            />
          </section>
        </>
      )}
    </Modal>
  )
}
