import { Badge } from '@/shared/ui/Badge'
import type { BadgeTone } from '@/shared/ui/Badge'
import { SHIPMENT_STATUS_LABELS } from '../types/shipment.types'
import type { ShipmentStatus } from '../types/shipment.types'

/**
 * Color de cada estado.
 *
 * DECISIÓN DE ARQUITECTURA
 * El mapeo estado → color vive acá y en ningún otro lado. Si mañana se agrega
 * un estado, el compilador obliga a decidir su color (el `Record` es completo).
 */
const STATUS_TONE: Record<ShipmentStatus, BadgeTone> = {
  BORRADOR: 'neutral',
  PENDIENTE: 'warning',
  PENDIENTE_DE_COTIZACION: 'warning',
  COTIZADO: 'info',
  PENDIENTE_DE_PAGO: 'warning',
  PAGADO: 'success',
  CANCELADO: 'danger',
  CADUCADO: 'danger',
  EN_IMPOSICION: 'info',
  ADMITIDO: 'info',
  OBSERVADO: 'warning',
  EN_TRANSITO: 'info',
  ENTREGADO: 'success',
  ERROR: 'danger',
}

export interface ShipmentStatusBadgeProps {
  readonly status: ShipmentStatus
}

export function ShipmentStatusBadge({ status }: ShipmentStatusBadgeProps) {
  return <Badge tone={STATUS_TONE[status]}>{SHIPMENT_STATUS_LABELS[status]}</Badge>
}
