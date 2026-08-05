/**
 * Acciones disponibles sobre un envío.
 *
 * DECISIÓN DE ARQUITECTURA
 * En lugar de que cada pantalla pregunte una por una y arme condiciones
 * compuestas, este módulo devuelve la LISTA de acciones con su resultado. La
 * grilla y el detalle recorren la misma lista, así nunca se desincronizan.
 *
 * Las acciones denegadas no se descartan: se devuelven con el motivo, para
 * poder mostrarlas deshabilitadas y explicar por qué — que es justo lo que hay
 * que demostrarle a Desarrollo.
 */

import { hasPermission } from '@/core/auth/access'
import type { CurrentUser } from '@/core/auth/currentUser'
import { allow, deny } from '@/core/types/common'
import type { ActionResult } from '@/core/types/common'
import { canCancelShipment } from './canCancelShipment'
import { canEditShipment } from './canEditShipment'
import { canPayShipment } from './canPayShipment'
import { canRescueShipment } from './canRescueShipment'
import type { Shipment } from '../types/shipment.types'

export type ShipmentActionId =
  | 'view'
  | 'edit'
  | 'duplicate'
  | 'quote'
  | 'pay'
  | 'cancel'
  | 'rescue'
  | 'printLabel'

export interface ShipmentAction {
  readonly id: ShipmentActionId
  readonly label: string
  readonly result: ActionResult
  /** `true` si la acción es destructiva (pide confirmación con tono de peligro). */
  readonly destructive?: boolean
}

/** Duplicar sólo necesita poder crear: el envío original no se toca. */
function canDuplicate(user: CurrentUser): ActionResult {
  return hasPermission(user, 'SHIPMENT_CREATE')
    ? allow()
    : deny('Tu usuario no tiene permiso para crear envíos.')
}

/** Cotizar es parte de editar: cambia el precio del envío. */
function canQuote(user: CurrentUser, shipment: Shipment): ActionResult {
  if (!hasPermission(user, 'SHIPMENT_EDIT')) {
    return deny('Tu usuario no tiene permiso para cotizar envíos.')
  }
  if (shipment.status === 'PAGADO' || shipment.status === 'EN_IMPOSICION') {
    return deny('El envío ya está pagado: la cotización no se puede recalcular.')
  }
  return allow()
}

/** El rótulo existe recién cuando el envío está pagado. */
function canPrintLabel(shipment: Shipment): ActionResult {
  const printableStatuses = ['PAGADO', 'EN_IMPOSICION', 'ADMITIDO', 'EN_TRANSITO', 'ENTREGADO']
  return printableStatuses.includes(shipment.status)
    ? allow()
    : deny('Vas a poder imprimir la documentación cuando el envío esté pagado.')
}

export function shipmentActions(
  user: CurrentUser,
  shipment: Shipment,
): readonly ShipmentAction[] {
  return [
    { id: 'view', label: 'Ver detalle', result: allow() },
    { id: 'edit', label: 'Modificar', result: canEditShipment(user, shipment) },
    { id: 'duplicate', label: 'Duplicar', result: canDuplicate(user) },
    { id: 'quote', label: 'Cotizar', result: canQuote(user, shipment) },
    { id: 'pay', label: 'Pagar', result: canPayShipment(user, shipment) },
    { id: 'rescue', label: 'Rescatar', result: canRescueShipment(user, shipment) },
    { id: 'printLabel', label: 'Imprimir rótulo', result: canPrintLabel(shipment) },
    { id: 'cancel', label: 'Cancelar', result: canCancelShipment(user, shipment), destructive: true },
  ]
}

/** Sólo las acciones permitidas. Útil para menús compactos. */
export function allowedShipmentActions(
  user: CurrentUser,
  shipment: Shipment,
): readonly ShipmentAction[] {
  return shipmentActions(user, shipment).filter((action) => action.result.allowed)
}

/** Busca una acción puntual. Devuelve un resultado denegado si no existe. */
export function shipmentAction(
  user: CurrentUser,
  shipment: Shipment,
  id: ShipmentActionId,
): ShipmentAction {
  const found = shipmentActions(user, shipment).find((action) => action.id === id)
  return found ?? { id, label: id, result: deny('Acción no disponible.') }
}
