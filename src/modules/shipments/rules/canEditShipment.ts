import { hasPermission } from '@/core/auth/access'
import type { CurrentUser } from '@/core/auth/currentUser'
import { allow, deny } from '@/core/types/common'
import type { ActionResult } from '@/core/types/common'
import { SHIPMENT_STATUS_LABELS } from '../types/shipment.types'
import type { Shipment, ShipmentStatus } from '../types/shipment.types'

/**
 * Estados en los que el envío todavía se puede modificar.
 * Una vez pagado deja de ser editable: hay que rescatarlo o cancelarlo.
 */
const EDITABLE_STATUSES: readonly ShipmentStatus[] = [
  'BORRADOR',
  'PENDIENTE',
  'PENDIENTE_DE_COTIZACION',
  'COTIZADO',
  'PENDIENTE_DE_PAGO',
]

export function isEditableStatus(status: ShipmentStatus): boolean {
  return EDITABLE_STATUSES.includes(status)
}

/** ¿Puede modificar este envío? */
export function canEditShipment(user: CurrentUser, shipment: Shipment): ActionResult {
  if (!hasPermission(user, 'SHIPMENT_EDIT')) {
    return deny('Tu usuario no tiene permiso para modificar envíos.')
  }

  if (!isEditableStatus(shipment.status)) {
    return deny(
      `No podés modificar un envío en estado "${SHIPMENT_STATUS_LABELS[shipment.status]}".`,
    )
  }

  return allow()
}
