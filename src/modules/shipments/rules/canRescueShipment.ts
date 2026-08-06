import { hasPermission } from '@/core/auth/access'
import type { CurrentUser } from '@/core/auth/currentUser'
import { allow, deny } from '@/core/types/common'
import type { ActionResult } from '@/core/types/common'
import { SHIPMENT_STATUS_LABELS } from '../types/shipment.types'
import type { Shipment } from '../types/shipment.types'

/**
 * "Rescatar" = recuperar un envío YA PAGADO que todavía no fue impuesto, para
 * volver a tenerlo disponible sin perder el pago.
 *
 * Es la ventana entre `PAGADO` y `EN_IMPOSICION`: una vez que el paquete entró
 * a la red postal ya no hay nada que rescatar. Éste es el escenario
 * `paid-preimposition`.
 */
export function canRescueShipment(user: CurrentUser, shipment: Shipment): ActionResult {
  if (!hasPermission(user, 'SHIPMENT_RESCUE')) {
    return deny('Tu usuario no tiene permiso para rescatar envíos.')
  }

  if (shipment.status !== 'PAGADO') {
    return deny(
      `Sólo se puede rescatar un envío pagado que todavía no fue impuesto. Este envío está "${SHIPMENT_STATUS_LABELS[shipment.status]}".`,
    )
  }

  return allow()
}
