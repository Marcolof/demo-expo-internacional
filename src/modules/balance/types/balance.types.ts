/**
 * Tipos del dominio Mi Saldo.
 *
 * El saldo de MiCorreo es prepago: se recarga y se consume a medida que se
 * pagan envíos. Las cuentas corporativas pueden además operar en cuenta
 * corriente, con un límite de crédito en vez de saldo disponible.
 */

import type { Id, IsoDate, Money } from '@/core/types/common'

export interface AccountBalance {
  readonly available: Money
  readonly pending: Money // retenido por envíos no imputados
  readonly lastUpdatedAt: IsoDate
  readonly hasCurrentAccount: boolean // cuenta corriente habilitada
  readonly creditLimit?: Money
}

export type MovementKind = 'RECARGA' | 'PAGO_ENVIO' | 'DEVOLUCION' | 'AJUSTE'

export interface BalanceMovement {
  readonly id: Id
  readonly date: IsoDate
  readonly kind: MovementKind
  readonly description: string
  readonly amount: Money // negativo si descuenta
  readonly balanceAfter: Money
}

export type ReceiptType =
  | 'FACTURA_A'
  | 'FACTURA_B'
  | 'FACTURA_E'
  | 'NOTA_CREDITO'
  | 'RECIBO'

export interface Receipt {
  readonly id: Id
  readonly number: string // p.ej. "0001-00012345"
  readonly type: ReceiptType
  readonly issuedAt: IsoDate
  readonly total: Money
  readonly relatedShipmentId?: Id
}

export type TopUpMethod =
  | 'TARJETA_CREDITO'
  | 'TARJETA_DEBITO'
  | 'TRANSFERENCIA'
  | 'CUENTA_CORRIENTE'

/** Nombre visible del tipo de movimiento. */
export const MOVEMENT_KIND_LABELS: Record<MovementKind, string> = {
  RECARGA: 'Recarga',
  PAGO_ENVIO: 'Pago de envío',
  DEVOLUCION: 'Devolución',
  AJUSTE: 'Ajuste',
}

/** Nombre visible del comprobante. Se usa en el badge de la grilla. */
export const RECEIPT_TYPE_LABELS: Record<ReceiptType, string> = {
  FACTURA_A: 'Factura A',
  FACTURA_B: 'Factura B',
  FACTURA_E: 'Factura E',
  NOTA_CREDITO: 'Nota de crédito',
  RECIBO: 'Recibo',
}

/** Nombre visible del medio de pago de una recarga. */
export const TOP_UP_METHOD_LABELS: Record<TopUpMethod, string> = {
  TARJETA_CREDITO: 'Tarjeta de crédito',
  TARJETA_DEBITO: 'Tarjeta de débito',
  TRANSFERENCIA: 'Transferencia bancaria',
  CUENTA_CORRIENTE: 'Cuenta corriente',
}
