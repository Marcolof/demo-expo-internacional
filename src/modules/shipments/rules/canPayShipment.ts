import { hasPermission } from '@/core/auth/access'
import type { CurrentUser } from '@/core/auth/currentUser'
import { allow, deny } from '@/core/types/common'
import type { ActionResult } from '@/core/types/common'
import { SHIPMENT_STATUS_LABELS } from '../types/shipment.types'
import type { Shipment, ShipmentStatus } from '../types/shipment.types'

/** Sólo se paga un envío ya cotizado. */
const PAYABLE_STATUSES: readonly ShipmentStatus[] = ['COTIZADO', 'PENDIENTE_DE_PAGO']

/**
 * ¿Puede pagar este envío?
 *
 * Distingue tres motivos de bloqueo, porque en la demo importa mostrar cuál es:
 * falta de permiso (operador sin pago), estado incorrecto, o falta de cotización.
 */
export function canPayShipment(user: CurrentUser, shipment: Shipment): ActionResult {
  if (!hasPermission(user, 'SHIPMENT_PAY')) {
    return deny('Tu usuario no tiene permiso para pagar envíos. Pedíselo al titular de la cuenta.')
  }

  if (shipment.status === 'PAGADO') {
    return deny('Este envío ya está pagado.')
  }

  if (!PAYABLE_STATUSES.includes(shipment.status)) {
    return deny(`No podés pagar un envío en estado "${SHIPMENT_STATUS_LABELS[shipment.status]}".`)
  }

  if (shipment.price === undefined) {
    return deny('Cotizá el envío antes de pagarlo.')
  }

  return allow()
}
