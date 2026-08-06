import { hasPermission } from '@/core/auth/access'
import type { CurrentUser } from '@/core/auth/currentUser'
import { allow, deny } from '@/core/types/common'
import type { ActionResult } from '@/core/types/common'
import { SHIPMENT_STATUS_LABELS } from '../types/shipment.types'
import type { Shipment, ShipmentStatus } from '../types/shipment.types'

/**
 * Estados en los que el envío ya salió del control del usuario.
 * A partir de la imposición el paquete está físicamente en la red postal.
 */
const NON_CANCELLABLE_STATUSES: readonly ShipmentStatus[] = [
  'EN_IMPOSICION',
  'ADMITIDO',
  'OBSERVADO',
  'EN_TRANSITO',
  'ENTREGADO',
  'CANCELADO',
  'CADUCADO',
]

export function canCancelShipment(user: CurrentUser, shipment: Shipment): ActionResult {
  if (!hasPermission(user, 'SHIPMENT_CANCEL')) {
    return deny('Tu usuario no tiene permiso para cancelar envíos.')
  }

  if (NON_CANCELLABLE_STATUSES.includes(shipment.status)) {
    return deny(
      `Un envío en estado "${SHIPMENT_STATUS_LABELS[shipment.status]}" ya no se puede cancelar.`,
    )
  }

  return allow()
}
