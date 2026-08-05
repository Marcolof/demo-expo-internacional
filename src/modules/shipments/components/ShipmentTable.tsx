import type { CurrentUser } from '@/core/auth/currentUser'
import type { ReactNode } from 'react'
import { formatDate } from '@/shared/lib/formatDate'
import { formatMoney, formatWeightKg } from '@/shared/lib/formatCurrency'
import { Button } from '@/shared/ui/Button'
import { DataTable } from '@/shared/ui/DataTable'
import type { DataTableColumn } from '@/shared/ui/DataTable'
import { shipmentActions } from '../rules/shipmentActions'
import type { ShipmentActionId } from '../rules/shipmentActions'
import {
  POSTAL_SERVICE_LABELS,
  shipmentDestinationLabel,
  shipmentOriginLabel,
} from '../types/shipment.types'
import type { Shipment } from '../types/shipment.types'
import { ShipmentStatusBadge } from './ShipmentStatusBadge'
import styles from './ShipmentTable.module.css'

export interface ShipmentTableProps {
  readonly shipments: readonly Shipment[]
  readonly user: CurrentUser
  readonly onAction: (actionId: ShipmentActionId, shipment: Shipment) => void
  readonly emptyState?: ReactNode
  readonly isLoading?: boolean
  /** Acciones que se muestran como botones en la fila. El resto queda fuera. */
  readonly rowActions?: readonly ShipmentActionId[]
}

const DEFAULT_ROW_ACTIONS: readonly ShipmentActionId[] = ['view', 'edit', 'pay', 'cancel']

/**
 * Grilla de envíos.
 *
 * DECISIÓN DE ARQUITECTURA
 * Los botones de acción salen de `shipmentActions(user, shipment)`, no de
 * condiciones escritas acá. Una acción denegada se muestra deshabilitada con el
 * motivo en el `title`: para la demo importa que se vea POR QUÉ está bloqueada.
 */
export function ShipmentTable({
  shipments,
  user,
  onAction,
  emptyState,
  isLoading = false,
  rowActions = DEFAULT_ROW_ACTIONS,
}: ShipmentTableProps) {
  const columns: readonly DataTableColumn<Shipment>[] = [
    {
      id: 'order',
      header: 'Orden',
      render: (shipment) => (
        <span className={styles.orderCell}>
          <span className={styles.orderNumber}>{shipment.orderNumber ?? shipment.id}</span>
          {shipment.trackingCode !== undefined && (
            <span className={styles.trackingCode}>{shipment.trackingCode}</span>
          )}
        </span>
      ),
    },
    {
      id: 'scope',
      header: 'Tipo',
      render: (shipment) => (
        <span className={styles.nowrap}>
          {shipment.scope === 'INTERNACIONAL' ? 'Internacional' : 'Nacional'}
        </span>
      ),
    },
    {
      id: 'date',
      header: 'Fecha',
      render: (shipment) => <span className={styles.nowrap}>{formatDate(shipment.createdAt)}</span>,
    },
    {
      id: 'route',
      header: 'Origen y destino',
      render: (shipment) => (
        <span className={styles.routeCell}>
          <span className={styles.routeLabel}>Origen</span>
          <span className={styles.routeValue}>{shipmentOriginLabel(shipment)}</span>
          <span className={styles.routeLabel}>Destino</span>
          <span className={styles.routeValue}>{shipmentDestinationLabel(shipment)}</span>
        </span>
      ),
    },
    {
      id: 'service',
      header: 'Servicio',
      render: (shipment) => (
        <span className={styles.nowrap}>
          {shipment.service === undefined ? '-' : POSTAL_SERVICE_LABELS[shipment.service]}
        </span>
      ),
    },
    {
      id: 'weight',
      header: 'Peso',
      align: 'right',
      render: (shipment) => (
        <span className={styles.nowrap}>{formatWeightKg(shipment.measures.weightKg)}</span>
      ),
    },
    {
      id: 'price',
      header: 'Precio',
      align: 'right',
      render: (shipment) => (
        <span className={styles.nowrap}>
          {shipment.price === undefined ? '-' : formatMoney(shipment.price)}
        </span>
      ),
    },
    {
      id: 'status',
      header: 'Estado',
      render: (shipment) => <ShipmentStatusBadge status={shipment.status} />,
    },
    {
      id: 'actions',
      header: 'Acciones',
      align: 'right',
      render: (shipment) => {
        const available = shipmentActions(user, shipment).filter((action) =>
          rowActions.includes(action.id),
        )

        return (
          <span className={styles.actions}>
            {available.map((action) => (
              <Button
                key={action.id}
                variant="link"
                size="sm"
                disabled={!action.result.allowed}
                title={action.result.allowed ? undefined : action.result.reason}
                onClick={() => onAction(action.id, shipment)}
              >
                {action.label}
              </Button>
            ))}
          </span>
        )
      },
    },
  ]

  return (
    <DataTable
      columns={columns}
      rows={shipments}
      getRowId={(shipment) => shipment.id}
      emptyState={emptyState}
      isLoading={isLoading}
      caption="Listado de envíos"
    />
  )
}
