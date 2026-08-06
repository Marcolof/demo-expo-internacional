/**
 * ¿Puede este usuario recargar el saldo de la cuenta?
 *
 * Combina el permiso (`core/auth/access`) con el estado del saldo. Las
 * pantallas nunca preguntan por el permiso suelto: piden el `ActionResult` y
 * usan el `reason` como tooltip o como aviso.
 */

import { hasPermission } from '@/core/auth/access'
import type { CurrentUser } from '@/core/auth/currentUser'
import { allow, deny } from '@/core/types/common'
import type { ActionResult } from '@/core/types/common'
import { formatCurrency } from '@/shared/lib/formatCurrency'
import type { AccountBalance } from '../types/balance.types'

/** Importe mínimo por recarga, en pesos. */
export const MIN_TOP_UP_AMOUNT = 1_000

/** Importe máximo por recarga, en pesos. */
export const MAX_TOP_UP_AMOUNT = 500_000

export function canTopUpBalance(user: CurrentUser, balance: AccountBalance): ActionResult {
  if (!hasPermission(user, 'BALANCE_TOP_UP')) {
    return deny(
      'Tu usuario no tiene permiso para recargar saldo. Pedíselo al titular de la cuenta.',
    )
  }

  // En cuenta corriente lo pendiente de imputación consume el crédito: si lo
  // superó, primero hay que regularizar y después recargar.
  if (
    balance.hasCurrentAccount &&
    balance.creditLimit !== undefined &&
    balance.pending.amount > balance.creditLimit.amount
  ) {
    return deny(
      'Alcanzaste el límite de crédito de tu cuenta corriente. Regularizá los envíos pendientes de imputación para volver a recargar.',
    )
  }

  return allow()
}

/**
 * Valida el importe tipeado en la pantalla de recarga.
 *
 * Vive con la regla de permiso porque los dos hablan de lo mismo: qué recarga
 * es posible. Devuelve `ActionResult` para que la pantalla muestre el `reason`
 * como error del campo sin traducir nada.
 */
export function validateTopUpAmount(amount: number): ActionResult {
  if (!Number.isFinite(amount) || amount <= 0) {
    return deny('Ingresá un importe válido.')
  }

  if (amount < MIN_TOP_UP_AMOUNT) {
    return deny(`El importe mínimo de recarga es ${formatCurrency(MIN_TOP_UP_AMOUNT)}.`)
  }

  if (amount > MAX_TOP_UP_AMOUNT) {
    return deny(
      `El importe máximo por recarga es ${formatCurrency(MAX_TOP_UP_AMOUNT)}. Si necesitás cargar más, hacelo en varias operaciones.`,
    )
  }

  return allow()
}
